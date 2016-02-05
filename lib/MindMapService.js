App.MindMapService = (function () {
  var instance;
  var isDownTimeActivated = false;

  var buildTree = function (node_id, depth, data) {
    var root = null;
    data.forEach(function(node) {
      App.nodeStore[node._id] = node;
      if (!App.Node.isRoot(node)) {
        node.childSubTree = node.childSubTree.map(function (id) {
          return data.find(function(d) {
            return d._id == id;
          });
        });
      }
      else {
        node.left = node.left.map(function (id) {
          return data.find(function (d) {
            return d._id == id;
          });
        });
        node.right = node.right.map(function (id) {
          return data.find(function (d) {
            return d._id == id;
          });
        });
        root = node;
      }
    });
    return root;
  };

  var init = function () {
      return {
        createRootNode : function (name,user) {
          var root = new App.Node(name, null);
          root.owner = user;
          var mindid = this.addNode(root);
          return mindid;
        },
        findTree : function (id) {
          return Mindmaps.find({$or: [{_id: id}, {rootId: id}]}).fetch();
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
        addChild : function (parent, childNode) {
          var subTree = {};
          var subListName = 'childSubTree';
          if(App.Node.isRoot(parent)) {
            subListName = childNode.position;
          }
          subTree[subListName] = ((!childNode.index || childNode.index == 0) ?
          childNode._id : {$each : [childNode._id], $position : childNode.index});
          Mindmaps.update({_id: parent._id}, {$push: subTree});
        },
        deleteNode : function (id) {
          var nodeToBeDeleted = Mindmaps.findOne(id);
          Mindmaps.remove({$or: [{_id: id}, {parentId: id}]});
        },
        findNode : function (id) {
          var result = Mindmaps.find({_id: id}).fetch();
          return result.length > 0 ? result[0] : null;
        },
        isDownTime : function(){
          return isDownTimeActivated;
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