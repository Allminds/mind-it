Template.ActionBar.helpers({
    userimages: function(){
        var usersAvailable= Meteor.users.find().fetch();
        var imageSrcs= users.map(function(){
            return usersAvailable.services.google.picture;
        });
        console.log("IMAGES: ",imageSrcs);
        return imageSrcs;
    }
});