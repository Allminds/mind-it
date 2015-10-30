/* global Router */
var mindMapService = new MindMapService();
Router.configure({layoutTemplate: 'main'});
Router.route('/', {template: 'home'});
Router.route('/create/:_id', {
    name: "create",
    template: "create",
    waitOn: function () {
        return Meteor.subscribe("mindmaps");
    },
    data: function () {
        return mindMapService.findTree(this.params._id);
    }
});