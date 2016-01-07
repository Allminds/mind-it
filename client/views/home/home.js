mindMapService = App.MindMapService.getInstance();


Template.MyButton.events({
  'click #clickme': function () {
    // 1. cretate root node with defualt title
    var mindMapId = mindMapService.createRootNode('New Mindmap'),
      link = '/create/' + mindMapId;
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

  $('#fileID').change(function(evt){
    var fileName = this.value;

    if(fileName == "" || fileName === undefined) {
        return;
    }

    if(!fileName.endsWith('.mm')) {
        alert('Not a valid File');
        this.value = "";
        return;
    }

    var files = evt.target.files;
    var file = files[0];
    var reader = new FileReader();
    reader.onload = function() {

        var xmltext = this.result;
        var importParser = App.ImportParser;
        var mindMapId = importParser.createMindmapFromXML(xmltext, mindMapService),
        link = '/create/' + mindMapId;
        if(importParser.errorMessage) {
            alert(importParser.errorMessage);
        } else {
            Router.go(link);
        }
    };

    reader.readAsText(file);
    this.value = "";
  });

});



