App.tracker = {
  added: function (id, fields) {
    var newNode = App.map.getNodeDataWithNodeId(id);
    if (newNode)
      return;
    newNode = fields;
    newNode._id = id;
    var parent = App.map.getNodeDataWithNodeId(newNode.parentId);
    App.map.addNodeToUI(parent, newNode);
    App.nodeSelector.setPrevDepth(newNode.depth);
  },
  changed: function (id, fields) {
    var updatedNode = App.map.getNodeDataWithNodeId(id);
    if (!updatedNode) return;

    if (fields.hasOwnProperty('name')) {
      updatedNode.name = fields.name;
      App.chart.update();
      var selectedNode = App.map.getDataOfNodeWithClassNamesString(".node.selected");
      // redraw gray box
      if (selectedNode && selectedNode._id === id) {
        setTimeout(function () {
          App.selectNode(selectedNode);
        }, 10);
      }
    }
    else if (fields.hasOwnProperty('childSubTree') || fields.hasOwnProperty('left') || fields.hasOwnProperty('right')){
      var parent = App.map.getNodeDataWithNodeId(id),
        key = Object.keys(fields)[0],
        subTree = parent[key],
        childIds = fields[key],
        newSubTree = childIds.map(function(id){
          return subTree.find(function(node){
            return node._id == id;
          });
        });
      parent[key] = newSubTree;
      App.chart.update();
    }
  },
  just_deleted: null,
  removed: function (id) {
    var deletedNode = App.map.getNodeDataWithNodeId(id);
    if (!deletedNode) return;

    var alreadyRemoved = deletedNode.parent_ids.some(function (parent_id) {
      return App.tracker.just_deleted == parent_id;
    });
    if (alreadyRemoved) return;

    var children = deletedNode.parent[deletedNode.position] || deletedNode.parent.children;

    var delNodeIndex = children.indexOf(deletedNode);
    if (delNodeIndex >= 0) {
      children.splice(delNodeIndex, 1);
      App.chart.update();
      App.tracker.just_deleted = id;
    }
  }
};