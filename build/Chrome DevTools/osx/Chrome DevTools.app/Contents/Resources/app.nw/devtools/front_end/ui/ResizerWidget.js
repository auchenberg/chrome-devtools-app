// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @constructor
 * @extends {WebInspector.Object}
 */
WebInspector.ResizerWidget = function()
{
    WebInspector.Object.call(this);

    this._isEnabled = true;
    this._isVertical = true;
    this._elements = [];
    this._installDragOnMouseDownBound = this._installDragOnMouseDown.bind(this);
};

WebInspector.ResizerWidget.Events = {
    ResizeStart: "ResizeStart",
    ResizeUpdate: "ResizeUpdate",
    ResizeEnd: "ResizeEnd"
};

WebInspector.ResizerWidget.prototype = {
    /**
     * @return {boolean}
     */
    isEnabled: function()
    {
        return this._isEnabled;
    },

    /**
     * @param {boolean} enabled
     */
    setEnabled: function(enabled)
    {
        this._isEnabled = enabled;
        this._updateElementsClass();
    },

    /**
     * @return {boolean}
     */
    isVertical: function()
    {
        return this._isVertical;
    },

    /**
     * Vertical widget resizes height (along y-axis).
     * @param {boolean} vertical
     */
    setVertical: function(vertical)
    {
        this._isVertical = vertical;
        this._updateElementsClass();
    },

    /**
     * @return {!Array.<!Element>}
     */
    elements: function()
    {
        return this._elements.slice();
    },

    /**
     * @param {!Element} element
     */
    addElement: function(element)
    {
        if (this._elements.indexOf(element) !== -1)
            return;

        this._elements.push(element);
        element.addEventListener("mousedown", this._installDragOnMouseDownBound, false);
        element.classList.toggle("ns-resizer-widget", this._isVertical && this._isEnabled);
        element.classList.toggle("ew-resizer-widget", !this._isVertical && this._isEnabled);
    },

    /**
     * @param {!Element} element
     */
    removeElement: function(element)
    {
        if (this._elements.indexOf(element) === -1)
            return;

        this._elements.remove(element);
        element.removeEventListener("mousedown", this._installDragOnMouseDownBound, false);
        element.classList.remove("ns-resizer-widget");
        element.classList.remove("ew-resizer-widget");
    },

    _updateElementsClass: function()
    {
        for (var i = 0; i < this._elements.length; ++i) {
            this._elements[i].classList.toggle("ns-resizer-widget", this._isVertical && this._isEnabled);
            this._elements[i].classList.toggle("ew-resizer-widget", !this._isVertical && this._isEnabled);
        }
    },

    /**
     * @param {!Event} event
     */
    _installDragOnMouseDown: function(event)
    {
        // Only handle drags of the nodes specified.
        if (this._elements.indexOf(event.target) === -1)
            return false;
        WebInspector.elementDragStart(this._dragStart.bind(this), this._drag.bind(this), this._dragEnd.bind(this), this._isVertical ? "ns-resize" : "ew-resize", event);
    },

    /**
     * @param {!MouseEvent} event
     * @return {boolean}
     */
    _dragStart: function(event)
    {
        if (!this._isEnabled)
            return false;
        this._startPosition = this._isVertical ? event.pageY : event.pageX;
        this.dispatchEventToListeners(WebInspector.ResizerWidget.Events.ResizeStart, { startPosition: this._startPosition, currentPosition: this._startPosition });
        return true;
    },

    /**
     * @param {!MouseEvent} event
     * @return {boolean}
     */
    _drag: function(event)
    {
        if (!this._isEnabled) {
            this._dragEnd(event);
            return true;  // Cancel drag.
        }

        var position = this._isVertical ? event.pageY : event.pageX;
        this.dispatchEventToListeners(WebInspector.ResizerWidget.Events.ResizeUpdate, { startPosition: this._startPosition, currentPosition: position, shiftKey: event.shiftKey });
        event.preventDefault();
        return false;  // Continue drag.
    },

    /**
     * @param {!MouseEvent} event
     */
    _dragEnd: function(event)
    {
        this.dispatchEventToListeners(WebInspector.ResizerWidget.Events.ResizeEnd);
        delete this._startPosition;
    },

    __proto__: WebInspector.Object.prototype
};
