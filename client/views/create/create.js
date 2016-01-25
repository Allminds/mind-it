var mindMapService = App.MindMapService.getInstance();

var nodeSelector = {
  prevDepthVisited: 0,

  setPrevDepth: function (depth) {
    this.prevDepthVisited = depth;
  }
};

var update = function (data) {
  window.data = data;
  d3.select('#mindmap svg')
    .datum(data)
    .call(App.chart);
  App.chart.update();
  App.getChartInFocus();
  $(window).resize(function() {
        App.getChartInFocus();
  });

};

var enableHelpLink = function () {
  $('#help-modal').modal('show');
};

Template.create.events({
  'click [data-action=share]': function (e, args) {
    var permission = d3.select("#permission")[0][0].value;
    var eMail = d3.select("#e_mail")[0][0].value;
    var mindMapId = Mindmaps.findOne({"position": null })._id;
    Meteor.call("addMapToUser", eMail, mindMapId, permission);
  }
});

Template.create.rendered = function rendered() {
  if(this.data.data.length == 0)
    Router.go('/404');

  App.currentMap = this.data.id;
  var email = Meteor.user() ? Meteor.user().services.google.email : null;
    App.editable = acl.find({
        user_id: {$in: [ email, "*" ]},
        mind_map_id: App.currentMap,
        permissions: "w"
   }).fetch().length > 0;
  var tree = mindMapService.buildTree(this.data.id, this.data.data);
  update(tree);
  var rootNode = d3.selectAll('.node')[0].find(function (node) {
    return !node.__data__.position;
  });

  App.select(rootNode);
  Mindmaps.find().observeChanges(App.tracker);

  App.retainCollapsed();
  d3.select("#help-link").on('click', enableHelpLink);

  App.setMapsCount();
};
