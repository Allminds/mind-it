/* global mindMapService */
/* global d3 */
mindMapService = new MindMapService();
Template.create.rendered = function (d) {
      var rootNodeData = this.data,
            vis = d3.select("#mindmap").append("svg:svg")
                  .attr("width", 1500).attr("height", 500)
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


   //Add the dot at every node
      node.append("svg:ellipse")
            .attr("cx",300).attr("cy",3)
            .attr("rx", function(d) {return d.name.length * 4.5}).attr("ry", 20)
            .attr("stroke", "black")
            .attr("fill", "white")
            .call(make_editable, "name", rootNodeData);



      // place the name attribute left or right depending if children
      node.append("svg:text")
            .attr("x",300).attr("y",3)
            .attr("dx","0em")
            .attr("dy","0.5em")
            .text(function (d) { return d.name; })
            .attr("text-anchor", "middle")
            .call(make_editable, "name", rootNodeData);



      


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
                  currentElement.text(function (d) {  return d[field]; });
                  currentElement.attr("visibility","visible");

                  parentElement.selectAll('ellipse')
                  .attr("cx",300).attr("cy",3)
                  .attr("rx", function(d) {return d.name.length * 4.5;})

                  currentElement.attr("dx","0em")
                  currentElement.attr("dy","0.5em")
                  currentElement.attr("text-anchor", "middle")

                  parentElement.select("foreignObject").remove();
                  mindMapService.updateNode(rootNodeData);
            };
      currentElement.attr("visibility", "hidden"); // erase text on  double click event

      inp.attr("value", function () {
            return nodeData[field];
      }).attr('', function () {
            this.value = this.value; // hack for focusing node title
            this.focus();
      })
      .attr("style","height:30px;")
     .style("width", function(d) {return ((d.name.length*10)+ "px");})
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