/*!
Plottable v0.1.2 (https://github.com/palantir/plottable)
Copyright 2014 Palantir Technologies
Licensed under MIT (https://github.com/palantir/plottable/blob/master/LICENSE)
*/

var Utils;
(function (Utils) {
    function inRange(x, a, b) {
        return (Math.min(a, b) <= x && x <= Math.max(a, b));
    }
    Utils.inRange = inRange;

    function getBBox(element) {
        return element.node().getBBox();
    }
    Utils.getBBox = getBBox;
})(Utils || (Utils = {}));
var Component = (function () {
    function Component() {
        this.registeredInteractions = [];
        this.boxes = [];
        this.clipPathEnabled = false;
        this.rowWeightVal = 0;
        this.colWeightVal = 0;
        this.rowMinimumVal = 0;
        this.colMinimumVal = 0;
        this.cssClasses = ["component"];
        this.xAlignment = "LEFT";
        this.yAlignment = "TOP";
    }
    Component.prototype.anchor = function (element) {
        var _this = this;
        if (element.node().childNodes.length > 0) {
            throw new Error("Can't anchor to a non-empty element");
        }
        this.element = element;
        if (this.clipPathEnabled) {
            this.generateClipPath();
        }
        ;
        this.cssClasses.forEach(function (cssClass) {
            _this.element.classed(cssClass, true);
        });
        this.cssClasses = null;

        this.hitBox = this.addBox("hit-box");
        this.addBox("bounding-box");

        this.hitBox.style("fill", "#ffffff").style("opacity", 0);
        this.registeredInteractions.forEach(function (r) {
            return r.anchor(_this.hitBox);
        });
        return this;
    };

    Component.prototype.computeLayout = function (xOffset, yOffset, availableWidth, availableHeight) {
        var _this = this;
        if (xOffset == null || yOffset == null || availableWidth == null || availableHeight == null) {
            if (this.element == null) {
                throw new Error("anchor must be called before computeLayout");
            } else if (this.element.node().nodeName === "svg") {
                xOffset = 0;
                yOffset = 0;
                availableWidth = parseFloat(this.element.attr("width"));
                availableHeight = parseFloat(this.element.attr("height"));
            } else {
                throw new Error("null arguments cannot be passed to computeLayout() on a non-root (non-<svg>) node");
            }
        }
        if (this.rowWeight() === 0 && this.rowMinimum() !== 0) {
            switch (this.yAlignment) {
                case "TOP":
                    break;
                case "CENTER":
                    yOffset += (availableHeight - this.rowMinimum()) / 2;
                    break;
                case "BOTTOM":
                    yOffset += availableHeight - this.rowMinimum();
                    break;
                default:
                    throw new Error(this.yAlignment + " is not a supported alignment");
            }
            availableHeight = this.rowMinimum();
        }
        if (this.colWeight() === 0 && this.colMinimum() !== 0) {
            switch (this.xAlignment) {
                case "LEFT":
                    break;
                case "CENTER":
                    xOffset += (availableWidth - this.colMinimum()) / 2;
                    break;
                case "RIGHT":
                    xOffset += availableWidth - this.colMinimum();
                    break;
                default:
                    throw new Error(this.xAlignment + " is not a supported alignment");
            }
            availableWidth = this.colMinimum();
        }
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.availableWidth = availableWidth;
        this.availableHeight = availableHeight;
        this.element.attr("transform", "translate(" + this.xOffset + "," + this.yOffset + ")");
        this.boxes.forEach(function (b) {
            return b.attr("width", _this.availableWidth).attr("height", _this.availableHeight);
        });
        return this;
    };

    Component.prototype.render = function () {
        return this;
    };

    Component.prototype.addBox = function (className, parentElement) {
        if (this.element == null) {
            throw new Error("Adding boxes before anchoring is currently disallowed");
        }
        var parentElement = parentElement == null ? this.element : parentElement;
        var box = parentElement.append("rect");
        if (className != null) {
            box.classed(className, true);
        }
        ;
        this.boxes.push(box);
        if (this.availableWidth != null && this.availableHeight != null) {
            box.attr("width", this.availableWidth).attr("height", this.availableHeight);
        }
        return box;
    };

    Component.prototype.generateClipPath = function () {
        var clipPathId = Component.clipPathId++;
        this.element.attr("clip-path", "url(#clipPath" + clipPathId + ")");
        var clipPathParent = this.element.append("clipPath").attr("id", "clipPath" + clipPathId);
        this.addBox("clip-rect", clipPathParent);
    };

    Component.prototype.registerInteraction = function (interaction) {
        this.registeredInteractions.push(interaction);
        if (this.element != null) {
            interaction.anchor(this.hitBox);
        }
    };

    Component.prototype.classed = function (cssClass, addClass) {
        if (addClass == null) {
            if (this.element == null) {
                return (this.cssClasses.indexOf(cssClass) !== -1);
            } else {
                return this.element.classed(cssClass);
            }
        } else {
            if (this.element == null) {
                var classIndex = this.cssClasses.indexOf(cssClass);
                if (addClass && classIndex === -1) {
                    this.cssClasses.push(cssClass);
                } else if (!addClass && classIndex !== -1) {
                    this.cssClasses.splice(classIndex, 1);
                }
            } else {
                this.element.classed(cssClass, addClass);
            }
            return this;
        }
    };

    Component.prototype.rowWeight = function (newVal) {
        if (newVal != null) {
            this.rowWeightVal = newVal;
            chai.assert.operator(this.rowWeightVal, ">=", 0, "rowWeight is a reasonable number");
            return this;
        } else {
            return this.rowWeightVal;
        }
    };

    Component.prototype.colWeight = function (newVal) {
        if (newVal != null) {
            this.colWeightVal = newVal;
            chai.assert.operator(this.colWeightVal, ">=", 0, "colWeight is a reasonable number");
            return this;
        } else {
            return this.colWeightVal;
        }
    };

    Component.prototype.rowMinimum = function (newVal) {
        if (newVal != null) {
            this.rowMinimumVal = newVal;
            chai.assert.operator(this.rowMinimumVal, ">=", 0, "rowMinimum is a reasonable number");
            return this;
        } else {
            return this.rowMinimumVal;
        }
    };

    Component.prototype.colMinimum = function (newVal) {
        if (newVal != null) {
            this.colMinimumVal = newVal;
            chai.assert.operator(this.colMinimumVal, ">=", 0, "colMinimum is a reasonable number");
            return this;
        } else {
            return this.colMinimumVal;
        }
    };
    Component.clipPathId = 0;
    return Component;
})();
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Scale = (function () {
    function Scale(scale) {
        this.broadcasterCallbacks = [];
        this.scale = scale;
    }
    Scale.prototype.public = function (value) {
        return this.scale(value);
    };

    Scale.prototype.domain = function (values) {
        var _this = this;
        if (values != null) {
            this.scale.domain(values);
            this.broadcasterCallbacks.forEach(function (b) {
                return b(_this);
            });
            return this;
        } else {
            return this.scale.domain();
        }
    };

    Scale.prototype.range = function (values) {
        if (values != null) {
            this.scale.range(values);
            return this;
        } else {
            return this.scale.range();
        }
    };

    Scale.prototype.copy = function () {
        return new Scale(this.scale.copy());
    };

    Scale.prototype.registerListener = function (callback) {
        this.broadcasterCallbacks.push(callback);
        return this;
    };
    return Scale;
})();

