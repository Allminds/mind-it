/**
 * Created by mahadevvyavahare on 13/01/16.
 */
Template.Export.events({

    'click': function (e ,args) {
        e.preventDefault();
        App.eventBinding.export();
    }

});