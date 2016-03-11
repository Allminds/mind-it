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
    error_msg: function() {
        console.log("helper:" + App.ERROR_MESSAGE)
        return App.ERROR_MESSAGE
    }
})
