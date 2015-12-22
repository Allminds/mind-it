Template.LoginMenu.events({
    'click [data-action=login]': function (e, args) {
        e.preventDefault();
        Meteor.loginWithGoogle();
    },

    'click [data-action=logout]': function (e, args) {
        e.preventDefault();
        Meteor.logout();
    }
});

Template.UserNameInfo.helpers({
    name: function() {
      return  Meteor.user().services.google.name;
    }
})