var QuantitiveScale = (function (_super) {
    __extends(QuantitiveScale, _super);
    function QuantitiveScale(scale) {
        _super.call(this, scale);
    }
    QuantitiveScale.prototype.invert = function (value) {
        return this.scale.invert(value);
    };

    QuantitiveScale.prototype.ticks = function (count) {
        return this.scale.ticks(count);
    };

    QuantitiveScale.prototype.copy = function () {
        return new QuantitiveScale(this.scale.copy());
    };

    QuantitiveScale.prototype.widenDomain = function (newDomain) {
        var currentDomain = this.domain();
        var wideDomain = [Math.min(newDomain[0], currentDomain[0]), Math.max(newDomain[1], currentDomain[1])];
        this.domain(wideDomain);
        return this;
    };
    return QuantitiveScale;
})(Scale);

var LinearScale = (function (_super) {
    __extends(LinearScale, _super);
    function LinearScale(scale) {
        _super.call(this, scale == null ? d3.scale.linear() : scale);
        this.domain([Infinity, -Infinity]);
    }
    LinearScale.prototype.copy = function () {
        return new LinearScale(this.scale.copy());
    };
    return LinearScale;
})(QuantitiveScale);
var Interaction = (function () {
    function Interaction(componentToListenTo) {
        this.componentToListenTo = componentToListenTo;
    }
    Interaction.prototype.anchor = function (hitBox) {
        this.hitBox = hitBox;
    };

    Interaction.prototype.registerWithComponent = function () {
        this.componentToListenTo.registerInteraction(this);
    };
    return Interaction;
})();

