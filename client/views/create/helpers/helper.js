App.previouslyVisitedNode = null;

App.DirectionToggler = (function() {
    var instance;

    var currentDir = "left";
    var canToggle = false;

    var init = function() {
        return {
            getCurrentDirection: function() {
                return currentDir;
            },
            getCanToggle: function() {
                return canToggle;
            },
            setCanToggle: function(toggle) {
                canToggle = toggle;
            },
            changeDirection: function() {
                currentDir = (currentDir == "right") ? "left" : "right";
            }
        }
    };

    var createInstance = function() {
        var object = new init();
        return object;
    };

    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };

})();

App.applyLevelClass = function(d3Callable, depth) {
    if (d3Callable) {
        depth = depth ? depth : (d3Callable[0].length > 0 ? d3Callable[0][0].__data__.depth : null);
        if (depth) {
            d3Callable.classed("level-" + depth, true);
            return depth + 1;
        }
    }
};

App.removeAllLevelClass = function(d3Callable) {
    var levels = ['level-0', 'level-1', 'level-2', 'level-3', 'level-4', 'level-5'];
    levels.forEach(function(level) {
        d3Callable.classed(level, false);
    });
};

App.getNewlyAddedNodeId = function(parent, fields) {
    var key = Object.keys(fields)[0],
        subTree = App.Node.isRoot(parent) ? parent[key] : (parent.isCollapsed ? parent._childSubTree : parent.childSubTree),
        childIdTree = subTree.map(
            function(child) {
                return child._id;
            }),
        newlyAddedId = fields[key].find(
            function(child) {
                return childIdTree.indexOf(child) == -1;
            });
    return newlyAddedId;
};

App.checkRepositionUpdateOnRoot = function(root, updatedDirection, addedId) {
    return root[updatedDirection == "right" ? "left" : "right"].map(function(child) {
        return child._id;
    }).indexOf(addedId) != -1;
};

App.applyClassToSubTree = function(parentNodeData, className, classCallBack, callBackArgument, nodeList) {

    App.resetPathClassForCurrentNode(parentNodeData, null);

    nodeList = nodeList ? nodeList : d3.selectAll('.node')[0];
    var classToApply = null;
    if (!className && !classCallBack) return;

    var subTree = App.Node.getSubTree(parentNodeData);
    var subTreeId = subTree.map(function(child) {
        return child._id;
    });
    var tempD3Array = d3.select('thisClassDoesNotExist');
    tempD3Array[0].pop();
    nodeList.forEach(function(node) {
        if (subTreeId.indexOf(node.__data__._id) != -1)
            tempD3Array[0].push(node);
    });

    if (!className && classCallBack) {
        callBackArgument = classCallBack(tempD3Array, callBackArgument);
    } else {
        tempD3Array.classed(className, true);
    }

    subTree.forEach(function(child) {
        App.applyClassToSubTree(child, className, classCallBack, callBackArgument, nodeList);
    });
};

App.resetPathClassForCurrentNode = function(parentNodeData, node) {
    var tempNode = d3.select('thisClassDoesNotExist'),
        depth;
    tempNode[0].pop();
    if (node) {
        depth = node.depth;
        tempNode.push(d3.selectAll('path')[0].filter(function(_) {
            return _.__data__.target._id == node._id
        }));
    } else {
        depth = parentNodeData.depth + 1;
        if (parentNodeData.childSubTree)
            parentNodeData.childSubTree.forEach(function(child) {
                tempNode.push(d3.selectAll('path')[0].filter(function(_) {
                    return _.__data__.target._id == child._id
                }));
            });
    }
    tempNode.classed('thick-link', false);
    tempNode.classed('link', false);
    tempNode.classed(App.getPathClassForNodeDepth(depth), true);
};

App.calculateNextIndex = function(initialIndex, length, keyPressed) {
    var newIndex = -1;
    if (keyPressed === App.Constants.KeyPressed.UP) {
        if (initialIndex == 0) return -1;
        newIndex = (initialIndex - 1) < 0 ? length - 1 : (initialIndex - 1) % length;
    } else if (keyPressed === App.Constants.KeyPressed.DOWN) {
        if (initialIndex == length - 1) return -1;
        newIndex = (initialIndex + 1) % length;
    }

    return newIndex
};

App.swapElements = function(list, firstIndex, secondIndex) {
    var temp = list[firstIndex];
    list[firstIndex] = list[secondIndex];
    list[secondIndex] = temp;
    return list;
};

App.circularReposition = function(list, keyPressed) {
    var newArray = [];
    if (keyPressed === App.Constants.KeyPressed.UP) {
        var temp = list[0];
        newArray = list.slice(1);
        newArray.push(temp);
    } else if (keyPressed == App.Constants.KeyPressed.DOWN) {
        var temp = list[list.length - 1];
        newArray = list.slice(0, list.length - 1);
        newArray.splice(0, 0, temp);
    }

    list = newArray;
    return list;
};

