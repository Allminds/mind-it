/* global mindMapService */
/* global d3 */

var currentNode; //use this
currentDir = "right"
mindMapService = new MindMapService();
Template.create.rendered = function (d) {
   console.log(this.data)
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
            // .attr("transform", function (d) { return "translate(" + d.y + "," + (d.x - 150) + ")"; })
   //Add the dot at every node
      node.append("svg:ellipse")
            .attr("cx",300).attr("cy",3)
            .attr("rx", function(d) {if(d.name.length>0)return d.name.length * 10 + "px"; else return 150+"px";})
            .attr("ry", 20)
            .attr("stroke", "black")
            .attr("fill", "white")
             // .attr("transform", function (d) { })
            // .attr("transform", function (d) { return "translate(" + (d.y) + "," + (d.x /*- 150*/) + ")"; })

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

function update() {
   rootNodeData = Mindmaps.findOne(rootNodeData._id)
   vis.selectAll("*").remove();
   var nodes = tree.nodes(rootNodeData)
   // console.log(nodes)
   var links = tree.links(nodes);
   var diagonal = d3.svg.diagonal() 
            .projection(function (d) {
               // console.log(d.direction)
               switch(d.direction)
               {
                  case "right": return [d.y, d.x];
                  case "left" : return [-d.y, d.x];
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
                  switch(d.direction) {
                     case "Right":return "translate(" + d.y + "," + d.x + ")";
                     case "Left":return "translate(" + -d.y + "," + d.x + ")";
                     default :return "translate(" + d.y + "," + d.x + ")";
        }
     })
 
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


      var parentBox = this.parentNode.getBBox(),
            position = { x: parentBox.x, y: parentBox.y + 5 },
            parentElement = d3.select(this.parentNode),
            currentElement = parentElement.select('text');

           // console.log("x is :"+ position.x +"and y is "+ position.y+ "cx is :"+  this.parentBox.cx+"and y is "+  this.parentBox.cy);

            inp = parentElement.append("foreignObject")
                  .attr("x",function(d){ if (position.x == 0) return 300; else return position.x;})
                  .attr("y", position.y)
                  .attr("width", 160).attr("height", 40)
                  .append("xhtml:form").append("input");

            updateNode = function () {

                  var txt = inp.node().value;
                  // console.log(txt)
                  nodeData[field] = txt;
                  // console.log(nodeData)
                  currentElement.text(function (d) {  return d[field]; });
                  currentElement.attr("visibility","visible");

                  parentElement.selectAll('ellipse')
                  .attr("cx",300).attr("cy",3)
                  .attr("rx", function(d) {
                   stringLength=d.name.length;
                   if(stringLength>0)
                       stringLength=stringLength * 4.5;
                   else
                        stringLength = 80;
                   return stringLength ;})

                  currentElement.attr("dx","0em")
                  currentElement.attr("dy","0.5em")
                  currentElement.attr("text-anchor", "middle")

                  parentElement.select("foreignObject").remove();
                  // console.log(nodeData)
                  mindMapService.updateNode(rootNodeData);
                  //mindMapService.addRightChild(rootNodeData);
            };

      currentElement.attr("visibility", "hidden"); // erase text on  double click event

      inp.attr("value", function () {
            return nodeData[field];
      }).attr('', function () {
            this.value = this.value; // hack for focusing node title
            this.focus();
            this.select();
      })
      .attr("style","height:30px;")
     .style("width", function(d) {if(d.name.length>0)return d.name.length * 10 + "px"; else return 150+"px"; })
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
            currentDir = "right"
             if(toggle === true) {
                currentDir = "left"
               toggle = false
             }


            //currentNode = d;
      }).on("dblclick", function (d) {
            showEditor.call(this, d, field, rootNodeData);
      });
  

}


document.addEventListener('keydown', function(e){
               if( e.keyCode == '9' ){
                  // console.log(currentDir)
                  mindMapService.addChild(rootNodeData, currentDir); 
                    toggle = true
                  update();
               }
               else if(e.keyCode == '13' ){
                 // mindMapService.addChild(rootNodeData, currentDir); 
                 //  toggle = true
                 //  update();
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