var PanZoomInteraction = (function (_super) {
    __extends(PanZoomInteraction, _super);
    function PanZoomInteraction(componentToListenTo, renderers, xScale, yScale) {
        var _this = this;
        _super.call(this, componentToListenTo);
        this.xScale = xScale;
        this.yScale = yScale;
        this.zoom = d3.behavior.zoom();
        this.zoom.x(this.xScale.scale);
        this.zoom.y(this.yScale.scale);
        this.zoom.on("zoom", function () {
            return _this.rerenderZoomed();
        });

        this.registerWithComponent();
    }
    PanZoomInteraction.prototype.anchor = function (hitBox) {
        _super.prototype.anchor.call(this, hitBox);
        this.zoom(hitBox);
    };

    PanZoomInteraction.prototype.rerenderZoomed = function () {
        var xDomain = this.xScale.scale.domain();
        var yDomain = this.yScale.scale.domain();
        this.xScale.domain(xDomain);
        this.yScale.domain(yDomain);
    };
    return PanZoomInteraction;
})(Interaction);

var AreaInteraction = (function (_super) {
    __extends(AreaInteraction, _super);
    function AreaInteraction(rendererComponent, areaCallback, selectionCallback, indicesCallback) {
        var _this = this;
        _super.call(this, rendererComponent);
        this.rendererComponent = rendererComponent;
        this.areaCallback = areaCallback;
        this.selectionCallback = selectionCallback;
        this.indicesCallback = indicesCallback;
        this.dragInitialized = false;
        this.origin = [0, 0];
        this.location = [0, 0];
        this.dragBehavior = d3.behavior.drag();
        this.dragBehavior.on("dragstart", function () {
            return _this.dragstart();
        });
        this.dragBehavior.on("drag", function () {
            return _this.drag();
        });
        this.dragBehavior.on("dragend", function () {
            return _this.dragend();
        });
        this.registerWithComponent();
    }
    AreaInteraction.prototype.dragstart = function () {
        this.clearBox();
        var availableWidth = parseFloat(this.hitBox.attr("width"));
        var availableHeight = parseFloat(this.hitBox.attr("height"));

        var constraintFunction = function (min, max) {
            return function (x) {
                return Math.min(Math.max(x, min), max);
            };
        };
        this.constrainX = constraintFunction(0, availableWidth);
        this.constrainY = constraintFunction(0, availableHeight);
    };

    AreaInteraction.prototype.drag = function () {
        if (!this.dragInitialized) {
            this.origin = [d3.event.x, d3.event.y];
            this.dragInitialized = true;
        }

        this.location = [this.constrainX(d3.event.x), this.constrainY(d3.event.y)];
        var width = Math.abs(this.origin[0] - this.location[0]);
        var height = Math.abs(this.origin[1] - this.location[1]);
        var x = Math.min(this.origin[0], this.location[0]);
        var y = Math.min(this.origin[1], this.location[1]);
        this.dragBox.attr("x", x).attr("y", y).attr("height", height).attr("width", width);
    };

    AreaInteraction.prototype.dragend = function () {
        if (!this.dragInitialized) {
            return;
        }
        this.dragInitialized = false;
        var xMin = Math.min(this.origin[0], this.location[0]);
        var xMax = Math.max(this.origin[0], this.location[0]);
        var yMin = Math.min(this.origin[1], this.location[1]);
        var yMax = Math.max(this.origin[1], this.location[1]);
        var pixelArea = { xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax };
        var fullArea = this.rendererComponent.invertXYSelectionArea(pixelArea);
        if (this.areaCallback != null) {
            this.areaCallback(fullArea);
        }
        if (this.selectionCallback != null) {
            var selection = this.rendererComponent.getSelectionFromArea(fullArea);
            this.selectionCallback(selection);
        }
        if (this.indicesCallback != null) {
            var indices = this.rendererComponent.getDataIndicesFromArea(fullArea);
            this.indicesCallback(indices);
        }
    };

    AreaInteraction.prototype.clearBox = function () {
        this.dragBox.attr("height", 0).attr("width", 0);
    };

    AreaInteraction.prototype.anchor = function (hitBox) {
        _super.prototype.anchor.call(this, hitBox);
        var cname = AreaInteraction.CLASS_DRAG_BOX;
        var element = this.componentToListenTo.element;
        this.dragBox = element.append("rect").classed(cname, true).attr("x", 0).attr("y", 0);
        hitBox.call(this.dragBehavior);
    };
    AreaInteraction.CLASS_DRAG_BOX = "drag-box";
    return AreaInteraction;
})(Interaction);

