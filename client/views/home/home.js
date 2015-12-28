mindMapService = new MindMapService();


var XMLtoJSON = function(XMLcontent) {

},
getJSONnodeFromXML = function(XMLdom) {
    console.log(XMLdom);
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(XMLdom,"text/xml");
    var txt = '';
    // documentElement always represents the root node
    x = xmlDoc.documentElement.childNodes;
    for (i = 0; i < x.length ;i++) {
        txt += x[i].nodeName;// + ": " + x[i].childNodes[0].nodeValue + "<br>";
    }

    console.log(txt);
};

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

    if(!fileName.endsWith('.mm')) {
        alert('Not a valid File');
        return;
    }

    var files = evt.target.files;
    var file = files[0];
    var reader = new FileReader();
    reader.onload = function() {
        //var mindMapId = mindMapService.createRootNode('New Mindmap'),
        //link = '/create/' + mindMapId;
        getJSONnodeFromXML(this.result);

    }

    reader.readAsText(file);



  });

});



