App.MindMapService = (function () {
  var instance;

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

  var init = function () {
      return {
        createRootNode : function (name, position, parent_id) {
          mindid = Mindmaps.insert({
            name: name,
            children: [],
            position: null,
            parent_id: parent_id
          });
          return mindid;
        },
        findTree : function (id) {
          return Mindmaps.find({$or: [{_id: id}, {parent_ids: id}]}).fetch();
        },
        buildTree : function (id, data) {
          return buildTree(id, 1, data);
        },
        addNode : function (node) {
          return Mindmaps.insert(node);
        },
        updateNode : function (id, $set) {
          var key = {_id: id};
          Mindmaps.update(key, {$set: $set});
        },
        addChild : function (current_node, dir) {
          var temp_node = {name: "d", children: [], direction: dir};
          Mindmaps.update({_id: current_node._id}, {$push: {children: temp_node}});
        },
        deleteNode : function (id) {
          var nodeToBeDeleted = Mindmaps.findOne(id);
          if (nodeToBeDeleted.previous) {
            this.updateNode(nodeToBeDeleted.previous, {next: nodeToBeDeleted.next});
          }
          if (nodeToBeDeleted.next) {
            this.updateNode(nodeToBeDeleted.next, {previous: nodeToBeDeleted.previous});
          }
          Mindmaps.remove({$or: [{_id: id}, {parent_ids: id}]});
        }
      }
  };

  var createInstance = function () {
    var object = new init();
    return object;
  };

  return {
    getInstance : function () {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();