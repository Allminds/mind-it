// TODO: Use singleton pattern (make currentDir and canToggle - private)
App.DirectionToggler = {
  currentDir: "right",
  canToggle: false,

  changeDirection: function () {
    this.currentDir = (this.currentDir== "right") ? "left" : "right";
  }
};

App.nodeSelector = {
  prevDepthVisited: 0,

  setPrevDepth: function (depth) {
    App.nodeSelector.prevDepthVisited = depth;
  }
};

App.select = function (node) {
  // Find previously selected and deselect
  if(node === d3.select(".selected")[0][0]){
    return;
  }
  App.deselectNode();

  if (!node.__data__.position && App.DirectionToggler.canToggle) {
    App.DirectionToggler.changeDirection();
    App.DirectionToggler.canToggle = false;
  }
  // Select current item
  d3.select(node).classed("selected", true);
};

App.deselectNode = function () {
  d3.select(".selected").classed("selected", false);
};

App.selectNode = function (target) {
  if (target) {
    var sel = d3.selectAll('#mindmap svg .node').filter(function (d) {
      return d._id == target._id
    })[0][0];
    if (sel) {
      App.select(sel);
      return true;
    }
  }
  return false;
};

var updateDbWithPromptInput = function (nodeData) {
  $('#myModalHorizontal').modal('hide');
  var updatedText = $("#modal-text").val();
  if (updatedText != nodeData.name) {
    nodeData.name = updatedText;
    mindMapService.updateNode(nodeData._id, {name: nodeData.name});
    App.chart.update();
    setTimeout(function () {
      App.chart.update();
      App.selectNode(nodeData);
    }, 10);
  }
};

var showPrompt = function (nodeData) {
  $("#modal-text").val(nodeData.name);
  $('#myModalHorizontal').modal('show');

  $('#myModalHorizontal').on('shown.bs.modal', function () {
    $("#modal-text").focus();
    $("#modal-text").select();
  });
  $("#modal-save").click(function () {
    updateDbWithPromptInput(nodeData);
    $('#modal-save').off('click');
  });
};

var updateNode = function (nodeData) {
  mindMapService.updateNode(nodeData._id, {name: nodeData.name});
  setTimeout(function () {
    App.selectNode(nodeData);
  }, 10);
};

App.showEditor = function (node) {
  var selectedNode = node || d3.select('.selected')[0][0];
  var nodeData = selectedNode.__data__;


  if (nodeData && nodeData.name && nodeData.name.length >= 50) {
    showPrompt(nodeData);
    return;
  }

  var editor = new Editor(selectedNode, updateNode);
  var editBox = editor.createEditBox();
  editor.setupEditBox(editBox);
  editor.setupAttributes();
};