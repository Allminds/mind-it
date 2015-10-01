/* global mindMapService */
/* global d3 */
mindMapService = new MindMapService();
Template.create.rendered = function (d) {
      var rootNodeData = this.data,
            vis = d3.select("#mindmap").append("svg:svg")
                  .attr("width", 1000).attr("height", 500)
                  .append("svg:g").attr("transform", "translate(150, 0)"),
            tree = d3.layout.tree()
                  .size([800, 500]),
            diagonal = d3.svg.diagonal()
                  .projection(function (d) { return [d.y, d.x]; }),
            nodes = tree.nodes(rootNodeData),// Preparing the data for the tree layout, convert data into an array of nodes
            links = tree.links(nodes);// Create an array with all the links
      vis.selectAll("pathlink")
            .data(links)
            .enter().append("svg:path")
            .attr("class", "link")
            .attr("d", diagonal)

      var node = vis.selectAll("g.node")
            .data(nodes)
            .enter().append("svg:g")
            .attr("transform", function (d) { return "translate(" + d.y + "," + (d.x - 150) + ")"; })
 
      // Add the dot at every node
      node.append("svg:ellipse")
            .attr("rx", 80).attr('ry', 20)
            .attr("stroke", "black")
            .attr("fill", "white")
            .call(make_editable, "name", rootNodeData);
      
 
      // place the name atribute left or right depending if children
      node.append("svg:text")
            .attr("dx", function (d) { return d.children ? -50 : 50; })
            .text(function (d) { return d.name; })
            .call(make_editable, "name", rootNodeData);;
}

function showEditor(nodeData, field, rootNodeData) {
      var parentBox = this.parentNode.getBBox(),
            position = { x: parentBox.x, y: parentBox.y + 5 },
            parentElement = d3.select(this.parentNode),
            currentElement = parentElement.select('text'),
            inp = parentElement.append("foreignObject")
                  .attr("x", position.x).attr("y", position.y)
                  .attr("width", 160).attr("height", 40)
                  .append("xhtml:form").append("input"),
            updateNode = function () {
                  var txt = inp.node().value;
                  nodeData[field] = txt;
                  currentElement.text(function (d) { return d[field]; });
                  parentElement.select("foreignObject").remove();
                  mindMapService.updateNode(rootNodeData);
            };

      inp.attr("value", function () {
            return nodeData[field];
      }).attr('', function () {
            this.value = this.value; // hack for focusing node title
            this.focus();
      }).attr("style", "width: 100px;")
            .on("blur", updateNode)
            .on("keypress", function () {
                  // IE fix
                  if (!d3.event)
                        d3.event = window.event;

                  var e = d3.event;
                  if (e.keyCode == 13) {
                        if (typeof (e.cancelBubble) !== 'undefined') // IE
                              e.cancelBubble = true;
                        if (e.stopPropagation)
                              e.stopPropagation();
                        e.preventDefault();
                        updateNode();
                  }
            });

};
function make_editable(d, field, rootNodeData) {
      this.on("mouseover", function () {
            d3.select(this.parentNode).select('ellipse').style("fill", "whitesmoke");
      }).on("mouseout", function () {
            d3.select(this.parentNode).select('ellipse').style("fill", null);
      }).on("dblclick", function (d) {
            showEditor.call(this, d, field, rootNodeData);
      });
}