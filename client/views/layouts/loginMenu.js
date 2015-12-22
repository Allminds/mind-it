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