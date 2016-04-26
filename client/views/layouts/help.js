Template.HelpImageButton.events({
    'click': function (e ,args) {
        e.preventDefault();
        $('#help-modal').modal('show');
    },
    'click #help_link_for_image': function (e ,args) {
        e.preventDefault();
        $('#help-modal').modal('show');
        }
});