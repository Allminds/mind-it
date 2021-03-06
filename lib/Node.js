var mindMapService = App.MindMapService.getInstance();

App.Node = function (name, direction, parent, index) {
    this.name = name;
    this.left = [];
    this.right = [];
    this.childSubTree = [];
    this.position = direction;
    this.parentId = parent ? parent._id : null;
    this.rootId = parent ? (App.Node.isRoot(parent) ? parent._id : parent.rootId) : null;
    this.index = index;
};

App.Node.getSubTree = function (node, direction) {
    var subTree = App.Node.isRoot(node) ? node[direction] : node.isCollapsed ? node._childSubTree : node.childSubTree;

    if (subTree === null || subTree === undefined) {
        subTree = [];
    }

    return subTree;
};

App.Node.updateNode = function (id, $set) {
    return mindMapService.updateNode(id, $set);
};

App.Node.setSubTree = function (parent, newSubTree, direction) {
    App.Node.isRoot(parent) ? parent[direction] = newSubTree : (parent.isCollapsed ? parent._childSubTree = newSubTree : parent[direction] = newSubTree);
};

App.Node.d3NodeToDbNode = function (d3Node) {
    var parent = mindMapService.findNode(d3Node.parentId),
        dbNode = new App.Node(d3Node.name, d3Node.position, parent, 0);

    dbNode.parent = d3Node.parent;
    dbNode._id = d3Node._id;

    if (App.Node.isRoot(d3Node)) {
        dbNode.left = d3Node.left ? d3Node.left.map(function (nodeObject) {
            return nodeObject._id;
        }) : [];
        dbNode.right = d3Node.right ? d3Node.right.map(function (nodeObject) {
            return nodeObject._id;
        }) : [];
    }
    else {
        dbNode.childSubTree = d3Node.childSubTree ? d3Node.childSubTree.map(function (nodeObject) {
            return nodeObject._id;
        }) : [];
    }

    return dbNode;
};

App.Node.getParent = function (parentId) {
    return mindMapService.findNode(parentId);
};

App.Node.isRoot = function (node) {
    return node !== null && node !== undefined ? (node.parentId === null || node.parentId === undefined) &&
    (node.rootId === null || node.rootId === undefined) &&
    node.childSubTree.length === 0 : false;
};

App.Node.getDirection = function (node) {
    if (node === null || node === undefined) {
        return null;
    }

    if (App.Node.isRoot(node)) {
        return App.Constants.Direction.ROOT;
    }

    var parent = node.parent;

    if (App.Node.isRoot(parent)) {
        var leftIdTree = parent.left.map(function (leftChild) {
            return leftChild._id;
        });
        var rightIdTree = parent.right.map(function (rightChild) {
            return rightChild._id;
        });

        return nodeExistsInTree(leftIdTree, node._id) ? App.Constants.Direction.LEFT :
            nodeExistsInTree(rightIdTree, node._id) ? App.Constants.Direction.RIGHT : null;
    }

    return App.Node.getDirection(parent);
};

var nodeExistsInTree = function (tree, nodeId) {
    return tree.indexOf(nodeId) !== -1;
};

App.Node.addToDatabase = function (node) {
    node._id = mindMapService.addNode(node);
    return node;
};

App.Node.addChild = function (parent, child) {
    mindMapService.addChild(parent, child);
};

App.Node.updateParentIdOfNode = function (node, parentId) {
    var updateData = parentId ? parentId : node.parentId,
        id = node._id,
        set = {parentId: updateData};

    mindMapService.updateNode(id, set);
};

App.Node.updateChildTree = function (parent, childTreeName, updatedChildTree) {
    var treeName = App.Node.isRoot(parent) ? childTreeName : "childSubTree",
        set = {};

    if (!updatedChildTree || !treeName) {
        return;
    }

    set[treeName] = updatedChildTree;
    mindMapService.updateNode(parent._id, set);
};

