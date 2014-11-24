/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @extends {WebInspector.SDKObject}
 * @param {!WebInspector.Target} target
 * @param {!WebInspector.Workspace} workspace
 * @param {!WebInspector.DebuggerWorkspaceBinding} debuggerWorkspaceBinding
 */
WebInspector.LiveEditSupport = function(target, workspace, debuggerWorkspaceBinding)
{
    WebInspector.SDKObject.call(this, target);
    this._workspace = workspace;
    this._debuggerWorkspaceBinding = debuggerWorkspaceBinding;
    this._projectId = "liveedit:" + target.id();
    this._projectDelegate = new WebInspector.DebuggerProjectDelegate(workspace, this._projectId, WebInspector.projectTypes.LiveEdit);
    target.debuggerModel.addEventListener(WebInspector.DebuggerModel.Events.GlobalObjectCleared, this._debuggerReset, this);
    this._debuggerReset();
}

WebInspector.LiveEditSupport.prototype = {
    /**
     * @param {!WebInspector.UISourceCode} uiSourceCode
     * @return {?WebInspector.UISourceCode}
     */
    uiSourceCodeForLiveEdit: function(uiSourceCode)
    {
        var debuggerModelLocation = this._debuggerWorkspaceBinding.uiLocationToRawLocation(this.target(), uiSourceCode, 0, 0);
        if (!debuggerModelLocation)
            return null;
        var uiLocation = this._debuggerWorkspaceBinding.rawLocationToUILocation(debuggerModelLocation);

        // FIXME: Support live editing of scripts mapped to some file.
        if (uiLocation.uiSourceCode !== uiSourceCode)
            return uiLocation.uiSourceCode;

        var script = debuggerModelLocation.script();
        if (this._uiSourceCodeForScriptId[script.scriptId])
            return this._uiSourceCodeForScriptId[script.scriptId];

        console.assert(!script.isInlineScript());
        var path = this._projectDelegate.addScript(script);
        var liveEditUISourceCode = this._workspace.uiSourceCode(this._projectId, path);

        liveEditUISourceCode.addEventListener(WebInspector.UISourceCode.Events.WorkingCopyCommitted, this._workingCopyCommitted, this);
        this._uiSourceCodeForScriptId[script.scriptId] = liveEditUISourceCode;
        this._scriptIdForUISourceCode.set(liveEditUISourceCode, script.scriptId);
        return liveEditUISourceCode;
    },

    _debuggerReset: function()
    {
        /** @type {!Object.<string, !WebInspector.UISourceCode>} */
        this._uiSourceCodeForScriptId = {};
        /** @type {!Map.<!WebInspector.UISourceCode, string>} */
        this._scriptIdForUISourceCode = new Map();
        this._projectDelegate.reset();
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _workingCopyCommitted: function(event)
    {
        var uiSourceCode = /** @type {!WebInspector.UISourceCode} */ (event.target);
        var scriptId = /** @type {string} */ (this._scriptIdForUISourceCode.get(uiSourceCode));
        this.target().debuggerModel.setScriptSource(scriptId, uiSourceCode.workingCopy(), innerCallback.bind(this));

        /**
         * @this {WebInspector.LiveEditSupport}
         * @param {?string} error
         * @param {!DebuggerAgent.SetScriptSourceError=} errorData
         */
        function innerCallback(error, errorData)
        {
            if (error) {
                var script = this.target().debuggerModel.scriptForId(scriptId);
                WebInspector.LiveEditSupport.logDetailedError(error, errorData, script);
                return;
            }
            WebInspector.LiveEditSupport.logSuccess();
        }
    },

    __proto__: WebInspector.SDKObject.prototype
}

/**
 * @param {!WebInspector.UISourceCode} uiSourceCode
 * @return {?WebInspector.LiveEditSupport}
 */
WebInspector.LiveEditSupport.liveEditSupportForUISourceCode = function(uiSourceCode)
{
    var projectId = uiSourceCode.project().id();
    var target = null;
    var targets = WebInspector.targetManager.targets();
    for (var i = 0; i < targets.length; ++i) {
        if (projectId === WebInspector.DefaultScriptMapping.projectIdForTarget(targets[i])) {
            target = targets[i];
            break;
        }
    }
    return target ? WebInspector.debuggerWorkspaceBinding.liveEditSupport(target) : null;
}

/**
 * @param {?string} error
 * @param {!DebuggerAgent.SetScriptSourceError=} errorData
 * @param {!WebInspector.Script=} contextScript
 */
WebInspector.LiveEditSupport.logDetailedError = function(error, errorData, contextScript)
{
    var warningLevel = WebInspector.Console.MessageLevel.Warning;
    if (!errorData) {
        if (error)
            WebInspector.console.addMessage(WebInspector.UIString("LiveEdit failed: %s", error), warningLevel);
        return;
    }
    var compileError = errorData.compileError;
    if (compileError) {
        var location = contextScript ? WebInspector.UIString(" at %s:%d:%d", contextScript.sourceURL, compileError.lineNumber, compileError.columnNumber) : "";
        var message = WebInspector.UIString("LiveEdit compile failed: %s%s", compileError.message, location);
        WebInspector.console.error(message);
    } else {
        WebInspector.console.addMessage(WebInspector.UIString("Unknown LiveEdit error: %s; %s", JSON.stringify(errorData), error), warningLevel);
    }
}

WebInspector.LiveEditSupport.logSuccess = function()
{
    WebInspector.console.log(WebInspector.UIString("Recompilation and update succeeded."));
}
