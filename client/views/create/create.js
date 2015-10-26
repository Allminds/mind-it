var mindMapService = new MindMapService();
var left;
var right;
drawTree = null;
currentDir = "right";
count = 0;
startup = true

getWidth = function (d) {
      var width = 80;
      if (d && d.name && typeof d.name == 'string')
            width = d.name.length * 4.5;
      return width;
};

splitTrees = function(mainTree, leftTree, rightTree){
    for(var i = 0; i < rootNodeData.children.length; i++) {
              if(rootNodeData.children[i].direction === "left")
                  left.children.push(rootNodeData.children[i])
              else
                  right.children.push(rootNodeData.children[i])
          }

}

drawTree= function(arrayOfNodes, rootNodeData, treeNodes, vis, direction){
    var nodes = treeNodes.nodes(arrayOfNodes),
        links = treeNodes.links(nodes),
        diagonal = d3.svg.diagonal().projection( function (d) {
        switch(direction){
                    case "right": return [-d.y, d.x];
                    case "left" : return [d.y, d.x];
                }
        });

    vis.selectAll(".links")
       .data(links)
       .enter().append("svg:path")
       .attr("class", "link")
       .attr("fill", "none")
       .attr("stroke", "#ADADAD")
       .attr("d", diagonal);

    var node = vis.selectAll("g.node")
        .data(nodes)
        .enter().append("svg:g")
        .attr('class', 'treeNode')
        .attr("transform", function (d) {
            switch(direction){
                case "right": return "translate(" + -d.y + "," + d.x + ")";
                case "left" : return "translate(" + d.y + "," + d.x + ")";
            }

        });


    if(direction === "left")
    {
    var rootNode = d3.select(node[0][0]);

    rootNode.append("svg:ellipse")
        .attr("cx", 50).attr("cy", 3)
        .attr("rx", function (d) { return getWidth(d) + 'px'; })
        .attr('ry', 20)
        .attr("stroke", "black")
        .attr("fill", "white")
        .attr("fill-opacity", "1")
        .call(make_editable, "name", rootNodeData);

    rootNode.append("svg:text")
        .attr("x", 50).attr("y", 3)
        .attr("dx", "0em")
        .attr("dy", "0.5em")
        .text(function (d) { return d.name; })
        .attr("text-anchor", "middle")
        .call(make_editable, "name", rootNodeData);
    }

    node.append("svg:text")
            .attr("x", 50).attr("y", 3)
            .attr("dx", "0em")
            .attr("dy", "0.5em")
            .text(function (d) { return d.name; })
            .attr("text-anchor", "middle")
            .call(make_editable, "name", rootNodeData);


}


Template.create.rendered = function rendered(d) {
      rootNodeData = this.data;
      left = {name: rootNodeData.name, children: [], direction: null};
      right = {name:"", children: [], direction: null};

      splitTrees(rootNodeData, left, right);


      var mapId = this.data._id,
          vis = d3.select("#mindmap").append("svg:svg")
              .attr("width", 1500)
              .attr("height", 1500)
              .append("svg:g").attr("transform", "translate(750, 0)"),

      treeLeft = d3.layout.tree().size([400, 400]);
      treeRight = d3.layout.tree().size([400, 400]);


      drawTreeLeft = function (update) {
          left = {name: rootNodeData.name, children: [], direction: null};
                right = {name:"", children: [], direction: null};
          if (update) {
              rootNodeData = Mindmaps.findOne(mapId);
              splitTrees(rootNodeData,left,right);

          }

          drawTree(left, rootNodeData, treeLeft, vis,"left");
      };

      drawTreeRight = function (update) {
          left = {name: rootNodeData.name, children: [], direction: null};
                right = {name:"", children: [], direction: null};
          if (update) {
              rootNodeData = Mindmaps.findOne(mapId);
               splitTrees(rootNodeData,left,right);
          }

      vis.selectAll("*").remove();

      drawTree(right, rootNodeData, treeRight, vis, "right");

      };

      drawTreeRight(true);
      drawTreeLeft(true);

      Mindmaps.find().observe({

            changed: function(){
                drawTreeRight(true);
                drawTreeLeft(true);
          }

     });
}

function showEditor(nodeData, field, rootNodeData) {
      var parentBox = this.parentNode.getBBox(),
            position = { x: parentBox.x, y: parentBox.y },
            parentElement = d3.select(this.parentNode),
            currentElement = parentElement.select('text'),
            inp = parentElement.append("foreignObject")
                  .attr("x", function (d) { if (d.name.length == 0) return parentBox.width / 2; else return position.x;  })
                  .attr("y", position.y)
                  .append("xhtml:form").append("input");

      updateNode = function () {
            var txt = inp.node().value;
            nodeData[field] = txt;
            var j = 0;
            var k = 0;
            parentElement.select("foreignObject").remove();
            rootNodeData.name = left.name
            for(i = 0; i < rootNodeData.children.length; i++ ) {
                if(rootNodeData.children[i].direction == "right") {
                      rootNodeData.children[i] = right.children[j];
                      j++;
                }
                else {
                    rootNodeData.children[i] = left.children[k]
                    k++;
                }
            }
            mindMapService.updateNode(rootNodeData);
            drawTreeRight(true);
            drawTreeLeft(true);

      };

      currentElement.attr("visibility", "hidden");

      inp.attr("value", function () {
            return nodeData[field];
      }).attr('', function () {
            this.value = this.value; // hack for focusing node title
            this.focus();
            this.select();
      })
            .attr("style", "height:30px;")
            .style("width", "auto")
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
      }).on("click", function (d) {
            d3.select(this.parentNode).select('ellipse').style("fill", "whitesmoke");
            if (toggle === true) {
                  switch (currentDir) {
                        case "left": currentDir = "right"; break;
                        case "right": currentDir = "left"; break;
                  }
                  toggle = false
            }
      }).on("dblclick", function (d) {
            showEditor.call(this, d, field, rootNodeData);
      });
}

document.addEventListener('keydown', function (e) {
      if (e.keyCode == '13') {
            mindMapService.addChild(rootNodeData, currentDir);
            toggle = true;
//            rootNodeData = Mindmaps.findOne(rootNodeData._id);
//            if(currentDir === "left")
//                left.children.push(rootNodeData.children[count])
//             else
//                right.children.push(rootNodeData.children[count])

            drawTreeRight(true);
            drawTreeLeft(true);
            count++;
      }
}, false);
