mindMapService = App.MindMapService.getInstance();

function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
function getSharableLink(){


    var date = ""+new Date().getTime();
    var  url=date.substring(0,date.length/2);

    url += randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    url += date.substring(date.length/2+1,date.length-1);
    url += randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');


    return url;
}


Template.MyButton.events({
    'click #clickme': function () {
        // 1. cretate root node with defualt title
        var user = Meteor.user() ? Meteor.user().services.google.email : "*";
        var mindMapId = mindMapService.createRootNode('New Mindmap', user),
            link = '/create/' + mindMapId;
        var sharedReadLink = "www.mindit.xyz/sharedLink/"+getSharableLink();
        var sharedWriteLink = "www.mindit.xyz/sharedLink/"+getSharableLink();
        if (Meteor.user()) {
            Meteor.call("addMapToUser", user, mindMapId, "o");
            Meteor.call("addMaptoMindmapMetadata", user, mindMapId, sharedReadLink,sharedWriteLink );
        }
        else {
            Meteor.call("addMaptoMindmapMetadata", "*", mindMapId, sharedReadLink,sharedWriteLink);
        }

        // 2. Go to canvas root note
        Router.go(link);
        clearNodeCollapsedState();
    }
});

Template.home.onRendered(function () {
    $('.home-bg').slick({
        dots: true,
        infinite: true,
        speed: 300,
        slidesToShow: 1
    });

    $("#about-us").click(function () {
        $('#aboutUs-modal').modal('show');
    });

    $('#fileID').change(function (evt) {
        var fileName = this.value;

        if (fileName == "" || fileName === undefined) {
            return;
        }

        if (!fileName.endsWith('.mm')) {
            alert('Not a valid File');
            this.value = "";
            return;
        }

        var files = evt.target.files;
        var file = files[0];
        var reader = new FileReader();
        reader.onload = function () {

            var xmltext = this.result,
                importParser = App.ImportParser,
                mindMapId = importParser.createMindmapFromXML(xmltext, mindMapService),
                link = mindMapService.isDownTime() ? '/createMindmap/' + mindMapId : '/create/' + mindMapId;
            if (importParser.errorMessage) {
                alert(importParser.errorMessage);
            } else {
                Router.go(link);
            }
        };

        reader.readAsText(file);
        this.value = "";
    });

});



