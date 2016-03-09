var mindMapService = App.MindMapService.getInstance();

App.setEventBinding = function () {
  if(!App.editable) {
    App.eventBinding.unBindAllEvents();
  }
}

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
  'click #Share_btn': function () {
    $('#share-modal').modal('show');

  }
});

Template.create.rendered = function rendered() {
  if(this.data.data.length == 0)
    Router.go('/404');

  App.currentMap = this.data.id;
  var email = Meteor.user() ? Meteor.user().services.google.email : null;
  Meteor.call("isWritable", App.currentMap, email, function(error, value) {
    App.editable = value;
    App.setEventBinding();
    UI.insert(UI.render(Template.sharemap), document.getElementById('shareblock'));
  });
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

  //$("#sh").click(function () {
  //  $('#share-modal').modal('show');
  //});
};





