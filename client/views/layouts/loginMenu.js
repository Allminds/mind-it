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

Template.UserInfo.helpers({
    name: function () {
        return Meteor.user().services.google.given_name;
    },
    picture: function () {
        if (Meteor.user()) {
            return Meteor.user().services.google.picture;
        }
    },
    check: function () {
        if (Meteor.user()) {
        }
    }
});
