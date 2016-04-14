App.eventBinding = {};
App.nodeToPasteBulleted = [];
App.nodeCutToPaste = null;
App.isIndicatorActive = false;
App.allDescendants = [];
App.indexDescendants = 0;
//userStatusService = App.usersStatusService.getInstance();

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
App.eventBinding.unBindAllEvents = function () {
    Mousetrap.unbind('mod+x');
    Mousetrap.unbind('mod+c');
    Mousetrap.unbind('mod+v');
    Mousetrap.unbind('enter');
    Mousetrap.unbind('tab');
    Mousetrap.unbind('del');
    Mousetrap.unbind('mod+left');
    Mousetrap.unbind('mod+right');
    Mousetrap.unbind('mod+up');
    Mousetrap.unbind('mod+down');
    Mousetrap.unbind('mod+x');
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


    //App.eventBinding.focusAfterDelete(selectedNode, selectedNodeIndex);

};


App.eventBinding.f2Action = function (event) {
    (event.preventDefault || event.stop || event.stopPropagation || function () {
    }).call(event);
    var selectedNode = d3.select(".node.selected")[0][0];
    var node = App.Node.d3NodeToDbNode(selectedNode.__data__);
    if (!selectedNode) return;
    if (App.editable) {
        App.showEditor(selectedNode);
        var stackData = new App.stackData(node, 'rename');
        App.RepeatHandler.addToActionStack([stackData]);
    }
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
    var selectedNodes = [];
    selectedNodes = App.multiSelectedNodes.map(function (elem) {
        return elem.__data__;
    });
    App.multiSelectedNodes = [];
    App.clearAllSelected();
    App.nodeToPasteBulleted = [];
    App.nodeCutToPaste = [];
    for (var i = 0; i < selectedNodes.length; i++) {
        if (App.Node.isRoot(selectedNodes[i])) {
            alert("Selection Contains Root and the root node cannot be cut!");
            return;
        }
    }
    var nodeToBeFocussed = null;
    var removedNodeIndex = null;
    var parentOfSelectedNode = null;
    var nodeToBeFocussedPosition = null;
    var selectedNode = null;
    var selectedNodesArray = [];
    var parent = null;
    var elementToBePushed = selectedNodes.map(function (element) {
        //var node = element.__data__;
        var node = element;
        selectedNodesArray.push(node);
        parent = element.parent;
        var direction = App.getDirection(element);
        var indexOfNode = App.Node.getIndexOfNode(node);
        selectedNode = node;
        parentOfSelectedNode = node.parent;
        nodeToBeFocussed = selectedNode.parentId;
        removedNodeIndex = indexOfNode;
        nodeToBeFocussedPosition = parentOfSelectedNode.position;
        App.nodeToPasteBulleted.push(App.CopyParser.populateBulletedFromObject(node));
        App.cutNode(node);
        // selectedNodes = App.multiSelectedNodes;
        return new App.stackData(node, "addNodeAfterCut", direction, indexOfNode, parent);
    });
    var areSiblings = App.checkIfSiblings(selectedNodes);
    if (areSiblings) {
        var nodeToFocus = null;
        var siblings = (App.Node.isRoot(parent) ? parent[nodeToBeFocussedPosition] : parent.childSubTree) || [];
        if (siblings.length == 0) {
            nodeToFocus = parent;
        } else if (removedNodeIndex <= siblings.length) {
            nodeToFocus = siblings[removedNodeIndex - 1];
        }
        App.selectNode(nodeToFocus);
    } else if (nodeToBeFocussed) {
        var existingNodesInUI = d3.selectAll(".node")[0];
        nodeToBeFocussed = existingNodesInUI.filter(
            function (_) {
                if (_.__data__._id == nodeToBeFocussed)
                    return _;
            }
        );
        App.select(nodeToBeFocussed[0]);
    }

    App.RepeatHandler.addToActionStack(elementToBePushed.reverse());
});

