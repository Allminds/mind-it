App.stackData = function (nodeData, operationData, destinationDirection, destinationIndex, oldParent, keyPressed) {
    this.nodeData = nodeData;
    this.operationData = operationData;
    this.destinationDirection = destinationDirection;
    this.destinationIndex = destinationIndex;
    this.oldParentId = oldParent ? oldParent._id : null;
    this.keyPressed = keyPressed;
};

mapsCount = 0;
nodeCount = 0;

var Constants = {
    deltaEllipseXRadius: 30,
    deltaEllipseYRadius: 25,
    deltaFromRoot: 20
};

App.nodeStore = [];
App.nodeToPaste = [];
App.undoStack = [];
App.redoStack = [];

App.multiSelectedNodes = [];

MindMap = function MindMap() {
    "use strict";
    var
        margin = {top: 0, left: 0, bottom: 0, right: 0},
        width = 960,
        height = 6000,
        identity = '_id',
        handleClick = function () {
        },
        handleDblClick = function () {
        },
        text = function (d) {
            return d.name;
        },
        idx = 0,
        getRootNode = function (node) {
            return node[0][0];
        },
        indicator = {
            default: 4,
            hovered: 7,
            enter: function (node) {
                node.filter(function (x) {
                    return App.getDirection(x);
                }).append('svg:circle')
                    .attr('class', 'indicator unfilled')
                    .attr('r', indicator.default)
                    .attr('cx', function (d) {
                        var text = d3.select(this.parentNode).select("text")[0][0],
                            textValue = d3.select(this.parentNode).select("text").select('tspan')[0][0].innerHTML,
                            bBox = getTextBBox(text, textValue),
                            x = bBox.width == 0 ? -5 : bBox.x;
                        return (App.getDirection(d) == 'left' ? 1 : -1) * x;
                    })
                    .on('mouseover', function (d) {
                        var hasChildren = App.Node.hasChildren(d),
                            r = hasChildren ? indicator.hovered : 0;
                        App.isIndicatorActive = true;
                        return d3.select(this)
                            .attr('r', r)
                            .classed('unfilled', false)
                            .classed('filled', hasChildren);
                    })
                    .on('mouseout', function (d) {
                        var hasChildren = App.Node.hasChildren(d),
                            r = hasChildren ? (d.isCollapsed ? indicator.default : indicator.hovered) : 0;
                        App.isIndicatorActive = false;
                        return d3.select(this)
                            .attr('r', r)
                            .classed('filled', d.isCollapsed)
                            .classed('unfilled', !d.isCollapsed);

                    })
                    .on('click', function (node) {
                        App.toggleCollapsedNode(node);
                        return false;
                    });
            },
            update: function (node) {
                node.selectAll('circle')
                    .attr('cx', function (d) {
                        var text = d3.select(this.parentNode).select("text")[0][0],
                            textValue = d3.select(this.parentNode).select("text").select('tspan')[0][0].innerHTML,
                            bBox = getTextBBox(text, textValue),
                            x = bBox.width == 0 ? -5 : bBox.x;
                        return (App.getDirection(d) == 'left' ? 1 : -1) * x;
                    })
                    .attr('r', function (d) {
                        var hasChildren = App.Node.hasChildren(d);
                        d3.select(this)
                            .classed('filled', d.isCollapsed)
                            .classed('unfilled', !d.isCollapsed);
                        return hasChildren ? (d.isCollapsed ? indicator.default : indicator.hovered) : 0;
                    });
            }
        },
        enterNode = function (node) {
            var rootNode = getRootNode(node);
            d3.select(rootNode).append("svg:ellipse")
                .attr("rx", 1e-6)
                .attr("ry", 1e-6)
                .attr("class", "root-ellipse");

            d3.select(rootNode).classed('rootNode', true);

            node.append('svg:rect');

            node.append("svg:text")
                .attr("cols", 60)
                .attr("rows", 4)
                .call(text);

            node.attr('class', function (d) {
                return d.depth < 4 ? ('node level-' + d.depth) : 'node';
            });

            indicator.enter(node);
        },
        updateNode = function (node) {
            node.select("text").call(text);

            node.select("text").attr("y", function () {
                var noOfLines = d3.select(this.parentNode).select("text").selectAll("tspan")[0].length;
                var reducedHeight = d3.select(this.parentNode).select("text")[0][0].getBoundingClientRect().height;
                if (noOfLines > 1) {
                    return -reducedHeight + 20;
                }
                else {
                    return -2;
                }
            });

            node.select(".level-0 text").attr("y", function () {
                var noOfLines = d3.select(this.parentNode).select("text").selectAll("tspan")[0].length;
                var reducedHeight = d3.select(this.parentNode).select("text")[0][0].getBoundingClientRect().height;
                if (noOfLines > 1) {
                    return -reducedHeight / 2;
                }
                else {
                    return 9;
                }
            });

            node.select('rect')
                .attr('x', function () {
                    var text = d3.select(this.parentNode).select('text')[0][0];
                    var textValue = d3.select(this.parentNode).select("text").select('tspan')[0][0].innerHTML;
                    var rect = getTextBBox(text, textValue);

                    return rect.x - (rect.width == 0 ? minTextSize / 2 : 0);
                })
                .attr('y', function () {
                    var text = d3.select(this.parentNode).select('text')[0][0];
                    var textValue = d3.select(this.parentNode).select("text").select('tspan')[0][0].innerHTML;
                    var rect = getTextBBox(text, textValue);

                    return rect.y == 0 ? -19 : rect.y;
                })
                .attr('width', function (d) {
                    var textWidth = 0;

                    if (textWidths.container.exists(d.name)) {
                        textWidth = textWidths.container.get(d.name);
                    }
                    else {
                        var text = d3.select(this.parentNode).select('text')[0][0];
                        var textValue = d3.select(this.parentNode).select("text").select('tspan')[0][0].innerHTML;
                        var rect = getTextBBox(text, textValue);

                        textWidths.container.add(d.name, rect.width);
                        textWidth = textWidths.container.get(d.name);
                    }

                    return textWidth == 0 ? minTextSize : textWidth;
                })
                .attr('height', function (d) {
                    var textHeight = 0;

                    if (textHeights.container.exists(d.name)) {
                        textHeight = textHeights.container.get(d.name);
                    }
                    else {
                        var text = d3.select(this.parentNode).select('text')[0][0];
                        var textValue = d3.select(this.parentNode).select("text").select('tspan')[0][0].innerHTML;
                        var rect = getTextBBox(text, textValue);

                        textHeights.container.add(d.name, rect.height);
                        textHeight = textHeights.container.get(d.name);
                    }

                    return textHeight == 0 ? minTextHeight : (textHeight - 5);
                });

            var rootNode = getRootNode(node);
            d3.select(rootNode).select("ellipse")
                .attr("rx", function () {
                    //return d3.select(this.parentNode).select("text")[0][0].getBoundingClientRect().width/3 + Constants.deltaEllipseXRadius;

                    return d3.select(this.parentNode).select("text")[0][0].getBoundingClientRect().width / 2 + Constants.deltaEllipseXRadius;
                })
                .attr("ry", function () {
                    var noOfLines = d3.select(this.parentNode).select("text").selectAll("tspan")[0].length;
                    if (noOfLines > 1) {

                        return d3.select(this.parentNode).select("text")[0][0].getBoundingClientRect().height + Constants.deltaEllipseYRadius;
                    }
                    else {
                        return d3.select(this.parentNode).select("text")[0][0].getBoundingClientRect().width / 50 + Constants.deltaEllipseYRadius;
                    }
                });
        },
        exitNode = function (node) {
            node.select("text")
                .style("fill-opacity", 1e-6);
        };

    Meteor.call('countMaps', function (error, count) {
        mapsCount = count;
    });

    Meteor.call('countNodes', function (error, count) {
        nodeCount = count;
    });

    var getNodeHeight = function (node, defaultHeight) {
        var textHeight = getTextHeight(node._id, node.name),
            subTreeHeight = (node.childSubTree || []).reduce(function (height, child) {
                height += getNodeHeight(child, defaultHeight);
                return height;
            }, 0);
        subTreeHeight += (node.childSubTree || []).length > 0 ? (2 * defaultHeight) : 0;
        return Math.max(defaultHeight, textHeight, subTreeHeight);
    };

    var getX = function (node, defaultHeight) {
        if (!node.parent) {
            return 0;
        }

        var siblings = App.Node.isRoot(node.parent) ? node.parent[App.getDirection(node)] : node.parent.childSubTree,
            siblingHeights = siblings.map(function (sibling) {
                return getNodeHeight(sibling, defaultHeight);
            }),
            sum = function (acc, cur) {
                return acc + cur;
            },
            siblingsAboveNode = function (sib, index) {
                return index < nodeIndex;
            },

            totalHeight = siblingHeights.reduce(sum, 0), firstSiblingX = -(totalHeight / 2),
            nodeIndex = siblings.indexOf(node),
            heightOfSiblingAboveIt = siblingHeights.filter(siblingsAboveNode).reduce(sum, 0);

        return firstSiblingX + heightOfSiblingAboveIt + (siblingHeights[nodeIndex] / 2);
    };

    var chart = function (selection) {
        selection.each(function (root) {
                var w = width - margin.left - margin.right;
                var h = height - margin.top - margin.bottom;
                var nodeSize = [20, 30];
                var container = d3.select(this);
                var vis = container.attr("width", width).attr("height", height);
                var graphRoot = vis.select('g');

                if (!graphRoot[0][0]) {
                    vis = vis.append('svg:g');
                } else {
                    vis = graphRoot;
                }

                vis = vis.attr("transform", "translate(" + (w / 2 + margin.left) + "," + (margin.top + h / 2) + ")");

                root.x0 = 0;
                root.y0 = 0;

                var tree = d3.layout.cluster().nodeSize(nodeSize);

                chart.update = function () {
                    container.call(chart);

                    App.showCursorLabels(App.onlineUsers);
                };

                var maxDepth = function (node) {
                    return (node.childSubTree || []).reduce(function (depth, child) {
                        var childDepth = maxDepth(child);
                        return childDepth > depth ? childDepth : depth;
                    }, node.depth);
                };

                //Compute the new tree layout.
                function right(d) {
                    return App.Node.isRoot(d) ? d.right : d.childSubTree;
                }

                function left(d) {
                    return App.Node.isRoot(d) ? d.left : d.childSubTree;
                }

                var first = root.left.length > 0 ? left : right,
                    second = root.right.length > 0 ? right : left;

                var firstSet = tree;
                var a1 = firstSet.children(first);
                var a2 = a1.nodes(root);
                firstSet = a2.reverse();

                var secondSet = tree;
                var b1 = secondSet.children(second);
                var b2 = b1.nodes(root);
                secondSet = b2.reverse();

                root.children = root.left.concat(root.right);

                var nodes = window.nodes = (function (left, right) {
                    left.pop();

                    var result = left.concat(right);

                    function getTotalWidth(node) {
                        if (!node) {
                            return 0;
                        }

                        var width = getTextWidth(node._id, node.name) / 2, parent = node.parent;

                        while (parent) {
                            width += getTextWidth(parent._id, parent.name) * (App.Node.isRoot(parent) ? 0.5 : 1);
                            parent = parent.parent;
                        }

                        return width;
                    }

                    result.sort(function (a, b) {
                        return a.depth - b.depth;
                    }).forEach(function (node) {
                        var dir = App.Node.isRoot(node) ? 0 : (App.getDirection(node) === 'left' ? -1 : 1),
                            textWidth = getTotalWidth(node);

                        node.y = dir * (node.depth * nodeSize[1] + textWidth);
                        node.y += dir * Constants.deltaFromRoot;

                        node.x = getX(node, nodeSize[0]);
                        node.x += (node.parent ? node.parent.x : 0);
                    });

                    return result;
                })(firstSet, secondSet);

                // Update the nodes…
                var node = vis.selectAll("g.node").data(nodes, function (d) {
                    return d[identity] || (d[identity] = ++idx);
                });

                // Enter any new nodes at the parent's previous position.
                var translate = function (node) {
                    var parentNode = node.parent || root,
                        x0 = parentNode.x0 || root.x0,
                        y0 = parentNode.y0 || root.y0;
                    return "translate(" + y0 + "," + x0 + ")";
                };

                var nodeEnter = node.enter().append("svg:g").attr("transform", translate);

                enterNode(nodeEnter);

                // Transition nodes to their new position.
                var nodeUpdate = node.attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

                updateNode(nodeUpdate);

                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().attr("transform", translate).remove();

                exitNode(nodeExit);

                indicator.update(nodeUpdate);

                var dragBehaviour = d3.behavior.drag()
                    .on("dragstart", dragStart)
                    .on("drag", drag)
                    .on("dragend", dragEnd);

                //TODO : text box for editing does not appear when you uncomment the below line.
                nodeEnter.call(dragBehaviour);

                var targetNode = nodeEnter,
                    draggedNode = null,
                    checkDrag = false,
                    droppedOnElement = null;

                function dragStart() {
                    var currentNodeRect = d3.select(this).select('rect');
                    var currentNodeText = d3.select(this).select('text');
                    draggedNode = d3.select(this).node().__data__;

                    if (App.Node.isRoot(d3.select(this).node().__data__)) {
                        return;
                    }

                    targetNode = d3.select('svg').select('g').append('svg:g')
                        .attr("transform", d3.select(this).attr("transform"))
                        .classed("node dragSelect", true);

                    targetNode.append("svg:rect")
                        .attr('x', currentNodeRect.attr('x'))
                        .attr('y', currentNodeRect.attr('y'))
                        .attr('height', currentNodeRect.attr('height'))
                        .attr('width', currentNodeRect.attr('width'));

                    targetNode.append("svg:text")
                        .text('')
                        .attr("cols", currentNodeText.attr('cols'))
                        .attr("rows", currentNodeText.attr('rows'));
                }

                function drag() {
                    if (App.Node.isRoot(d3.select(this).node().__data__)) {
                        return;
                    }
                    checkDrag = true;
                    var nodeToBeDragged = d3.select(targetNode[0][0]);

                    nodeToBeDragged.attr("transform", function () {
                        return "translate(" + d3.event.x + "," + d3.event.y + ")";
                    });
                    // Code to highlight the nodes at the time of drag and drop.
                    var point = nodeToBeDragged.attr('transform').replace('translate(', '').replace(')', '').split(',');
                    droppedOnElement = App.checkOverlap(point);
                    var rectList = d3.select('svg').select('g').selectAll('g');
                    d3.selectAll(".dragSelect").classed('dragSelect', false);
                    if (droppedOnElement != nodeToBeDragged && d3.select(droppedOnElement).node()) {
                        d3.select(droppedOnElement).classed('dragSelect', true);
                    }


                }

                function dragEnd() {
                    if (checkDrag === false) {
                        if (d3.select(targetNode[0][0]).attr('class').indexOf('level-0') == -1) {
                            d3.select(targetNode[0][0]).remove();
                        }
                        handleClick.call(this);
                        return;
                    }

                    var droppedOnData = d3.select(droppedOnElement).node().textContent ? d3.select(droppedOnElement).node().__data__ : null;
                    var droppedOnId = droppedOnData ? droppedOnData._id : null;

                    if (!droppedOnData) {
                        d3.selectAll(".dragSelect").classed("dragSelect", false);
                        d3.select(targetNode[0][0]).remove();
                        checkDrag = false;
                        return;
                    }

                    if (checkDrag === true) {

                        if (droppedOnId === draggedNode.parentId) {
                            d3.selectAll(".dragSelect").classed("dragSelect", false);
                            d3.select(targetNode[0][0]).remove();
                            checkDrag = false;
                            return;
                        }

                        var currentNode = droppedOnData;
                        while (App.getDirection(currentNode) != "root") {
                            if (draggedNode._id === currentNode._id) {
                                d3.selectAll(".dragSelect").classed("dragSelect", false);
                                d3.select(targetNode[0][0]).remove();
                                checkDrag = false;
                                return;
                            }
                            currentNode = currentNode.parent;
                        }

                        if (droppedOnElement && ($.inArray(draggedNode._id, droppedOnData.parent_ids) < 0) && (draggedNode._id != droppedOnData._id)) {
                            App.dragAndDrop(draggedNode, droppedOnData, App.toggleCollapsedNode);
                        }
                        checkDrag = false;
                        d3.selectAll(".dragSelect").classed("dragSelect", false);
                        d3.select(targetNode[0][0]).remove();
                    }
                }

                // Update the links…
                var thickLink = vis.selectAll("path.thick-link").data(tree.links(nodes), function (d) {
                    return d.target[identity];
                });

                // Enter any new links at the parent's previous position.
                thickLink.enter().insert("svg:path", "g").attr("class", "thick-link");

                thickLink.attr("d", thickLineConnector);

                // Transition exiting nodes to the parent's new position.
                thickLink.exit().attr("d", function (path) {
                    var parentNode = path.source || root,
                        o = {x: parentNode.x, y: parentNode.y};

                    return thickLineConnector({source: o, target: o});
                }).remove();

                var thinLink = vis.selectAll("path.link").data(tree.links(nodes), function (d) {
                    return d.target[identity];
                });

                // Transition links to their new position.
                thinLink.enter().insert("svg:path", "g").attr("class", "link");

                thinLink.attr("d", thinLineConnector);

                thinLink.exit().attr("d", function (path) {
                    var parentNode = path.source || root,
                        o = {x: parentNode.x, y: parentNode.y};

                    return thinLineConnector({source: o, target: o});
                }).remove();

                // Stash the old positions for transition.
                nodes.forEach(function (d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
            }
        );
    };

    chart.width = function (_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function (_) {
        if (!arguments.length) return 6000;
        height = _;
        return chart;
    };

    chart.connector = function (_) {
        if (!arguments.length) return thickLineConnector;
        thickLineConnector = _;
        return chart;
    };

    chart.connectLine = function (_) {
        if (!arguments.length) return thinLineConnector;
        thinLineConnector = _;
        return chart;
    };

    chart.click = function (_) {
        if (!arguments.length) return handleClick;
        handleClick = _;
        return chart;
    };

    chart.identity = function (_) {
        if (!arguments.length) return identity;
        identity = _;
        return chart;
    };

    chart.text = function (_) {
        if (!arguments.length) return text;
        text = _;
        return chart;
    };

    chart.nodeEnter = function (_) {
        if (!arguments.length) return enterNode;
        enterNode = _;
        return chart;
    };

    chart.nodeUpdate = function (_) {
        if (!arguments.length) return updateNode;
        updateNode = _;
        return chart;
    };

    chart.nodeExit = function (_) {
        if (!arguments.length) return exitNode;
        exitNode = _;
        return chart;
    };

    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin.top = typeof _.top != 'undefined' ? _.top : margin.top;
        margin.right = typeof _.right != 'undefined' ? _.right : margin.right;
        margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
        margin.left = typeof _.left != 'undefined' ? _.left : margin.left;
        return chart;
    };

    chart.dblClick = function (_) {
        if (!arguments.length) return handleDblClick;
        handleDblClick = _;
        return chart;
    };

    return chart;
};

var textWidths = {};

textWidths.container = {
    textWidth: {},

    add: function (key, value) {
        textWidths.container.textWidth[key] = value;
    },

    get: function (key) {
        return textWidths.container.textWidth[key];
    },

    exists: function (key) {
        return textWidths.container.get(key) !== undefined;
    }
};

var textHeights = {};

textHeights.container = {
    textHeight: {},

    add: function (key, value) {
        textHeights.container.textHeight[key] = value;
    },

    get: function (key) {
        return textHeights.container.textHeight[key];
    },

    exists: function (key) {
        return textHeights.container.get(key) !== undefined;
    }
};

var minTextSize = Constants.deltaEllipseXRadius,
    minTextHeight = 16,
    getTextWidth = function (id, name) {
        if (!id) {
            return 0;
        }

        if (textWidths.container.exists(name)) {
            return textWidths.container.get(name);
        }
        else {
            return 0;
        }
    },
    getTextHeight = function (id, name) {
        if (!id) {
            return minTextHeight;
        }

        if (textHeights.container.exists(name)) {
            return textHeights.container.get(name);
        }
        else {
            return 0;
        }
    };

var textBBoxes = {};

textBBoxes.container = {
    textBBox: {},

    add: function (key, value) {
        textBBoxes.container.textBBox[key] = value;
    },

    get: function (key) {
        return textBBoxes.container.textBBox[key];
    },

    exists: function (key) {
        return textBBoxes.container.get(key) !== undefined;
    }
};

var getTextBBox = function (text, key) {
    if (!Boolean(text) && !Boolean(key)) {
        return;
    }

    if (Boolean(text) && !Boolean(key)) {
        return text.getBBox();
    }

    if (textBBoxes.container.exists(key)) {
        return textBBoxes.container.get(key);
    }
    else {
        var value = text.getBBox();

        textBBoxes.container.add(key, value);
        return textBBoxes.container.get(key);
    }
};

thickLineConnector = function diagonal(d) {
    if (!Boolean(d.source._id) || !Boolean(d.target._id)) {
        return;
    }

    if (!App.Node.isRoot(d.source)) {
        return;
    }

    var source = d.source,
        target = d.target,
        dir = App.getDirection(target) === 'right' ? 1 : -1,
        sourceWidth = dir * getTextWidth(source._id, source.name) / 2,
        targetWidth = dir * getTextWidth(target._id, target.name) / 2,
        deltaY = (source.y + sourceWidth) + ((target.y - targetWidth) - (source.y + sourceWidth)) / 2;

    return 'M ' + (source.y + sourceWidth) + ',' + source.x +
        ' C ' + deltaY + ',' + target.x +
        ' ' + deltaY + ',' + target.x +
        ' ' + (target.y - targetWidth) + ',' + target.x;
};

thinLineConnector = function diagonalLine(d) {
    if (!Boolean(d.source._id) || !Boolean(d.target._id)) {
        return;
    }

    var source = d.source,
        target = d.target,
        dir = App.getDirection(target) === 'right' ? 1 : -1,
        sourceWidth = dir * getTextWidth(source._id, source.name) / 2,
        targetWidth = dir * getTextWidth(target._id, target.name) / 2,
        deltaY = (source.y + sourceWidth) + ((target.y - targetWidth) - (source.y + sourceWidth)) / 2;

    return 'M ' + (source.y + sourceWidth) + ',' + source.x +
        ' C ' + deltaY + ',' + target.x +
        ' ' + deltaY + ',' + target.x +
        ' ' + (target.y - targetWidth) + ',' + target.x +
        ' L ' + (target.y + targetWidth) + ',' + target.x;

};