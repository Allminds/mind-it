App.eventBinding = {};
App.nodeToPasteBulleted = "";
App.nodeCutToPaste = null;
App.isIndicatorActive=false;
App.eventBinding.focusAfterDelete = function (removedNode, removedNodeIndex) {
    var parent = removedNode.parent,
        siblings = (App.Node.isRoot(parent) ? parent[removedNode.position] : parent.childSubTree) || [];
    var focusableNode = siblings[removedNodeIndex];
    if (siblings.length == 0) {
        focusableNode = parent;
    } else if (removedNodeIndex == siblings.length) {
        focusableNode = siblings[removedNodeIndex - 1];
    }
    App.selectNode(focusableNode);
};

App.cutNode = function (selectedNode) {
    if (App.Node.isRoot(selectedNode) == true) {
      alert("The root node cannot be cut!");
        return;
    }

    App.nodeCutToPaste = selectedNode;

    var dir = App.Node.getDirection(selectedNode),
        parent = selectedNode.parent,
        siblings = App.Node.getSubTree(parent, dir),
        siblingsIDList = siblings.map(function(_){return _._id;}),
        selectedNodeIndex = siblingsIDList.indexOf(selectedNode._id);
        siblingsIDList.splice(selectedNodeIndex,1);
    siblings.splice(selectedNodeIndex,1);


    App.Node.updateChildTree(parent, dir, siblingsIDList);
    App.Node.updateParentIdOfNode(selectedNode, "None");


    App.eventBinding.focusAfterDelete(selectedNode,selectedNodeIndex);

};



App.eventBinding.f2Action = function (event) {
    (event.preventDefault || event.stop || event.stopPropagation || function () {
    }).call(event);
    var selectedNode = d3.select(".node.selected")[0][0];
    if (!selectedNode) return;
    App.showEditor(selectedNode);
};

var deleteNode = function(stack, nodeData, destinationDirection) {
    App.Node.delete(nodeData);
    App.eventBinding.focusAfterDelete(nodeData, nodeData.index);
    var stackData = new App.redoData(nodeData, "add");
    stackData.destinationDirection = destinationDirection;
    stack.push([stackData]);
};

var undoRedoDeleteOperation = function(stack, stackData) {
    if (stackData.nodeData.parent.isCollapsed) {
        App.expandRecursive(stackData.nodeData.parent, stackData.nodeData.parent._id);
    }
    if (stackData.nodeData.childSubTree.length == 0)
        deleteNode(stack, stackData.nodeData, stackData.destinationDirection);
};

var clearAllSelections = function() {
    d3.selectAll(".selected").classed("selected", false);
    d3.selectAll(".softSelected").classed("softSelected", false);
};

App.eventBinding.undoAction = function() {
    if(App.undoStack.length!=0) {
        var multipleUndo = App.undoStack.pop();
        multipleUndo.forEach(function(undoData) {
            if (undoData.nodeData) {
                if (undoData.operationData === "delete")
                    undoRedoDeleteOperation(App.redoStack, undoData);
                if (undoData.operationData === "add") {

                    if(App.Node.isDeleted(undoData.nodeData.parent)){
                        return;
                    }

                    var targetNode = undoData.nodeData.parent;

                    //App.tracker.updatedNodeId = undoData.nodeData._id;

                    if (targetNode.isCollapsed) {
                        App.expandRecursive(targetNode, targetNode._id);
                    }

                    var destinationDirection = undoData.destinationDirection;

                    var destinationSubtree = App.Node.getSubTree(targetNode, destinationDirection);
                    destinationIndex = destinationSubtree[undoData.nodeData.index] ? undoData.nodeData.index : destinationSubtree.length;

                    undoData.nodeData.index = destinationIndex;

                    var destinationIdList = destinationSubtree.map(
                        function (child) {
                            return child._id;
                        });

                    destinationIdList.splice(destinationIndex, 0, undoData.nodeData._id);
                    App.Node.updateChildTree(targetNode, destinationDirection, destinationIdList);

                    clearAllSelections();
                    App.selectNode(undoData.nodeData);

                    var redoData = new App.redoData(undoData.nodeData, undoData.operationData);
                    redoData.operationData = "delete";
                    redoData.destinationDirection = undoData.destinationDirection;
                    App.redoStack.push([redoData]);

                }
            }

            if (undoData.operationData === "Vertical Reposition Down") {
                verticalRepositionAction(undoData.nodeData, App.Constants.KeyPressed.DOWN, App.redoStack);
            }

            if (undoData.operationData === "Vertical Reposition Up") {
                verticalRepositionAction(undoData.nodeData, App.Constants.KeyPressed.UP, App.redoStack);
            }
        });
    }
};


