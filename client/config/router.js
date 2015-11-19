/* global Router */
Router.configure({layoutTemplate: 'main'});
Router.route('/', {template: 'home'});
Router.route('/:_id', {
    name: "create",
    template: "create",
    waitOn: function () {
        return Meteor.subscribe("mindmap",this.params._id);
    },
    data: function () {
        return {id: this.params._id, data: mindMapService.findTree(this.params._id)};
    }
});