/*
 * Copyright (C) 2007 Apple Inc.  All rights reserved.
 * Copyright (C) 2009 Google Inc.  All rights reserved.
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
 * @param {string|!Node} title
 * @param {string=} subtitle
 */
WebInspector.Section = function(title, subtitle)
{
    this.element = createElement("div");
    this.element.className = "section";
    this.element._section = this;

    this.headerElement = createElement("div");
    this.headerElement.className = "header";

    this.titleElement = createElement("div");
    this.titleElement.className = "title";

    this.subtitleElement = createElement("div");
    this.subtitleElement.className = "subtitle";

    this.headerElement.appendChild(this.subtitleElement);
    this.headerElement.appendChild(this.titleElement);

    this.headerElement.addEventListener("click", this.handleClick.bind(this), false);
    this.element.appendChild(this.headerElement);

    this.title = title;
    if (subtitle) {
        this._subtitle = subtitle;
        this.subtitleElement.textContent = subtitle;
    }
    this._expanded = false;

    this.headerElement.classList.add("monospace");
    this.propertiesElement = createElement("ol");
    this.propertiesElement.className = "properties properties-tree monospace";
    this.propertiesTreeOutline = new TreeOutline(this.propertiesElement, true);
    this.propertiesTreeOutline.setFocusable(false);
    this.propertiesTreeOutline.section = this;

    this.element.appendChild(this.propertiesElement);
}

WebInspector.Section.prototype = {
    get title()
    {
        return this._title;
    },

    set title(x)
    {
        if (this._title === x)
            return;
        this._title = x;

        if (x instanceof Node) {
            this.titleElement.removeChildren();
            this.titleElement.appendChild(x);
        } else
          this.titleElement.textContent = x;
    },

    get subtitle()
    {
        return this._subtitle;
    },

    get subtitleAsTextForTest()
    {
        var result = this.subtitleElement.textContent;
        var child = this.subtitleElement.querySelector("[data-uncopyable]");
        if (child) {
            var linkData = child.getAttribute("data-uncopyable");
            if (linkData)
                result += linkData;
        }
        return result;
    },

    get expanded()
    {
        return this._expanded;
    },

    repopulate: function()
    {
        this._populated = false;
        if (this._expanded) {
            this.onpopulate();
            this._populated = true;
        }
    },

    /**
     * @protected
     */
    onpopulate: function()
    {
        // Overridden by subclasses.
    },

    expand: function()
    {
        if (this._expanded)
            return;
        this._expanded = true;
        this.element.classList.add("expanded");

        if (!this._populated) {
            this.onpopulate();
            this._populated = true;
        }
    },

    collapse: function()
    {
        if (!this._expanded)
            return;
        this._expanded = false;
        this.element.classList.remove("expanded");
    },

    /**
     * @param {!Event} event
     * @protected
     */
    handleClick: function(event)
    {
        if (this._expanded)
            this.collapse();
        else
            this.expand();
        event.consume();
    }
}
