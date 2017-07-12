/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const {utils: Cu} = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/Preferences.jsm");
Cu.import("resource://gre/modules/Log.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "LogManager",
  "resource://shield-recipe-client/lib/LogManager.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "RecipeRunner",
  "resource://shield-recipe-client/lib/RecipeRunner.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "CleanupManager",
  "resource://shield-recipe-client/lib/CleanupManager.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "PreferenceExperiments",
  "resource://shield-recipe-client/lib/PreferenceExperiments.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "AboutPages",
  "chrome://shield-recipe-client/content/AboutPages.jsm");

this.EXPORTED_SYMBOLS = ["ShieldRecipeClient"];

const REASONS = {
  APP_STARTUP: 1,      // The application is starting up.
  APP_SHUTDOWN: 2,     // The application is shutting down.
  ADDON_ENABLE: 3,     // The add-on is being enabled.
  ADDON_DISABLE: 4,    // The add-on is being disabled. (Also sent during uninstallation)
  ADDON_INSTALL: 5,    // The add-on is being installed.
  ADDON_UNINSTALL: 6,  // The add-on is being uninstalled.
  ADDON_UPGRADE: 7,    // The add-on is being upgraded.
  ADDON_DOWNGRADE: 8,  // The add-on is being downgraded.
};
const PREF_BRANCH = "extensions.shield-recipe-client.";
const DEFAULT_PREFS = {
  api_url: "https://normandy.cdn.mozilla.net/api/v1",
  dev_mode: false,
  enabled: true,
  startup_delay_seconds: 300,
  "logging.level": Log.Level.Warn,
  user_id: "",
  run_interval_seconds: 86400, // 24 hours
};
const PREF_DEV_MODE = "extensions.shield-recipe-client.dev_mode";
const PREF_SELF_SUPPORT_ENABLED = "browser.selfsupport.enabled";
const PREF_LOGGING_LEVEL = PREF_BRANCH + "logging.level";

// Due to bug 1051238 frame scripts are cached forever, so we can't update them
// as a restartless add-on. The Math.random() is the work around for this.
const PROCESS_SCRIPT = (
  `chrome://shield-recipe-client/content/shield-content-process.js?${Math.random()}`
);

let log = null;

/**
 * Handles startup and shutdown of the entire add-on. Bootsrap.js defers to this
 * module for most tasks so that we can more easily test startup and shutdown
 * (bootstrap.js is difficult to import in tests).
 */
this.ShieldRecipeClient = {
  async startup() {
    ShieldRecipeClient.setDefaultPrefs();

    // Setup logging and listen for changes to logging prefs
    LogManager.configure(Services.prefs.getIntPref(PREF_LOGGING_LEVEL));
    Preferences.observe(PREF_LOGGING_LEVEL, LogManager.configure);
    CleanupManager.addCleanupHandler(
      () => Preferences.ignore(PREF_LOGGING_LEVEL, LogManager.configure),
    );
    log = LogManager.getLogger("bootstrap");

    // Disable self-support, since we replace its behavior.
    // Self-support only checks its pref on start, so if we disable it, wait
    // until next startup to run, unless the dev_mode preference is set.
    if (Preferences.get(PREF_SELF_SUPPORT_ENABLED, true)) {
      Preferences.set(PREF_SELF_SUPPORT_ENABLED, false);
      if (!Preferences.get(PREF_DEV_MODE, false)) {
        return;
      }
    }

    // Register frame script ro run in child processes to register about: pages.
    Services.ppmm.loadProcessScript(PROCESS_SCRIPT, true);
    CleanupManager.addCleanupHandler(() => {
      // Although the ppmm loads the scripts into the chrome process as well,
      // we need to manually unregister in the parent process anyway to ensure
      // these aren't part of the chrome process and avoid errors.
      AboutPages.aboutStudies.unregister();
    });

    // Initialize experiments first to avoid a race between initializing prefs
    // and recipes rolling back pref changes when experiments end.
    try {
      await PreferenceExperiments.init();
    } catch (err) {
      log.error("Failed to initialize preference experiments:", err);
    }

    await RecipeRunner.init();
  },

  shutdown(reason) {
    // Notify child processes that the add-on is shutting down.
    Services.ppmm.broadcastAsyncMessage("ShieldShuttingDown");

    CleanupManager.cleanup();

    // Re-enable self-support if we're being disabled.
    if (reason === REASONS.ADDON_DISABLE || reason === REASONS.ADDON_UNINSTALL) {
      Services.prefs.setBoolPref(PREF_SELF_SUPPORT_ENABLED, true);
    }
  },

  setDefaultPrefs() {
    for (const [key, val] of Object.entries(DEFAULT_PREFS)) {
      const fullKey = PREF_BRANCH + key;
      // If someone beat us to setting a default, don't overwrite it.
      if (!Preferences.isSet(fullKey)) {
        Preferences.set(fullKey, val);
      }
    }
  },
};