App.eventBinding.copyAction = function () {
    var nodes = App.multiSelectedNodes;
    App.multiSelectedNodes = [];
    App.clearAllSelected();

    App.nodeCutToPaste = [];


    App.nodeToPasteBulleted = [];
    nodes = finalNodes(nodes);

    nodes.forEach(function (element) {
        var node = element.__data__;
        App.nodeToPasteBulleted.push(App.CopyParser.populateBulletedFromObject(node));
    });
};
var finalNodes = function (nodes) {
    var mapNodes = new Map();

    var descendants = [];
    for (var i = 0; i < nodes.length; i++) {
        App.allDescendants = [];
        App.indexDescendants = 0;
        selectAllDescendants(nodes[i].__data__);
        descendants = App.allDescendants;
        for (var j = 0; j < nodes.length; j++) {
            if (descendants.indexOf(nodes[j].__data__) > -1) {
                mapNodes.set(nodes[j], true);
            }
        }
    }
    var nodes1 = [];
    for (var k = 0; k < nodes.length; k++) {
        if (mapNodes.get(nodes[k])) {
        }
        else {
            nodes1.push(nodes[k]);
        }

    }
    return nodes1;
};

Mousetrap.bind('mod+c', function () {
    App.eventBinding.copyAction();
});

var getNextSiblingForShift = function (currentNode, keyPressed) {
    var nextNode = null;
    var siblingsOfParent = currentNode.parent.parent ? App.Node.getSubTree(currentNode.parent.parent, App.getDirection(currentNode)) : null;
    var siblings = currentNode.parent ? App.Node.getSubTree(currentNode.parent, App.getDirection(currentNode)) : null;


    var currentNodeDepth = d3.select(".selected")[0][0].__data__.depth;
    var allVisibleNodes = d3.selectAll(".node")[0];
    var sameLevelNodes = allVisibleNodes.filter(function (_) {
        return (_.__data__.depth == currentNodeDepth && App.getDirection(_.__data__) == App.getDirection(d3.select(".selected")[0][0].__data__));
    });


    sameLevelNodes = sortNodesAccToUi(sameLevelNodes);

    if (sameLevelNodes) {
        var currentIndex = sameLevelNodes.map(function (_) {
            return _.__data__._id
        }).indexOf(currentNode._id);
        if (keyPressed == App.Constants.KeyPressed.UP) {
            nextNode = (sameLevelNodes[currentIndex - 1 < 0 ? null : currentIndex - 1]);
        } else if (keyPressed == App.Constants.KeyPressed.DOWN) {
            nextNode = (sameLevelNodes[currentIndex + 1 == sameLevelNodes.length ? null : currentIndex + 1]);
        }
    }

    //If next node turn out to be null ie we are at the end of samelevelNodes list
    if (!nextNode) {
        return nextNode;

    } else {
        return nextNode.__data__;
    }
};


var sortNodesAccToUi = function (nodes) {
    var temp;
    for (var i = 0; i < nodes.length; i++) {
        for (var j = i; j < nodes.length; j++) {
            if (nodes[i].__data__.x > nodes[j].__data__.x) {
                temp = nodes[i];
                nodes[i] = nodes[j];
                nodes[j] = temp;
            }

        }


    }
    return nodes;
}
Mousetrap.bind('shift+up', function () {


    var node = d3.select('.selected').node();
    var nextNode = getNextSiblingForShift(node.__data__, App.Constants.KeyPressed.UP);

    if (!nextNode) {
        return;
    }

    nextNode = d3.selectAll('.node')[0].find(function (_) {
        return _.__data__._id == nextNode._id;
    });

    if (d3.select(nextNode).attr("class").indexOf("softSelected") >= 0) {
        App.select(node, true);
        App.selectShiftVertical(nextNode);
    } else {
        App.select(nextNode, true);
    }
});

Mousetrap.bind('shift+down', function () {
    var node = d3.select('.selected').node().__data__;
    var nextNode = getNextSiblingForShift(node, App.Constants.KeyPressed.DOWN);
    if (!nextNode) {
        return;
    }
    var node = d3.select('.selected').node();
    nextNode = d3.selectAll('.node')[0].find(function (_) {
        return _.__data__._id == nextNode._id;
    });
    if (d3.select(nextNode).attr("class").indexOf("softSelected") >= 0) {
        App.select(node, true);
        App.selectShiftVertical(nextNode);

    } else {

        App.select(nextNode, true);
    }


});
var selectAllDescendants = function (selectedNode) {

    children = App.Node.isRoot(selectedNode) ? App.Node.getSubTree(selectedNode, "right").concat(App.Node.getSubTree(selectedNode, "left")) : selectedNode.childSubTree;
    if (children) {
        children.forEach(function (child) {
                App.allDescendants[App.indexDescendants++] = child;

                selectAllDescendants(child);


            }
        );
    }

}

