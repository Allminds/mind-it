var mindMapService = App.MindMapService.getInstance();

App.setEventBinding = function () {
    if (!App.editable) {
        App.eventBinding.unBindAllEvents();
    }
};

var update = function (data) {
    window.data = data;
    d3.select('#mindmap svg')
        .datum(data)
        .call(App.chart);
    App.chart.update();
    App.getChartInFocus();
    $(window).resize(function () {
        App.getChartInFocus();
    });

};

var enableHelpLink = function () {
    $('#help-modal').modal('show');
};

//Template.create.events({
//    'click #Share_btn': function () {
//        $('#share-modal').modal('show');
//
//    },
//
//    'click #getSharableWriteLink': function () {
//
//        Meteor.call("getSharableWriteLink", App.currentMap, function (error, value) {
//            var msg = value;
//            alert(msg);
//        });
//
//
//    },
//    'click #getSharableReadLink': function () {
//        Meteor.call("getSharableReadLink", App.currentMap, function (error, value) {
//            var msg = value;
//            alert(msg);
//        });
//    }
//});

//Template.create.helpers({
//    shareReadLink: function () {
//        if (App.isSharedMindmap == App.Constants.Mode.READ) {
//            return "";
//        }
//
//
//        else
//            return "Share read only link";
//    },
//    shareWriteLink: function () {
//        if (App.isSharedMindmap == App.Constants.Mode.WRITE) {
//            return "";
//        }
//
//        else
//            return "Share read-write link";
//    }
//
//})

Template.create.rendered = function rendered() {
    if (this.data.data.length == 0) {
        var message = "Invalid mindmap";
        Router.go("/404");
    }

    App.currentMap = this.data.id;
    var email = Meteor.user() ? Meteor.user().services.google.email : null;
    if (App.isSharedMindmap != App.Constants.Mode.WRITE) {
        Meteor.call("isWritable", App.currentMap, email, function (error, value) {
            App.editable = value;
            App.setEventBinding();
            //  UI.insert(UI.render(Template.sharemap), document.getElementById('shareblock'));
        });

    }
    else {
        App.editable = true;
    }
    var tree = mindMapService.buildTree(this.data.id, this.data.data);
    update(tree);
    var rootNode = d3.selectAll('.node')[0].find(function (node) {
        return !node.__data__.position;
    });

    App.select(rootNode);
    Mindmaps.find({$or: [{_id: this.data.id}, {rootId: this.data.id}]}).observeChanges(App.tracker);
    console.log("start rendering...");

    App.retainCollapsed();
    d3.select("#help-link").on('click', enableHelpLink);
    Meteor.call("updateUserStatus", email, App.currentMap, App.currentMap);
//  App.setMapsCount();
};
Template.readOnly.helpers({
    statusmsg: function () {
        if (App.editable)
            return "";
        else
            return "View Only";
    }
});