var BrushZoomInteraction = (function (_super) {
    __extends(BrushZoomInteraction, _super);
    function BrushZoomInteraction(eventComponent, xScale, yScale, indicesCallback) {
        _super.call(this, eventComponent);
        this.xScale = xScale;
        this.yScale = yScale;
        this.areaCallback = this.zoom;
        this.indicesCallback = indicesCallback;
    }
    BrushZoomInteraction.prototype.zoom = function (area) {
        var originalXDomain = this.xScale.domain();
        var originalYDomain = this.yScale.domain();
        var xDomain = [area.data.xMin, area.data.xMax];
        var yDomain = [area.data.yMin, area.data.yMax];

        var xOrigDirection = originalXDomain[0] > originalXDomain[1];
        var yOrigDirection = originalYDomain[0] > originalYDomain[1];
        var xDirection = xDomain[0] > xDomain[1];
        var yDirection = yDomain[0] > yDomain[1];

        if (xDirection !== xOrigDirection) {
            xDomain.reverse();
        }
        ;
        if (yDirection !== yOrigDirection) {
            yDomain.reverse();
        }
        ;

        this.xScale.domain(xDomain);
        this.yScale.domain(yDomain);
    };
    return BrushZoomInteraction;
})(AreaInteraction);
var Label = (function (_super) {
    __extends(Label, _super);
    function Label(text, orientation) {
        if (typeof text === "undefined") { text = ""; }
        if (typeof orientation === "undefined") { orientation = "horizontal"; }
        _super.call(this);
        this.xAlignment = "CENTER";
        this.yAlignment = "CENTER";
        this.classed(Label.CSS_CLASS, true);
        this.text = text;
        if (orientation === "horizontal" || orientation === "vertical-left" || orientation === "vertical-right") {
            this.orientation = orientation;
        } else {
            throw new Error(orientation + " is not a valid orientation for LabelComponent");
        }
    }
    Label.prototype.anchor = function (element) {
        _super.prototype.anchor.call(this, element);
        this.textElement = this.element.append("text");
        this.setText(this.text);
        return this;
    };

    Label.prototype.setText = function (text) {
        this.text = text;
        this.textElement.text(text);
        this.measureAndSetTextSize();
        if (this.orientation === "horizontal") {
            this.rowMinimum(this.textHeight);
        } else {
            this.colMinimum(this.textHeight);
        }
    };

    Label.prototype.measureAndSetTextSize = function () {
        var bbox = Utils.getBBox(this.textElement);
        this.textHeight = bbox.height;
        this.textLength = bbox.width;
    };

    Label.prototype.truncateTextToLength = function (availableLength) {
        if (this.textLength <= availableLength) {
            return;
        }

        this.textElement.text(this.text + "...");
        var textNode = this.textElement.node();
        var dotLength = textNode.getSubStringLength(textNode.textContent.length - 3, 3);
        if (dotLength > availableLength) {
            this.textElement.text("");
            this.measureAndSetTextSize();
            return;
        }

        var numChars = this.text.length;
        for (var i = 1; i < numChars; i++) {
            var testLength = textNode.getSubStringLength(0, i);
            if ((testLength + dotLength) > availableLength) {
                this.textElement.text(this.text.substr(0, i - 1).trim() + "...");
                this.measureAndSetTextSize();
                return;
            }
        }
    };

    Label.prototype.computeLayout = function (xOffset, yOffset, availableWidth, availableHeight) {
        _super.prototype.computeLayout.call(this, xOffset, yOffset, availableWidth, availableHeight);

        this.textElement.attr("dy", 0);
        var bbox = Utils.getBBox(this.textElement);
        this.textElement.attr("dy", -bbox.y);

        var xShift = 0;
        var yShift = 0;

        if (this.orientation === "horizontal") {
            this.truncateTextToLength(this.availableWidth);
            switch (this.xAlignment) {
                case "LEFT":
                    break;
                case "CENTER":
                    xShift = (this.availableWidth - this.textLength) / 2;
                    break;
                case "RIGHT":
                    xShift = this.availableWidth - this.textLength;
                    break;
                default:
                    throw new Error(this.xAlignment + " is not a supported alignment");
            }
        } else {
            this.truncateTextToLength(this.availableHeight);
            switch (this.yAlignment) {
                case "TOP":
                    break;
                case "CENTER":
                    xShift = (this.availableHeight - this.textLength) / 2;
                    break;
                case "BOTTOM":
                    xShift = this.availableHeight - this.textLength;
                    break;
                default:
                    throw new Error(this.yAlignment + " is not a supported alignment");
            }

            if (this.orientation === "vertical-right") {
                this.textElement.attr("transform", "rotate(90)");
                yShift = -this.textHeight;
            } else {
                this.textElement.attr("transform", "rotate(-90)");
                xShift = -xShift - this.textLength;
            }
        }

        this.textElement.attr("x", xShift);
        this.textElement.attr("y", yShift);
        return this;
    };
    Label.CSS_CLASS = "label";
    return Label;
})(Component);

