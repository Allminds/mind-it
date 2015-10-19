/* global mindMapService */
/* global d3 */
mindMapService = new MindMapService();
var drawTree;
currentDir = "right"
Template.create.rendered =
function rendered(d) {            
      rootNodeData = this.data;
      var mapId = this.data._id,
            vis = d3.select("#mindmap").append("svg:svg")
                  .attr("width", 1500)
                  .attr("height", 1500)
                  .append("svg:g").attr("transform", "translate(750, 0)")
            
            ,tree = d3.layout.tree()
                  .size([400, 300])
           

      drawTree = function (update) {
            if (update) {
                  rootNodeData = Mindmaps.findOne(mapId);
            }
               vis.selectAll("*").remove();//dont use .treeNode - it doesnot clear the links

            var nodes = tree.nodes(rootNodeData).reverse(),

                  nodes = tree.nodes(rootNodeData),// Preparing the data for the tree layout, convert data into an nodes = tree.nodes(rootNodeData),// Preparing the data for the tree layout, convert data into an array of nodes
                  links = tree.links(nodes);// Create an array with all the links

             diagonal = d3.svg.diagonal()
                  .projection(function (d) {   
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
                  .attr('class', 'treeNode')
                  .attr("transform", function (d) {switch(d.direction) {
                     case "right":return "translate(" + d.y + "," + d.x + ")";
                     case "left":return "translate(" + -d.y + "," + d.x + ")";
                     default :return "translate(" + d.y + "," + d.x + ")";
        }}
 )
 
            // Add the dot at every node
            node.append("svg:ellipse")
                  .attr("cx", 50/*300*/).attr("cy", 3)
                  .attr("rx", function(d) {if(d.name.length>0)return d.name.length * 4.5 + "px"; else return 80+"px";})
                  .attr('ry', 20)
                  .attr("stroke", "black")
                  .attr("fill", "white")
                  .call(make_editable, "name", rootNodeData);

 
            // place the name atribute left or right depending if children
            node.append("svg:text")
                  .attr("x", 50/*300*/).attr("y", 3)
                  .attr("dx", "0em")
                  .attr("dy", "0.5em")
                  .text(function (d) { return d.name; })
                  .attr("text-anchor", "middle")
                  .call(make_editable, "name", rootNodeData);

      };

      drawTree();

      Mindmaps.find().observe({

            changed: _.partial(drawTree, true)
      });


}

function showEditor(nodeData, field, rootNodeData) {


      var parentBox = this.parentNode.getBBox(),
            position = { x: parentBox.x, y: parentBox.y },
            parentElement = d3.select(this.parentNode),
            currentElement = parentElement.select('text'),
            inp = parentElement.append("foreignObject")
                  .attr("x",function(d){ if(d.name.length ==0)return parentBox.width/2; else return position.x;})
                  .attr("y", position.y)
                  .append("xhtml:form").append("input");

            updateNode = function () {

                  var txt = inp.node().value;
                  nodeData[field] = txt;
                  currentElement.text(function (d) {  return d[field]; });
                  currentElement.attr("visibility","visible");

                  parentElement.selectAll('ellipse')
                        .attr("cx", 300).attr("cy", 3)
                        .attr("rx", function (d) {
                              stringLength = d.name.length;
                              if (stringLength > 0)
                                    stringLength = stringLength * 4.5;
                              else
                                    stringLength = 80;
                              return stringLength;
                        });

                  currentElement.attr("dx", "0em")
                  currentElement.attr("dy", "0.5em")
                  currentElement.attr("text-anchor", "middle")

                  parentElement.select("foreignObject").remove();
                  mindMapService.updateNode(rootNodeData);
                   drawTree(true);
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
     .style("width","auto")
       .on("blur", updateNode)
       .on("keydown", function () {
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
            d3.select(this.parentNode).select('ellipse').style("fill", null);
      }).on("click",function(d){
            d3.select(this.parentNode).select('ellipse').style("fill", "whitesmoke");
             if(toggle === true) {
                switch(currentDir){
                    case "left"  : currentDir = "right"; break;
                    case "right" : currentDir = "left" ; break;
                }
               toggle = false
             }
      }).on("dblclick", function (d) {
            showEditor.call(this, d, field, rootNodeData);
      });
}



document.addEventListener('keydown', function(e){
               if(e.keyCode == '13' ){
                 mindMapService.addChild(rootNodeData, currentDir);
                    toggle = true;
                    drawTree(true);
               }
           }, false);
