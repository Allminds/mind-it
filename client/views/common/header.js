Template.TopBar.events({
  'click [data-action=login]': function (e, args) {
    e.preventDefault();
    Meteor.loginWithGoogle();
  },

  'click [data-action=logout]': function (e, args) {
    e.preventDefault();
    Meteor.logout();
    window.location = "/";
  },
  'click [data-action=toggleOptions]': function (e, args) {
    e.preventDefault();
    $("div#userOptions").toggle();
  }

});

Template.TopBar.helpers({
  topbarTagID: function (id) {
    return id;
  },

  name: function () {
    return Meteor.user().services.google.given_name;
  },

  picture: function(){
    if(Meteor.user())
      return Meteor.user().services.google.picture;
  }
});