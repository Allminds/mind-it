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
  },
    'click [data-action=redirectToHome]': function (e, args) {
        e.preventDefault();
        e.stopPropagation();

        var doc =  MindmapMetadata.findOne();
        var onlineUsers = doc.onlineUsers;

        var currentUser = Meteor.user();
        onlineUsers = onlineUsers.filter(function(user) {
            return user.email != currentUser.services.google.email;
        });

        MindmapMetadata.update({_id:doc._id} , {$set: {onlineUsers: onlineUsers}});
        Router.go("/");
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
  },
  hideInEmbedMode:function () {
    var location = window.location.href;
    if(location.indexOf("/embed/") == -1){
      return true;
    }else {
      return false;
    }
  }
});

