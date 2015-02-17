// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @constructor
 * @extends {WebInspector.NativeBreakpointsSidebarPane}
 * @implements {WebInspector.TargetManager.Observer}
 */
WebInspector.AsyncOperationsSidebarPane = function()
{
    WebInspector.NativeBreakpointsSidebarPane.call(this, WebInspector.UIString("Async Operation Breakpoints"));
    this.bodyElement.classList.add("async-operations");
    this.emptyElement.textContent = WebInspector.UIString("No Async Operations");

    /** @type {!Map.<!WebInspector.Target, !Map.<number, !DebuggerAgent.AsyncOperation>>} */
    this._asyncOperationsByTarget = new Map();
    /** @type {!Map.<number, !Element>} */
    this._operationIdToElement = new Map();

    this._revealBlackboxedCallFrames = false;
    this._linkifier = new WebInspector.Linkifier(new WebInspector.Linkifier.DefaultFormatter(30));

    WebInspector.targetManager.addModelListener(WebInspector.DebuggerModel, WebInspector.DebuggerModel.Events.AsyncOperationStarted, this._onAsyncOperationStarted, this);
    WebInspector.targetManager.addModelListener(WebInspector.DebuggerModel, WebInspector.DebuggerModel.Events.AsyncOperationCompleted, this._onAsyncOperationCompleted, this);
    WebInspector.targetManager.addModelListener(WebInspector.DebuggerModel, WebInspector.DebuggerModel.Events.AsyncOperationsCleared, this._onAsyncOperationsCleared, this);
    WebInspector.targetManager.addModelListener(WebInspector.DebuggerModel, WebInspector.DebuggerModel.Events.DebuggerResumed, this._debuggerResumed, this);
    WebInspector.context.addFlavorChangeListener(WebInspector.Target, this._targetChanged, this);

    WebInspector.settings.skipStackFramesPattern.addChangeListener(this._refresh, this);

    WebInspector.targetManager.observeTargets(this);
}

WebInspector.AsyncOperationsSidebarPane.prototype = {
    /**
     * @override
     * @param {!WebInspector.Target} target
     */
    targetAdded: function(target)
    {
    },

    /**
     * @override
     * @param {!WebInspector.Target} target
     */
    targetRemoved: function(target)
    {
        this._asyncOperationsByTarget.delete(target);
        if (this._target === target) {
            this._clear();
            delete this._target;
        }
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _targetChanged: function(event)
    {
        var target = /** @type {!WebInspector.Target} */ (event.data);
        if (this._target === target)
            return;
        this._target = target;
        this._refresh();
    },

    /** @override */
    wasShown: function()
    {
        if (!this._target) {
            this._target = WebInspector.context.flavor(WebInspector.Target);
            this._refresh();
        }
    },

    /**
     * @param {!WebInspector.Target} target
     */
    revealHiddenCallFrames: function(target)
    {
        if (this._target !== target || this._revealBlackboxedCallFrames)
            return;
        this._revealBlackboxedCallFrames = true;
        this._refresh();
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _debuggerResumed: function(event)
    {
        var target = /** @type {!WebInspector.Target} */  (event.target.target());
        if (this._target !== target || !this._revealBlackboxedCallFrames)
            return;
        this._revealBlackboxedCallFrames = false;
        this._refresh();
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _onAsyncOperationStarted: function(event)
    {
        var target = /** @type {!WebInspector.Target} */ (event.data.target);
        var operation = /** @type {!DebuggerAgent.AsyncOperation} */ (event.data.operation);

        var operationsMap = this._asyncOperationsByTarget.get(target);
        if (!operationsMap) {
            operationsMap = new Map();
            this._asyncOperationsByTarget.set(target, operationsMap)
        }
        operationsMap.set(operation.id, operation);

        if (this._target === target)
            this._createAsyncOperationItem(operation);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _onAsyncOperationCompleted: function(event)
    {
        var target = /** @type {!WebInspector.Target} */ (event.data.target);
        var operationId = /** @type {number} */ (event.data.operationId);

        var operationsMap = this._asyncOperationsByTarget.get(target);
        if (operationsMap)
            operationsMap.delete(operationId);

        if (this._target === target) {
            var element = this._operationIdToElement.get(operationId);
            if (element)
                this.removeListElement(element);
            this._operationIdToElement.delete(operationId);
            if (!this._operationIdToElement.size)
                this._clear();
        }
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _onAsyncOperationsCleared: function(event)
    {
        var target = /** @type {!WebInspector.Target} */ (event.data);
        this._asyncOperationsByTarget.delete(target);
        if (this._target === target)
            this._clear();
    },

    _refresh: function()
    {
        this._clear();
        if (!this._target)
            return;
        var operationsMap = this._asyncOperationsByTarget.get(this._target);
        if (!operationsMap || !operationsMap.size)
            return;

        // The for..of loop iterates in insertion order.
        for (var pair of operationsMap) {
            var operation = /** @type {!DebuggerAgent.AsyncOperation} */ (pair[1]);
            this._createAsyncOperationItem(operation);
        }
    },

    /**
     * @param {!DebuggerAgent.AsyncOperation} operation
     */
    _createAsyncOperationItem: function(operation)
    {
        var element = createElement("li");

        var title = operation.description || WebInspector.UIString("Async Operation");
        var label = createCheckboxLabel(title, false);
        label.classList.add("checkbox-elem");
        element.appendChild(label);

        var callFrame = WebInspector.DebuggerPresentationUtils.callFrameAnchorFromStackTrace(this._target, operation.stackTrace, operation.asyncStackTrace, this._revealBlackboxedCallFrames);
        if (callFrame)
            element.createChild("div").appendChild(this._linkifier.linkifyConsoleCallFrame(this._target, callFrame));

        this._operationIdToElement.set(operation.id, element);
        this.addListElement(element, this.listElement.firstChild);
    },

    _clear: function()
    {
        this.reset();
        this._operationIdToElement.clear();
        this._linkifier.reset();
    },

    __proto__: WebInspector.NativeBreakpointsSidebarPane.prototype
}
