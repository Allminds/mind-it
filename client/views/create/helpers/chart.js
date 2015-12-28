var mindMapService = new MindMapService();

var getDims = function () {
    var w = window, d = document, e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight || e.clientHeight || g.clientHeight;
    return {width: x, height: y};
};

var dims = getDims();

var lastClick = 0;

App.showPrompt = function (nodeData) {
    $("#modal-text").val(nodeData.name);
    $('#myModalHorizontal').modal('show');

    $('#myModalHorizontal').on('shown.bs.modal', function () {
        $("#modal-text").focus();
        $("#modal-text").select();
    });
    $("#modal-save").click(function () {
        App.updateDbWithPromptInput(nodeData)
        $('#modal-save').off('click');
    });
};

App.updateNode = function (nodeData) {
    mindMapService.updateNode(nodeData._id, {name: nodeData.name});
    setTimeout(function () {
        App.selectNode(nodeData);
    }, 10);
};

App.showEditor = function (node) {
    console.log("show editor");
    var selectedNode = node || d3.select('.selected')[0][0];
    var nodeData = selectedNode.__data__;


    if (nodeData && nodeData.name && nodeData.name.length >= 50) {
        App.showPrompt(nodeData);
        return;
    }

    var editor = new Editor(selectedNode, App.updateNode);
    var editBox = editor.createEditBox();
    editor.setupEditBox(editBox);
    editor.setupAttributes();
};

App.update = function (data) {
    window.data = data;
    d3.select('#mindmap svg')
        .datum(data)
        .call(App.chart);
    App.chart.update();
    App.getChartInFocus();
};


App.getChartInFocus = function () {
    var body = $('body')[0],
        scrollWidth = body.scrollWidth - body.clientWidth,
        scrollHeight = body.scrollHeight - body.clientHeight;
    $(window).scrollLeft(scrollWidth / 2);
    $(window).scrollTop(scrollHeight / 2);
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


App.updateDbWithPromptInput = function (nodeData) {
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

App.deselectNode = function () {
    d3.select(".selected").classed("selected", false);
};

App.nodeSelector = {
    prevDepthVisited: 0,

    setPrevDepth: function (depth) {
        App.nodeSelector.prevDepthVisited = depth;
    }
};

App.chart = MindMap()
  .width(20 * dims.width)
  .height(20 * dims.height)
  .text(function (textSelector) {
      var texts = textSelector[0];
      texts.forEach(function (text) {
          var currentTextSelector = d3.select(text);
          currentTextSelector.selectAll('tspan').remove();
          var node = currentTextSelector.node();
          if (node) {
              var lines = node.__data__.name.wrapString(60);
              lines.forEach(function (line,index) {
                  var dy = index == 0 ? 0 : 40;
                  currentTextSelector.append('svg:tspan').attr('x', 0).attr('dy', dy).text(line);
              });
          }
      });
  })
  .click(function () {
      if(this.__data__){
          var newClickTime = new Date().getTime();
          if(newClickTime - lastClick < 300) {
              App.showEditor(this);
          }
          App.nodeSelector.setPrevDepth(this.__data__.depth);
          App.select(this);
          lastClick = newClickTime;
      }
  });
