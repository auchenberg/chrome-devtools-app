// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @constructor
 * @suppressGlobalPropertiesCheck
 */
WebInspector.DevToolsApp = function()
{
    this._iframe = document.querySelector("iframe.inspector-app-iframe");

    /**
     * @type {!Window}
     */
    this._inspectorWindow = this._iframe.contentWindow;
    this._inspectorWindow.InspectorFrontendHost = window.InspectorFrontendHost;
}

WebInspector.DevToolsApp.prototype = {
}

runOnWindowLoad(function() { new WebInspector.DevToolsApp(); });
