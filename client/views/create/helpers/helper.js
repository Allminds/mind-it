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
  d3.select(node).classed("selected", true);
};

App.deselectNode = function () {
  d3.selectAll(".selected").classed("selected", false);
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
  var selectedNode = App.map.getDataOfNodeWithClassNamesString(".node.selected");
  if (dir === 'root') {
    if (App.getDirection(selectedNode) === 'root') {
      var directionToggler = App.DirectionToggler.getInstance();
      directionToggler.setCanToggle(true);
      directionToggler.changeDirection();
      directionToggler.setCanToggle(false);
      dir = directionToggler.getCurrentDirection();
    }
    else
      dir = selectedNode.position;
  }
  return dir;
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

App.storeLocally = function (d) {
  var state = {isCollapsed: d.isCollapsed};
  store.set(d._id, state);
};

App.removeLocally = function (d) {
  store.remove(d._id);
};

var collapseRecursive = function (d, id) {
  if (d._id === id) {
    d.isCollapsed = true;
    App.storeLocally(d);
  }
  if (d.hasOwnProperty('children') && d.children) {
    d._children = [];
    d._children = d.children;
    d._children.forEach(collapseRecursive);
    d.children = null;
  }

};

App.collapse = function (d, id) {
  collapseRecursive(d, id);
  App.chart.update();
};

App.expandRecursive = function (d, id) {
  if (d._id === id) {
    d.isCollapsed = false;
    App.removeLocally(d);
  }
  // On refresh - If child node is collapsed do not expand it
  if (App.isLocallyCollapsed(d._id) == true)
    d.isCollapsed = true;
  if (d.hasOwnProperty('_children') && d._children && !d.isCollapsed) {
    d.children = d._children;
    d._children.forEach(App.expandRecursive);
    d._children = null;
  }
};

App.expand = function (d, id) {
  App.expandRecursive(d, id);
  App.chart.update();
};

App.toggleCollapsedNode = function (selected) {
  var dir = App.getDirection(selected);
  if (dir !== 'root') {
    if (selected.hasOwnProperty('_children') && selected._children) {
      App.expand(selected, selected._id);
    }
    else {
      App.collapse(selected, selected._id);
    }
  }
};


App.checkOverlap = function (rect1) {
  var rectList = d3.select('svg').select('g').selectAll('g');
  for (var i = 0; i < rectList[0].length; i++) {
    var rectPoint = d3.select(rectList[0][i]).attr('transform').replace('translate(', '').replace(')', '').split(',');

    var currHeight = (d3.select(rectList[0][i]).select('rect').attr('height') * 1), currWidth = (d3.select(rectList[0][i]).select('rect').attr('width') * 1),
      currX = rectPoint[0] * 1 - (currWidth / 2), currY = rectPoint[1] * 1 + (currHeight / 2);

    if (rect1[0] * 1 >= currX && rect1[0] * 1 <= currX + currWidth && rect1[1] * 1 <= currY && rect1[1] * 1 >= currY - currHeight) {
      return rectList[0][i];
    }
  }
};

App.JSONtoXML = function (XMLString, nodeObject) {
  XMLString += "<node ";
  XMLString += "ID = \"" + nodeObject._id + "\"";
  XMLString += "TEXT = \"" + nodeObject.name + "\"";
  if (nodeObject.hasOwnProperty('parent_ids') && nodeObject.parent_ids.length === 1) {
    XMLString += "POSITION = \"" + nodeObject.position + "\"";
  }
  XMLString += ">\n";
  (nodeObject.children || nodeObject._children || []).forEach(function (child) {
    XMLString = App.JSONtoXML(XMLString, child)
  });
  XMLString += "</node>\n";
  return XMLString;
};

App.getChartInFocus = function () {
  var body = $('body')[0],
    scrollWidth = body.scrollWidth - body.clientWidth,
    scrollHeight = body.scrollHeight - body.clientHeight;
  $(window).scrollLeft(scrollWidth / 2);
  $(window).scrollTop(scrollHeight / 2);
};

App.clone = function (node) {
  var clonedNode = {name: node.name, position: node.position};
  clonedNode.children = (node.children || node._children || []).App.map(function (currentElem) {
    return clone(currentElem);
  });
  if (node.depth == 0) {
    clonedNode.left = clonedNode.children.filter(function (x) {
      return x.position == 'left'
    });
    clonedNode.right = clonedNode.children.filter(function (x) {
      return x.position == 'right'
    });
  }
  return clonedNode;
};


App.cloneObject = function (obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
};