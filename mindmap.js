/* global MindMapService */
/* global Mindmaps */
/* global d3 */
/* global Router */
/* global Template */
/* global SessionCounter */
/* global Meteor */

Mindmaps = new Meteor.Collection("Mindmaps");
var mindMapService;
Router.configure({ layoutTemplate: 'main' });
Router.route('/', { template: 'home' });
Router.route('/create/:_id', {
      name: "create",
      template: "create",
      waitOn: function () {
            return Meteor.subscribe("mindmaps");
      },
      data: function () {
            return Mindmaps.findOne(this.params._id);
      }
});

if (Meteor.isClient) {
      Meteor.subscribe('mindmaps');
      // counter starts at 0
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
      
 
            // place the name atribute left or right depending if children
            node.append("svg:text")
                  .attr("dx", function (d) { return d.children ? -50 : 50; })
                  .text(function (d) { return d.name; })


      }

      mindMapService = new MindMapService();
      Template.MyButton.events({
            'click #clickme': function () {
                  // 1. cretate root node with defualt title
                  var mindMapId = mindMapService.createNode('New Mindmap'),
                        link = '/create/' + mindMapId;
                  // 2. Go to canvas root note
                  Router.go(link);
            }
      });
}

if (Meteor.isServer) {
      Meteor.startup(function () {
            // code to run on server at startup
      });
      Meteor.publish('mindmaps', function () {
            return Mindmaps.find();
      });
}
