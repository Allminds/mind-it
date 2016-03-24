Template.FeedbackImageButton.events({
    'click': function (e ,args) {
        e.preventDefault();
        var win = window.open('http://goo.gl/forms/PYS3mnP8un', '_blank');
        win.focus();
    }
});