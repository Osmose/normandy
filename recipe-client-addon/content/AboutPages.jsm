/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { interfaces: Ci, results: Cr, manager: Cm, utils: Cu } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

this.EXPORTED_SYMBOLS = ["AboutPages"];

/**
 * Class for managing an about: page that Shield provides.
 *
 * @implements nsIFactory
 * @implements nsIAboutModule
 */
class AboutPage {
  constructor(chromeURL, aboutHost, classId, description, uriFlags) {
    this.chromeURL = chromeURL;
    this.aboutHost = aboutHost;
    this.classId = Components.ID(classId);
    this.description = description;
    this.uriFlags = uriFlags;
  }

  getURIFlags() {
    return this.uriFlags;
  }

  newChannel(uri, loadInfo) {
    const newURI = Services.io.newURI(this.chromeURL);
    const channel = Services.io.newChannelFromURIWithLoadInfo(newURI, loadInfo);
    channel.originalURI = uri;

    if (this.uriFlags & Ci.nsIAboutModule.URI_SAFE_FOR_UNTRUSTED_CONTENT) {
      const principal = Services.scriptSecurityManager.createCodebasePrincipal(uri, {});
      channel.owner = principal;
    }
    return channel;
  }

  createInstance(outer, iid) {
    if (outer !== null) {
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    return this.QueryInterface(iid);
  }

  register() {
    Cm.QueryInterface(Ci.nsIComponentRegistrar).registerFactory(
      this.classId,
      this.description,
      `@mozilla.org/network/protocol/about;1?what=${this.aboutHost}`,
      this,
    );
  }

  unregister() {
    Cm.QueryInterface(Ci.nsIComponentRegistrar).unregisterFactory(this.classId, this);
  }
}
AboutPage.prototype.QueryInterface = XPCOMUtils.generateQI([Ci.nsIAboutModule]);

this.AboutPages = {};
XPCOMUtils.defineLazyGetter(this.AboutPages, "aboutStudies", () => new AboutPage(
  "chrome://shield-recipe-client/content/aboutStudies.html",
  "studies",
  "{6ab96943-a163-482c-9622-4faedc0e827f}",
  "Shield Study Listing",
  Ci.nsIAboutModule.ALLOW_SCRIPT,
));
