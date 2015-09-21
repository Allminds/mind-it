/* global Template */
/* global SessionCounter */
/* global Meteor */
if (Meteor.isClient) {
  // counter starts at 0

  Template.hello.helpers({
    counter: function () {
      return SessionCounter.getCount();
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      SessionCounter.incrementCount();
      
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
