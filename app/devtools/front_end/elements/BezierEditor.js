// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * @constructor
 * @extends {WebInspector.VBox}
 */
WebInspector.BezierEditor = function()
{
    WebInspector.VBox.call(this, true);
    this.registerRequiredCSS("elements/bezierEditor.css");
    this.contentElement.tabIndex = 0;

    this._label = this.contentElement.createChild("span", "source-code bezier-display-value");
    this._outerContainer = this.contentElement.createChild("div", "bezier-container");

    // Presets UI
    this._presetsContainer = this._outerContainer.createChild("div", "bezier-presets");
    this._presetUI = new WebInspector.BezierUI(40, 40, 0, 2, false);
    this._presetIcons = [];
    for (var category of WebInspector.BezierEditor.BezierPresets)
        this._presetsContainer.appendChild(this._createCategoryIcon(category));

    // Curve UI
    this._curveUI = new WebInspector.BezierUI(150, 270, 60, 7, true);
    this._curve = this._outerContainer.createSVGChild("svg", "bezier-curve");
    WebInspector.installDragHandle(this._curve, this._dragStart.bind(this), this._dragMove.bind(this), this._dragEnd.bind(this), "default");

    // Preview UI
    this._previewElement = this.contentElement.createChild("div", "bezier-preview-container");
    this._previewElement.createChild("div", "bezier-preview-animation");
    this._previewElement.addEventListener("click", this._startPreviewAnimation.bind(this));
    this._previewOnion = this.contentElement.createChild("div", "bezier-preview-onion");
    this._previewOnion.addEventListener("click", this._startPreviewAnimation.bind(this));
}

WebInspector.BezierEditor.Events = {
    BezierChanged: "BezierChanged"
}