var TitleLabel = (function (_super) {
    __extends(TitleLabel, _super);
    function TitleLabel(text, orientation) {
        _super.call(this, text, orientation);
        this.classed(TitleLabel.CSS_CLASS, true);
    }
    TitleLabel.CSS_CLASS = "title-label";
    return TitleLabel;
})(Label);

var AxisLabel = (function (_super) {
    __extends(AxisLabel, _super);
    function AxisLabel(text, orientation) {
        _super.call(this, text, orientation);
        this.classed(AxisLabel.CSS_CLASS, true);
    }
    AxisLabel.CSS_CLASS = "axis-label";
    return AxisLabel;
})(Label);
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer(dataset) {
        if (typeof dataset === "undefined") { dataset = { seriesName: "", data: [] }; }
        _super.call(this);
        _super.prototype.rowWeight.call(this, 1);
        _super.prototype.colWeight.call(this, 1);
        this.clipPathEnabled = true;

        this.dataset = dataset;
        this.classed(Renderer.CSS_CLASS, true);
    }
    Renderer.prototype.data = function (dataset) {
        this.renderArea.classed(this.dataset.seriesName, false);
        this.dataset = dataset;
        this.renderArea.classed(dataset.seriesName, true);
        return this;
    };

    Renderer.prototype.anchor = function (element) {
        _super.prototype.anchor.call(this, element);
        this.renderArea = element.append("g").classed("render-area", true).classed(this.dataset.seriesName, true);
        return this;
    };
    Renderer.CSS_CLASS = "renderer";
    return Renderer;
})(Component);

;

var XYRenderer = (function (_super) {
    __extends(XYRenderer, _super);
    function XYRenderer(dataset, xScale, yScale, xAccessor, yAccessor) {
        var _this = this;
        _super.call(this, dataset);
        this.classed(XYRenderer.CSS_CLASS);

        this.xAccessor = (xAccessor != null) ? xAccessor : XYRenderer.defaultXAccessor;
        this.yAccessor = (yAccessor != null) ? yAccessor : XYRenderer.defaultYAccessor;

        this.xScale = xScale;
        this.yScale = yScale;

        var data = dataset.data;

        var xDomain = d3.extent(data, this.xAccessor);
        this.xScale.widenDomain(xDomain);
        var yDomain = d3.extent(data, this.yAccessor);
        this.yScale.widenDomain(yDomain);

        this.xScale.registerListener(function () {
            return _this.rescale();
        });
        this.yScale.registerListener(function () {
            return _this.rescale();
        });
    }
    XYRenderer.prototype.computeLayout = function (xOffset, yOffset, availableWidth, availableHeight) {
        _super.prototype.computeLayout.call(this, xOffset, yOffset, availableWidth, availableHeight);
        this.xScale.range([0, this.availableWidth]);
        this.yScale.range([this.availableHeight, 0]);
        return this;
    };

    XYRenderer.prototype.invertXYSelectionArea = function (pixelArea) {
        var xMin = this.xScale.invert(pixelArea.xMin);
        var xMax = this.xScale.invert(pixelArea.xMax);
        var yMin = this.yScale.invert(pixelArea.yMin);
        var yMax = this.yScale.invert(pixelArea.yMax);
        var dataArea = { xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax };
        return { pixel: pixelArea, data: dataArea };
    };

    XYRenderer.prototype.getSelectionFromArea = function (area) {
        var _this = this;
        var dataArea = area.data;
        var filterFunction = function (d) {
            var x = _this.xAccessor(d);
            var y = _this.yAccessor(d);
            return Utils.inRange(x, dataArea.xMin, dataArea.xMax) && Utils.inRange(y, dataArea.yMin, dataArea.yMax);
        };
        return this.dataSelection.filter(filterFunction);
    };

    XYRenderer.prototype.getDataIndicesFromArea = function (area) {
        var _this = this;
        var dataArea = area.data;
        var filterFunction = function (d) {
            var x = _this.xAccessor(d);
            var y = _this.yAccessor(d);
            return Utils.inRange(x, dataArea.xMin, dataArea.xMax) && Utils.inRange(y, dataArea.yMin, dataArea.yMax);
        };
        var results = [];
        this.dataset.data.forEach(function (d, i) {
            if (filterFunction(d)) {
                results.push(i);
            }
        });
        return results;
    };

    XYRenderer.prototype.rescale = function () {
        if (this.element != null) {
            this.render();
        }
    };
    XYRenderer.CSS_CLASS = "xy-renderer";

    XYRenderer.defaultXAccessor = function (d) {
        return d.x;
    };
    XYRenderer.defaultYAccessor = function (d) {
        return d.y;
    };
    return XYRenderer;
})(Renderer);

