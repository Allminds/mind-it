Template.TopBar.events({
  'click [data-action=login]': function (e, args) {
    e.preventDefault();
    Meteor.loginWithGoogle();
  },

  'click [data-action=logout]': function (e, args) {
    e.preventDefault();
    Meteor.logout(function(err) {
      location.reload(true);
      Router.go("/")
    })
  },
  'click [data-action=toggleOptions]': function (e, args) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById("myDropdown").classList.toggle("show");
    //$("div#userOptions").toggle();
  }
});
//hiding logout option if clicked anywhere other than that
window.onclick = function (event) {
  if (!event.target.matches('.dropButtons')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

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

