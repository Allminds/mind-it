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
    console.log("checking");
    removeNodeSelection();
    $("#modal-text").focus();
    $("#modal-text").select();
  },
  'hidden.bs.modal #myModalHorizontal': function(event){
    restoreNodeSelection();
    console.log("checking2");
  }
});