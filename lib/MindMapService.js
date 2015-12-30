/* global Mindmaps */
/* global Session */
/* global SessionCounter */
/* global MindMapService */

MindMapService = function () {
};

MindMapService.prototype.createRootNode = function (name, position, parent_id) {
  mindid = Mindmaps.insert({
    name: name,
    children: [],
    position: null,
    parent_id: parent_id
  });
  return mindid;
};
var buildTree = function (node_id, depth, data) {
  var node = data.find(function (d) {
    return d._id == node_id
  });
  if (!node) return;
  var children = data.filter(function (d) {
      return d.parent_ids &&
        d.parent_ids.find(function (parent_id) {
          return node_id == parent_id;
        })
        && d.parent_ids.length == depth
    }) || [];
  var buildList = function (acc, curEle, curIndex, children) {
      var ele = children.find(function (x) {
        return (curIndex == 0 || acc.length == 0 || acc[acc.length - 1].next == null) ? x.previous == null
          : acc[acc.length - 1].next == x._id;
      });
      if (ele)
        acc.push(ele);
      return acc;
    },
    buildChildrenTree = function (acc, d) {
      var childNode = buildTree(d._id, depth + 1, data);
      if (childNode) {
        acc.push(childNode);
      }
      return acc;
    };
  if (node.position) {
    node.children = children.reduce(buildList, []).reduce(buildChildrenTree, []);
  } else {
    if (!node.position) {
      node.left = children.filter(function (x) {
          return x.position == 'left'
        }).reduce(buildList, []).reduce(buildChildrenTree, []) || [];
      node.right = children.filter(function (x) {
          return x.position == 'right'
        }).reduce(buildList, []).reduce(buildChildrenTree, []) || [];
      node.children = (node.left).concat((node.right));
    }
  }
  return node;
};

MindMapService.prototype.findTree = function (id) {
  return Mindmaps.find({$or: [{_id: id}, {parent_ids: id}]}).fetch();
};
MindMapService.prototype.buildTree = function (id, data) {
  return buildTree(id, 1, data);
};
MindMapService.prototype.addNode = function (node) {
  return Mindmaps.insert(node);
};

MindMapService.prototype.updateNode = function (id, $set) {
  var key = {_id: id};
  Mindmaps.update(key, {$set: $set});
};

MindMapService.prototype.addChild = function (current_node, dir) {
  var temp_node = {name: "d", children: [], direction: dir};
  Mindmaps.update({_id: current_node._id}, {$push: {children: temp_node}});
};

MindMapService.prototype.deleteNode = function (id) {
  var nodeToBeDeleted = Mindmaps.findOne(id);
  if (nodeToBeDeleted.previous) {
    this.updateNode(nodeToBeDeleted.previous, {next: nodeToBeDeleted.next});
  }
  if (nodeToBeDeleted.next) {
    this.updateNode(nodeToBeDeleted.next, {previous: nodeToBeDeleted.previous});
  }
  Mindmaps.remove({$or: [{_id: id}, {parent_ids: id}]});
};