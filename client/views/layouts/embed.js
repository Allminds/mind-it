Template.Embed.rendered= function(){
    var textBox = document.getElementById("embedCodeTextBox");
    Meteor.call("getSharableReadLink",App.currentMap,function (error, value){
        var link = value;
        link = link.replace("sharedLink","embed");
        var url = "http://"+location.hostname + (location.port ? ':' + location.port : '') + "/" + link;
        var code =  "<iframe width=" +"\"854\"" + " height= "+ "\"480\" src=\""+url+"\" frameborder= \"0\" allowfullscreen></iframe>";
        console.log(code);
        textBox.value = code;
    })
    //var code= App.getEmbedCode();
    //console.log("code",code);
    //textBox.value = code;
}