Mousetrap.bind('shift+right', function () {
    App.allDescendants = [];

    d3.selectAll(".softSelected").classed("softSelected", false);
    App.multiSelectedNodes = [];

    var selectedNode = d3.select('.selected').node();

    parent = selectedNode.__data__.parentId ? selectedNode.__data__.parent : selectedNode.__data__;
    dir = App.calculateDirection(parent);
    if (dir == "right") {
        selectAllDescendants(selectedNode.__data__);
    } else if (dir == "left") {
        selectAllDescendants(parent);
    } else {
        App.allDescendants[App.indexDescendants++] = parent;
        selectAllDescendants(parent);
    }

    var currentNodeDepth = d3.select(".selected")[0][0].__data__.depth;
    var allVisibleNodes = d3.selectAll(".node")[0];

    allVisibleNodes.forEach(function (node) {
        App.allDescendants.forEach(function (node1) {
            if (node1._id == node.__data__._id) {
                App.selectShiftHorizontal(node);
            }
            if (parent._id == node.__data__._id) {
                parent = node;
            }
        });

        if (selectedNode.__data__._id == node.__data__._id) {
            App.selectShiftHorizontal(selectedNode);
        }
    });

    if (dir == "left") {
        d3.select(parent).classed("softSelected", true);
        App.deselectNode();
        d3.select(parent).classed("selected", true);
        if (App.multiSelectedNodes.indexOf(parent) < 0)
            App.multiSelectedNodes.push(parent);
    }

});


Mousetrap.bind('shift+left', function () {
    App.allDescendants = [];

    d3.selectAll(".softSelected").classed("softSelected", false);
    App.multiSelectedNodes = [];

    var selectedNode = d3.select('.selected').node();

    //var dbNode = App.Node.d3NodeToDbNode(selectedNode),
    parent = selectedNode.__data__.parentId ? selectedNode.__data__.parent : selectedNode.__data__;
    dir = App.calculateDirection(parent);

    if (dir == "left") {
        selectAllDescendants(selectedNode.__data__);
    } else if (dir == "right") {
        selectAllDescendants(parent);
    } else {
        App.allDescendants[App.indexDescendants++] = parent;
        selectAllDescendants(parent);
    }

    var currentNodeDepth = d3.select(".selected")[0][0].__data__.depth;
    var allVisibleNodes = d3.selectAll(".node")[0];

    allVisibleNodes.forEach(function (node) {
        App.allDescendants.forEach(function (node1) {
            if (node1._id == node.__data__._id) {
                App.selectShiftHorizontal(node);
            }
            if (parent._id == node.__data__._id) {
                parent = node;
            }
        });
        if (selectedNode.__data__._id == node.__data__._id) {
            App.selectShiftHorizontal(selectedNode);
        }
    });

    if (dir == "right") {
        d3.select(parent).classed("softSelected", true);
        App.deselectNode();
        d3.select(parent).classed("selected", true);
        if (App.multiSelectedNodes.indexOf(parent) < 0)
            App.multiSelectedNodes.push(parent);
    }
});


Mousetrap.bind('mod+v', function () {
    var targetNode = App.map.getDataOfNodeWithClassNamesString(".node.selected");
    var dir = App.calculateDirection(targetNode);
    if (targetNode.isCollapsed)
        App.expandRecursive(targetNode, targetNode._id);

    if (App.nodeCutToPaste != null && App.nodeCutToPaste.length) {
        var undoArray = App.nodeCutToPaste.map(function (element) {
            App.Node.reposition(element, targetNode, null, null, dir);
            var stackData = new App.stackData(element, "cutNode");
            stackData.oldParentId = element.parentId;
            return stackData;

        });
        App.RepeatHandler.addToActionStack(undoArray);
        App.nodeCutToPaste = [];
    } else {
        var undoArray = App.nodeToPasteBulleted.map(function (sourceNodeBulleted) {
            var headerNode = App.CopyParser.populateObjectFromBulletedList(sourceNodeBulleted, targetNode),
                index = App.Node.getSubTree(App.map.getNodeDataWithNodeId(headerNode.parentId),
                    App.getDirection(headerNode)).length;


            var stackData = new App.stackData(headerNode, "deleteNode", App.getDirection(headerNode), index);
            stackData.oldParentId = headerNode.parentId;
            return stackData;
        });
        App.RepeatHandler.addToActionStack(undoArray.reverse());
    }

});


