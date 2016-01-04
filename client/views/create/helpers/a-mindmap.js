mapsCount = 0;

MindMap = function MindMap() {
  "use strict";
  var
    margin = {top: 0, left: 0, bottom: 0, right: 0},
    width = 960,
    defaultWidth = 0,
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
            App.toggleCollapsedNode(node);
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
      node.select("text")
        .call(text);
      node.select("text").attr("y", -2);
      node.select(".level-0 text").attr("y", 9);
      node.select('rect')
        .attr('x', function () {
          var rect = d3.select(this.parentNode).select('text')[0][0].getBBox();
          return rect.x - (rect.width == 0 ? minTextSize / 2 : 0);
        })
        .attr('y', function () {
          var rect = d3.select(this.parentNode).select('text')[0][0].getBBox();
          return rect.y == 0 ? -19 : rect.y;
        })
        .attr('width', function (d) {
          var rect = d3.select(this.parentNode).select('text')[0][0].getBBox();
          return rect.width == 0 ? minTextSize : rect.width;
        })
        .attr('height', function (d) {
          var rect = d3.select(this.parentNode).select('text')[0][0].getBBox();
          return rect.height == 0 ? minTextHeight : (rect.height - 5);
        });

      var rootNode = getRootNode(node);
      d3.select(rootNode).select("ellipse")
        .attr("rx", function () {
          return d3.select(this.parentNode).select("text")[0][0].getBoundingClientRect().width / 2 + 30;
        })
        .attr("ry", function () {
          return d3.select(this.parentNode).select("text")[0][0].getBoundingClientRect().width / 50 + 25;
        });
    },
    exitNode = function (node) {
      node.select("text")
        .style("fill-opacity", 1e-6);
    };

  Meteor.call('countMaps', function (error, count) {
    mapsCount = count;
  });

  var connector = MindMap.diagonal;
  var connectLine = MindMap.diagonalLine;
  var getNodeHeight = function (node, defualtHeight) {
    var textHeight = getTextHeight(node._id),
      subTreeHeight = (node.children || []).reduce(function (height, child) {
        height += getNodeHeight(child, defualtHeight);
        return height;
      }, 0);
    subTreeHeight += (node.children || []).length > 0 ? (2 * defualtHeight) : 0;
    return Math.max(defualtHeight, textHeight, subTreeHeight);
  };
  var getX = function (node, defualtHeight) {
    if (!node.parent) return 0;
    var siblings = node.parent[node.position] || node.parent.children || [],
      siblingHeights = siblings.map(function (sibling) {
        return getNodeHeight(sibling, defualtHeight);
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
      var vis = container
        .attr("width", width)
        .attr("height", height);
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
        container.call(chart);
        container.call(chart);
      };
      var maxDepth = function (node) {
        return (node.children || []).reduce(function (depth, child) {
          var childDepth = maxDepth(child);
          return childDepth > depth ? childDepth : depth;
        }, node.depth);
      };
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
      }

      function left(d) {
        return d.left ? d.left : d.children;
      }

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
            width += getTextWidth(parent._id) * (parent.position ? 1 : 0.5);
            parent = parent.parent;
          }

          return width;
        }

        result.sort(function (a, b) {
          return a.depth - b.depth;
        }).forEach(function (node) {
          var dir = node.position ? (node.position == 'left' ? -1 : 1) : 0,
            textWidth = getTotalWidth(node);
          node.y = dir * (node.depth * nodeSize[1] + textWidth);
          node.x = getX(node, nodeSize[0]);
          node.x += (node.parent ? node.parent.x : 0);
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
        .attr("transform", translate);

//      nodeEnter.on("click", handleClick).on("dblclick", handleDblClick);

      var dragBehaviour = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", drag)
        .on("dragend", dragend);

      //TODO : text box for editing does not appear when you uncomment the below line.
      nodeEnter.call(dragBehaviour);

//TODO : handling double click, parent is same as dropped on then don't cut
      var targetNode = nodeEnter,
        draggedNode = null,
        checkDrag = false;

      function dragstart() {
        App.select(this);
        var currentNodeRect = d3.select(this).select('rect');
        var currentNodeText = d3.select(this).select('text');
        draggedNode = d3.select(this).node().__data__;
        if(d3.select(this).node().__data__.position === null){
            return;
        }

        targetNode = d3.select('svg').select('g').append('svg:g')
          .attr("transform", d3.select(this).attr("transform"))
          .attr('class', d3.select(this).attr('class'));

        targetNode.append("svg:rect")
          .attr('x', currentNodeRect.attr('x'))
          .attr('y', currentNodeRect.attr('y'))
          .attr('height', currentNodeRect.attr('height'))
          .attr('width', currentNodeRect.attr('width'));

        targetNode.append("svg:text")
          .text(currentNodeText.text())
          .attr("cols", currentNodeText.attr('cols'))
          .attr("rows", currentNodeText.attr('rows'));
      };

      function drag() {
        if(d3.select(this).node().__data__.position === null){
            return;
        }
        checkDrag = true;
        var nodeToBeDragged = d3.select(targetNode[0][0]);
        var rootNode = d3.select(".level-0");

        nodeToBeDragged.attr("transform", function () {
          return "translate(" + d3.event.x + "," + d3.event.y + ")";
        });
      };

      function dragend() {
        if (checkDrag === false) {
          if(d3.select(targetNode[0][0]).attr('class').indexOf('level-0') == -1){
             d3.select(targetNode[0][0]).remove();
          }
          handleClick.call(this);
          return;
        }
        var point = d3.select(targetNode[0][0]).attr('transform').replace('translate(', '').replace(')', '').split(',');
        d3.select(targetNode[0][0]).remove();

        if (checkDrag === true) {
          var droppedOnElement = App.checkOverlap(point);
          var droppedOnData = d3.select(droppedOnElement).node() ? d3.select(droppedOnElement).node().__data__ : null;
          if (droppedOnElement && ($.inArray(draggedNode._id, droppedOnData.parent_ids) < 0) && (draggedNode._id != droppedOnData._id)) {
            App.cutNode(function(){
              App.pasteNode(draggedNode, droppedOnData, App.calculateDirection(droppedOnData));
              App.select(droppedOnElement);
            });
          };
          checkDrag = false;
        }
      };

      enterNode(nodeEnter);

      // Transition nodes to their new position.
      var nodeUpdate = node
        .attr("transform", function (d) {
          return "translate(" + d.y + "," + d.x + ")";
        });

      updateNode(nodeUpdate);

      // Transition exiting nodes to the parent's new position.
      var nodeExit = node
        .exit()
        //.transition()
        .attr("transform", translate)
        .remove();

      exitNode(nodeExit);
      indicator.update(nodeUpdate);
      // Update the links…
      var link = vis.selectAll("path.thick-link")
        .data(tree.links(nodes), function (d) {
          return d.target[identity];
        });

      var myLineLink = vis.selectAll("path.link")
        .data(tree.links(nodes), function (d) {
          return d.target[identity];
        });


      // Enter any new links at the parent's previous position.
      link.enter().insert("svg:path", "g")
        .attr("class", function (path) {
          if (path.source == root)
            return "thick-link";
          return "link";
        })
        .attr("d", function (path) {

          var parentNode = path.source || root,
            x0 = parentNode.x0 || root.x0,
            y0 = parentNode.y0 || root.y0,
            o = {x: x0, y: y0};
          var a = connector({source: o, target: o});
          return a;
        })

      link.attr("d", connector);

      myLineLink.enter().insert("svg:path", "g")
        .attr("class", "link")
        .attr("d", function (path) {
          var parentNode = path.source || root,
            x0 = parentNode.x0 || root.x0,
            y0 = parentNode.y0 || root.y0,
            o = {x: x0, y: y0};
          var a = connectLine({source: o, target: o});
          return a;
        })
      myLineLink.attr("d", connectLine);


      // Transition links to their new position.

      // Transition exiting nodes to the parent's new position.
      link.exit()
        .attr("d", function (path) {
          var parentNode = path.source || root,
            o = {x: parentNode.x, y: parentNode.y};
          return connector({source: o, target: o});
        })
        .remove();

      myLineLink
        .exit()
        .attr("d", function (path) {
          var parentNode = path.source || root,
            o = {x: parentNode.x, y: parentNode.y};
          return connectLine({source: o, target: o});
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
    if (!arguments.length) return 6000;
    height = _;
    return chart;
  };


  chart.connector = function (_) {
    if (!arguments.length) return connector;
    connector = _;
    return chart;
  };

  chart.connectLine = function (_) {
    if (!arguments.length) return connectLine;
    connectLine = _;
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
var minTextSize = 150,
  minTextHeight = 16,
  getTextWidth = function (id) {
    if (!id) return 0;
    var text = d3.selectAll('text')[0].filter(function (text) {
      return text.__data__._id == id;
    })[0];
    if (!text) return 0;

    var textWidth = text.getBBox().width;
    return textWidth == 0 ? minTextSize : textWidth;
  },
  getTextHeight = function (id) {
    if (!id) return minTextHeight;
    var text = d3.selectAll('text')[0].find(function (text) {
      return text.__data__._id == id;
    });
    if (!text) return minTextHeight;

    var textHeight = text.getBBox().height;
    return Math.max(textHeight, minTextHeight)
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
      ' ' + (target.y - targetWidth) + ',' + target.x;
  };


MindMap.diagonalLine =
  function diagonalLine(d) {
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