var LineRenderer = (function (_super) {
    __extends(LineRenderer, _super);
    function LineRenderer(dataset, xScale, yScale, xAccessor, yAccessor) {
        _super.call(this, dataset, xScale, yScale, xAccessor, yAccessor);
        this.classed(LineRenderer.CSS_CLASS, true);
    }
    LineRenderer.prototype.anchor = function (element) {
        _super.prototype.anchor.call(this, element);
        this.path = this.renderArea.append("path");
        return this;
    };

    LineRenderer.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        this.line = d3.svg.line().x(function (datum) {
            return _this.xScale.scale(_this.xAccessor(datum));
        }).y(function (datum) {
            return _this.yScale.scale(_this.yAccessor(datum));
        });
        this.dataSelection = this.path.classed("line", true).classed(this.dataset.seriesName, true).datum(this.dataset.data);
        this.path.attr("d", this.line);
        return this;
    };
    LineRenderer.CSS_CLASS = "line-renderer";
    return LineRenderer;
})(XYRenderer);

var CircleRenderer = (function (_super) {
    __extends(CircleRenderer, _super);
    function CircleRenderer(dataset, xScale, yScale, xAccessor, yAccessor, size) {
        if (typeof size === "undefined") { size = 3; }
        _super.call(this, dataset, xScale, yScale, xAccessor, yAccessor);
        this.classed(CircleRenderer.CSS_CLASS, true);
        this.size = size;
    }
    CircleRenderer.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        this.dataSelection = this.renderArea.selectAll("circle").data(this.dataset.data);
        this.dataSelection.enter().append("circle");
        this.dataSelection.attr("cx", function (datum) {
            return _this.xScale.scale(_this.xAccessor(datum));
        }).attr("cy", function (datum) {
            return _this.yScale.scale(_this.yAccessor(datum));
        }).attr("r", this.size);
        this.dataSelection.exit().remove();
        return this;
    };
    CircleRenderer.CSS_CLASS = "circle-renderer";
    return CircleRenderer;
})(XYRenderer);

