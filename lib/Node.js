var mindMapService = App.MindMapService.getInstance();

App.Node = function (name, direction, parent, index ) {
  this.name = name;
  this.left = [];
  this.right = [];
  this.childSubTree = [];
  this.position = direction;
  this.parentId = parent ? parent._id : null;
  this.rootId = parent ? (App.Node.isRoot(parent) ? parent._id : parent.rootId) : null;
  this.index = index;
//  this.depth = parent ? (parent.depth + 1) : 0;
};
App.Node.getSubTree = function(parent, direction) {
  return App.Node.isRoot(parent) ? parent[direction] : (parent.isCollapsed ? parent._childSubTree : parent.childSubTree);
};

App.Node.setSubTree = function(parent, newSubTree, direction) {
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

App.Node.isRoot = function(node) {
//  return node ? node.parentId == null : false;// ? true : false;
    return node ? (node.parentId == null && node.rootId == null && (node.childSubTree == null || node.childSubTree.length == 0)) : false
};


App.Node.getDirection = function(node) {
  if (App.Node.isRoot(node)) {
    return 'root';
  }
  if (App.Node.isRoot(node.parent)) {
    var parent = node.parent;
    var leftIdTree = parent.left.map(function(child) {
                       return child._id;
                     });
    var rightIdTree = parent.right.map(function(child) {
                       return child._id;
                     });
    
    return leftIdTree.indexOf(node._id) == -1 ? (rightIdTree.indexOf(node._id) == -1 ? null : "right") : "left";
  }
  else {
    return App.getDirection(node.parent);
  }
};

App.Node.addToDatabase = function(node) {
  node._id = mindMapService.addNode(node);
  return node;
};

App.Node.addChild = function(parent, child) {
  mindMapService.addChild(parent, child);
};

App.Node.updateParentIdOfNode = function(node, parentId){
  var updateData = parentId ? parentId : node.parentId,
      id = node._id,
      set = { parentId : updateData};
  mindMapService.updateNode(id, set); 
};

App.Node.updateChildTree = function(parent, childTreeName, updatedChildTree) {
  var treeName = App.Node.isRoot(parent) ? childTreeName : "childSubTree",
      set = {};
  if(!updatedChildTree || !treeName) return;
  set[treeName] = updatedChildTree;
  mindMapService.updateNode(parent._id, set);
};

App.Node.verticalReposition = function(selectedNode, keyPressed) {
  if(App.Node.isRoot(selectedNode))
    return;
  var parent = selectedNode.parent,
      dir = App.Node.getDirection(selectedNode),
      siblings = (App.Node.isRoot(parent) ? parent[dir] : parent.childSubTree) || [],
    selectedNodeIndex = siblings.indexOf(selectedNode);
  if(selectedNodeIndex == -1) {
    return;
  }

  var siblingIdList = siblings.map(function(child) {
    return child._id;
  }),
  newIndex = App.calculateNextIndex(selectedNodeIndex, siblingIdList.length, keyPressed);
  if(newIndex >= 0) {
    siblingIdList = App.swapElements(siblingIdList, selectedNodeIndex, newIndex);
  } else {
    siblingIdList = App.circularReposition(siblingIdList, keyPressed);
  }

  App.Node.updateChildTree(parent, dir, siblingIdList);
};

App.Node.horizontalReposition = function(selectedNode, keyPressed, toggleCallback, destinationIndex) {
  
  if(App.Node.isRoot(selectedNode))
        return false;

  var dir = App.Node.getDirection(selectedNode),
      parent = selectedNode.parent,
      siblings = (App.Node.isRoot(parent) ? parent[dir] : parent.childSubTree) || [],
      selectedNodeIndex = siblings.indexOf(selectedNode),
      destinationSubTree = null,
      repositionDoneFlag = false,
      destinationDirection = App.Node.isRoot(parent) ? (dir == "right" ? "left" : "right") : "childSubTree",
      newParent = null,
      destinationIndex = -1;


    if(dir != keyPressed) {
        if(App.Node.isRoot(parent)) {
            newParent = parent;
            destinationSubTree = newParent[destinationDirection];
            destinationIndex = destinationSubTree.length;
            repositionDoneFlag = true;
        } else {
            newParent = parent.parent;
            if(newParent.isCollapsed) toggleCallback(newParent);
            destinationDirection = App.Node.isRoot(newParent) ? App.Node.getDirection(parent) : App.Node.getDirection(newParent);
            destinationSubTree = App.Node.isRoot(newParent) ? newParent[dir] : newParent.childSubTree;
            destinationIndex = destinationSubTree.indexOf(parent) + 1;
            repositionDoneFlag = true;
        }
    } else {
        if(siblings.length > 1) {
            newParent = siblings[selectedNodeIndex == 0 ? selectedNodeIndex + 1 : selectedNodeIndex - 1];
            if(newParent.isCollapsed) toggleCallback(newParent);
            destinationSubTree = newParent.childSubTree;
            destinationIndex = destinationSubTree.length;
            repositionDoneFlag = true;
        }
    }

  if(repositionDoneFlag === true) {
    App.Node.reposition(selectedNode, newParent, destinationSubTree, destinationIndex);
  }
};

App.Node.reposition = function(selectedNode, newParent, destSubTree, destIndex, destDir) {
    var dir = destDir ? destDir : App.Node.getDirection(selectedNode),
        parent = selectedNode.parent,
        siblings = App.Node.getSubTree(parent, dir),
        selectedNodeIndex = siblings.indexOf(selectedNode);

        var destinationDirection = null;

        if(parent._id === newParent._id) {
            if(App.Node.isRoot(newParent)) {
                destinationDirection = (dir == "right" ? "left" : "right");
            } else {
                dir = destinationDirection = "childSubTree";

            }
        } else {
            if(!App.Node.isRoot(newParent)) {
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
    if((newParent._id == parent._id && destinationDirection  != dir) || newParent._id != parent._id)
        App.Node.updateChildTree(parent, dir, siblingIdList);
}



App.Node.delete = function (selectedNode) {
  var dir = App.Node.getDirection(selectedNode),
  parent = selectedNode.parent,
  siblings = (App.Node.isRoot(parent) ? parent[dir] : parent.childSubTree) || [],
      selectedNodeIndex = siblings.map(function(child){
                            return child._id;
                          }).indexOf(selectedNode._id);

  siblings.splice(selectedNodeIndex, 1);
    selectedNode.index = selectedNodeIndex;
  var siblingIdList = siblings.map(function(child) {
      return child._id;
    }),
    subTree = {},
    subListName = 'childSubTree';
  if(App.Node.isRoot(parent)) {
    subListName = dir;
  }
  subTree[subListName] = siblingIdList;
  mindMapService.updateNode(parent._id, subTree);

  return selectedNodeIndex;
};


App.Node.isDeleted = function(node) {

    if (App.Node.isRoot(node)) {
        return false;
    }

    if(App.Node.isRoot(node.parent)) {
        var parent = node.parent;
        var leftIdTree = parent.left.map(function(child) {
            return child._id;
        });
        var rightIdTree = parent.right.map(function(child) {
            return child._id;
        });

        return leftIdTree.indexOf(node._id) == -1 ? (rightIdTree.indexOf(node._id) == -1 ? true : false) : false;
    }
    else
    {
        var parent = node.parent;
        var childSubTree = parent.childSubTree.map(function(child) {
            return child._id;
        });

        if(childSubTree.indexOf(node._id) == -1 ? true : false)
        {
            return true;
        }
        else
        {
            return App.Node.isDeleted(parent);
        }
    }
};

App.Node.hasChildren = function(node){
    return (node._childSubTree || node.childSubTree || []).length > 0;
};

App.Node.getChildren = function(node) {
  return node._childSubTree || node.childSubTree;
};

App.Node.getIndexOfNode = function(selectedNode) {
    var dir = App.Node.getDirection(selectedNode),
        parent = selectedNode.parent,
        siblings = (App.Node.isRoot(parent) ? parent[dir] : parent.childSubTree) || [],
        selectedNodeIndex = siblings.map(function(child){
            return child._id;
        }).indexOf(selectedNode._id);
    return selectedNodeIndex;

};