App.nodeSelector = {
    prevDepthVisited: 0,

    setPrevDepth: function(depth) {
        App.nodeSelector.prevDepthVisited = depth;
    }
};


App.selectShiftHorizontal = function(node) {

    {
        d3.select(node).classed("softSelected", true);
        App.deselectNode();
        d3.select(node).classed("selected", true);
        if (App.multiSelectedNodes.indexOf(node) < 0)
            App.multiSelectedNodes.push(node);



    }



}

App.selectShiftVertical = function(node) {

    if (App.multiSelectedNodes.indexOf(node) > 0) {
        d3.select(node).classed("softSelected", true);
        App.deselectNode();
        d3.select(node).classed("selected", true);
        if (App.multiSelectedNodes.indexOf(node) < 0)
            App.multiSelectedNodes.push(node);
    }



}

App.select = function(node, softSelect) {
    // Find previously selected and deselect

    if (App.cmdDown || softSelect) {

        if (App.multiSelectedNodes.indexOf(node) >= 0) {

            if (App.multiSelectedNodes.length == 1) return;
            App.deselectNode();
            App.multiSelectedNodes.splice(App.multiSelectedNodes.indexOf(node), 1);
            d3.select(App.multiSelectedNodes[App.multiSelectedNodes.length - 1]).classed("selected", true);
            d3.select(node).classed("softSelected", false);

            return;
        }

        d3.select(node).classed("softSelected", true);
        App.deselectNode();
        d3.select(node).classed("selected", true);
        if (App.multiSelectedNodes.indexOf(node) < 0)
            App.multiSelectedNodes.push(node);
    } else {
        //deselct everything except currently selected
        App.deselectNode();
        d3.select(node).classed("selected", true);
        App.clearAllSelected();

    }
    if(Meteor.user()) {
        Meteor.call("updateUserStatus", Meteor.user().services.google.email, d3.select(".node.level-0")[0][0].__data__._id, node.__data__._id);
    }
};

App.deselectNode = function() {
    d3.selectAll(".selected").classed("selected", false);
};

App.clearAllSelected = function() {

    App.multiSelectedNodes = [];
    d3.selectAll(".softSelected").classed("softSelected", false);

    var node = d3.select(".selected")[0][0];
    d3.select(node).classed("softSelected", true);
    App.multiSelectedNodes.push(node);

}


App.selectNode = function(target) {
    if (target) {
        var sel = d3.selectAll('#mindmap svg .node').filter(function(d) {
            return d._id == target._id
        })[0][0];
        if (sel) {
            App.select(sel);
          //  console.log("selected mnode",sel.)
            return true;
        }
    }
    return false;
};

var updateDbWithPromptInput = function(nodeData) {
    $('#myModalHorizontal').modal('hide');
    var updatedText = $("#modal-text").val();
    if (updatedText != nodeData.name) {
        nodeData.name = updatedText;
        mindMapService.updateNode(nodeData._id, {
            name: nodeData.name
        });
        App.chart.update();
        setTimeout(function() {
            App.chart.update();
            App.selectNode(nodeData);
        }, 10);
    }
};

var showPrompt = function(nodeData) {
    $("#modal-text").val(nodeData.name);
    $('#myModalHorizontal').modal('show');

    $('#myModalHorizontal').on('shown.bs.modal', function() {
        $("#modal-text").focus();
        $("#modal-text").select();
    });
    $("#modal-save").click(function() {
        updateDbWithPromptInput(nodeData);
        $('#modal-save').off('click');
    });
};

var updateNode = function(nodeData) {
    mindMapService.updateNode(nodeData._id, {
        name: nodeData.name
    });
    setTimeout(function() {
        App.selectNode(nodeData);
    }, 10);
};

App.showEditor = function(node) {
    var selectedNode = node || d3.select('.selected')[0][0];
    var nodeData = selectedNode.__data__;

    if (nodeData && nodeData.name && nodeData.name.length >= 50) {
        showPrompt(nodeData);
        return;
    }

    var editor = new Editor(selectedNode, updateNode);
    var editBox = editor.createEditBox();
    editor.setupEditBox(editBox);
    editor.setupAttributes();
};

App.getDirection = function(data) {
    return App.Node.getDirection(data);
};

App.calculateDirection = function(parent) {
    var dir = App.getDirection(parent);
    var selectedNode = App.map.getDataOfNodeWithClassNamesString(".node.selected");
    if (dir === 'root') {
        dir = App.getDirection(selectedNode);
        if (dir === 'root') {
            var directionToggler = App.DirectionToggler.getInstance();
            directionToggler.setCanToggle(true);
            directionToggler.changeDirection();
            directionToggler.setCanToggle(false);
            dir = directionToggler.getCurrentDirection();
        }
    }
    return dir;
};

App.storeLocally = function(node) {
    var state = {
        isCollapsed: node.isCollapsed
    };
    store.set(node._id, state);
};

