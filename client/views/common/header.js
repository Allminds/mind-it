Template.TopBar.events({
    'click [data-action=login]': function (e, args) {
        e.preventDefault();
        Meteor.loginWithGoogle();
    },
    'click [data-action=logout]': function (e, args) {
        e.preventDefault();
        Meteor.logout(function (err) {
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

        var currentUser = Meteor.user();

        if (currentUser) {
            var doc = MindmapMetadata.findOne();
            var onlineUsers = doc.onlineUsers;
            onlineUsers = onlineUsers.filter(function (user) {
                return user.email != currentUser.services.google.email;
            });

            MindmapMetadata.update({_id: doc._id}, {$set: {onlineUsers: onlineUsers}});
        }

        Router.go("/");
        window.scrollTo(0, 0);
    }
});

//hiding logout option if clicked anywhere other than that
window.onclick = function (event) {
    if (!event.target.matches('.dropButtons')) {
        var dropDowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropDowns.length; i++) {
            var openDropdown = dropDowns[i];

            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
};

Template.TopBar.helpers({
    topbarTagID: function (id) {
        return id;
    },

    name: function () {
        if (Meteor.user().services !== undefined) {
            return Meteor.user().services.google.given_name;
        }
    },

    picture: function () {
        if (Meteor.user().services !== undefined) {
            return Meteor.user().services.google.picture;
        }
    },
    hideInEmbedMode: function () {
        var location = window.location.href;
        if (location.indexOf("/embed/") == -1) {
            return true;
        } else {
            return false;
        }
    }
});

