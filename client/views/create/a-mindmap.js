MindMap = function () {
    "use strict";
    var
        margin = {top: 0, left: 0, bottom: 0, right: 0},
        width = 960,
        width = 960,
        defaultWidth = 0,
        height = 500,
        identity = '_id',
        handleClick = function () {
        },
        handleDblClick = function () {
        },
        text = function (d) {
            return d.name;
        },
        getWidth = function (d) {
            var width = 80;
            if (d && d.name && typeof d.name == 'string')
                width = d.name.length * 6 + 12;
            return width;
        },
        idx = 0,
        getRootNode = function (node) {
            return node[0][node[0].length - 1];
            return node[0].find(function (n) {
                return !n.__data__.position;
            });
        },
        indicator = {
            default: 4,
            hovered: 10,
            enter: function (node) {
                node.filter(function (x) {
                    return x.position;
                }).append('svg:circle')
                    .attr('class', 'indicator unfilled')
                    .attr('r', indicator.default)
                    .attr('cx', function (d) {
                        var text = d3.select(this.parentNode).select("text")[0][0],
                            bBox = text.getBBox(),
                            x = bBox.width == 0 ? -5 : bBox.x;
                        return (d.position == 'left' ? 1 : -1) * x;
                    })
                    .on('mouseover', function (d) {
                        var hasChildren = (d.children || d._children || []).length > 0,
                            r = hasChildren ? indicator.hovered : 0;
                        return d3.select(this)
                            .attr('r', r)
                            .classed('unfilled', false)
                            .classed('filled', hasChildren);
                    })
                    .on('mouseout', function (d) {
                        var hasChildren = (d.children || d._children || []).length > 0,
                            r = hasChildren ? (d.isCollapsed ? indicator.default : indicator.hovered) : 0;
                        return d3.select(this)
                            .attr('r', r)
                            .classed('filled', d.isCollapsed)
                            .classed('unfilled', !d.isCollapsed);

                    })
                    .on('click', function (node) {
                        toggleCollapsedNode(node);
                        return false;
                    });
            },
            update: function (node) {
                node.selectAll('circle')
                    .attr('cx', function (d) {
                        var text = d3.select(this.parentNode).select("text")[0][0],
                            bBox = text.getBBox(),
                            x = bBox.width == 0 ? -5 : bBox.x;
                        return (d.position == 'left' ? 1 : -1) * x;
                    })
                    .attr('r', function (d) {
                        var hasChildren = (d.children || d._children || []).length > 0;
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
            d3.select(rootNode).classed('rootNode', true);

            node.append("svg:ellipse")
                .attr("rx", 10)
                .attr("ry", 10)
                .style("fill", "transparent")
                .style("stroke-width", 0)
                .on("mouseover", function () {
                    return d3.select(this).style("stroke-width", 1);
                })
                .on("mouseout", function () {
                    return d3.select(this).style("stroke-width", 0);
                });


            node.append("svg:text")
                .text(text);

            indicator.enter(node);
        },
        updateNode = function (node) {
            node.select("text")
                .text(text);
            node.select("text").attr("y", -2);
            node.select(".rootNode text").attr("y", 6);


            var rootNode = getRootNode(node);
            d3.select(rootNode).select("ellipse")
                .attr("rx", getWidth)
                .attr("ry", 20);
        },
        exitNode = function (node) {
            var rootNode = getRootNode(node);
            if (rootNode)
                d3.select(rootNode).select("ellipse")
                    .attr("rx", 1e-6)
                    .attr("ry", 1e-6);

            node.select("text")
                .style("fill-opacity", 1e-6);
        }
        ;

    var connector = MindMap.diagonal;

    var chart = function (selection) {
        selection.each(function (root) {
            var w = width - margin.left - margin.right;
            var h = height - margin.top - margin.bottom;
            var nodeSize = [30, 30]
            var container = d3.select(this);
            var vis = container
                .attr("width", width)
                .attr("height", height)
                ;
            var graphRoot = vis.select('g');
            if (!graphRoot[0][0]) {
                vis = vis.append('svg:g');
            } else {
                vis = graphRoot;
            }
            vis = vis
                .attr("transform", "translate(" + (w / 2 + margin.left) + "," + (margin.top + h / 2) + ")")
            ;

            root.x0 = 0;
            root.y0 = 0;

            var tree = d3.layout.cluster()
                .nodeSize(nodeSize);

            chart.update = function () {
                //updateWidth();
                container.transition().call(chart);
            };
            var maxDepth = function (node) {
                return (node.children || []).reduce(function (depth, child) {
                    var childDepth = maxDepth(child);
                    return childDepth > depth ? childDepth : depth;
                }, node.depth);
            };
            var updateWidth = function () {
                var depth = maxDepth(container.select('.node.rootNode').data()[0]);
                defaultWidth = defaultWidth == null ? width : defaultWidth;
                chart.width(defaultWidth + depth * 250);
            }
            // Ensure we have Left and Right node lists
            if (!(root.left || root.right)) {
                var i = 0, l = (root.children || []).length;
                root.left = [];
                root.right = [];

                for (; i < l; i++) {
                    switch (root.children[i].position) {
                        case 'left' :
                            root.left.push(root.children[i]);
                            break;
                        case 'right':
                            root.right.push(root.children[i]);
                            break;
                    }
                }
            }

            //Compute the new tree layout.
            function right(d) {
                return d.right ? d.right : d.children;
            };
            function left(d) {
                return d.left ? d.left : d.children;
            };
            var first = root.left.length > 0 ? left : right,
                second = root.right.length > 0 ? right : left;

            var firstSet = tree
                .children(first)
                .nodes(root)
                .reverse();
            var secondSet = tree
                .children(second)
                .nodes(root)
                .reverse();

            root.children = root.left.concat(root.right);

            var nodes = window.nodes = (function (left, right) {
                left.pop();

                var result = left.concat(right);

                function getTotalWidth(node) {
                    if (!node) return 0;
                    var width = getTextWidth(node._id) / 2, parent = node.parent;
                    while (parent) {
                        width += getTextWidth(parent._id);
                        parent = parent.parent;
                    }

                    return width;
                }

                result.forEach(function (node) {
                    var dir = node.position ? (node.position == 'left' ? -1 : 1) : 0,
                        textWidth = getTotalWidth(node);
                    node.y = dir * (node.depth * nodeSize[1] + textWidth);
                });

                return result;
            })(firstSet, secondSet);

            // Update the nodes…
            var node = vis.selectAll("g.node")
                .data(nodes, function (d) {
                    return d[identity] || (d[identity] = ++idx);
                });

            // Enter any new nodes at the parent's previous position.
            var translate = function (node) {
                var parentNode = node.parent || root,
                    x0 = parentNode.x0 || root.x0,
                    y0 = parentNode.y0 || root.y0;
                return "translate(" + y0 + "," + x0 + ")";
            };

            var nodeEnter = node.enter().append("svg:g")
                .attr("class", "node")
                .attr("transform", translate)
                .on("click", handleClick)
                .on("dblclick", handleDblClick);


            enterNode(nodeEnter);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });


            updateNode(nodeUpdate);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .attr("transform", translate)
                .remove();

            exitNode(nodeExit);
            indicator.update(nodeUpdate);
            // Update the links…
            var link = vis.selectAll("path.link")
                .data(tree.links(nodes), function (d) {
                    return d.target[identity];
                });

            // Enter any new links at the parent's previous position.
            link.enter().insert("svg:path", "g")
                .attr("class", "link")
                .attr("d", function (path) {
                    var parentNode = path.source || root,
                        x0 = parentNode.x0 || root.x0,
                        y0 = parentNode.y0 || root.y0,
                        o = {x: x0, y: y0};
                    return connector({source: o, target: o});
                })
                .transition()
                .attr("d", connector);


            // Transition links to their new position.
            link.transition()
                .attr("d", connector);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .attr("d", function (path) {
                    var parentNode = path.source || root,
                        o = {x: parentNode.x, y: parentNode.y};
                    return connector({source: o, target: o});
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        });
    };

    chart.width = function (_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function (_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };


    chart.connector = function (_) {
        if (!arguments.length) return connector;
        connector = _;
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
    }
    return chart;
};
var getTextWidth = function (id) {
    if (!id) return 0;
    var text = d3.selectAll('text')[0].filter(function (text) {
        return text.__data__._id == id;
    })[0];
    if (!text) return 0;
    return text.getBBox().width;
};
MindMap.elbow = function (d) {
    var source = d.source;
    var target = d.target;
    var hy = (target.y - source.y) / 2;
    return "M" + source.y + "," + source.x +
        "H" + (source.y + hy) +
        "V" + target.x + "H" + target.y;
};
MindMap.diagonal =
    function diagonal(d) {
        var source = d.source,
            target = d.target,
            dir = target.position == 'right' ? 1 : -1,
            sourceWidth = dir * getTextWidth(source._id) / 2,
            targetWidth = dir * getTextWidth(target._id) / 2,
            deltaY = (source.y + sourceWidth) + ((target.y - targetWidth) - (source.y + sourceWidth)) / 2;
        return 'M' + (source.y + sourceWidth) + ',' + source.x +
            'C' + deltaY + ',' + target.x +
            ' ' + deltaY + ',' + target.x +
            ' ' + (target.y - targetWidth) + ',' + target.x +
            'L' + (target.y + targetWidth) + ',' + target.x;
    };

MindMap.loadFreeMind = function (fileName, callback) {
    d3.xml(fileName, 'application/xml', function (err, xml) {
        // Changes XML to JSON
        var xmlToJson = function (xml) {

            // Create the return object
            var obj = {};

            if (xml.nodeType == 1) { // element
                // do attributes
                if (xml.attributes.length > 0) {
                    obj["@attributes"] = {};
                    for (var j = 0; j < xml.attributes.length; j++) {
                        var attribute = xml.attributes.item(j);
                        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                    }
                }
            } else if (xml.nodeType == 3) { // text
                obj = xml.nodeValue;
            }

            // do children
            if (xml.hasChildNodes()) {
                for (var i = 0; i < xml.childNodes.length; i++) {
                    var item = xml.childNodes.item(i);
                    var nodeName = item.nodeName;
                    if (typeof(obj[nodeName]) == "undefined") {
                        obj[nodeName] = xmlToJson(item);
                    } else {
                        if (typeof(obj[nodeName].push) == "undefined") {
                            var old = obj[nodeName];
                            obj[nodeName] = [];
                            obj[nodeName].push(old);
                        }
                        obj[nodeName].push(xmlToJson(item));
                    }
                }
            }
            return obj;
        };
        var js = xmlToJson(xml);
        var data = js.map.node;
        var parseData = function (data, direction) {
            var key, i, l, dir = direction, node = {}, child;
            for (key in data['@attributes']) {
                node[key.toLowerCase()] = data['@attributes'][key];
            }
            node.direction = node.direction || dir;
            l = (data.node || []).length;
            if (l) {
                node.children = [];
                for (i = 0; i < l; i++) {
                    dir = data.node[i]['@attributes'].POSITION || dir;
                    child = parseData(data.node[i], {}, dir);
                    (node[dir] = node[dir] || []).push(child);
                    node.children.push(child);
                }
            }
            return node;
        };
        var root = parseData(data, 'right');

        return callback(err, root);
    });
};