Mousetrap.bind('mod+z', function() {
    App.eventBinding.undoAction();
});

App.eventBinding.redoAction = function() {
    if(App.redoStack.length!=0) {
        var multipleRedo = App.redoStack.pop();

        multipleRedo.forEach(function(redoData){
            if(redoData.nodeData) {
                if (redoData.operationData === "delete")
                    undoRedoDeleteOperation(App.undoStack, redoData);
                if (redoData.operationData === "add") {
                    var targetNode = redoData.nodeData.parent;

                    if(App.Node.isDeleted(targetNode)){
                        return;
                    }

                    App.tracker.updatedNodeId = redoData.nodeData._id;

                    if (targetNode.isCollapsed) {
                        App.expandRecursive(targetNode, targetNode._id);
                    }

                    var destinationDirection = redoData.destinationDirection;

                    var destinationSubtree = App.Node.getSubTree(targetNode, destinationDirection);
                    destinationIndex = destinationSubtree[redoData.nodeData.index] ? redoData.nodeData.index : destinationSubtree.length;

                    redoData.nodeData.index = destinationIndex;

                    var destinationIdList = destinationSubtree.map(
                        function (child) {
                            return child._id;
                        });

                    destinationIdList.splice(destinationIndex, 0, redoData.nodeData._id);
                    App.Node.updateChildTree(targetNode, destinationDirection, destinationIdList);

                    clearAllSelections();
                    App.selectNode(redoData.nodeData);

                    var undoData = new App.undoData(redoData.nodeData, redoData.operationData);
                    undoData.operationData = "delete";
                    undoData.destinationDirection = redoData.destinationDirection
                    App.undoStack.push([undoData]);

                }

                if (redoData.operationData === "Vertical Reposition Down") {
                    verticalRepositionAction(redoData.nodeData, App.Constants.KeyPressed.DOWN, App.undoStack);
                }

                if (redoData.operationData === "Vertical Reposition Up") {
                    verticalRepositionAction(redoData.nodeData, App.Constants.KeyPressed.UP, App.undoStack);
                }

            }
        });

    }
};

Mousetrap.bind('command+shift+z', function() {
    App.eventBinding.redoAction();
});

// The above function MUST be copied and the key binding changed to "CTRL+Y" for non- mac users


Mousetrap.bind('f2', function (event) {
    App.eventBinding.f2Action(event);
});


Mousetrap.bind('mod+x', function () {
  var selection = d3.select(".node.selected")[0][0];
    if (selection) {
      var node = selection.__data__;
      App.nodeToPasteBulleted = App.CopyParser.populateBulletedFromObject(node);
      App.cutNode(node);
    }
});

Mousetrap.bind('mod+c', function () {
  var selection = d3.select(".node.selected")[0][0];
  if (selection) {
    var node = selection.__data__;
    App.nodeToPasteBulleted = App.CopyParser.populateBulletedFromObject(node);
  }
});

Mousetrap.bind('mod+v', function () {
  var targetNode = App.map.getDataOfNodeWithClassNamesString(".node.selected");
  var sourceNodeBulleted = App.nodeToPasteBulleted,
  dir = App.calculateDirection(targetNode);
  if (targetNode.isCollapsed)
    App.expandRecursive(targetNode, targetNode._id);

  if(App.nodeCutToPaste) {
    App.Node.reposition(App.nodeCutToPaste, targetNode, null, null, dir);
    App.nodeCutToPaste = null;
  } else {
    App.CopyParser.populateObjectFromBulletedList(sourceNodeBulleted, targetNode);
  }

});


