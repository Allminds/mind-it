Template.ModalHeader.helpers({
  modalTagID: function (id) {
    return id;
  }
});

Template.ModalBody.helpers({
  modalBodyImageSrc: function (path) {
    return path;
  },
  isModalForImage: function (path) {
    return path ? true : false;
  },

  permissions : function() {
    if(App.editable) {
      return [{name: 'r' , value: 'Read Only'} , {name: 'w' , value: 'Read-Write'}];
    }
    else {
      return [{name: 'r' , value: 'Read Only'}];
    }
  },

  isWriteUser : function() {
    if(App.editable){
      return true;
    }
    else
      return false;
  }
});


Template.ModalBody.events({
  'click [data-action=share]': function (e, args) {
    var permission = d3.select("#permission")[0][0].value;
    var eMail = d3.select("#e_mail")[0][0].value;
    //var mindMapId = Mindmaps.findOne({"position": null })._id;
    var mindMapId=d3.select(".node.level-0")[0][0].__data__._id;
    Meteor.call("addMapToUser", eMail, mindMapId, permission);
  }


});

Template.ModalPopUp.helpers({
  modalTagID: function (id) {
    return id;
  },
  style: function (isFullWidth) {
    return isFullWidth == "true" ? "modal-dialog full-width" : "modal-dialog";
  }
});

var removeNodeSelection = function () {
  d3.select('.selected').classed("_selected", true);
  d3.select('.selected').classed("selected", false);
};

var restoreNodeSelection = function () {
  App.deselectNode();
  d3.select('._selected').classed("selected", true);
  d3.select('._selected').classed("_selected", false);
};

Template.ModalPopUp.events({
  'shown.bs.modal #help-modal': function(event){
    removeNodeSelection();
  },
  'hidden.bs.modal #help-modal': function(event){
    restoreNodeSelection();
  },
  'shown.bs.modal #myModalHorizontal': function(event){
    removeNodeSelection();
    $("#modal-text").focus();
    $("#modal-text").select();
  },
  'hidden.bs.modal #myModalHorizontal': function(event){
    restoreNodeSelection();
  },
  'click #sharableLinkButton': function (e, args) {
    e.preventDefault();
    $("div#userOptions").toggle();
  },
  'click #sharedLinkr': function () {
    var text= document.getElementById("sharedLinkr");
    var textBox= document.getElementById("linkTextBox");
    var button = document.getElementById("sharableLinkButtonMessage");
    textBox.value = text;


    Meteor.call("getSharableReadLink", App.currentMap, function (error, value) {
      textBox.value = value;
      button.innerHTML= "read";
    });


  },
  'click #sharedLinkw': function () {
    var text= document.getElementById("sharedLinkw");
    var textBox= document.getElementById("linkTextBox");
    textBox.value = text;
    var button = document.getElementById("sharableLinkButtonMessage");
    console.log("button",button.innerHTML);
    if(Meteor.user()){
      Meteor.call("getSharableWriteLink", App.currentMap, function (error, value) {
        textBox.value=value;
        button.innerHTML= "read and write";
      });
    }

  },
  'click [data-action=link]' : function(){
     this.select();
    this.focus();
  },
  'click #secondTab' : function(){
    var temp = document.getElementById("linkToShow");
    temp.className="hidden";
  },
  'click #firstTab' : function(){
    var temp = document.getElementById("linkToShow");
    temp.className="";
  },



});


Template.ModalBody.rendered = function rendered(){

  var textBox= document.getElementById("linkTextBox");
  textBox.disabled = false;
  textBox.value = "welcome";
  Meteor.call("getSharableReadLink", App.currentMap, function (error, value) {
    textBox.value = value;
  });

}

function selectText()
{ var id = "e_mail";
  console.log("in text box");
  document.getElementById(id).focus();
  document.getElementById(id).select();
}