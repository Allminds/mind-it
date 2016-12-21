mindMapService = App.MindMapService.getInstance();

Template.CreateMindmapButton.events({
    'click #createMindmap': function () {
        // 1. cretate root node with defualt title
        var user = Meteor.user() ? Meteor.user().services.google.email : "*";
        var mindMapId = mindMapService.createRootNode('New Mindmap', user),
            link = '/create/' + mindMapId;
        if (Meteor.user()) {
            Meteor.call("addMapToUser", user, mindMapId, "o");
            Meteor.call("addMaptoMindmapMetadata", user, mindMapId);
        }
        else {
            Meteor.call("addMaptoMindmapMetadata", "*", mindMapId);
        }

        // 2. Go to canvas root note
        Router.go(link);
        clearNodeCollapsedState();
    }
});

Template.CreateMindmapButton.onRendered(function () {

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

});



