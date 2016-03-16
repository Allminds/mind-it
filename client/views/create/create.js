var mindMapService = App.MindMapService.getInstance();
App.setEventBinding = function () {
  if(!App.editable) {
    App.eventBinding.unBindAllEvents();
    console.log("App",App.editable);
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
  if(this.data.data.length == 0) {
    var message = "Invalid mindmap"
    Router.go("/404");

  }


  App.currentMap = this.data.id;
  var email = Meteor.user() ? Meteor.user().services.google.email : null;
  Meteor.call("isWritable", App.currentMap, email, function(error , value) {
    console.log("ABC",error,value);
    App.editable = value;
    console.log("renderd:",App.editable);
    //console.log("error:",error,value);
    App.setEventBinding();
    UI.insert(UI.render(Template.sharemap), document.getElementById('shareblock'));
  });
  var tree = mindMapService.buildTree(this.data.id, this.data.data);
  update(tree);
  var rootNode = d3.selectAll('.node')[0].find(function (node) {
    return !node.__data__.position;
  });

  App.select(rootNode);
  Mindmaps.find({$or:[{_id:this.data.id},{rootId:this.data.id}]}).observeChanges(App.tracker);

  App.retainCollapsed();
  d3.select("#help-link").on('click', enableHelpLink);

//  App.setMapsCount();
};
Template.readOnly.helpers({
  statusmsg : function(){
    console.log("in helpers:",App.editable);
    if(App.editable)
        return "";
    else
        return "Read-Only";
  }
});
//Template.readOnly.rendered = function rendered() {
//  console.log("in rendered",App.editable);
//
//  if (App.editable)
//    statusmsg("prajakta");
//  else
//    statusmsg("Read-only");
//
//
//}
//


