App.map = {};

App.map.getDataOfNodeWithClassNamesString = function (classNames) {
  var node = d3.select(classNames)[0][0];
  return node ? node.__data__ : null;
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

App.map.getNodeDataWithNodeId = function (nodeId) {
  var rootNodeData = App.map.getDataOfNodeWithClassNamesString('#mindmap svg .node.level-0');
  if (rootNodeData) {
    var nodeData = App.map.findOne(rootNodeData, function (x) {
      return x._id == nodeId
    });
    return nodeData;
  }
  return null;
};

App.map.storeSourceNode = function (sourceNode) {
  App.map.sourceNode = App.cloneObject(sourceNode);
};
