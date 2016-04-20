describe('text editor', function () {


    var createFixture = function(nodeText, rectWidth) {
        var fixture = '<div id="mindmap">' +
            '<svg xmlns="http://www.w3.org/2000/svg" version="1.2" width="28800" height="15560">' +
            '<g transform="translate(14400,7780)">' +
                    '<g transform="translate(0,0)" class="node level-0 selected">' +
                        '<ellipse rx="106.6875" ry="28.0675" class="root-ellipse"></ellipse>' +
                        '<rect x="-76.6875" y="-13" width="' + rectWidth + '" height="22.5"></rect>' +
                        '<text cols="60" rows="4" y="9"><tspan x="0" dy="0">' + nodeText + '</tspan></text>' +
                        '<circle class="indicator unfilled" r="0" cx="76.6875"></circle>' +
                    '</g>' +
            '</g>' +
            '</svg>' +
        '</div>';
        return fixture;
    };

    it("should create text box for root node", function () {
        var rectWidth = 150;
        var fixture = createFixture("New Mindmap", rectWidth);
        setFixtures(fixture);
        var elementToEdit = d3.select(".node.selected")[0][0];
        elementToEdit.__data__ = { isCollapsed: true };

        var editor = new Editor(elementToEdit, function() {});
        editor.createEditBox();

        expect(".edit-box").toExist();
    });

    it("should calculate text box width based on the rectangle width of element", function() {
        var rectWidth = 150;
        var fixture = createFixture("New mindmap", rectWidth);
        setFixtures(fixture);
        var elementToEdit = d3.select(".node.selected")[0][0];
        elementToEdit.__data__ = { isCollapsed: true };

        var editor = new Editor(elementToEdit, function() {});
        var textBoxWidth = editor.calculateTextBoxWidth();

        expect(textBoxWidth).toBe(rectWidth + App.Constants.DeltaTextBoxWidth);
    });


    it("should show text box of default size for element that does not have children and has rectangle width lesser than 100", function() {
        var rectWidth = 22;
        var fixture = createFixture("A", rectWidth);
        setFixtures(fixture);
        var elementToEdit = d3.select(".node.selected")[0][0];
        elementToEdit.__data__ = { childSubTree: [] };

        var editor = new Editor(elementToEdit, function() {});
        var textBoxWidth = editor.calculateTextBoxWidth();

        expect(textBoxWidth).toBe(App.Constants.MinTextBoxWidth);
    });

    it("should show text box of default size for element that does not have any visible children and has rectangle width lesser than 100", function() {
        var rectWidth = 20;
        var fixture = createFixture("A", rectWidth);
        setFixtures(fixture);
        var elementToEdit = d3.select(".node.selected")[0][0];
        elementToEdit.__data__ = { isCollapsed: true, childSubTree: [1, 2]};

        var editor = new Editor(elementToEdit, function() {});
        var textBoxWidth = editor.calculateTextBoxWidth();

        expect(textBoxWidth).toBe(App.Constants.MinTextBoxWidth);
    });

    it("should calculate appropriate adjustments if element is in left direction", function() {
        var rectWidth = 20;
        var fixture = createFixture('A', rectWidth);
        setFixtures(fixture);
        spyOn(App, "getDirection").and.returnValue("left");

        var elementToEdit = d3.select(".node.selected")[0][0];
        var editor = new Editor(elementToEdit, function() {});
        var adjustmentFactor = editor.calculateAdjustmentFactor(100);

        expect(adjustmentFactor).toBe(-90);
    });

    it("should calculate appropriate adjustments if element is in right direction", function() {
        var rectWidth = 20;
        var fixture = createFixture('A', rectWidth);
        setFixtures(fixture);
        spyOn(App, "getDirection").and.returnValue("right");

        var elementToEdit = d3.select(".node.selected")[0][0];
        var editor = new Editor(elementToEdit, function() {});
        var adjustmentFactor = editor.calculateAdjustmentFactor(100);

        expect(adjustmentFactor).toBe(-10);
    });

    it("should be able to reset itself", function() {
        var rectWidth = 150;
        var fixture = createFixture("New Mindmap", rectWidth);
        setFixtures(fixture);
        var elementToEdit = d3.select(".node.selected")[0][0];
        elementToEdit.__data__ = { isCollapsed: true };

        var editor = new Editor(elementToEdit, function() {});
        editor.createEditBox();
        expect(".edit-box").toExist();
        editor.resetEditor();
        expect(".edit-box").not.toExist();
    });

    xit("should notify handler on tab", function () {
        var obj = { handler: function (text) {} };
        var rectWidth = 150;
        var fixture = createFixture("New Mindmap", rectWidth);
        setFixtures(fixture);
        var elementToEdit = d3.select(".node.selected")[0][0];
        var nodeData = { isCollapsed: true, name: "New mindmap" };
        elementToEdit.__data__ = nodeData;
        spyOn(obj, "handler");
        event = document.createEvent("Events");
        event.initEvent("keydown", true, true);
        event.keyCode = App.KeyCodes.tab;

        var editor = new Editor(elementToEdit, obj.handler);
        var editBox = editor.createEditBox();
        editor.setupEditBox(editBox);
        editor.setupAttributes();
        document.getElementsByClassName("edit-box")[0].dispatchEvent(event);

        expect(obj.handler).toHaveBeenCalledWith(nodeData);
        expect(".edit-box").not.toExist();
    });

    it("should notify handler on enter", function () {
        var obj = { handler: function (text) {} };
        var rectWidth = 150;
        var fixture = createFixture("New Mindmap", rectWidth);
        setFixtures(fixture);
        var elementToEdit = d3.select(".node.selected")[0][0];
        var nodeData = { isCollapsed: true, name: "New mindmap" };
        elementToEdit.__data__ = nodeData;
        spyOn(obj, "handler");
        event = document.createEvent("Events");
        event.initEvent("keydown", true, true);
        event.keyCode = App.KeyCodes.enter;

        var editor = new Editor(elementToEdit, obj.handler);
        var editBox = editor.createEditBox();
        editor.setupEditBox(editBox);
        editor.setupAttributes();
        document.getElementsByClassName("edit-box")[0].dispatchEvent(event);

        expect(obj.handler).toHaveBeenCalledWith(nodeData);
        expect(".edit-box").not.toExist();
    });

    it("should not notify handler on escape", function () {
        var obj = { handler: function (text) {} };
        var rectWidth = 150;
        var fixture = createFixture("New Mindmap", rectWidth);
        setFixtures(fixture);
        var elementToEdit = d3.select(".node.selected")[0][0];
        var nodeData = { isCollapsed: true, name: "New mindmap" };
        elementToEdit.__data__ = nodeData;
        spyOn(obj, "handler");
        event = document.createEvent("Events");
        event.initEvent("keydown", true, true);
        event.keyCode = App.KeyCodes.escape;

        var editor = new Editor(elementToEdit, obj.handler);
        var editBox = editor.createEditBox();
        editor.setupEditBox(editBox);
        editor.setupAttributes();
        document.getElementsByClassName("edit-box")[0].dispatchEvent(event);

        expect(obj.handler).not.toHaveBeenCalled();
        expect(".edit-box").not.toExist();
    })

});
