Template.login_loading_page.events({
    'click [data-action=login]': function (e, args) {
        e.preventDefault();
        Meteor.loginWithGoogle();
    }
});
Template.login_loading_page.rendered = function rendered() {
    Meteor.loginWithGoogle();
}