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
  var elementToEdit = d3.select(this.elementToEdit);

  var textboxAttributes = textBoxAttribute(svgWidth, svgHeight, elementToEdit),
    adjmnt = [20, 10, 10, 10, 15],
    depth = this.nodeData.depth;
  depth = depth < adjmnt.length ? depth : 4;

  /**
   * Added Extra space for child nodes adjacent to root @Author Swapnil  ,Danny.
   *
   */

  return d3.select("#mindmap")
    .append("input")
    .attr("class", "edit-box" + " level-" + depth)
    .attr("type", "text")
    .style("left", textboxAttributes.textboxX + "px")
    .style("top", (textboxAttributes.textboxY + adjmnt[depth]) + "px")
    .style("width", textboxAttributes.textboxWidth + "px");
};

var hasNoVisibleChildren = function(elementToEdit) {
  var isCollapsed = elementToEdit[0][0].__data__.isCollapsed;
  if(isCollapsed) return true;
  return elementToEdit[0][0].__data__.childSubTree.length == 0;
};

var calculateTextBoxWidth = function(elementToEdit) {
  var rectWidth = elementToEdit.select("rect").attr("width");
  if(rectWidth < App.Constants.MinTextBoxWidth && hasNoVisibleChildren(elementToEdit))
    return App.Constants.MinTextBoxWidth;
  return rectWidth;
};

var calculateAdjustmentFactor = function(elementToEdit, textBoxWidth) {
  var rectWidth = elementToEdit.select("rect").attr("width");
  var leftAdjustment = rectWidth / 2 - textBoxWidth;
  var rightAdjustment = rectWidth / 2 * -1;
  return App.getDirection(elementToEdit[0][0].__data__)=="left" ? leftAdjustment : rightAdjustment;
};

var textBoxAttribute = function (svgWidth, svgHeight, elementToEdit) {

  var rect = elementToEdit.select("rect");
  var rectHeight = rect.attr("height");
  var textBoxWidth = calculateTextBoxWidth(elementToEdit);

  var transformation = elementToEdit.attr("transform").split(",");
  var xTranslation = transformation[0].split("(")[1];
  var yTranslation = transformation[1].split(")")[0];
  var adjustmentFactor = calculateAdjustmentFactor(elementToEdit, textBoxWidth);

  return {
    textboxX: svgWidth / 2 + parseInt(xTranslation) + adjustmentFactor,
    textboxY: svgHeight / 2 + parseInt(yTranslation) - rectHeight ,
    textboxWidth: textBoxWidth
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