App.Node.verticalReposition = function (selectedNode, keyPressed) {
    if (App.Node.isRoot(selectedNode))
        return;
    var parent = selectedNode.parent,
        dir = App.Node.getDirection(selectedNode),
        siblings = (App.Node.isRoot(parent) ? parent[dir] : parent.childSubTree) || [],
        selectedNodeIndex = siblings.indexOf(selectedNode);
    if (selectedNodeIndex == -1) {
        return;
    }

    var siblingIdList = siblings.map(function (child) {
            return child._id;
        }),
        newIndex = App.calculateNextIndex(selectedNodeIndex, siblingIdList.length, keyPressed);
    if (newIndex >= 0) {
        siblingIdList = App.swapElements(siblingIdList, selectedNodeIndex, newIndex);
    } else {
        siblingIdList = App.circularReposition(siblingIdList, keyPressed);
    }

    App.Node.updateChildTree(parent, dir, siblingIdList);
};

App.Node.horizontalReposition = function (selectedNodes, keyPressed, toggleCallback) {
    if (selectedNodes.filter(App.Node.isRoot).length > 0) {
        return false;
    }

    var newParent = null,
        selectedNodeId = selectedNodes.map(function (node) {
            return node._id;
        }),
        firstChild = selectedNodes[selectedNodes.length - 1],
        dir = App.Node.getDirection(firstChild),
        parent = firstChild.parent,
        siblings = (App.Node.isRoot(parent) ? parent[dir] : parent.childSubTree) || [],
        selectedNodeIndex = siblings.indexOf(firstChild),
        selectedSiblings = siblings.filter(function (node) {
            return selectedNodeId.indexOf(node._id) != -1;
        });

    if (selectedNodes.filter(function (node) {
            return parent._id != node.parent._id
        }).length > 0) {
        return false;
    }

    for (var count = 0; count < selectedNodes.length; count++) {
        var selectedNode = selectedNodes[count],
            destinationSubTree = null,
            repositionDoneFlag = false,
            destinationDirection = App.Node.isRoot(parent) ? (dir == "right" ? "left" : "right") : "childSubTree",
            destinationIndex = -1;

        if (dir != keyPressed) {
            if (App.Node.isRoot(parent)) {
                newParent = newParent || parent;
                destinationSubTree = newParent[destinationDirection];
                destinationIndex = destinationSubTree.length;
                repositionDoneFlag = true;
            } else {
                newParent = newParent || parent.parent;
                if (newParent.isCollapsed) toggleCallback(newParent);
                destinationSubTree = App.Node.isRoot(newParent) ? newParent[dir] : newParent.childSubTree;
                destinationIndex = destinationSubTree.indexOf(parent) + 1;
                repositionDoneFlag = true;
            }
        } else {
            if (siblings.length > 1) {
                if (selectedNodes.length == siblings.length) return false;
                var adder = selectedNodeIndex == 0 ? 1 : -1;
                newParent = newParent || function (selectedNodes, siblings, selectedNodeIndex, adder) {
                        var returnElement = null;
                        var tempSelectedNodeIndex = selectedNodeIndex;
                        var counter = siblings.length;
                        while (!returnElement && counter >= 0) {
                            if (selectedNodes.indexOf(siblings[selectedNodeIndex + adder]) == -1) {
                                return siblings[selectedNodeIndex + adder];
                            }
                            counter--;
                            selectedNodeIndex += adder;
                            if (selectedNodeIndex <= 0) {
                                adder = 1;
                                selectedNodeIndex = tempSelectedNodeIndex;
                            }
                        }

                        return returnElement;
                    }(selectedSiblings, siblings, selectedNodeIndex, adder);

                if (!newParent) return false;

                if (newParent.isCollapsed) toggleCallback(newParent);
                destinationSubTree = newParent.childSubTree;
                destinationIndex = destinationSubTree.length;
                repositionDoneFlag = true;
            }
        }

        if (repositionDoneFlag === true) {
            App.Node.reposition(selectedNode, newParent, destinationSubTree, destinationIndex);

        }
    }

    return true;
};

