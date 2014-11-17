/*
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2008, 2009 Anthony Ricaud <rik@webkit.org>
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @implements {WebInspector.ContextMenu.Provider}
 * @implements {WebInspector.Searchable}
 * @extends {WebInspector.Panel}
 */
WebInspector.NetworkPanel = function()
{
    WebInspector.Panel.call(this, "network");
    this.registerRequiredCSS("network/networkPanel.css");

    this._panelStatusBar = new WebInspector.StatusBar(this.element);
    this._filterBar = new WebInspector.FilterBar();
    this._filtersContainer = this.element.createChild("div", "network-filters-header hidden");
    this._filtersContainer.appendChild(this._filterBar.filtersElement());
    this._filterBar.addEventListener(WebInspector.FilterBar.Events.FiltersToggled, this._onFiltersToggled, this);
    this._filterBar.setName("networkPanel");

    this._searchableView = new WebInspector.SearchableView(this);
    this._searchableView.show(this.element);
    var contentsElement = this._searchableView.element;

    this._splitView = new WebInspector.SplitView(true, false, "networkPanelSplitViewState");
    this._splitView.show(contentsElement);
    this._splitView.hideMain();

    var defaultColumnsVisibility = WebInspector.NetworkLogView.defaultColumnsVisibility;
    var networkLogColumnsVisibilitySetting = WebInspector.settings.createSetting("networkLogColumnsVisibility", defaultColumnsVisibility);
    var savedColumnsVisibility = networkLogColumnsVisibilitySetting.get();
    var columnsVisibility = {};
    for (var columnId in defaultColumnsVisibility)
        columnsVisibility[columnId] = savedColumnsVisibility.hasOwnProperty(columnId) ? savedColumnsVisibility[columnId] : defaultColumnsVisibility[columnId];
    networkLogColumnsVisibilitySetting.set(columnsVisibility);

    /** @type {!WebInspector.NetworkLogView} */
    this._networkLogView = new WebInspector.NetworkLogView(this._filterBar, networkLogColumnsVisibilitySetting);
    this._networkLogView.show(this._splitView.sidebarElement());

    var viewsContainerView = new WebInspector.VBox();
    this._viewsContainerElement = viewsContainerView.element;
    this._viewsContainerElement.id = "network-views";
    if (!this._networkLogView.usesLargeRows())
        this._viewsContainerElement.classList.add("small");
    viewsContainerView.show(this._splitView.mainElement());

    this._networkLogView.addEventListener(WebInspector.NetworkLogView.EventTypes.ViewCleared, this._onViewCleared, this);
    this._networkLogView.addEventListener(WebInspector.NetworkLogView.EventTypes.RowSizeChanged, this._onRowSizeChanged, this);
    this._networkLogView.addEventListener(WebInspector.NetworkLogView.EventTypes.RequestSelected, this._onRequestSelected, this);
    this._networkLogView.addEventListener(WebInspector.NetworkLogView.EventTypes.SearchCountUpdated, this._onSearchCountUpdated, this);
    this._networkLogView.addEventListener(WebInspector.NetworkLogView.EventTypes.SearchIndexUpdated, this._onSearchIndexUpdated, this);

    this._closeButtonElement = this._viewsContainerElement.createChild("div", "close-button");
    this._closeButtonElement.id = "network-close-button";
    this._closeButtonElement.addEventListener("click", this._toggleGridMode.bind(this), false);
    this._viewsContainerElement.appendChild(this._closeButtonElement);

    var statusBarItems = this._networkLogView.statusBarItems();
    for (var i = 0; i < statusBarItems.length; ++i)
        this._panelStatusBar.appendStatusBarItem(statusBarItems[i]);

    /**
     * @this {WebInspector.NetworkPanel}
     * @return {?WebInspector.SourceFrame}
     */
    function sourceFrameGetter()
    {
        return this._networkItemView.currentSourceFrame();
    }
    WebInspector.GoToLineDialog.install(this, sourceFrameGetter.bind(this));
}

