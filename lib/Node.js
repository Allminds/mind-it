var mindMapService = App.MindMapService.getInstance();

App.Node = function (name, direction, parent, index ) {
  this.name = name;
  this.left = [];
  this.right = [];
  this.childSubTree = [];
  this.position = direction;
  this.parentId = parent ? parent._id : null;
  this.rootId = parent ? (parent.position == null ? parent._id : parent.rootId) : null;
  this.index = index;
//  this.depth = parent ? (parent.depth + 1) : 0;
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
  return node.parentId == null;// ? true : false;
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
}

App.Node.addToDatabase = function(node) {
  node._id = mindMapService.addNode(node);
  return node;
};

App.Node.addChild = function(parent, child) {
  mindMapService.addChild(parent, child);
};

App.Node.reposition = function(selectedNode, keyPressed) {
  if(App.Node.isRoot(selectedNode))
    return;
  var parent = selectedNode.parent,
    siblings = (App.Node.isRoot(parent) ? parent[selectedNode.position] : parent.childSubTree) || [],
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

  var subTree = {},
  subListName = 'childSubTree';
  if(App.Node.isRoot(parent)) {
    subListName = selectedNode.position;
  }
  subTree[subListName] = siblingIdList;
  mindMapService.updateNode(parent._id, subTree);
};

App.Node.horizontalReposition = function(selectedNode, keyPressed) {
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
            destinationDirection = App.Node.isRoot(newParent) ? parent.position : newParent.position;
            destinationSubTree = App.Node.isRoot(newParent) ? newParent[dir] : newParent.childSubTree;
            destinationIndex = destinationSubTree.indexOf(parent) + 1;
            repositionDoneFlag = true;
        }
    } else {
        if(siblings.length > 1) {
            newParent = siblings[selectedNodeIndex == 0 ? selectedNodeIndex + 1 : selectedNodeIndex - 1];
            destinationSubTree = newParent.childSubTree;
            destinationIndex = destinationSubTree.length;
            repositionDoneFlag = true;
        }
    }

    if(repositionDoneFlag === true) {
        siblings.splice(selectedNodeIndex,1);
        selectedNode.position = destinationDirection;
        destinationSubTree.splice(destinationIndex, 0, selectedNode);
        selectedNode.parentId = newParent._id;
    }
}



App.Node.delete = function (selectedNode) {
  var dir = selectedNode.position,
  parent = selectedNode.parent,
  siblings = (App.Node.isRoot(parent) ? parent[dir] : parent.childSubTree) || [],
  selectedNodeIndex = siblings.indexOf(selectedNode);

  siblings.splice(selectedNodeIndex, 1);

  var siblingIdList = siblings.map(function(child) {
      return child._id;
    }),
    subTree = {},
    subListName = 'childSubTree';
  if(App.Node.isRoot(parent)) {
    subListName = selectedNode.position;
  }
  subTree[subListName] = siblingIdList;
  mindMapService.updateNode(parent._id, subTree);

  return selectedNodeIndex;
};
