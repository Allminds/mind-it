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
    console.log("EDIT :" + App.editable);
    if(App.editable) {
      return [{name: 'r' , value: 'Read Only'} , {name: 'w' , value: 'Read-Write'}];
    }
    else {
      return [{name: 'r' , value: 'Read Only'}];
    }
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
  }
});


/* share promt dropdown menu */
var dropdowns = $(".dropdown");

// Onclick on a dropdown, toggle visibility

dropdowns.find("dt").click(function(){
  console.log("1");
  dropdowns.find("dd ul").hide();
  $(this).next().children().toggle();
});

// Click handler for dropdown
dropdowns.find("dd ul li a").click(function(){
  var leSpan = $(this).parents(".dropdown").find("dt a span");
  console.log("2");
  // Remove selected class
  $(this).parents(".dropdown").find('dd a').each(function(){
    $(this).removeClass('selected');
  });

  // Update selected value
  leSpan.html($(this).html());

  // If back to default, remove selected class else addclass on right element
  if($(this).hasClass('default')){
    leSpan.removeClass('selected')
  }
  else{
    leSpan.addClass('selected');
    $(this).addClass('selected');
  }

  // Close dropdown
  $(this).parents("ul").hide();
});

// Close all dropdown onclick on another element
$(document).bind('click', function(e){
  if (! $(e.target).parents().hasClass("dropdown")) $(".dropdown dd ul").hide();
});