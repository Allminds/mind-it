App.tracker = {
  added: function (id, fields) {
    var newNode = App.map.getNodeData(id);
    if (newNode)
      return;
    newNode = fields;
    newNode._id = id;
    var parent = App.map.getNodeData(newNode.parent_ids[newNode.parent_ids.length - 1]);
    App.map.addNodeToUI(parent, newNode);
    App.nodeSelector.setPrevDepth(newNode.parent_ids.length);
  },
  changed: function (id, fields) {
    var updatedNode = App.map.getNodeData(id);
    if (!updatedNode) return;

    updatedNode.previous = fields.hasOwnProperty('previous') ? fields.previous : updatedNode.previous;
    updatedNode.next = fields.hasOwnProperty('next') ? fields.next : updatedNode.next;

    if (fields.hasOwnProperty('name')) {
      updatedNode.name = fields.name;
      App.chart.update();
      var selectedNode = App.map.selectedNodeData();
      // redraw gray box
      if (selectedNode && selectedNode._id === id) {
        setTimeout(function () {
          App.selectNode(selectedNode);
        }, 10);
      }
    }
  },
  just_deleted: null,
  removed: function (id) {
    var deletedNode = App.map.getNodeData(id);
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