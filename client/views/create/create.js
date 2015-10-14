/* global mindMapService */
/* global d3 */

var currentNode; //use this
currentDir = "Right"
mindMapService = new MindMapService();
Template.create.rendered = function (d) {
       rootNodeData = this.data,
            vis = d3.select("#mindmap").append("svg:svg")
                  .attr("width", 1000).attr("height", 500)
                  .append("svg:g").attr("transform", "translate(600, 0)"),
            tree = d3.layout.tree()
                  .size([400, 300])
            diagonal = d3.svg.diagonal()
                  .projection(function (d) { return [d.y, d.x]; }),
            nodes = tree.nodes(rootNodeData),// Preparing the data for the tree layout, convert data into an array of nodes
            links = tree.links(nodes);// Create an array with all the links
            
var diagonal = d3.svg.diagonal() 
            .projection(function(d) {return [-d.y, d.x];});


            // console.log(this)

      vis.selectAll(".link")
            .data(links)
            .enter().append("svg:path")
            .attr("class", "link")
            .attr("fill","none")
            .attr("stroke","#ADADAD")
            .attr("d", diagonal)
          // .attr("transform", function (d) { return "translate(" + (d.y -120) + "," + (-d.x /*- 150*/) + ")"; })

      
      var node = vis.selectAll("g.node")
            .data(nodes)
            .enter().append("svg:g")
            .attr("transform", function (d) { return "translate(" + (d.y) + "," + (d.x /*- 150*/) + ")"; })
 
      // Add the dot at every node
      node.append("svg:ellipse")
            .attr("cx",10).attr("cy",3)
            .attr("rx", 80).attr('ry', 20)
            .attr("stroke", "black")
            .attr("fill", "white")
             // .attr("transform", function (d) { })
            // .attr("transform", function (d) { return "translate(" + (d.y) + "," + (d.x /*- 150*/) + ")"; })

            .call(make_editable, "name", rootNodeData);
      
 
      // place the name atribute left or right depending if children
      node.append("svg:text")
            .attr("dx", function (d) { return d.children ? -50 : -50; })
            .text(function (d) { return d.name; })
            .call(make_editable, "name", rootNodeData);
}

function update() {
   rootNodeData = Mindmaps.findOne(rootNodeData._id)
   vis.selectAll("*").remove();
   var nodes = tree.nodes(rootNodeData)
   console.log(nodes)
   var links = tree.links(nodes);
   var diagonal = d3.svg.diagonal() 
            .projection(function (d) {
               console.log(d.direction)
               switch(d.direction)
               {
                  case "Right": return [d.y, d.x];
                  case "Left" : return [-d.y, d.x];
                  default     : return [d.y, d.x];
               }
            });

   vis.selectAll(".link")
            .data(links)
            .enter().append("svg:path")
            .attr("class", "link")
            .attr("fill","none")
            .attr("stroke","#ADADAD")
            .attr("d", diagonal)
      
   var node = vis.selectAll("g.node")
            .data(nodes)
            .enter().append("svg:g")
            .attr("transform", function (d) {
                  
               return "translate(" + (-d.y) + "," + (d.x /*- 150*/) + ")"; })
 
      // Add the dot at every node
      node.append("svg:ellipse")
            .attr("cx",10).attr("cy",3)
            .attr("rx", 80).attr('ry', 20)
            .attr("stroke", "black")
            .attr("fill", "white")
            .call(make_editable, "name", rootNodeData);
 
      // place the name atribute left or right depending if children
      node.append("svg:text")
            .attr("dx", function (d) { return d.children ? -50 : -50; })
            .text(function (d) { return d.name; })
            .call(make_editable, "name", rootNodeData);


}

function showEditor(nodeData, field, rootNodeData) {
      var bbox=0;

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

                  parentElement.selectAll('ellipse')
                  .attr("cx",10).attr("cy",3)
                  .attr("rx", function(d) {return this.parentNode.getBBox().width/2+7;})

                  currentElement.attr("dx","1em")
                  currentElement.attr("dy","0.5em")
                  currentElement.attr("text-anchor", "middle")

                  parentElement.select("foreignObject").remove();
                  mindMapService.updateNode(rootNodeData);
                  //mindMapService.addRightChild(rootNodeData);
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
toggle = false

function make_editable(d, field, rootNodeData) {
      this.on("mouseover", function () {
            d3.select(this.parentNode).select('ellipse').style("fill", "whitesmoke");
      }).on("mouseout", function () {
           // d3.select(this.parentNode).select('ellipse').style("fill", null);
      }).on("click",function(d){
            d3.select(this.parentNode).select('ellipse').style("fill", "whitesmoke");
            currentDir = "Right"
             if(toggle === true) {
                currentDir = "Left"
               toggle = false
             }


            //currentNode = d;
      }).on("dblclick", function (d) {
            showEditor.call(this, d, field, rootNodeData);
      });
  

}


document.addEventListener('keydown', function(e){
               if( e.keyCode == '9' ){
                  console.log(currentDir)
                  mindMapService.addChild(rootNodeData, currentDir); 
                    toggle = true
                  update();
               }
               else if(e.keyCode == '13' ){
                 mindMapService.addChild(rootNodeData, currentDir); 
                  toggle = true
                  update();
               }
               else if(e.keyCode == '32' ){
                 //collapse(currentNode);
               }
               else if(e.keyCode == '38' && e.altKey){
                 //shiftNodeUp();
               }
               else if(e.keyCode == '37' && e.altKey){
                 //shiftNodeLeft();
               }
               

           }, false);


