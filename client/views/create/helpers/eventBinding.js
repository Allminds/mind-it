App.eventBinding = {};
App.nodeToPasteBulleted = [];
App.nodeCutToPaste = null;
App.isIndicatorActive = false;
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

    App.nodeCutToPaste.push(selectedNode);

    var dir = App.Node.getDirection(selectedNode),
        parent = selectedNode.parent,
        siblings = App.Node.getSubTree(parent, dir),
        siblingsIDList = siblings.map(function (_) {
            return _._id;
        }),
        selectedNodeIndex = siblingsIDList.indexOf(selectedNode._id);
    siblingsIDList.splice(selectedNodeIndex, 1);
    siblings.splice(selectedNodeIndex, 1);


    App.Node.updateChildTree(parent, dir, siblingsIDList);
    App.Node.updateParentIdOfNode(selectedNode, "None");


    App.eventBinding.focusAfterDelete(selectedNode, selectedNodeIndex);

};


App.eventBinding.f2Action = function (event) {
    (event.preventDefault || event.stop || event.stopPropagation || function () {
    }).call(event);
    var selectedNode = d3.select(".node.selected")[0][0];
    var node = App.Node.d3NodeToDbNode(selectedNode.__data__);
    if (!selectedNode) return;
    App.showEditor(selectedNode);
    var stackData = new App.stackData(node, 'rename');
    App.RepeatHandler.addToActionStack([stackData]);
};

var deleteNode = function(stack, nodeData, destinationDirection) {
    App.Node.delete(nodeData);
    App.eventBinding.focusAfterDelete(nodeData, nodeData.index);
    var stackData = new App.stackData(nodeData, "add");
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
    App.multiSelectedNodes = [];
};

Mousetrap.bind('mod+z', function () {
    App.RepeatHandler.undo();
});

Mousetrap.bind('command+shift+z', function () {
    App.RepeatHandler.redo();
});

Mousetrap.bind('ctrl+y', function () {
    App.RepeatHandler.redo();
});

Mousetrap.bind('f2', function (event) {
    App.eventBinding.f2Action(event);
});


Mousetrap.bind('mod+x', function () {
    var selectedNodes = App.multiSelectedNodes;
    App.nodeToPasteBulleted = [];
    App.nodeCutToPaste = [];
    var elementToBePushed = selectedNodes.map(function(element) {
        var node = element.__data__;
        var parent = node.parent;
        var direction = App.getDirection(node);
        var indexOfNode = App.Node.getIndexOfNode(node);
        App.nodeToPasteBulleted.push( App.CopyParser.populateBulletedFromObject(node) );
        App.cutNode(node);
        return new App.stackData(node, "addNode", direction, indexOfNode, parent);
    });
    UndoRedo.stack.undo.push(elementToBePushed.reverse());
});

App.eventBinding.copyAction = function() {
    var nodes = App.multiSelectedNodes;
    App.nodeToPasteBulleted = [];
    nodes.forEach(function(element) {
        var node = element.__data__;
        App.nodeToPasteBulleted.push(App.CopyParser.populateBulletedFromObject(node));
    });
};

Mousetrap.bind('mod+c', function () {
    App.eventBinding.copyAction();
});

Mousetrap.bind('mod+v', function () {
    var targetNode = App.map.getDataOfNodeWithClassNamesString(".node.selected");
    var dir = App.calculateDirection(targetNode);
    if (targetNode.isCollapsed)
        App.expandRecursive(targetNode, targetNode._id);

    if (App.nodeCutToPaste) {
        var undoArray = App.nodeCutToPaste.map(function(element) {
            App.Node.reposition(element, targetNode, null, null, dir);
            return new App.stackData(element, "deleteNode");
        });
        UndoRedo.stack.undo.push(undoArray);
        App.nodeCutToPaste = null;
    } else {
        var undoArray = App.nodeToPasteBulleted.map(function(sourceNodeBulleted){
            var headerNode = App.CopyParser.populateObjectFromBulletedList(sourceNodeBulleted, targetNode);
            return new App.stackData(headerNode, "deleteNode");
        });
        UndoRedo.stack.undo.push(undoArray);
    }

});


