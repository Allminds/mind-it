/* global mindMapService */
/* global d3 */
mindMapService = new MindMapService();
Template.create.rendered = function () {
      
      var treeData = this.data;
      // Create a svg canvas
      var vis = d3.select("#mindmap").append("svg:svg")
            .attr("width", 1000)
            .attr("height", 500)
            .append("svg:g")
            .attr("transform", "translate(150, 0)"); // shift everything to the right
 
      // Create a tree "canvas"
      var tree = d3.layout.tree()
            .size([800, 500]);

      var diagonal = d3.svg.diagonal()
      // change x and y (for the left to right tree)
            .projection(function (d) { return [d.y, d.x]; });
      // Preparing the data for the tree layout, convert data into an array of nodes
      var nodes = tree.nodes(treeData);
      // Create an array with all the links
      var links = tree.links(nodes);
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
            .call(make_editable, "name", treeData);
      
 
      // place the name atribute left or right depending if children
      node.append("svg:text")
            .attr("dx", function (d) { return d.children ? -50 : 50; })
            .text(function (d) { return d.name; })
            .call(make_editable, "name", treeData);;
}
function make_editable(d, field, treeData) {
      this.on("mouseover", function () {
            d3.select(this.parentNode).select('ellipse').style("fill", "whitesmoke");
      }).on("mouseout", function () {
            d3.select(this.parentNode).select('ellipse').style("fill", null);
      }).on("dblclick", function (d) {
            var p = this.parentNode;
            // inject a HTML form to edit the content here...
            // bug in the getBBox logic here, but don't know what I've done wrong here;
            // anyhow, the coordinates are completely off & wrong. :-((
            var xy = this.getBBox();
            var p_xy = p.getBBox();

            xy.x = p_xy.x;
            xy.y = p_xy.y + 5;

            var el = d3.select(p).select('text');
            var p_el = d3.select(p);

            var frm = p_el.append("foreignObject");

            var inp = frm
                  .attr("x", xy.x)
                  .attr("y", xy.y)
                  .attr("width", 160)
                  .attr("height", 40)
                  .append("xhtml:form")
                  .append("input")
                  .attr("value", function () {
                        // nasty spot to place this call, but here we are sure that the <input> tag is available
                        // and is handily pointed at by 'this':
                        this.focus();

                        return d[field];
                  }).attr('', function () {
                        this.value = this.value;
                  })
                  .attr("style", "width: 100px;")
            // make the form go away when you jump out (form looses focus) or hit ENTER:
                  .on("blur", function () {

                        var txt = inp.node().value;
                        d[field] = txt;
                        el.text(function (d) { return d[field]; });

                        // Note to self: frm.remove() will remove the entire <g> group! Remember the D3 selection logic!
                        p_el.select("foreignObject").remove();
                  })
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

                              var txt = inp.node().value;
                              d[field] = txt;
                              el.text(function (d) { return d[field]; });
                              mindMapService.updateNode(treeData);

                              // odd. Should work in Safari, but the debugger crashes on this instead.
                              // Anyway, it SHOULD be here and it doesn't hurt otherwise.
                              p_el.select("foreignObject").remove();
                        }
                  });

      });
}