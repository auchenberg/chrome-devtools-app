/*
 * Copyright 2015 The Chromium Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style license that can be
 * found in the LICENSE file.
 */

/**
 * @interface
 */
WebInspector.LayerView = function()
{
}

WebInspector.LayerView.prototype = {
    /**
     * @param {?WebInspector.LayerView.Selection} selection
     */
    hoverObject: function(selection) { },

    /**
     * @param {?WebInspector.LayerView.Selection} selection
     */
    selectObject: function(selection) { },

    /**
     * @param {?WebInspector.LayerTreeBase} layerTree
     */
    setLayerTree: function(layerTree) { }
}


/**
 * @constructor
 * @param {!WebInspector.LayerView.Selection.Type} type
 * @param {?WebInspector.Layer} layer
 */
WebInspector.LayerView.Selection = function(type, layer)
{
    this._type = type;
    this._layer = layer;
}

/**
 * @enum {string}
 */
WebInspector.LayerView.Selection.Type = {
    Layer: "Layer",
    ScrollRect: "ScrollRect",
    Tile: "Tile",
}

WebInspector.LayerView.Selection.prototype = {
    /**
     * @return {!WebInspector.LayerView.Selection.Type}
     */
    type: function()
    {
        return this._type;
    },

    /**
     * @return {?WebInspector.Layer}
     */
    layer: function()
    {
        return this._layer;
    },

    /**
     * @param {!WebInspector.LayerView.Selection} other
     * @return {boolean}
     */
    isEqual: function(other)
    {
        return false;
    }
}

/**
 * @constructor
 * @extends {WebInspector.LayerView.Selection}
 */
WebInspector.LayerView.LayerSelection = function(layer)
{
    WebInspector.LayerView.Selection.call(this, WebInspector.LayerView.Selection.Type.Layer, layer);
}

WebInspector.LayerView.LayerSelection.prototype = {
    /**
     * @override
     * @param {!WebInspector.LayerView.Selection} other
     * @return {boolean}
     */
    isEqual: function(other)
    {
        return other._type === WebInspector.LayerView.Selection.Type.Layer && other.layer().id() === this.layer().id();
    },

    __proto__: WebInspector.LayerView.Selection.prototype
}

/**
 * @constructor
 * @extends {WebInspector.LayerView.Selection}
 */
WebInspector.LayerView.ScrollRectSelection = function(layer, scrollRectIndex)
{
    WebInspector.LayerView.Selection.call(this, WebInspector.LayerView.Selection.Type.ScrollRect, layer);
    this.scrollRectIndex = scrollRectIndex;
}

WebInspector.LayerView.ScrollRectSelection.prototype = {
    /**
     * @override
     * @param {!WebInspector.LayerView.Selection} other
     * @return {boolean}
     */
    isEqual: function(other)
    {
        return other._type === WebInspector.LayerView.Selection.Type.ScrollRect &&
            this.layer().id() === other.layer().id() && this.scrollRectIndex === other.scrollRectIndex;
    },

    __proto__: WebInspector.LayerView.Selection.prototype
}

/**
 * @constructor
 * @extends {WebInspector.LayerView.Selection}
 * @param {!WebInspector.Layer} layer
 * @param {!WebInspector.TracingModel.Event} traceEvent
 */
WebInspector.LayerView.TileSelection = function(layer, traceEvent)
{
    WebInspector.LayerView.Selection.call(this, WebInspector.LayerView.Selection.Type.Tile, layer);
    this.traceEvent = traceEvent;
}

WebInspector.LayerView.TileSelection.prototype = {
    /**
     * @override
     * @param {!WebInspector.LayerView.Selection} other
     * @return {boolean}
     */
    isEqual: function(other)
    {
        return other._type === WebInspector.LayerView.Selection.Type.Tile
            && this.layer().id() === other.layer().id() && this.traceEvent === other.traceEvent;
    },

    __proto__: WebInspector.LayerView.Selection.prototype
}

/**
 * @constructor
 */
WebInspector.LayerViewHost = function()
{
    /** @type {!Array.<!WebInspector.LayerView>} */
    this._views = [];
    this._selectedObject = null;
    this._hoveredObject = null;
}

WebInspector.LayerViewHost.prototype = {
    /**
     * @param {!WebInspector.LayerView} layerView
     */
    registerView: function(layerView)
    {
        this._views.push(layerView);
    },

    /**
     * @param {?WebInspector.LayerTreeBase} layerTree
     */
    setLayerTree: function(layerTree)
    {
        this._target = layerTree.target();
        var selectedLayer = this._selectedObject && this._selectedObject.layer();
        if (selectedLayer && (!layerTree || !layerTree.layerById(selectedLayer.id())))
            this.selectObject(null);
        var hoveredLayer = this._hoveredObject && this._hoveredObject.layer();
        if (hoveredLayer && (!layerTree || !layerTree.layerById(hoveredLayer.id())))
            this.hoverObject(null);
        for (var view of this._views)
            view.setLayerTree(layerTree);
    },

    /**
     * @param {?WebInspector.LayerView.Selection} selection
     */
    hoverObject: function(selection)
    {
        if (this._hoveredObject === selection)
            return;
        this._hoveredObject = selection;
        var layer = selection && selection.layer();
        this._toggleNodeHighlight(layer ? layer.nodeForSelfOrAncestor() : null);
        for (var view of this._views)
            view.hoverObject(selection);
    },

    /**
     * @param {?WebInspector.LayerView.Selection} selection
     */
    selectObject: function(selection)
    {
        if (this._selectedObject === selection)
            return;
        this._selectedObject = selection;
        for (var view of this._views)
            view.selectObject(selection);
    },

    /**
     * @return {?WebInspector.LayerView.Selection}
     */
    selection: function()
    {
        return this._selectedObject;
    },

    /**
     * @param {?WebInspector.DOMNode} node
     */
    _toggleNodeHighlight: function(node)
    {
        if (node) {
            node.highlightForTwoSeconds();
            return;
        }
        if (this._target)
            this._target.domModel.hideDOMNodeHighlight();
    }
}