WebInspector.BezierEditor.BezierPresets = [
    { title: "General", presets: [
        { name: "ease-in-out", value: "cubic-bezier(0.42, 0, 0.58, 1)" },
        { name: "ease-in-out-sine", value: "cubic-bezier(0.445, 0.05, 0.55, 0.95)" },
        { name: "ease-in-out-quad", value: "cubic-bezier(0.455, 0.03, 0.515, 0.955)" },
        { name: "ease-in-out-cubic", value: "cubic-bezier(0.645, 0.045, 0.355, 1)" },
        { name: "ease-in-out-quart", value: "cubic-bezier(0.77, 0, 0.175, 1)" },
        { name: "ease-in-out-quint", value: "cubic-bezier(0.86, 0, 0.07, 1)" },
        { name: "ease-in-out-expo", value: "cubic-bezier(1, 0, 0, 1)" },
        { name: "ease-in-out-circ", value: "cubic-bezier(0.785, 0.135, 0.15, 0.86)" },
        { name: "ease-in-out-back", value: "cubic-bezier(0.68, -0.55, 0.265, 1.55)" }
    ] },
    { title: "Incoming", presets: [
        { name: "ease-in", value: "cubic-bezier(0.42, 0, 1, 1)" },
        { name: "ease-in-sine", value: "cubic-bezier(0.47, 0, 0.745, 0.715)" },
        { name: "ease-in-quad", value: "cubic-bezier(0.55, 0.085, 0.68, 0.53)" },
        { name: "ease-in-cubic", value: "cubic-bezier(0.55, 0.055, 0.675, 0.19)" },
        { name: "ease-in-quart", value: "cubic-bezier(0.895, 0.03, 0.685, 0.22)" },
        { name: "ease-in-quint", value: "cubic-bezier(0.755, 0.05, 0.855, 0.06)" },
        { name: "ease-in-expo", value: "cubic-bezier(0.95, 0.05, 0.795, 0.035)" },
        { name: "ease-in-circ", value: "cubic-bezier(0.6, 0.04, 0.98, 0.335)" },
        { name: "ease-in-back", value: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" }
    ] },
    { title: "Outgoing", presets: [
        { name: "ease-out", value: "cubic-bezier(0, 0, 0.58, 1)" },
        { name: "ease-out-sine", value: "cubic-bezier(0.39, 0.575, 0.565, 1)" },
        { name: "ease-out-quad", value: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" },
        { name: "ease-out-cubic", value: "cubic-bezier(0.215, 0.61, 0.355, 1)" },
        { name: "ease-out-quart", value: "cubic-bezier(0.165, 0.84, 0.44, 1)" },
        { name: "ease-out-quint", value: "cubic-bezier(0.23, 1, 0.32, 1)" },
        { name: "ease-out-expo", value: "cubic-bezier(0.19, 1, 0.22, 1" },
        { name: "ease-out-circ", value: "cubic-bezier(0.075, 0.82, 0.165, 1)" },
        { name: "ease-out-back", value: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" }
    ] }
]

WebInspector.BezierEditor.prototype = {
    /**
     * @param {?WebInspector.Geometry.CubicBezier} bezier
     */
    setBezier: function(bezier)
    {
        if (!bezier)
            return;
        this._bezier = bezier;
        this._updateUI();
    },

    /**
     * @return {!WebInspector.Geometry.CubicBezier}
     */
    bezier: function()
    {
        return this._bezier;
    },

    wasShown: function()
    {
        this._updateUI();
        this._startPreviewAnimation();
    },

    _onchange: function()
    {
        this._updateUI();
        this.dispatchEventToListeners(WebInspector.BezierEditor.Events.BezierChanged, this._bezier.asCSSText());
    },

    _updateUI: function()
    {
        var labelText = this._categorySelected ? this._categorySelected.presets[this._presetIndex].name : this._bezier.asCSSText();
        this._label.textContent = WebInspector.UIString(labelText);
        this._curveUI.drawCurve(this._bezier, this._curve);
        this._previewOnion.removeChildren();
    },

    /**
     * @param {!Event} event
     * @return {boolean}
     */
    _dragStart: function(event)
    {
        this._mouseDownPosition = new WebInspector.Geometry.Point(event.x, event.y);
        var ui = this._curveUI;
        this._controlPosition = new WebInspector.Geometry.Point(
            Number.constrain((event.offsetX - ui.radius) / ui.curveWidth(), 0, 1),
            (ui.curveHeight() + ui.marginTop + ui.radius - event.offsetY) / ui.curveHeight());

        var firstControlPointIsCloser = this._controlPosition.distanceTo(this._bezier.controlPoints[0]) < this._controlPosition.distanceTo(this._bezier.controlPoints[1]);
        this._selectedPoint = firstControlPointIsCloser ? 0 : 1;

        this._bezier.controlPoints[this._selectedPoint] = this._controlPosition;
        this._unselectPresets();
        this._onchange();

        event.consume(true);
        return true;
    },

    /**
     * @param {number} mouseX
     * @param {number} mouseY
     */
    _updateControlPosition: function(mouseX, mouseY)
    {
        var deltaX = (mouseX - this._mouseDownPosition.x) / this._curveUI.curveWidth();
        var deltaY = (mouseY - this._mouseDownPosition.y) / this._curveUI.curveHeight();
        var newPosition = new WebInspector.Geometry.Point(Number.constrain(this._controlPosition.x + deltaX, 0, 1), this._controlPosition.y - deltaY);
        this._bezier.controlPoints[this._selectedPoint] = newPosition;
    },

    /**
     * @param {!Event} event
     */
    _dragMove: function(event)
    {
        this._updateControlPosition(event.x, event.y);
        this._onchange();
    },

    /**
     * @param {!Event} event
     */
    _dragEnd: function(event)
    {
        this._updateControlPosition(event.x, event.y);
        this._onchange();
        this._startPreviewAnimation();
    },

    /**
     * @param {{title: string, presets: !Array.<!Object>}} category
     */
    _createCategoryIcon: function(category)
    {
        /**
         * @param {!Element} parentElement
         * @param {string} className
         * @param {string} drawPath
         * @return {!Element}
         */
        function createPresetModifyIcon(parentElement, className, drawPath)
        {
            var icon = parentElement.createSVGChild("svg", "bezier-preset-modify " + className);
            icon.setAttribute("width", 20);
            icon.setAttribute("height", 20);
            var path = icon.createSVGChild("path");
            path.setAttribute("d", drawPath);
            return icon;
        }

        var presetElement = createElementWithClass("div", "bezier-preset-category");
        var icon = presetElement.createSVGChild("svg", "bezier-preset monospace");
        this._presetUI.drawCurve(WebInspector.Geometry.CubicBezier.parse(category.presets[0].value), icon);
        icon.addEventListener("click", this._presetCategorySelected.bind(this, icon, category));
        this._presetIcons.push(icon);
        var label = presetElement.createChild("div", "bezier-preset-label");
        label.textContent = WebInspector.UIString(category.title);

        var plus = createPresetModifyIcon(presetElement, "bezier-preset-plus", "M 5 10 L 15 10 M 10 5 L 10 15");
        plus.addEventListener("click", this._presetModifyClicked.bind(this, true));
        var minus = createPresetModifyIcon(presetElement, "bezier-preset-minus", "M 5 10 L 15 10");
        minus.addEventListener("click", this._presetModifyClicked.bind(this, false));
        return presetElement;
    },

    _unselectPresets: function()
    {
        for (var icon of this._presetIcons)
            icon.parentElement.classList.remove("bezier-preset-selected");
        delete this._categorySelected;
    },

    /**
     * @param {!Element} icon
     * @param {{title: string, presets: !Array.<!Object>}} category
     * @param {!Event} event
     */
    _presetCategorySelected: function(icon, category, event)
    {
        if (this._categorySelected === category)
            return;
        this._unselectPresets();
        this._categorySelected = category;
        this._presetIndex = 0;
        icon.parentElement.classList.add("bezier-preset-selected");
        this.setBezier(WebInspector.Geometry.CubicBezier.parse(category.presets[0].value));
        this._onchange();
        this._startPreviewAnimation();
        event.consume(true);
    },

    /**
     * @param {boolean} intensify
     * @param {!Event} event
     */
    _presetModifyClicked: function(intensify, event)
    {
        if (!this._categorySelected)
            return;

        if ((!intensify && this._presetIndex == 0) || (intensify && this._presetIndex == this._categorySelected.presets.length - 1))
            return;

        this._presetIndex = intensify ? this._presetIndex + 1 : this._presetIndex - 1;
        this.setBezier(WebInspector.Geometry.CubicBezier.parse(this._categorySelected.presets[this._presetIndex].value));
        this._onchange();
        this._startPreviewAnimation();
    },

    _startPreviewAnimation: function()
    {
        if (this._previewAnimation)
            this._previewAnimation.cancel();

        const animationDuration = 1600;
        const numberOnionSlices = 15;
        var keyframes = [{ transform: "translateX(0px)", easing: this._bezier.asCSSText() }, { transform: "translateX(170px)" }];

        this._previewAnimation = this._previewElement.animate(keyframes, { duration: animationDuration, fill: "forwards" });
        this._previewOnion.removeChildren();
        for (var i = 0; i < numberOnionSlices; i++) {
            var slice = this._previewOnion.createChild("div", "bezier-preview-animation");
            var player = slice.animate(keyframes, animationDuration);
            player.pause();
            player.currentTime = animationDuration * i / numberOnionSlices;
        }
    },

    __proto__: WebInspector.VBox.prototype
}

/**
 * @constructor
 * @extends {WebInspector.StylesPopoverIcon}
 * @param {!WebInspector.StylePropertyTreeElementBase} treeElement
 * @param {?WebInspector.StylesPopoverHelper} stylesPopoverHelper
 * @param {?WebInspector.BezierEditor} bezierEditor
 * @param {!Element} nameElement
 * @param {!Element} valueElement
 * @param {string} text
 */
WebInspector.BezierIcon = function(treeElement, stylesPopoverHelper, bezierEditor, nameElement, valueElement, text)
{
    WebInspector.StylesPopoverIcon.call(this, treeElement, stylesPopoverHelper, nameElement, valueElement, text);

    this._stylesPopoverHelper = stylesPopoverHelper;
    this._bezierEditor = bezierEditor;
    this._boundBezierChanged = this._bezierChanged.bind(this);
}

WebInspector.BezierIcon.prototype = {
    /**
     * @override
     * @return {?WebInspector.View}
     */
    view: function()
    {
        return this._bezierEditor;
    },

    /**
     * @return {!Node}
     */
    icon: function()
    {
        /**
         * @return {!Element}
         */
        function createIcon()
        {
            var icon = container.createSVGChild("svg", "popover-icon bezier-icon");
            icon.setAttribute("height", 10);
            icon.setAttribute("width", 10);
            var g = icon.createSVGChild("g");
            var path = g.createSVGChild("path");
            path.setAttribute("d", "M2,8 C2,3 8,7 8,2");
            return icon;
        }

        var container = createElement("nobr");
        this._iconElement = createIcon();
        this._iconElement.addEventListener("click", this._iconClick.bind(this), false);
        this._bezierValueElement = container.createChild("span");
        this._bezierValueElement.textContent = this._text;
        return container;
    },

    /**
     * @override
     * @param {!Event} event
     * @return {boolean}
     */
    toggle: function(event)
    {
        event.consume(true);

        if (!this._stylesPopoverHelper)
            return false;

        if (this._stylesPopoverHelper.isShowing()) {
            this._stylesPopoverHelper.hide(true);
        } else {
            this._bezierEditor.setBezier(WebInspector.Geometry.CubicBezier.parse(this._text));
            this._stylesPopoverHelper.show(this._bezierEditor, this._iconElement);
            this._bezierEditor.addEventListener(WebInspector.BezierEditor.Events.BezierChanged, this._boundBezierChanged);
        }

        return this._stylesPopoverHelper.isShowing();
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _bezierChanged: function(event)
    {
        this._bezierValueElement.textContent = /** @type {string} */ (event.data);
        this._valueChanged();
    },

    /**
     * @override
     * @param {!WebInspector.Event} event
     */
    popoverHidden: function(event)
    {
        this._bezierEditor.removeEventListener(WebInspector.BezierEditor.Events.BezierChanged, this._boundBezierChanged);
        WebInspector.StylesPopoverIcon.prototype.popoverHidden.call(this, event);
    },

    __proto__: WebInspector.StylesPopoverIcon.prototype
}