App.removeLocally = function(node) {
    store.remove(node._id);
};

App.isLocallyCollapsed = function(id) {
    try {
        var locallyCollapsed = store.get(id).isCollapsed;
    } catch (e) {}
    return locallyCollapsed ? true : false;
};

App.retainCollapsed = function() {
    store.forEach(function(key) {
        try {
            if (App.isLocallyCollapsed(key)) {
                var nodeData = App.map.getNodeDataWithNodeId(key);
                App.collapse(nodeData, key);
            }
        } catch (e) {}
    });
};

var collapseRecursive = function(d, id) {
    if (d._id === id) {
        d.isCollapsed = true;
        App.storeLocally(d);
    }
    if (d.hasOwnProperty('childSubTree') && d.children) {
        d._childSubTree = [];
        d._childSubTree = d.childSubTree;
        //d._childSubTree.forEach(collapseRecursive);
        d.childSubTree = null;
    }
};

App.collapse = function(d, id) {
    collapseRecursive(d, id);
    App.chart.update();
};

App.expandRecursive = function(d, id) {
    if (d._id === id) {
        d.isCollapsed = false;
        App.removeLocally(d);
    }
    // On refresh - If child node is collapsed do not expand it
    if (App.isLocallyCollapsed(d._id) == true)
        d.isCollapsed = true;
    if (d.hasOwnProperty('_childSubTree') && d._childSubTree && !d.isCollapsed) {
        d.childSubTree = d._childSubTree;
        // d._childSubTree.forEach(App.expandRecursive);
        d._childSubTree = null;
    }
};

App.expand = function(d, id) {
    App.expandRecursive(d, id);
    App.chart.update();
};

App.toggleCollapsedNode = function(selected) {

    var dir = App.getDirection(selected);
    if (dir !== 'root') {
        if (selected.hasOwnProperty('_childSubTree') && selected._childSubTree) {
            App.expand(selected, selected._id);
        } else {
            App.collapse(selected, selected._id);
        }
    }
};


App.checkOverlap = function(rect1) {
    var rectList = d3.select('svg').select('g').selectAll('g');
    for (var i = 0; i < rectList[0].length; i++) {

        var rectPoint = d3.select(rectList[0][i]).attr('transform').replace('translate(', '').replace(')', '').split(',');

        var currHeight = (d3.select(rectList[0][i]).select('rect').attr('height') * 1),
            currWidth = (d3.select(rectList[0][i]).select('rect').attr('width') * 1),
            currX = rectPoint[0] * 1 - (currWidth / 2),
            currY = rectPoint[1] * 1 + (currHeight / 2);

        if (rect1[0] * 1 >= currX && rect1[0] * 1 <= currX + currWidth && rect1[1] * 1 <= currY && rect1[1] * 1 >= currY - currHeight) {

            return rectList[0][i];

        }

    }
};

App.dragAndDrop = function(draggedNode, droppedOnNode, toggleCallback) {
    if (droppedOnNode.isCollapsed) toggleCallback(droppedOnNode);
    var parent = draggedNode.parent,
        dir = App.getDirection(draggedNode),
        siblingIds = (App.Node.isRoot(parent) ? parent[dir] : parent.childSubTree).map(function(_) {
            return _._id
        });

    var stackData = new App.stackData(draggedNode, "reposition", dir, siblingIds.indexOf(draggedNode._id), parent);
    App.Node.reposition(draggedNode, droppedOnNode);
    App.RepeatHandler.addToActionStack([stackData]);

};


App.getChartInFocus = function() {
    var body = $('body')[0],
        scrollWidth = body.scrollWidth - body.clientWidth,
        scrollHeight = body.scrollHeight - body.clientHeight;
    $(window).scrollLeft(scrollWidth / 2);
    $(window).scrollTop(scrollHeight / 2);
};

App.clone = function(node) {
    var clonedNode = {
        name: node.name,
        position: node.position
    };
    clonedNode.children = (node.children || node._children || []).App.map(function(currentElem) {
        return clone(currentElem);
    });
    if (node.depth == 0) {
        clonedNode.left = clonedNode.children.filter(function(x) {
            return x.position == 'left'
        });
        clonedNode.right = clonedNode.children.filter(function(x) {
            return x.position == 'right'
        });
    }
    return clonedNode;
};


App.cloneObject = function(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
};

App.KeyCodes = {
    enter: 13,
    escape: 27,
    tab: 9
};

App.getPathClassForNodeDepth = function(depth) {
    var nodeDepthPathClass = {
        1: 'thick-link',
        2: 'link',
        3: 'link',
        4: 'link'
    };

    return Object.keys(nodeDepthPathClass).indexOf(depth) != -1 ? nodeDepthPathClass[depth] : 'link';
};

App.checkIfSiblings = function(nodesList) {
    for (var i = 0; i < nodesList.length - 1; i++) {
        if (nodesList[i].parentId != nodesList[i + 1].parentId)
            return false;
    }
    return true;
};