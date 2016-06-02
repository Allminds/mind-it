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

    isWriteUser: function () {
        if (App.editable) {
            return true;
        }
        else {
            return false;
        }
    },
    isPublicMindmap: function () {
        return App.isPublicMindMap;
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
    App.clearAllSelected();
    d3.select('._selected').classed("softSelected", true);
    d3.select('._selected').classed("_selected", false);
};

Template.ModalPopUp.events({
    'shown.bs.modal #help-modal': function (event) {
        App.eventBinding.unbindEditableEvents();
        App.modal_shown = true;
        removeNodeSelection();
    },
    'hidden.bs.modal #help-modal': function (event) {
        App.eventBinding.bindAllEvents();
        App.modal_shown = false;
        restoreNodeSelection();
    },

    'shown.bs.modal #share-modal': function (event) {
        $("#linkTextBox").focus();
        App.modal_shown = true;
        removeNodeSelection();
    },
    'hidden.bs.modal #share-modal': function (event) {
        App.modal_shown = false;
        restoreNodeSelection();
    },
    'shown.bs.modal #myModalHorizontal': function (event) {
        removeNodeSelection();
        $("#modal-text").focus();
        $("#modal-text").select();
    },
    'hidden.bs.modal #myModalHorizontal': function (event) {
        restoreNodeSelection();
    },
    'click #sharableLinkButton': function (e, args) {
        e.preventDefault();
        $("div#userOptions").toggle();
    },
    'click #sharedLinkr': function () {
        var text = document.getElementById("sharedLinkr");
        var textBox = document.getElementById("linkTextBox");
        var button = document.getElementById("sharableLinkButtonMessage");
        textBox.value = text;

        Meteor.call("getSharableReadLink", App.currentMap, function (error, value) {
            textBox.value = App.getSharableLink() + value;
            button.innerHTML = "read";
        });
    },
    'click #sharedLinkw': function () {
        var text = document.getElementById("sharedLinkw");

        var textBox = document.getElementById("linkTextBox");
        textBox.value = text;

        var button = document.getElementById("sharableLinkButtonMessage");

        Meteor.call("getSharableWriteLink", App.currentMap, function (error, value) {
            textBox.value = App.getSharableLink() + value;
            button.innerHTML = "read and write";
        });
    },
    'click [data-action=link]': function () {
        this.select();
        this.focus();
    },

    'click #copySharableLink': function (e, args) {
        e.preventDefault();

        var code = document.getElementById("linkTextBox");
        code.select();

        try {
            document.execCommand('copy');
        } catch (err) {
            console.log('Oops, unable to copy');
        }
    }
});


Template.ModalBody.rendered = function rendered() {
    var textBox = document.getElementById("linkTextBox");

    if (Boolean(textBox)) {
        textBox.disabled = false;

        if (App.isPublicMindMap) {
            Meteor.call("getSharableWriteLink", App.currentMap, function (error, value) {
                textBox.value = App.getSharableLink() + value;
            });
        }
        else {
            Meteor.call("getSharableReadLink", App.currentMap, function (error, value) {
                textBox.value = App.getSharableLink() + value;
            });
        }
    }

    if (!Meteor.settings.public.shareThroughEmail) {
        var link = document.getElementById("LinkTab");
        if (Boolean(link)) {
            link.style.width = '50%';
        }

        var code = document.getElementById("embedCodeTab");
        if (Boolean(code)) {
            code.style.width = '50%';
        }

        $('#emailTab').remove();
    }
    else {
        var link = document.getElementById("LinkTab");
        if (Boolean(link)) {
            link.style.width = '33%';
        }

        var code = document.getElementById("embedCodeTab");
        if (Boolean(code)) {
            code.style.width = '34%';
        }

        var mail = document.getElementById("emailTab");
        if (Boolean(mail)) {
            mail.style.width = "33%";
        }
    }
};

App.getSharableLink = function getSharableLinkValue() {
    return App.Constants.HttpProtocol + "://" + location.hostname + (location.port ? ':' + location.port : '') + "/";
};
