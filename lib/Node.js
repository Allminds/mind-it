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
  this.depth = parent ? (parent.depth + 1) : 0;
};

App.Node.d3NodeToDbNode = function (d3Node) {
  var parent = mindMapService.findNode(d3Node.parentId);
    dbNode = new App.Node(d3Node.name, d3Node.position, parent, 0);

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
  return node.position ? false : true;
};
//
//App.Node.prototype.populateFromD3Data = function(data) {
//  this._id = data._id;
//  this.name = data.name;
//  this.leftSubTree = data.leftSubTree;
//  this.rightSubTree = data.rightSubTree;
//  this.position = data.position;
//  this.parentId = data.parentId;
//  this.rootId = data.rootId;
//};
//
App.Node.addToDatabase = function(node) {
  node._id = mindMapService.addNode(node);
  return node;
};
//
App.Node.addChild = function(parent, child) {
  mindMapService.addChild(parent, child);
};

App.Node.reposition = function(selectedNode, keyPressed) {
  var parent = selectedNode.parent,
    siblings = (App.Node.isRoot(parent) ? parent[selectedNode.position] : parent.childSubTree) || [],
    selectedNodeIndex = siblings.indexOf(selectedNode);
  if(selectedNodeIndex == -1) {
    return;
  }

  var newIndex = (selectedNodeIndex - 1) < 0 ? siblings.length - 1 :  (selectedNodeIndex - 1) % siblings.length,
    siblingIdList = siblings.map(function(child) {
      return child._id;
    });

  App.swapElements(siblingIdList, selectedNodeIndex, newIndex);
  var subTree = {};
  var subListName = 'childSubTree';
  if(App.Node.isRoot(parent)) {
    subListName = selectedNode.position;
  }
  subTree[subListName] = siblingIdList;
  mindMapService.updateNode(parent._id, subTree);
};