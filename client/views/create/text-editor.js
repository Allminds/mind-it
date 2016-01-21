Editor = function Editor(elementToEdit, handler) {
  this.editBox = null;
  this.elementToEdit = elementToEdit;
  this.nodeData = elementToEdit.__data__;
  this.currentTextElement = d3.select(elementToEdit).select('text');
  this.handler = handler;
};


Editor.prototype.createEditBox = function () {
  var svgWidth = d3.select("svg").attr("width");
  var svgHeight = d3.select("svg").attr("height");
  git stash var elementToEdit = d3.select(this.elementToEdit);

  var textboxAttributes = textBoxAttribute(svgWidth, svgHeight, elementToEdit),
    adjmnt = [20, 10, 10, 10, 15],
    depth = this.nodeData.depth;
  depth = depth < adjmnt.length ? depth : 4;

  return d3.select("#mindmap")
    .append("input")
    .attr("class", "edit-box" + " level-" + depth)
    .attr("type", "text")
    .style("left", textboxAttributes.textboxX + "px")
    .style("top", (textboxAttributes.textboxY + adjmnt[depth]) + "px")
    .style("width", textboxAttributes.textboxWidth + "px");
};
var textBoxAttribute = function (svgWidth, svgHeight, elementToEdit) {

  var rect = elementToEdit.select("rect");
  var rectWidth = rect.attr("width"); //
  var rectHeight = rect.attr("height");

  if(elementToEdit[0][0].__data__.isCollapsed != true) {
    if (elementToEdit[0][0].__data__.childSubTree.length > 0 || elementToEdit[0][0].__data__.name == "") {
      rectWidth < 50 ? rectWidth = 50 : rect.attr("width");
    }
  }


  var transformation = elementToEdit.attr("transform").split(",");
  var xTranslation = transformation[0].split("(")[1];
  var yTranslation = transformation[1].split(")")[0];

  return {
    textboxX: svgWidth / 2 + parseInt(xTranslation) - rectWidth / 2,
    textboxY: svgHeight / 2 + parseInt(yTranslation) - rectHeight,
    textboxWidth: rectWidth
  };
};

Editor.prototype.setupEditBox = function (editBox) {
  this.editBox = editBox;
};


Editor.prototype.resetEditor = function () {
  this.currentTextElement.attr("visibility", "");
  var editBox = d3.select(".edit-box");
  if (editBox) {
    editBox.remove();
  }
};

var propagateChanges = function (editor) {
  editor.nodeData.name = editor.editBox[0][0].value;
  editor.resetEditor(this.currentTextElement);
  editor.handler(editor.nodeData);
};

Editor.prototype.setupAttributes = function () {
  var escaped = false;

  var currentTextElement = this.currentTextElement;
  var editBox = this.editBox;
  var nodeData = this.nodeData;
  var editor = this;

  currentTextElement.attr("visibility", "hidden");
  editBox.attr("value", nodeData.name)
    .attr('', function () {
      this.select();
      this.focus();
    })
    .on("blur", function () {
      if (escaped) return;
      propagateChanges(editor);
      escaped = false;
    })
    .on("keydown", function () {
      // IE fix
      if (!d3.event)
        d3.event = window.event;

      var e = d3.event;
      if (e.keyCode == App.KeyCodes.enter) {
        if (typeof (e.cancelBubble) !== 'undefined') // IE
          e.cancelBubble = true;
        if (e.stopPropagation)
          e.stopPropagation();
        e.preventDefault();
        propagateChanges(editor);
      }


      if (e.keyCode == App.KeyCodes.escape) {
        escaped = true;
        editor.resetEditor();
        e.preventDefault();
      }

      if (e.keyCode == App.KeyCodes.tab) {
        e.stopPropagation();
        e.preventDefault();
        propagateChanges(editor);
      }
    });

};
