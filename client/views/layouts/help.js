Template.HelpImageButton.events({
    'click #helpImageButton': function (e ,args) {
        //e.preventDefault();
        //App.modal_shown = true;
        $('#help-modal').modal('show');
    },
    'click #help_link_for_image': function (e ,args) {
        e.preventDefault();
        //App.modal_shown = true;
        $('#help-modal').modal('show');
        }
});

Template.Help.events({
   'click #help-link': function(e, args){
       e.preventDefault();
       $('#help-modal').modal('show');

   }
});
