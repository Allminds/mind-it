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
  name: function () {
    return Meteor.user().services.google.given_name;
  }
});

Template.UserPictureInfo.helpers({
  name : function(){
    if(Meteor.user())
    return Meteor.user().services.google.picture;
    else
      return "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg "
  }
});

