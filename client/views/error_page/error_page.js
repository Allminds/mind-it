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
            return "";
        }
        else{
            return "You need permission ";
        }
    },
    error_msg: function() {
        if(App.ERROR_MESSAGE == "Invalid Mindmap") {
            return "Looks like you were led astray with an incorrect URL.";
        }
        else{
            return "Seems that the owner of this mindmap hasn't shared this mindmap with you ";
        }

    }
})
