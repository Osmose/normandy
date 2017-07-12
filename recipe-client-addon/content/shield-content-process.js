/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

// This file is loaded as a process script, it will be loaded in the parent
// process as well as all content processes.

const { utils: Cu } = Components;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("chrome://shield-recipe-client/content/AboutPages.jsm");

class ShieldChildListener {
  onStartup() {
    // Only do this in content processes since, as the broadcaster of this
    // message, the parent process doesn't also receive it.  We handle
    // the shutting down separately.
    if (Services.appinfo.processType === Services.appinfo.PROCESS_TYPE_CONTENT) {
      Services.cpmm.addMessageListener("ShieldShuttingDown", this, true);
    }

    AboutPages.aboutStudies.register();
  }

  onShutdown() {
    AboutPages.aboutStudies.unregister();

    Services.cpmm.removeMessageListener("ShieldShuttingDown", this);
    Cu.unload("chrome://shield-recipe-client/content/AboutPages.jsm");
  }

  receiveMessage(message) {
    switch (message.name) {
      case "ShieldShuttingDown":
        this.onShutdown();
        break;
      default:
        break;
    }
  }
}

const listener = new ShieldChildListener();
listener.onStartup();