App.eventBinding.escapeOnNewNode = function(newNode){
  var parentNode = App.map.getNodeDataWithNodeId(newNode.parentId);
    $(window).unbind().on("keyup", (function(e) {
      var selectedNodeId = d3.select('.selected').node() ? d3.select('.selected').node().__data__._id : null;
                                      var modalCreatedNodeId = d3.select('._selected').node() ? d3.select('._selected').node().__data__._id : null;
      if((selectedNodeId === null && modalCreatedNodeId === null )){
        if (e.keyCode === App.KeyCodes.escape) {
          newNode.parent = parentNode;
          App.Node.delete(newNode);
          App.selectNode(parentNode);
        }
      }
    }));
};

App.eventBinding.afterNewNodeAddition = function (newNode, selectedNode) {
    App.deselectNode();
    App.map.makeEditable(newNode._id);
    App.eventBinding.escapeOnNewNode(newNode, selectedNode);


};

App.eventBinding.newNodeAddAction = function (action) {
    var selectedNode = App.map.getDataOfNodeWithClassNamesString(".node.selected");

    if (selectedNode) {
        var newNode = action(selectedNode);

        var undoData1 = new App.undoData(App.map.getNodeDataWithNodeId(newNode._id),"delete");

        undoData1.destinationDirection = App.Node.isRoot(undoData1.nodeData.parent) ? undoData1.nodeData.position : App.Node.getDirection(undoData1.nodeData);

        App.undoStack.push([undoData1]);

        App.eventBinding.afterNewNodeAddition(newNode, selectedNode);
    }
};

App.eventBinding.enterAction = function (selectedNode) {
    var dbNode = App.Node.d3NodeToDbNode(selectedNode),
        parent = dbNode.parentId ? dbNode.parent : dbNode,
        dir = App.calculateDirection(parent),
        siblings = App.Node.isRoot(parent) ? parent[dir] : parent.childSubTree;

    var childIndex = App.Node.isRoot(dbNode) ? siblings.length : siblings.map(function (child) {
        return child._id;
    }).indexOf(dbNode._id) + 1;

    return App.map.addNewNode(parent, dir, childIndex);
};

Mousetrap.bind('enter', function () {
    App.eventBinding.newNodeAddAction(App.eventBinding.enterAction);
    App.clearAllSelected();
    return false;
});

App.eventBinding.tabAction = function (selectedNode) {
    if (selectedNode.hasOwnProperty('isCollapsed') && selectedNode.isCollapsed) {
        App.expand(selectedNode, selectedNode._id);
    }
    var dbNode = App.Node.d3NodeToDbNode(selectedNode),
        dir = App.calculateDirection(dbNode),
        siblings = dbNode.position ? dbNode.childSubTree : dbNode[dir],
        childIndex = siblings.length;

    return App.map.addNewNode(dbNode, dir, childIndex);
};

Mousetrap.bind('tab', function () {
    App.eventBinding.newNodeAddAction(App.eventBinding.tabAction);
    App.clearAllSelected();
    return false;
});

App.eventBinding.deleteAction = function() {
    var selectedNode = App.map.getDataOfNodeWithClassNamesString(".node.selected");
    if (selectedNode) {
        var dir = App.getDirection(selectedNode);

        if (dir === 'root') {
            alert('Can\'t delete root');
            return;
        }

        deleteNode(App.undoStack, selectedNode, dir);
    }
};

Mousetrap.bind('del', function () {
    App.eventBinding.deleteAction();
});