var BarRenderer = (function (_super) {
    __extends(BarRenderer, _super);
    function BarRenderer(dataset, xScale, yScale, xAccessor, x2Accessor, yAccessor) {
        _super.call(this, dataset, xScale, yScale, xAccessor, yAccessor);
        this.barPaddingPx = 1;
        this.classed(BarRenderer.CSS_CLASS, true);

        var yDomain = this.yScale.domain();
        if (!Utils.inRange(0, yDomain[0], yDomain[1])) {
            var newMin = 0;
            var newMax = yDomain[1];
            this.yScale.widenDomain([newMin, newMax]);
        }

        this.x2Accessor = (x2Accessor != null) ? x2Accessor : BarRenderer.defaultX2Accessor;

        var x2Extent = d3.extent(dataset.data, this.x2Accessor);
        this.xScale.widenDomain(x2Extent);
    }
    BarRenderer.prototype.render = function () {
        var _this = this;
        _super.prototype.render.call(this);
        var yRange = this.yScale.range();
        var maxScaledY = Math.max(yRange[0], yRange[1]);

        this.dataSelection = this.renderArea.selectAll("rect").data(this.dataset.data);
        this.dataSelection.enter().append("rect");
        this.dataSelection.attr("x", function (d) {
            return _this.xScale.scale(_this.xAccessor(d)) + _this.barPaddingPx;
        }).attr("y", function (d) {
            return _this.yScale.scale(_this.yAccessor(d));
        }).attr("width", function (d) {
            return (_this.xScale.scale(_this.x2Accessor(d)) - _this.xScale.scale(_this.xAccessor(d)) - 2 * _this.barPaddingPx);
        }).attr("height", function (d) {
            return maxScaledY - _this.yScale.scale(_this.yAccessor(d));
        });
        this.dataSelection.exit().remove();
        return this;
    };
    BarRenderer.CSS_CLASS = "bar-renderer";
    BarRenderer.defaultX2Accessor = function (d) {
        return d.x2;
    };
    return BarRenderer;
})(XYRenderer);
var Table = (function (_super) {
    __extends(Table, _super);
    function Table(rows, rowWeightVal, colWeightVal) {
        if (typeof rowWeightVal === "undefined") { rowWeightVal = 1; }
        if (typeof colWeightVal === "undefined") { colWeightVal = 1; }
        _super.call(this);
        this.rowPadding = 0;
        this.colPadding = 0;
        this.classed(Table.CSS_CLASS, true);

        var cleanOutNulls = function (c) {
            return c == null ? new Component() : c;
        };
        rows = rows.map(function (row) {
            return row.map(cleanOutNulls);
        });
        this.rows = rows;
        this.cols = d3.transpose(rows);
        this.nRows = this.rows.length;
        this.nCols = this.cols.length;
        _super.prototype.rowWeight.call(this, rowWeightVal).colWeight(colWeightVal);
    }
    Table.prototype.anchor = function (element) {
        var _this = this;
        _super.prototype.anchor.call(this, element);

        this.rows.forEach(function (row, rowIndex) {
            row.forEach(function (component, colIndex) {
                component.anchor(_this.element.append("g"));
            });
        });
        return this;
    };

    Table.prototype.computeLayout = function (xOffset, yOffset, availableWidth, availableHeight) {
        var _this = this;
        _super.prototype.computeLayout.call(this, xOffset, yOffset, availableWidth, availableHeight);

        var freeWidth = this.availableWidth - this.colMinimum();
        var freeHeight = this.availableHeight - this.rowMinimum();
        if (freeWidth < 0 || freeHeight < 0) {
            throw new Error("InsufficientSpaceError");
        }

        var rowProportionalSpace = Table.rowProportionalSpace(this.rows, freeHeight);
        var colProportionalSpace = Table.colProportionalSpace(this.cols, freeWidth);

        var sumPair = function (p) {
            return p[0] + p[1];
        };
        var rowHeights = d3.zip(rowProportionalSpace, this.rowMinimums).map(sumPair);
        var colWidths = d3.zip(colProportionalSpace, this.colMinimums).map(sumPair);
        chai.assert.closeTo(d3.sum(rowHeights) + (this.nRows - 1) * this.rowPadding, this.availableHeight, 1, "row heights sum to available height");
        chai.assert.closeTo(d3.sum(colWidths) + (this.nCols - 1) * this.colPadding, this.availableWidth, 1, "col widths sum to available width");

        var childYOffset = 0;
        this.rows.forEach(function (row, rowIndex) {
            var childXOffset = 0;
            row.forEach(function (component, colIndex) {
                component.computeLayout(childXOffset, childYOffset, colWidths[colIndex], rowHeights[rowIndex]);
                childXOffset += colWidths[colIndex] + _this.colPadding;
            });
            chai.assert.operator(childXOffset - _this.colPadding, "<=", _this.availableWidth + 0.1, "final xOffset was <= availableWidth");
            childYOffset += rowHeights[rowIndex] + _this.rowPadding;
        });
        chai.assert.operator(childYOffset - this.rowPadding, "<=", this.availableHeight + 0.1, "final yOffset was <= availableHeight");
        return this;
    };

    Table.rowProportionalSpace = function (rows, freeHeight) {
        return Table.calculateProportionalSpace(rows, freeHeight, function (c) {
            return c.rowWeight();
        });
    };
    Table.colProportionalSpace = function (cols, freeWidth) {
        return Table.calculateProportionalSpace(cols, freeWidth, function (c) {
            return c.colWeight();
        });
    };
    Table.calculateProportionalSpace = function (componentGroups, freeSpace, spaceAccessor) {
        var weights = componentGroups.map(function (group) {
            return d3.max(group, spaceAccessor);
        });
        var weightSum = d3.sum(weights);
        if (weightSum === 0) {
            var numGroups = componentGroups.length;
            return weights.map(function (w) {
                return freeSpace / numGroups;
            });
        } else {
            return weights.map(function (w) {
                return freeSpace * w / weightSum;
            });
        }
    };

    Table.prototype.render = function () {
        this.rows.forEach(function (row, rowIndex) {
            row.forEach(function (component, colIndex) {
                component.render();
            });
        });
        return this;
    };

    Table.prototype.rowMinimum = function (newVal) {
        if (newVal != null) {
            throw new Error("Row minimum cannot be directly set on Table");
        } else {
            this.rowMinimums = this.rows.map(function (row) {
                return d3.max(row, function (r) {
                    return r.rowMinimum();
                });
            });
            return d3.sum(this.rowMinimums) + this.rowPadding * (this.rows.length - 1);
        }
    };

    Table.prototype.colMinimum = function (newVal) {
        if (newVal != null) {
            throw new Error("Col minimum cannot be directly set on Table");
        } else {
            this.colMinimums = this.cols.map(function (col) {
                return d3.max(col, function (r) {
                    return r.colMinimum();
                });
            });
            return d3.sum(this.colMinimums) + this.colPadding * (this.cols.length - 1);
        }
    };

    Table.prototype.padding = function (rowPadding, colPadding) {
        this.rowPadding = rowPadding;
        this.colPadding = colPadding;
        return this;
    };
    Table.CSS_CLASS = "table";
    return Table;
})(Component);
var ScaleDomainCoordinator = (function () {
    function ScaleDomainCoordinator(scales) {
        var _this = this;
        this.scales = scales;
        this.rescaleInProgress = false;
        this.scales.forEach(function (s) {
            return s.registerListener(function (sx) {
                return _this.rescale(sx);
            });
        });
    }
    ScaleDomainCoordinator.prototype.rescale = function (scale) {
        if (this.rescaleInProgress) {
            return;
        }
        this.rescaleInProgress = true;
        var newDomain = scale.domain();
        this.scales.forEach(function (s) {
            return s.domain(newDomain);
        });
        this.rescaleInProgress = false;
    };
    return ScaleDomainCoordinator;
})();
var Axis = (function (_super) {
    __extends(Axis, _super);
    function Axis(scale, orientation, formatter) {
        var _this = this;
        _super.call(this);
        this.scale = scale;
        this.orientation = orientation;
        this.formatter = formatter;
        this.classed(Axis.CSS_CLASS, true);
        this.clipPathEnabled = true;
        this.isXAligned = this.orientation === "bottom" || this.orientation === "top";
        this.d3axis = d3.svg.axis().scale(this.scale.scale).orient(this.orientation);
        if (this.formatter == null) {
            this.formatter = d3.format(".3s");
        }
        this.d3axis.tickFormat(this.formatter);

        this.cachedScale = 1;
        this.cachedTranslate = 0;
        this.scale.registerListener(function () {
            return _this.rescale();
        });
    }
    Axis.axisXTransform = function (selection, x) {
        selection.attr("transform", function (d) {
            return "translate(" + x(d) + ",0)";
        });
    };

    Axis.axisYTransform = function (selection, y) {
        selection.attr("transform", function (d) {
            return "translate(0," + y(d) + ")";
        });
    };

    Axis.prototype.anchor = function (element) {
        _super.prototype.anchor.call(this, element);
        this.axisElement = this.element.append("g").classed("axis", true);
        return this;
    };

    Axis.prototype.transformString = function (translate, scale) {
        var translateS = this.isXAligned ? "" + translate : "0," + translate;
        return "translate(" + translateS + ")";
    };

    Axis.prototype.render = function () {
        if (this.orientation === "left") {
            this.axisElement.attr("transform", "translate(" + Axis.yWidth + ", 0)");
        }
        ;
        if (this.orientation === "top") {
            this.axisElement.attr("transform", "translate(0," + Axis.xHeight + ")");
        }
        ;
        var domain = this.scale.domain();
        var extent = Math.abs(domain[1] - domain[0]);
        var min = +d3.min(domain);
        var max = +d3.max(domain);
        var newDomain;
        var standardOrder = domain[0] < domain[1];
        if (typeof (domain[0]) === "number") {
            newDomain = standardOrder ? [min - extent, max + extent] : [max + extent, min - extent];
        } else {
            newDomain = standardOrder ? [new Date(min - extent), new Date(max + extent)] : [new Date(max + extent), new Date(min - extent)];
        }

        if (this.scale.ticks != null) {
            var scale = this.scale;
            var nTicks = 10;
            var ticks = scale.ticks(nTicks);
            var numericDomain = scale.domain();
            var interval = numericDomain[1] - numericDomain[0];
            var cleanTick = function (n) {
                return Math.abs(n / interval / nTicks) < 0.0001 ? 0 : n;
            };
            ticks = ticks.map(cleanTick);
            this.d3axis.tickValues(ticks);
        }

        this.axisElement.call(this.d3axis);
        var bbox = this.axisElement.node().getBBox();
        if (bbox.height > this.availableHeight || bbox.width > this.availableWidth) {
            this.axisElement.classed("error", true);
        }

        return this;
    };

    Axis.prototype.rescale = function () {
        return (this.element != null) ? this.render() : null;
    };

    Axis.prototype.zoom = function (translatePair, scale) {
        return this.render();
    };
    Axis.CSS_CLASS = "axis";
    Axis.yWidth = 50;
    Axis.xHeight = 30;
    return Axis;
})(Component);

var XAxis = (function (_super) {
    __extends(XAxis, _super);
    function XAxis(scale, orientation, formatter) {
        if (typeof formatter === "undefined") { formatter = null; }
        _super.call(this, scale, orientation, formatter);
        _super.prototype.rowMinimum.call(this, Axis.xHeight);
    }
    return XAxis;
})(Axis);

var YAxis = (function (_super) {
    __extends(YAxis, _super);
    function YAxis(scale, orientation, formatter) {
        if (typeof formatter === "undefined") { formatter = null; }
        _super.call(this, scale, orientation, formatter);
        _super.prototype.colMinimum.call(this, Axis.yWidth);
    }
    return YAxis;
})(Axis);
//# sourceMappingURL=plottable.js.map