WebInspector.NetworkPanel.prototype = {
    /**
     * @param {!WebInspector.Event} event
     */
    _onFiltersToggled: function(event)
    {
        var toggled = /** @type {boolean} */ (event.data);
        this._filtersContainer.classList.toggle("hidden", !toggled);
        this.element.classList.toggle("filters-toggled", toggled);
        this.doResize();
    },

    /**
     * @return {!Array.<!Element>}
     */
    elementsToRestoreScrollPositionsFor: function()
    {
        return this._networkLogView.elementsToRestoreScrollPositionsFor();
    },

    /**
     * @return {!WebInspector.SearchableView}
     */
    searchableView: function()
    {
        return this._searchableView;
    },

    /**
     * @param {!KeyboardEvent} event
     */
    handleShortcut: function(event)
    {
        if (this._viewingRequestMode && event.keyCode === WebInspector.KeyboardShortcut.Keys.Esc.code) {
            this._toggleGridMode();
            event.handled = true;
            return;
        }

        WebInspector.Panel.prototype.handleShortcut.call(this, event);
    },

    wasShown: function()
    {
        WebInspector.Panel.prototype.wasShown.call(this);
    },

    /**
     * @param {!WebInspector.NetworkRequest} request
     */
    revealAndHighlightRequest: function(request)
    {
        this._toggleGridMode();
        if (request)
            this._networkLogView.revealAndHighlightRequest(request);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _onViewCleared: function(event)
    {
        this._closeVisibleRequest();
        this._toggleGridMode();
        this._viewsContainerElement.removeChildren();
        this._viewsContainerElement.appendChild(this._closeButtonElement);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _onRowSizeChanged: function(event)
    {
        this._viewsContainerElement.classList.toggle("small", !event.data.largeRows);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _onSearchCountUpdated: function(event)
    {
        var count = /** @type {number} */ (event.data);
        this._searchableView.updateSearchMatchesCount(count);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _onSearchIndexUpdated: function(event)
    {
        var index = /** @type {number} */ (event.data);
        this._searchableView.updateCurrentMatchIndex(index);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _onRequestSelected: function(event)
    {
        var request = /** @type {!WebInspector.NetworkRequest} */ (event.data);
        this._showRequest(request);
    },

    /**
     * @param {?WebInspector.NetworkRequest} request
     */
    _showRequest: function(request)
    {
        if (!request)
            return;

        this._toggleViewingRequestMode();

        if (this._networkItemView) {
            this._networkItemView.detach();
            delete this._networkItemView;
        }

        var view = new WebInspector.NetworkItemView(request);
        view.show(this._viewsContainerElement);
        this._networkItemView = view;
    },

    _closeVisibleRequest: function()
    {
        this.element.classList.remove("viewing-resource");

        if (this._networkItemView) {
            this._networkItemView.detach();
            delete this._networkItemView;
        }
    },

    _toggleGridMode: function()
    {
        if (this._viewingRequestMode) {
            this._viewingRequestMode = false;
            this.element.classList.remove("viewing-resource");
            this._splitView.hideMain();
        }

        this._networkLogView.switchViewMode(true);
    },

    _toggleViewingRequestMode: function()
    {
        if (this._viewingRequestMode)
            return;
        this._viewingRequestMode = true;

        this.element.classList.add("viewing-resource");
        this._splitView.showBoth();
        this._networkLogView.switchViewMode(false);
    },

    /**
     * @param {!WebInspector.SearchableView.SearchConfig} searchConfig
     * @param {boolean} shouldJump
     * @param {boolean=} jumpBackwards
     */
    performSearch: function(searchConfig, shouldJump, jumpBackwards)
    {
        this._networkLogView.performSearch(searchConfig, shouldJump, jumpBackwards);
    },

    jumpToPreviousSearchResult: function()
    {
        this._networkLogView.jumpToPreviousSearchResult();
    },

    /**
     * @return {boolean}
     */
    supportsCaseSensitiveSearch: function()
    {
        return false;
    },

    /**
     * @return {boolean}
     */
    supportsRegexSearch: function()
    {
        return false;
    },

    jumpToNextSearchResult: function()
    {
        this._networkLogView.jumpToNextSearchResult();
    },

    searchCanceled: function()
    {
        this._networkLogView.searchCanceled();
    },

    /**
     * @param {!Event} event
     * @param {!WebInspector.ContextMenu} contextMenu
     * @param {!Object} target
     * @this {WebInspector.NetworkPanel}
     */
    appendApplicableItems: function(event, contextMenu, target)
    {
        /**
         * @this {WebInspector.NetworkPanel}
         */
        function reveal(request)
        {
            WebInspector.inspectorView.setCurrentPanel(this);
            this.revealAndHighlightRequest(request);
        }

        /**
         * @this {WebInspector.NetworkPanel}
         */
        function appendRevealItem(request)
        {
            var revealText = WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Reveal in Network panel" : "Reveal in Network Panel");
            contextMenu.appendItem(revealText, reveal.bind(this, request));
        }

        if (target instanceof WebInspector.Resource) {
            var resource = /** @type {!WebInspector.Resource} */ (target);
            if (resource.request)
                appendRevealItem.call(this, resource.request);
            return;
        }
        if (target instanceof WebInspector.UISourceCode) {
            var uiSourceCode = /** @type {!WebInspector.UISourceCode} */ (target);
            var resource = WebInspector.resourceForURL(uiSourceCode.url);
            if (resource && resource.request)
                appendRevealItem.call(this, resource.request);
            return;
        }

        if (!(target instanceof WebInspector.NetworkRequest))
            return;
        var request = /** @type {!WebInspector.NetworkRequest} */ (target);
        if (this._networkItemView && this._networkItemView.isShowing() && this._networkItemView.request() === request)
            return;

        appendRevealItem.call(this, request);
    },

    __proto__: WebInspector.Panel.prototype
}

/**
 * @constructor
 * @implements {WebInspector.ContextMenu.Provider}
 */
WebInspector.NetworkPanel.ContextMenuProvider = function()
{
}

WebInspector.NetworkPanel.ContextMenuProvider.prototype = {
    /**
     * @param {!Event} event
     * @param {!WebInspector.ContextMenu} contextMenu
     * @param {!Object} target
     */
    appendApplicableItems: function(event, contextMenu, target)
    {
        WebInspector.NetworkPanel._instance().appendApplicableItems(event, contextMenu, target);
    }
}

/**
 * @constructor
 * @implements {WebInspector.Revealer}
 */
WebInspector.NetworkPanel.RequestRevealer = function()
{
}

WebInspector.NetworkPanel.RequestRevealer.prototype = {
    /**
     * @param {!Object} request
     * @param {number=} lineNumber
     * @return {!Promise}
     */
    reveal: function(request, lineNumber)
    {
        if (request instanceof WebInspector.NetworkRequest) {

            var panel = WebInspector.NetworkPanel._instance();
            WebInspector.inspectorView.setCurrentPanel(panel);
            panel.revealAndHighlightRequest(request);
            return Promise.resolve();
        }
        return Promise.rejectWithError("Internal error: not a network request");
    }
}

/**
 * @constructor
 * @implements {WebInspector.TimelineGrid.Calculator}
 */
WebInspector.NetworkTimeCalculator = function(startAtZero)
{
    this.startAtZero = startAtZero;
}

/** @type {!WebInspector.UIStringFormat} */
WebInspector.NetworkTimeCalculator._latencyDownloadTotalFormat = new WebInspector.UIStringFormat("%s latency, %s download (%s total)");

/** @type {!WebInspector.UIStringFormat} */
WebInspector.NetworkTimeCalculator._latencyFormat = new WebInspector.UIStringFormat("%s latency");

/** @type {!WebInspector.UIStringFormat} */
WebInspector.NetworkTimeCalculator._downloadFormat = new WebInspector.UIStringFormat("%s download");

/** @type {!WebInspector.UIStringFormat} */
WebInspector.NetworkTimeCalculator._fromServiceWorkerFormat = new WebInspector.UIStringFormat("%s (from ServiceWorker)");

/** @type {!WebInspector.UIStringFormat} */
WebInspector.NetworkTimeCalculator._fromCacheFormat = new WebInspector.UIStringFormat("%s (from cache)");

WebInspector.NetworkTimeCalculator.prototype = {
    /**
     * @override
     * @return {number}
     */
    paddingLeft: function()
    {
        return 0;
    },

    /**
     * @override
     * @param {number} time
     * @return {number}
     */
    computePosition: function(time)
    {
        return (time - this._minimumBoundary) / this.boundarySpan() * this._workingArea;
    },

    /**
     * @override
     * @param {number} value
     * @param {number=} precision
     * @return {string}
     */
    formatTime: function(value, precision)
    {
        return Number.secondsToString(value);
    },

    /**
     * @override
     * @return {number}
     */
    minimumBoundary: function()
    {
        return this._minimumBoundary;
    },

    /**
     * @override
     * @return {number}
     */
    zeroTime: function()
    {
        return this._minimumBoundary;
    },

    /**
     * @override
     * @return {number}
     */
    maximumBoundary: function()
    {
        return this._maximumBoundary;
    },

    /**
     * @override
     * @return {number}
     */
    boundarySpan: function()
    {
        return this._maximumBoundary - this._minimumBoundary;
    },

    reset: function()
    {
        delete this._minimumBoundary;
        delete this._maximumBoundary;
    },

    /**
     * @return {number}
     */
    _value: function(item)
    {
        return 0;
    },

    /**
     * @param {number} clientWidth
     */
    setDisplayWindow: function(clientWidth)
    {
        this._workingArea = clientWidth;
    },

    /**
     * @param {!WebInspector.NetworkRequest} request
     * @return {!{start: number, middle: number, end: number}}
     */
    computeBarGraphPercentages: function(request)
    {
        if (request.startTime !== -1)
            var start = ((request.startTime - this._minimumBoundary) / this.boundarySpan()) * 100;
        else
            var start = 0;

        if (request.responseReceivedTime !== -1)
            var middle = ((request.responseReceivedTime - this._minimumBoundary) / this.boundarySpan()) * 100;
        else
            var middle = (this.startAtZero ? start : 100);

        if (request.endTime !== -1)
            var end = ((request.endTime - this._minimumBoundary) / this.boundarySpan()) * 100;
        else
            var end = (this.startAtZero ? middle : 100);

        if (this.startAtZero) {
            end -= start;
            middle -= start;
            start = 0;
        }

        return {start: start, middle: middle, end: end};
    },

    /**
     * @param {number} eventTime
     * @return {number}
     */
    computePercentageFromEventTime: function(eventTime)
    {
        // This function computes a percentage in terms of the total loading time
        // of a specific event. If startAtZero is set, then this is useless, and we
        // want to return 0.
        if (eventTime !== -1 && !this.startAtZero)
            return ((eventTime - this._minimumBoundary) / this.boundarySpan()) * 100;

        return 0;
    },

    /**
     * @param {number} eventTime
     * @return {boolean}
     */
    updateBoundariesForEventTime: function(eventTime)
    {
        if (eventTime === -1 || this.startAtZero)
            return false;

        if (typeof this._maximumBoundary === "undefined" || eventTime > this._maximumBoundary) {
            this._maximumBoundary = eventTime;
            return true;
        }
        return false;
    },

    /**
     * @param {!WebInspector.NetworkRequest} request
     * @return {!{left: string, right: string, tooltip: (string|undefined)}}
     */
    computeBarGraphLabels: function(request)
    {
        var rightLabel = "";
        if (request.responseReceivedTime !== -1 && request.endTime !== -1)
            rightLabel = Number.secondsToString(request.endTime - request.responseReceivedTime);

        var hasLatency = request.latency > 0;
        if (hasLatency)
            var leftLabel = Number.secondsToString(request.latency);
        else
            var leftLabel = rightLabel;

        if (request.timing)
            return {left: leftLabel, right: rightLabel};

        if (hasLatency && rightLabel) {
            var total = Number.secondsToString(request.duration);
            var tooltip = WebInspector.NetworkTimeCalculator._latencyDownloadTotalFormat.format(leftLabel, rightLabel, total);
        } else if (hasLatency)
            var tooltip = WebInspector.NetworkTimeCalculator._latencyFormat.format(leftLabel);
        else if (rightLabel)
            var tooltip = WebInspector.NetworkTimeCalculator._downloadFormat.format(rightLabel);

        if (request.fetchedViaServiceWorker)
            tooltip = WebInspector.NetworkTimeCalculator._fromServiceWorkerFormat.format(tooltip);
        else if (request.cached())
            tooltip = WebInspector.NetworkTimeCalculator._fromCacheFormat.format(tooltip);
        return {left: leftLabel, right: rightLabel, tooltip: tooltip};
    },

    /**
     * @param {!WebInspector.NetworkRequest} request
     * @return {boolean}
     */
    updateBoundaries: function(request)
    {
        var didChange = false;

        var lowerBound;
        if (this.startAtZero)
            lowerBound = 0;
        else
            lowerBound = this._lowerBound(request);

        if (lowerBound !== -1 && (typeof this._minimumBoundary === "undefined" || lowerBound < this._minimumBoundary)) {
            this._minimumBoundary = lowerBound;
            didChange = true;
        }

        var upperBound = this._upperBound(request);
        if (upperBound !== -1 && (typeof this._maximumBoundary === "undefined" || upperBound > this._maximumBoundary)) {
            this._maximumBoundary = upperBound;
            didChange = true;
        }

        return didChange;
    },

    /**
     * @param {!WebInspector.NetworkRequest} request
     * @return {number}
     */
    _lowerBound: function(request)
    {
        return 0;
    },

    /**
     * @param {!WebInspector.NetworkRequest} request
     * @return {number}
     */
    _upperBound: function(request)
    {
        return 0;
    }
}

/**
 * @constructor
 * @extends {WebInspector.NetworkTimeCalculator}
 */
WebInspector.NetworkTransferTimeCalculator = function()
{
    WebInspector.NetworkTimeCalculator.call(this, false);
}

WebInspector.NetworkTransferTimeCalculator.prototype = {
    /**
     * @override
     * @param {number} value
     * @param {number=} precision
     * @return {string}
     */
    formatTime: function(value, precision)
    {
        return Number.secondsToString(value - this.zeroTime());
    },

    /**
     * @override
     * @param {!WebInspector.NetworkRequest} request
     * @return {number}
     */
    _lowerBound: function(request)
    {
        return request.startTime;
    },

    /**
     * @override
     * @param {!WebInspector.NetworkRequest} request
     * @return {number}
     */
    _upperBound: function(request)
    {
        return request.endTime;
    },

    __proto__: WebInspector.NetworkTimeCalculator.prototype
}

/**
 * @constructor
 * @extends {WebInspector.NetworkTimeCalculator}
 */
WebInspector.NetworkTransferDurationCalculator = function()
{
    WebInspector.NetworkTimeCalculator.call(this, true);
}

WebInspector.NetworkTransferDurationCalculator.prototype = {
    /**
     * @override
     * @param {number} value
     * @param {number=} precision
     * @return {string}
     */
    formatTime: function(value, precision)
    {
        return Number.secondsToString(value);
    },

    /**
     * @override
     * @param {!WebInspector.NetworkRequest} request
     * @return {number}
     */
    _upperBound: function(request)
    {
        return request.duration;
    },

    __proto__: WebInspector.NetworkTimeCalculator.prototype
}

WebInspector.NetworkPanel.show = function()
{
    WebInspector.inspectorView.setCurrentPanel(WebInspector.NetworkPanel._instance());
}

/**
 * @return {!WebInspector.NetworkPanel}
 */
WebInspector.NetworkPanel._instance = function()
{
    if (!WebInspector.NetworkPanel._instanceObject)
        WebInspector.NetworkPanel._instanceObject = new WebInspector.NetworkPanel();
    return WebInspector.NetworkPanel._instanceObject;
}

/**
 * @constructor
 * @implements {WebInspector.PanelFactory}
 */
WebInspector.NetworkPanelFactory = function()
{
}

WebInspector.NetworkPanelFactory.prototype = {
    /**
     * @return {!WebInspector.Panel}
     */
    createPanel: function()
    {
        return WebInspector.NetworkPanel._instance();
    }
}

/**
 * @constructor
 */
WebInspector.HARWriter = function()
{
}

WebInspector.HARWriter.prototype = {
    /**
     * @param {!WebInspector.OutputStream} stream
     * @param {!Array.<!WebInspector.NetworkRequest>} requests
     * @param {!WebInspector.Progress} progress
     */
    write: function(stream, requests, progress)
    {
        this._stream = stream;
        this._harLog = (new WebInspector.HARLog(requests)).build();
        this._pendingRequests = 1; // Guard against completing resource transfer before all requests are made.
        var entries = this._harLog.entries;
        for (var i = 0; i < entries.length; ++i) {
            var content = requests[i].content;
            if (typeof content === "undefined" && requests[i].finished) {
                ++this._pendingRequests;
                requests[i].requestContent(this._onContentAvailable.bind(this, entries[i], requests[i]));
            } else if (content !== null)
                this._setEntryContent(entries[i], requests[i]);
        }
        var compositeProgress = new WebInspector.CompositeProgress(progress);
        this._writeProgress = compositeProgress.createSubProgress();
        if (--this._pendingRequests) {
            this._requestsProgress = compositeProgress.createSubProgress();
            this._requestsProgress.setTitle(WebInspector.UIString("Collecting content…"));
            this._requestsProgress.setTotalWork(this._pendingRequests);
        } else
            this._beginWrite();
    },

    /**
     * @param {!Object} entry
     * @param {!WebInspector.NetworkRequest} request
     */
    _setEntryContent: function(entry, request)
    {
        if (request.content !== null)
            entry.response.content.text = request.content;
        if (request.contentEncoded)
            entry.response.content.encoding = "base64";
    },

    /**
     * @param {!Object} entry
     * @param {!WebInspector.NetworkRequest} request
     * @param {?string} content
     */
    _onContentAvailable: function(entry, request, content)
    {
        this._setEntryContent(entry, request);
        if (this._requestsProgress)
            this._requestsProgress.worked();
        if (!--this._pendingRequests) {
            this._requestsProgress.done();
            this._beginWrite();
        }
    },

    _beginWrite: function()
    {
        const jsonIndent = 2;
        this._text = JSON.stringify({log: this._harLog}, null, jsonIndent);
        this._writeProgress.setTitle(WebInspector.UIString("Writing file…"));
        this._writeProgress.setTotalWork(this._text.length);
        this._bytesWritten = 0;
        this._writeNextChunk(this._stream);
    },

    /**
     * @param {!WebInspector.OutputStream} stream
     * @param {string=} error
     */
    _writeNextChunk: function(stream, error)
    {
        if (this._bytesWritten >= this._text.length || error) {
            stream.close();
            this._writeProgress.done();
            return;
        }
        const chunkSize = 100000;
        var text = this._text.substring(this._bytesWritten, this._bytesWritten + chunkSize);
        this._bytesWritten += text.length;
        stream.write(text, this._writeNextChunk.bind(this));
        this._writeProgress.setWorked(this._bytesWritten);
    }
}