App.eventBinding.findSameLevelChild = function (node, depth, keyPressed) {
    var index;
    if (keyPressed === App.Constants.KeyPressed.DOWN)
        index = 0;
    if (!node.children)
        return node;
    if (node.depth == depth) {
        return node;
    }
    while (node.children) {
        if (!(keyPressed === App.Constants.KeyPressed.DOWN))
            index = node.children.length - 1;
        node = node.children[index];
        if (node.depth == depth) {
            return node;
        }
    }
    return node;
};

var isParentChildMatchesThisNode = function (siblings, index, node) {
    return siblings[index]._id === node._id
};

var isGoingUpFromTopMostNode = function (siblings, node, keyPressed) {
    return !(keyPressed === App.Constants.KeyPressed.DOWN) && isParentChildMatchesThisNode(siblings, 0, node);
};

var isGoingDownFromBottomLastNode = function (iterator, numberOfSiblings, keyPressed) {
    return (keyPressed === App.Constants.KeyPressed.DOWN) && (iterator == numberOfSiblings);
};

App.eventBinding.performLogicalVerticalMovement = function (node, keyPressed) {
    var direction = App.getDirection(node);
    if (direction === 'root') return;

    var parent = node.parent,
        siblings = (App.Node.isRoot(parent) ? parent[direction] : parent.childSubTree) || [],
        iterator = (keyPressed === App.Constants.KeyPressed.DOWN) ? 0 : 1;

    var numberOfSiblings = (keyPressed === App.Constants.KeyPressed.DOWN) ? siblings.length - 1 : siblings.length;

    while (iterator < numberOfSiblings) {
        if (isParentChildMatchesThisNode(siblings, iterator, node)) {
            var iteratorDiff = (keyPressed === App.Constants.KeyPressed.DOWN) ? 1 : -1;
            App.selectNode(App.eventBinding.findSameLevelChild(siblings[iterator + iteratorDiff], App.nodeSelector.prevDepthVisited, keyPressed));
            break;
        }
        iterator++;
    }
    if (isGoingDownFromBottomLastNode(iterator, numberOfSiblings, keyPressed))
        App.eventBinding.performLogicalVerticalMovement(parent, keyPressed);
    if (isGoingUpFromTopMostNode(siblings, node, keyPressed))
        App.eventBinding.performLogicalVerticalMovement(parent, keyPressed);
};

App.eventBinding.beforeBindEventAction = function (event) {
    (event.preventDefault || event.stop || event.stopPropagation || function () {
    }).call(event);
//    return null;
    return d3.select(".node.selected")[0][0].__data__;
};

App.eventBinding.afterBindEventAction = function (node) {
    App.selectNode(node);
    if (node)
        App.nodeSelector.setPrevDepth(node.depth);
};

App.eventBinding.caseAction = function (data, left, right, root, keyPressed) {
    var dir = App.getDirection(data);
    switch (dir) {
        case('root'):
            root(data, keyPressed);
            break;
        case('left'):
            left(data, keyPressed);
            break;
        case('right'):
            right(data, keyPressed);
            break;
    }
};

App.eventBinding.bindEventAction = function (event, left, right, root, keyPressed) {
    var selectedNodeData = App.eventBinding.beforeBindEventAction(event);
    if (selectedNodeData) {
        App.eventBinding.caseAction(selectedNodeData, left, right, root, keyPressed);
    }
    return false;
};

Mousetrap.bind('up', function () {
    var a=App.eventBinding.bindEventAction(arguments[0], App.eventBinding.performLogicalVerticalMovement, App.eventBinding.performLogicalVerticalMovement, function () {
    }, App.Constants.KeyPressed.UP);
    App.clearAllSelected();
    return a;
});

Mousetrap.bind('down', function () {

    var a=App.eventBinding.bindEventAction(arguments[0], App.eventBinding.performLogicalVerticalMovement, App.eventBinding.performLogicalVerticalMovement, function () {
    }, App.Constants.KeyPressed.DOWN);
    App.clearAllSelected();
    return a;
});