App.eventBinding.escapeOnNewNode = function (newNode) {
    var parentNode = App.map.getNodeDataWithNodeId(newNode.parentId);
    $(window).unbind().on("keyup", (function (e) {
        var selectedNodeId = d3.select('.selected').node() ? d3.select('.selected').node().__data__._id : null;
        var modalCreatedNodeId = d3.select('._selected').node() ? d3.select('._selected').node().__data__._id : null;
        if ((selectedNodeId === null && modalCreatedNodeId === null)) {
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
    var selectedNode = null;
    for (var i = 0; i < App.multiSelectedNodes.length; i++) {
        selectedNode = App.multiSelectedNodes[i].__data__;
        var existingNodesInUI = d3.selectAll(".node")[0];
        if (existingNodesInUI.indexOf(App.multiSelectedNodes[i]) < 0)
            continue;
        var directionForUndo = App.getDirection(selectedNode);
        removedNodeIndex = App.Node.delete(selectedNode);
        nodeToBeFocussed = selectedNode.parentId;

        var stackData = new App.stackData(selectedNode, "addNode");
        stackData.destinationDirection = directionForUndo;
        stackData.destinationIndex = removedNodeIndex;

        elementToPush.push(stackData);
    }

    App.RepeatHandler.addToActionStack(elementToPush.reverse());

    if (areSiblings) {
        App.eventBinding.focusAfterDelete(selectedNode, removedNodeIndex);
    } else if (nodeToBeFocussed) {
        var existingNodesInUI = d3.selectAll(".node")[0];
        nodeToBeFocussed = existingNodesInUI.filter(
            function (_) {
                if (_.__data__._id == nodeToBeFocussed)
                    return _;
            }
        );
        App.select(nodeToBeFocussed[0]);
    }

};

Mousetrap.bind('del', function () {
    App.eventBinding.deleteAction();

    App.getChartInFocus();

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
        case ('root'):
            root(data, keyPressed);
            break;
        case ('left'):
            left(data, keyPressed);
            break;
        case ('right'):
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
    //	Meteor.call("updateUserStatus",Meteor.user().services.google.email,d3.select(".node.level-0")[0][0].__data__._id,d3.select('.selected').node().__data__._id);

    // console.log("moving to -->up",d3.select('.selected').node().__data__);

    return a;
});

Mousetrap.bind('down', function () {

    var a = App.eventBinding.bindEventAction(arguments[0], App.eventBinding.performLogicalVerticalMovement, App.eventBinding.performLogicalVerticalMovement, function () {
    }, App.Constants.KeyPressed.DOWN);
    App.clearAllSelected();
    // console.log("moving to -->down",d3.select('.selected').node().__data__);
    //	Meteor.call("updateUserStatus",Meteor.user().services.google.email,d3.select(".node.level-0")[0][0].__data__._id,d3.select('.selected').node().__data__._id);

    return a;
});

App.eventBinding.handleCollapsing = function (data) {
    var node;
    if (data.hasOwnProperty('isCollapsed') && data.isCollapsed) {
        App.expand(data, data._id);
    } else {
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
    // console.log("moving to -->left",d3.select('.selected').node().__data__);
    //userStatusService.updateUserNode(Meteor.user().services.google.email,d3.select(".node.level-0")[0][0].__data__._id,d3.select('.selected').node().__data__._id);s
//Meteor.users.update({"services.google.email":Meteor.user().services.google.email},{$set :  {mindmap:{id: d3.select(".node.level-0")[0][0].__data__._id,node :d3.select('.selected').node().__data__._id}}});
    //	Meteor.call("updateUserStatus",Meteor.user().services.google.email,d3.select(".node.level-0")[0][0].__data__._id,d3.select('.selected').node().__data__._id);

    return a;
});

Mousetrap.bind('right', function () {
    var a = App.eventBinding.bindEventAction(arguments[0], App.eventBinding.getParentForEventBinding, App.eventBinding.handleCollapsing, App.eventBinding.getParentForEventBinding, App.Constants.KeyPressed.RIGHT);
    App.clearAllSelected();
    // console.log("moving to -->right",d3.select('.selected').node().__data__);

    //		Meteor.call("updateUserStatus",Meteor.user().services.google.email,d3.select(".node.level-0")[0][0].__data__._id,d3.select('.selected').node().__data__._id);

    return a;
});

Mousetrap.bind('space', function () {

    event = arguments[0];
    (event.preventDefault || event.stop || event.stopPropagation || function () {
    }).call(event);

    var multiStackData = [];
    for (var i = 0; i < App.multiSelectedNodes.length; i++) {
        App.toggleCollapsedNode(App.multiSelectedNodes[i].__data__);
        multiStackData.push(new App.stackData(App.multiSelectedNodes[i].__data__, "toggleCollapse"));
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


App.getInOrderOfAppearance = function (multiSelectedNodes) {
    var firstSelection = multiSelectedNodes[0].__data__;
    var direction = App.getDirection(firstSelection);
    var parent = firstSelection.parent;
    var subTree = App.Node.getSubTree(parent, direction);
    var selectedNodeIds = multiSelectedNodes.map(function (selection) {
        return selection.__data__._id;
    });
    var orderedNodes = subTree.filter(function (selection) {
        return selectedNodeIds.indexOf(selection._id) >= 0;
    });
    return orderedNodes;
};

App.areSiblingsOnSameSide = function (nodes) {
    var expectedParentId = nodes[0].__data__.parent._id;
    var expectedPosition = App.getDirection(nodes[0].__data__);
    return nodes.every(function (node) {
        return node.__data__.parent._id == expectedParentId && App.getDirection(node.__data__) == expectedPosition;
    })
};

var getMultiSelectedNodes = function (inorder) {
    var areSiblings = App.areSiblingsOnSameSide(App.multiSelectedNodes);
    if (!areSiblings) return null;
    return inorder ? App.multiSelectedNodes.map(function (_) {
        return _.__data__;
    }) : App.getInOrderOfAppearance(App.multiSelectedNodes);

};


App.eventBinding.horizontalRepositionAction = function (repositionDirection) {
    var nodes = getMultiSelectedNodes(true);
    if (nodes) {
        var indexOfDeletedNode = nodes.findIndex(function (node) {
                return App.Node.isDeleted(node)
            }),
            siblings = App.Node.getSubTree(nodes[0].parent, App.Node.getDirection(nodes[0]));

        if (indexOfDeletedNode != -1) return;

        var undoStackElement = nodes.map(function (node) {
            var operationData = "horizontalReposition";
            var stackData = new App.stackData(node, operationData, null,
                siblings.map(function (_) {
                    return _._id
                }).indexOf(node._id), node.parent);
            stackData.keyPressed = repositionDirection == App.Constants.KeyPressed.RIGHT ? App.Constants.KeyPressed.LEFT : App.Constants.KeyPressed.RIGHT;
            return stackData;
        });

        var oldParents = nodes.map(function (_) {
            return _.parent;
        });

        nodes.forEach(function (node) {
            if (App.Node.isRoot(node.parent)) {
                if (repositionDirection == "right")
                    node.position = "right";
                else {
                    if (repositionDirection == "left")
                        node.position = "left";
                }
            }
        });
        if (App.Node.horizontalReposition(nodes, repositionDirection, App.toggleCollapsedNode)) {
            var newParents = nodes.map(function (_) {
                return _.parent;
            });
            var flag = true;
            for (var i = 0; i < oldParents.length; i++) {
                if (oldParents[i] == newParents[i] && !App.Node.isRoot(oldParents[i])) {
                    flag = false;
                    break;
                }
            }
            if (flag)
                App.RepeatHandler.addToActionStack(undoStackElement);
        }
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

App.eventBinding.verticalRepositionAction = function (repositionDirection) {
    var nodes = getMultiSelectedNodes();
    if (nodes) {
        if (repositionDirection == App.Constants.KeyPressed.DOWN)
            nodes = nodes.reverse();
        var indexOfDeletedNode = nodes.findIndex(function (node) {
            return App.Node.isDeleted(node)
        });
        if (indexOfDeletedNode != -1) return;

        var undoStackElement = nodes.map(function (node) {
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

Mousetrap.bind('mod+shift+p', function () {
    event = arguments[0];
    event.preventDefault();
    App.presentation.preparePresentationUI();

});
Mousetrap.bind("pageup", function () {
    e = arguments[0];
    e.preventDefault();
    App.presentation.moveCursorToPreviousNode();
});

Mousetrap.bind('pagedown', function () {
    e = arguments[0];
    e.preventDefault();
    App.presentation.moveCursorToNextNode();
});

