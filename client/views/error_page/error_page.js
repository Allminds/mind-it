var enableHelpLink = function () {
    $('#help-modal').modal('show');
};

Template.error_page.rendered = function rendered() {
    d3.select("#help-link").on('click', enableHelpLink);
};
window.addEventListener("hashchange", function(e) {
    Router.go("/");
})

/*
window.onhashchange = function() {
    Router.go("/");
}*/
