App = {};

App.storeLocally = function (node) {
  var state = {isCollapsed: node.isCollapsed};
  store.set(node._id, state);
};

App.removeLocally = function (node) {
  store.remove(node._id);
};

App.isLocallyCollapsed = function (id) {
  try {
    var locallyCollapsed = store.get(id).isCollapsed;
  }
  catch (e) {
  }
  return locallyCollapsed ? true : false;
};

App.retainCollapsed = function  () {
  store.forEach(function (key) {
    try {
      if (App.isLocallyCollapsed(key)) {
        var nodeData = App.map.getNodeDataWithNodeId(key);
        App.collapse(nodeData, key);
      }
    }
    catch (e) {
    }
  });
};