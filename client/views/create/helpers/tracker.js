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
    else if(fields.hasOwnProperty('parentId')) {
      var parentDepth = App.map.getNodeDataWithNodeId(fields.parentId).depth,
        selectedNode = App.map.getNodeDataWithNodeId(id);
      var node = d3.select(".selected")[0][0];
      d3.select(".selected").attr("class", "node level-"+(parentDepth+1) +" selected");
      //recursiveNodeColoring(node.__data__.depth, node.__data__._id, node.__data__.depth + 1);
      App.removeClassFromSubTree(node.__data__, null, getLevelBasedOnDepth, -1);
      App.removeClassFromSubTree(node.__data__, null, getLevelBasedOnDepth, +1);
      App.applyClassToSubTree(node.__data__, null, getLevelBasedOnDepth);
    }
  }
};

var getLevelBasedOnDepth = function(nodeData, adder) {
  if(nodeData) {
    var depth = nodeData.depth + (adder ? adder : 0);
    return "level-"+depth;
  }
}
var recursiveNodeColoring = function (depth, parentId, newDepth) {
  //console.log(d3.selectAll(".level-"+depth)[0]);
  d3.selectAll(".level-"+depth)[0].forEach(function (node) {
    if (node.__data__.parentId == parentId) {
      node.setAttribute("class", "node level-"+(newDepth));
      node.__data__.childSubTree.forEach(function(d) {
        recursiveNodeColoring(newDepth, node.__data__._id, newDepth+1);
      });
    }
  });

};