App.eventBinding.handleCollapsing = function (data) {
    var node;
    if (data.hasOwnProperty('isCollapsed') && data.isCollapsed) {
        App.expand(data, data._id);
    }
    else {
        node = (data.children || [])[0];
    }
    App.eventBinding.afterBindEventAction(node);
};

App.eventBinding.getParentForEventBinding = function (data, dir) {
    var node = data.parent || data[dir][0];
    App.eventBinding.afterBindEventAction(node);
};

Mousetrap.bind('left', function () {

    var a=App.eventBinding.bindEventAction(arguments[0], App.eventBinding.handleCollapsing, App.eventBinding.getParentForEventBinding, App.eventBinding.getParentForEventBinding, App.Constants.KeyPressed.LEFT);
    App.clearAllSelected();
    return a;
});

Mousetrap.bind('right', function () {
    var a=App.eventBinding.bindEventAction(arguments[0], App.eventBinding.getParentForEventBinding, App.eventBinding.handleCollapsing, App.eventBinding.getParentForEventBinding, App.Constants.KeyPressed.RIGHT);
    App.clearAllSelected();
    return a;
});

Mousetrap.bind('space', function () {

    event = arguments[0];
    (event.preventDefault || event.stop || event.stopPropagation || function () {
    }).call(event);

    for (var i = 0; i < App.multiSelectedNodes.length; i++)
        App.toggleCollapsedNode(App.multiSelectedNodes[i].__data__);

    App.multiSelectedNodes = d3.selectAll(".softSelected")[0];

    App.deselectNode();
    var node=App.multiSelectedNodes[App.multiSelectedNodes.length-1];
    d3.select(node).classed("selected", true);

});

Mousetrap.bind('mod+e', function () {
    var rootName = d3.select(".node.level-0")[0][0].__data__.name;
    App.exportParser.export(rootName);
});

Mousetrap.bind('mod+left', debounce(0, true,
    function () {
        var selection = d3.select(".node.selected")[0][0];
        if (selection) {
            var node = selection.__data__;
            App.Node.horizontalReposition(node, App.Constants.KeyPressed.LEFT, App.toggleCollapsedNode);
        }
    }));

Mousetrap.bind('mod+right', debounce(0, true,
    function () {
        var selection = d3.select(".node.selected")[0][0];
        if (selection) {
            var node = selection.__data__;
            App.Node.horizontalReposition(node, App.Constants.KeyPressed.RIGHT, App.toggleCollapsedNode);
        }
    }));

var verticalRepositionAction = function(node, repositionDirection, stack) {
    if (!(node && node.parent))
        return;

    var operationData = repositionDirection == App.Constants.KeyPressed.UP ? "Vertical Reposition Down" : "Vertical Reposition Up";
    var undoData = new App.undoData(node, operationData);
    stack.push([undoData]);

    App.Node.verticalReposition(node, repositionDirection);
};


App.eventBinding.upRepositionAction = function() {
    var selection = App.map.getDataOfNodeWithClassNamesString(".node.selected");
    verticalRepositionAction(selection, App.Constants.KeyPressed.UP, App.undoStack);
};

Mousetrap.bind('mod+up', debounce(0, true, function () {
    App.eventBinding.upRepositionAction();
}));

App.eventBinding.downRepositionAction = function() {
    var selection = App.map.getDataOfNodeWithClassNamesString(".node.selected");
    verticalRepositionAction(selection, App.Constants.KeyPressed.DOWN, App.undoStack);
};

Mousetrap.bind('mod+down', debounce(0, true, function () {
    App.eventBinding.downRepositionAction();
}));

Mousetrap.bind("esc", function goToRootNode() {
    App.select(d3.select('.node.level-0')[0][0]);
    App.getChartInFocus();
});

Mousetrap.bind('?', function showHelp() {
    $('#help-modal').modal('show');
});



var setCmd = function(e){
    App.cmdDown=true;
};

var clearCmd =  function(e){
    App.cmdDown=false;
};

Mousetrap.bind('mod',setCmd,'keydown');
Mousetrap.bind('mod',clearCmd,'keyup');

