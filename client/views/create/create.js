var mindMapService = App.MindMapService.getInstance();

App.setEventBinding = function () {
    if (!App.editable) {
        App.eventBinding.unbindEditableEvents();
    }
};

$(window).on('popstate', function () {
    if (App.modal_shown == true) {
        App.modal_shown = false;
        location.reload(true);
    }
});

var update = function (data) {
    window.data = data;
    d3.select('#mindmap svg').datum(data).call(App.chart);

    App.getChartInFocus();

    $(window).resize(function () {
        App.getChartInFocus();
    });
};

Template.create.rendered = function rendered() {
    if (this.data.data.length == 0) {
        Router.go("/404");
    }

    App.currentMap = this.data.id;
    var email;

    if (App.isEmbedUrl()) {
        email = "*";
    }
    else {
        email = Meteor.user() ? Meteor.user().services.google.email : null;
    }

    if (App.isSharedMindmap != App.Constants.Mode.WRITE) {
        Meteor.call("isWritable", App.currentMap, email, function (error, value) {
            App.editable = value;
            App.setEventBinding();
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
    MindmapMetadata.find().observeChanges(App.cursorTracker);

    App.presentation.collapseAllMindmap();
    
};

Template.readOnly.helpers({
    statusmsg: function () {
        if (App.editable)
            return "";
        else
            return "View Only";
    }
});

