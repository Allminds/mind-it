App.map = {};
App.map.selectedNodeData = function () {
  var selectedNode = d3.select(".node.selected")[0][0];
  return selectedNode ? selectedNode.__data__ : null;
};
App.map.addNodeToUI = function (parent, newNode) {
  var children = parent[newNode.position] || parent.children || parent._children;
  if (!children) {
    children = parent.children = [];
  }
  if (newNode.previous) {
    var previousNode = children.find(function (x) {
        return x._id == newNode.previous
      }),
      previousNodeIndex = children.indexOf(previousNode) + 1;
    children.splice(previousNodeIndex, 0, newNode);
  } else if (newNode.next) {
    children.splice(0, 0, newNode);
  } else
    children.push(newNode);
  App.chart.update();
};

App.map.addNewNode = function (parent, newNodeName, dir, previousSibling) {

  if (!previousSibling) {
    var children = parent.position ? parent.children : parent[dir];

    previousSibling = children && children.length > 0
      ? children[children.length - 1]
      : {_id: null, next: null};
  }
  var newNode = {
    name: newNodeName, position: dir,
    parent_ids: [].concat(parent.parent_ids || []).concat([parent._id]),
    previous: previousSibling._id, next: previousSibling.next
  };
  newNode._id = mindMapService.addNode(newNode);

  if (previousSibling._id) {
    mindMapService.updateNode(previousSibling._id, {next: newNode._id});
    mindMapService.updateNode(newNode.next, {previous: newNode._id});
  }

  // let the subscribers to update their mind map :)

  return newNode;
};

App.map.makeEditable = function (nodeId) {
  var node = d3.selectAll('#mindmap svg .node').filter(function (d) {
    return d._id == nodeId
  })[0][0];
  if (node)
    App.showEditor(node);
};

App.map.findOne = function (node, fun) {

  if (fun(node)) return node;
  var children = (node.children || node._children || []),
    res = children.reduce(function (result, child) {
      return result || App.map.findOne(child, fun);
    }, null);
  return res;
};
App.map.getNodeData = function (nodeId) {
  var rootNode = d3.selectAll('#mindmap svg .node.level-0')[0][0];
  var rootNodeData = rootNode ? rootNode.__data__ : null;
  if (rootNodeData) {
    return App.map.findOne(rootNodeData, function (x) {
      return x._id == nodeId
    });
  }
};

clone = function (node) {
  var clonedNode = {name: node.name, position: node.position};
  clonedNode.children = (node.children || node._children || []).App.map(function (currentElem) {
    return clone(currentElem);
  });
  if (node.depth == 0) {
    clonedNode.left = clonedNode.children.filter(function (x) {
      return x.position == 'left'
    });
    clonedNode.right = clonedNode.children.filter(function (x) {
      return x.position == 'right'
    });
  }
  return clonedNode;
};

function cloneObject(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
}

App.map.storeSourceNode = function (sourceNode) {
  App.map.sourceNode = cloneObject(sourceNode);
};

App.map.getSourceNode = function () {
  return d3.select(".selected")[0][0].__data__;
};