App.Node.reposition = function (selectedNode, newParent, destSubTree, destIndex, destDir) {
    var dir = destDir ? destDir : App.Node.getDirection(selectedNode),
        parent = selectedNode.parent,
        siblings = App.Node.getSubTree(parent, dir),
        selectedNodeIndex = siblings.indexOf(selectedNode);

    var destinationDirection = null;

    if (parent._id === newParent._id) {
        if (App.Node.isRoot(newParent)) {
            destinationDirection = (dir == "right" ? "left" : "right");
        } else {
            dir = destinationDirection = "childSubTree";

        }
    } else {
        if (!App.Node.isRoot(newParent)) {
            destinationDirection = "childSubTree";
        } else {
            destinationDirection = dir;
        }
    }

    var destinationSubTree = destSubTree ? destSubTree : App.Node.getSubTree(newParent, destinationDirection),
        destinationIndex = destIndex == undefined ? destinationSubTree.length : destIndex;

    var siblingIdList = siblings.map(
        function (child) {
            return child._id;
        });
    if (selectedNodeIndex != -1) {
        siblingIdList.splice(selectedNodeIndex, 1);

    }

    var destinationIdList = destinationSubTree.map(
        function (child) {
            return child._id;
        });
    //check for destinationIndex == -1 TODO
    destinationIdList.splice(destinationIndex, 0, selectedNode._id);

    App.Node.updateParentIdOfNode(selectedNode, newParent._id);
    App.Node.updateChildTree(newParent, destinationDirection, destinationIdList);
    if ((newParent._id == parent._id && destinationDirection != dir) || newParent._id != parent._id)
        App.Node.updateChildTree(parent, dir, siblingIdList);
};

App.Node.delete = function (selectedNode) {
    var direction = App.Node.getDirection(selectedNode),
        parent = selectedNode.parent,
        subNodes = App.Node.getSubTree(parent, direction),
        selectedNodeIndex = subNodes.map(function (child) {
            return child._id;
        }).indexOf(selectedNode._id);

    subNodes.splice(selectedNodeIndex, 1);
    selectedNode.index = selectedNodeIndex;

    var subNodeIds = subNodes.map(function (subNode) {
            return subNode._id;
        }),
        subTree = {},
        subListName = 'childSubTree';

    if (App.Node.isRoot(parent)) {
        subListName = direction;
    }

    subTree[subListName] = subNodeIds;
    mindMapService.updateNode(parent._id, subTree);

    return selectedNodeIndex;
};

App.Node.isDeleted = function (node) {
    if (App.Node.isRoot(node)) {
        return false;
    }

    var parent = node.parent;

    if (App.Node.isRoot(parent)) {
        return App.Node.getIndexOfNode(node) === -1;
    }

    var subNodeIds = parent.childSubTree.map(function (child) {
        return child._id;
    });

    if (subNodeIds.indexOf(node._id) === -1 ? true : false) {
        return true;
    }

    return App.Node.isDeleted(parent);
};

App.Node.hasChildren = function (node) {
    return (node._childSubTree || node.childSubTree || []).length > 0;
};

App.Node.getChildren = function (node) {
    return node._childSubTree || node.childSubTree;
};

App.Node.getIndexOfNode = function (node) {
    var direction = App.Node.getDirection(node),
        parent = node.parent,
        siblings = App.Node.getSubTree(parent, direction) || [];

    return siblings.map(function (sibling) {
        return sibling._id;
    }).indexOf(node._id);
};

App.Node.immediateSubNodes = function (node) {
    if (App.Node.isRoot(node)) {
        return node.right.concat(node.left);
    }

    return App.Node.getSubTree(node);
};

App.Node.isSubNode = function (node) {
    if (App.Node.isRoot(node)) {
        return false;
    }

    var subNodes = App.Node.getSubTree(node) || [];

    return subNodes.length > 0;
};

App.Node.isLeafNode = function (node) {
    if (App.Node.isRoot(node)) {
        return false;
    }

    return !App.Node.isSubNode(node);
};

App.Node.selectedNodes = function () {
    return d3.selectAll(".softSelected")[0];
};