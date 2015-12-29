App.DirectionToggler = (function () {
  var instance;

  var currentDir = "right";
  var canToggle = false;

  var init = function () {
    return {
      getCurrentDirection: function () {
        return currentDir;
      },
      getCanToggle: function () {
        return canToggle;
      },
      setCanToggle: function (toggle) {
        canToggle = toggle;
      },
      changeDirection: function () {
        currentDir = (currentDir== "right") ? "left" : "right";
      }
    }
  };

  var createInstance = function () {
    var object = new init();
    return object;
  };

  return {
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };

})();

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

  var directionToggler = App.DirectionToggler.getInstance();
  if (!node.__data__.position && directionToggler.getCanToggle()) {
    directionToggler.changeDirection();
    directionToggler.setCanToggle(false);
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

App.getDirection = function (data) {
  if (!data) {
    return 'root';
  }
  if (data.position) {
    return data.position;
  }
  return App.getDirection(data.parent);
};

App.calculateDirection = function (parent) {
  var dir = App.getDirection(parent);
  var selectedNode = App.map.selectedNodeData();
  if (dir === 'root') {
    if (App.getDirection(selectedNode) === 'root') {
      var directionToggler = App.DirectionToggler.getInstance();
      directionToggler.setCanToggle(true);
      dir = directionToggler.getCurrentDirection();
    }
    else
      dir = selectedNode.position;
  }
  return dir;
};