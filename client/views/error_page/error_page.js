var enableHelpLink = function () {
    $('#help-modal').modal('show');
};

Template.error_page.rendered = function rendered() {
    d3.select("#help-link").on('click', enableHelpLink);
};

Template.error_page.events({
    'click [data-action=redirectToHome]': function(e, args) {
        e.preventDefault();
        Router.go("/");
    }

});

Template.error_page.helpers({
    error_title : function(){
        if(App.ERROR_MESSAGE == "Invalid Mindmap") {
            return "Invalid Mindmap";
        }
        if(App.ERROR_MESSAGE == "Inaccessible Mindmap"){
            return "You need permission ";
        }
        if(App.ERROR_MESSAGE == "Page Not Found"){
            return "Sorry, this page isn't available";
        }
    },
    error_msg: function() {
        if(App.ERROR_MESSAGE == "Page Not Found") {
            return "The link you followed may be broken, or the page may have been removed."
        }
        if(App.ERROR_MESSAGE == "Invalid Mindmap") {
            return "The link you followed may be broken";
        }
        if(App.ERROR_MESSAGE == "Inaccessible Mindmap"){
            return "Seems that the owner of this mindmap hasn't shared this mindmap with you ";
        }

    }
})
