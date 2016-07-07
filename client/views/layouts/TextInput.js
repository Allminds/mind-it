Template.TextInputImageButton.events({
    'click': function (e) {
        onModalShow();
        clickEventHandler(e);
        tabEventHandler(e);
        saveButtonClickHandler();
        onModalHide();
    }
});

var clickEventHandler = function (e) {
    e.preventDefault();
    $('#myModalHorizontal').modal('show');
};

var getSelectedNode = function () {
    return d3.selectAll(".softSelected")[0][0].__data__;
};

var getModalTextValue = function () {
    return document.getElementById('modal-text').value;
};

var setModalTextValueToEmptyString = function () {
    document.getElementById('modal-text').value = '';
};

var saveButtonClickHandler = function () {
    $("#modal-save").click(function () {
        var inputString = getModalTextValue();
        var inputRootNode = App.MindmapTextParser.parse(inputString);

        if (Boolean(inputRootNode)) {
            var currentNode = getSelectedNode();
            App.NodeFormatter.format(currentNode, inputRootNode);
        }

        $('#myModalHorizontal').modal('hide');
    });
};

var tabEventHandler = function () {
    $("#modal-text").keydown(function (e) {
        if (e.keyCode === 9) { // tab was pressed
            // get caret position/selection
            var start = this.selectionStart;
            end = this.selectionEnd;
            var $this = $(this);
            // set textarea value to: text before caret + tab + text after caret
            $this.val($this.val().substring(0, start)
                + "\t"
                + $this.val().substring(end));
            // put caret at right position again
            this.selectionStart = this.selectionEnd = start + 1;
            // prevent the focus lose
            return false;
        }
    });
};

var onModalShow = function () {
    $('#myModalHorizontal').on('show.bs.modal', function () {
        setModalTextValueToEmptyString();
    });
};

var unHookKeyDownEvent = function () {
    $('#modal-text').off('keydown');
};

var unHookClickEvent = function () {
    $('#modal-save').off('click');
};
var onModalHide = function () {
    $('#myModalHorizontal').on('hide.bs.modal', function () {
        unHookKeyDownEvent();
        unHookClickEvent();
    });
};


