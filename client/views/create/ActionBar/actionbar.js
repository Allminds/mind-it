Template.ActionBar.helpers({
    userimages: function(){
        var usersAvailable= Meteor.users.find().fetch();
        var Srcs= usersAvailable.map(function(x){
        if(x.status.online )
          {
        //console.log("status",x.status.online);
            return x.services.google.picture;
          }
        });
        var imageSrcs=Srcs.filter(function(y)
        {
            return typeof y === 'string';s
        });
        console.log("IMAGES: ",imageSrcs);
        return imageSrcs;
    }
});