App.eventBinding.escapeOnNewNode = function (newNode) {
    var parentNode = App.map.getNodeDataWithNodeId(newNode.parentId);
    $(window).unbind().on("keyup", (function (e) {
        var selectedNodeId = d3.select('.selected').node() ? d3.select('.selected').node().__data__._id : null;
        var modalCreatedNodeId = d3.select('._selected').node() ? d3.select('._selected').node().__data__._id : null;
        if ((selectedNodeId === null && modalCreatedNodeId === null )) {
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

        var stackData1 = new App.stackData(App.map.getNodeDataWithNodeId(newNode._id), "deleteNode");

        stackData1.destinationDirection = App.Node.isRoot(stackData1.nodeData.parent) ? stackData1.nodeData.position : App.Node.getDirection(stackData1.nodeData);

        App.RepeatHandler.addToActionStack([stackData1]);

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

App.eventBinding.deleteAction = function () {

    for (var i = 0; i < App.multiSelectedNodes.length; i++) {

        var selectedNode = App.multiSelectedNodes[i].__data__;

        var dir = App.getDirection(selectedNode);
        if (dir === 'root') {
            alert('Can\'t delete root');
            return;
        }
    }

    var areSiblings = App.checkIfSiblings(App.multiSelectedNodes);

    var nodeToBeFocussed = null;
    var removedNodeIndex = null;
    var elementToPush = [];
    var selectedNode=null;
    for (var i = 0; i < App.multiSelectedNodes.length; i++) {
        selectedNode = App.multiSelectedNodes[i].__data__;
        var existingNodesInUI = d3.selectAll(".node")[0];


        if (existingNodesInUI.indexOf(App.multiSelectedNodes[i]) < 0)
            continue;
        removedNodeIndex = App.Node.delete(selectedNode);
        nodeToBeFocussed = selectedNode.parentId;

        var stackData = new App.stackData(selectedNode, "addNode");
        stackData.destinationDirection = dir;
        elementToPush.push(stackData);
    }

    App.RepeatHandler.addToActionStack(elementToPush.reverse());

    if(areSiblings){
        App.eventBinding.focusAfterDelete(selectedNode, removedNodeIndex);
    }
    else if (nodeToBeFocussed) {
        var existingNodesInUI = d3.selectAll(".node")[0];
        nodeToBeFocussed= existingNodesInUI.filter(
            function(_){
                if(_.__data__._id == nodeToBeFocussed)
                    return _;
            }
        );
        App.select(nodeToBeFocussed[0]);
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
    var a = App.eventBinding.bindEventAction(arguments[0], App.eventBinding.performLogicalVerticalMovement, App.eventBinding.performLogicalVerticalMovement, function () {
    }, App.Constants.KeyPressed.UP);
    App.clearAllSelected();
    return a;
});

Mousetrap.bind('down', function () {

    var a = App.eventBinding.bindEventAction(arguments[0], App.eventBinding.performLogicalVerticalMovement, App.eventBinding.performLogicalVerticalMovement, function () {
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

    var a = App.eventBinding.bindEventAction(arguments[0], App.eventBinding.handleCollapsing, App.eventBinding.getParentForEventBinding, App.eventBinding.getParentForEventBinding, App.Constants.KeyPressed.LEFT);
    App.clearAllSelected();
    return a;
});

Mousetrap.bind('right', function () {
    var a = App.eventBinding.bindEventAction(arguments[0], App.eventBinding.getParentForEventBinding, App.eventBinding.handleCollapsing, App.eventBinding.getParentForEventBinding, App.Constants.KeyPressed.RIGHT);
    App.clearAllSelected();
    return a;
});

Mousetrap.bind('space', function () {

    event = arguments[0];
    (event.preventDefault || event.stop || event.stopPropagation || function () {
    }).call(event);

    var multiStackData = [];
    for (var i = 0; i < App.multiSelectedNodes.length; i++) {
        App.toggleCollapsedNode(App.multiSelectedNodes[i].__data__);
        multiStackData.push(new App.stackData(App.multiSelectedNodes[i].__data__,"toggleCollapse"));
    }
    App.multiSelectedNodes = d3.selectAll(".softSelected")[0];

    App.deselectNode();
    var node = App.multiSelectedNodes[App.multiSelectedNodes.length - 1];
    d3.select(node).classed("selected", true);

    App.RepeatHandler.addToActionStack(multiStackData.reverse());

});

Mousetrap.bind('mod+e', function () {
    var rootName = d3.select(".node.level-0")[0][0].__data__.name;
    App.exportParser.export(rootName);
});


App.getInOrderOfAppearance = function(multiSelectedNodes) {
    var firstSelection = multiSelectedNodes[0].__data__;
    var direction = App.getDirection(firstSelection);
    var parent = firstSelection.parent;
    var subTree = App.Node.getSubTree(parent, direction);
    var selectedNodeIds = multiSelectedNodes.map(function(selection) {
        return selection.__data__._id;
    });
    var orderedNodes = subTree.filter(function(selection) {
        return selectedNodeIds.indexOf(selection._id) >= 0;
    });
    return orderedNodes;
};

App.areSiblingsOnSameSide = function(nodes) {
    var expectedParentId = nodes[0].__data__.parent._id;
    var expectedPosition = App.getDirection(nodes[0].__data__);
    return nodes.every(function(node) {
        return node.__data__.parent._id == expectedParentId && App.getDirection(node.__data__) == expectedPosition;
    })
};

var getMultiSelectedNodes = function(inorder) {
    var areSiblings = App.areSiblingsOnSameSide(App.multiSelectedNodes);
    if(!areSiblings) return null;
    return inorder? App.multiSelectedNodes.map(function(_){return _.__data__;}):App.getInOrderOfAppearance(App.multiSelectedNodes);

};


App.eventBinding.horizontalRepositionAction = function(repositionDirection) {
    var nodes = getMultiSelectedNodes(true);
    if(nodes) {
        var indexOfDeletedNode = nodes.findIndex(function (node) {
            return App.Node.isDeleted(node)
        }),
            siblings = App.Node.getSubTree(nodes[0].parent, App.Node.getDirection(nodes[0]));

        if(indexOfDeletedNode != -1) return;

        var undoStackElement = nodes.map(function(node) {
            var operationData = "horizontalReposition";
            var stackData = new App.stackData(node, operationData, null,
                siblings.map(function(_){return _._id}).indexOf(node._id), node.parent);
            stackData.keyPressed = repositionDirection == App.Constants.KeyPressed.RIGHT ? App.Constants.KeyPressed.LEFT : App.Constants.KeyPressed.RIGHT;
            return stackData;
        });
        if(App.Node.horizontalReposition(nodes, repositionDirection, App.toggleCollapsedNode))
        App.RepeatHandler.addToActionStack(undoStackElement);
    }
};

Mousetrap.bind('mod+left', debounce(0, true,
    function () {
        App.eventBinding.horizontalRepositionAction(App.Constants.KeyPressed.LEFT);
    }));

Mousetrap.bind('mod+right', debounce(0, true,
    function () {
        App.eventBinding.horizontalRepositionAction(App.Constants.KeyPressed.RIGHT);
    }));

App.eventBinding.verticalRepositionAction = function(repositionDirection) {
    var nodes = getMultiSelectedNodes();
    if(nodes) {
        var indexOfDeletedNode = nodes.findIndex(function (node) {
            return App.Node.isDeleted(node)
        });
        if(indexOfDeletedNode != -1) return;

        var undoStackElement = nodes.map(function(node) {
            var operationData = "verticalReposition";
            var stackData = new App.stackData(node, operationData);
            stackData.keyPressed = repositionDirection == App.Constants.KeyPressed.UP ? App.Constants.KeyPressed.DOWN : App.Constants.KeyPressed.UP;

            App.Node.verticalReposition(node, repositionDirection);
            return stackData;
        });
        App.RepeatHandler.addToActionStack(undoStackElement.reverse());
    }
};

Mousetrap.bind('mod+up', debounce(0, true, function () {
    App.eventBinding.verticalRepositionAction(App.Constants.KeyPressed.UP);
}));

Mousetrap.bind('mod+down', debounce(0, true, function () {
    App.eventBinding.verticalRepositionAction(App.Constants.KeyPressed.DOWN);
}));

Mousetrap.bind("esc", function goToRootNode() {
    App.select(d3.select('.node.level-0')[0][0]);
    App.getChartInFocus();
});

Mousetrap.bind('?', function showHelp() {
    $('#help-modal').modal('show');
});


var setCmd = function (e) {
    App.cmdDown = true;
};

var clearCmd = function (e) {
    App.cmdDown = false;
};

Mousetrap.bind('mod', setCmd, 'keydown');
Mousetrap.bind('mod', clearCmd, 'keyup');

