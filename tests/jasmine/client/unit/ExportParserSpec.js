describe('App.exportParser', function () {
    it('should call Mindmaps.findOne() for getting rootnode data', function () {
        spyOn(Mindmaps, 'findOne').and.returnValue({_id: "qRbTTPjHzfoGAmW3b", name: "testtxt", left: [], right: []});
        var returnedString = App.JSONConverter();
        var expectedString = "<map version=\"1.0.1\">\n<node ID=\"qRbTTPjHzfoGAmW3b\" TEXT=\"testtxt\"></node>\n</map>";

        expect(Mindmaps.findOne).toHaveBeenCalled();
        expect(returnedString).toBe(expectedString);
    });

    it('should call childrenRecurse in JSONConverter method if any of left/right of root has at least one child', function () {
        spyOn(Mindmaps, 'findOne').and.returnValue({_id: "qRbTTPjHzfoGAmW3b", name: "testtxt", left: [], right: []});
        spyOn(App.exportParser, "children_recurse");
        App.exportParser.children_recurse("qRbTTPjHzfoGAmW3b");

        expect(App.exportParser.children_recurse).toHaveBeenCalled();
    });

    it('should ensure root node text have special character like less than sign', function () {
        spyOn(Mindmaps, 'findOne').and.returnValue({
            _id: "rootNodeId",
            name: "root node text with < symbol",
            left: [],
            right: []
        });

        var expectedString = "<map version=\"1.0.1\">\n<node ID=\"rootNodeId\" TEXT=\"root node text with &lt; symbol\"></node>\n</map>";
        var actualString = App.JSONConverter();

        expect(expectedString).toBe(actualString);
    });

    it('should ensure left child node text have special character like greater than sign', function () {
        var rootNode = {
            _id: "rootNodeId",
            name: "root node text ",
            left: ["leftNodeId"],
            right: []
        };

        var leftNode = {
            _id: "leftNodeId",
            name: "left node text with > sign",
            childSubTree: []
        };


        spyOn(Mindmaps, 'findOne').and.returnValues(rootNode,leftNode,leftNode);
        spyOn(console,'log');
        var expectedString = "<map version=\"1.0.1\">\n<node ID=\"rootNodeId\" TEXT=\"root node text \"><node ID=\"leftNodeId\" TEXT=\"left node text with &gt; sign\" POSITION=\"left\"></node>\n</node>\n</map>";
        var actualString = App.JSONConverter();
        expect(console.log).toHaveBeenCalledWith(leftNode);
        expect(expectedString).toBe(actualString);
    });

    describe('should ensure parseSymbols functionality', function () {
        it('should ensure node text can have special character like less than sign', function () {
            var nodeText = "<";

            var expectedValue = "&lt;";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(expectedValue).toBe(actualValue);
        });

        it('should ensure node text can have special character like greater than sign', function () {
            var nodeText = ">";

            var expectedValue = "&gt;";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(expectedValue).toBe(actualValue);
        });

        it('should ensure node text can have special character like Quote sign', function () {
            var nodeText = "\"";

            var expectedValue = "&quot;";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(expectedValue).toBe(actualValue);
        });

        it('should ensure node text can have special character like apostrophe sign', function () {
            var nodeText = "'";

            var expectedValue = "&apos;";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(expectedValue).toBe(actualValue);
        });

        it('should ensure node text can have special character like ampersand sign', function () {
            var nodeText = "&";

            var expectedValue = "&amp;";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(expectedValue).toBe(actualValue);
        });

        it('should ensure node text can have multiple special character like ampersand sign', function () {
            var nodeText = "&&";

            var expectedValue = "&amp;&amp;";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(expectedValue).toBe(actualValue);
        });

        it('should ensure node text is undefined', function () {
            var expectedValue = "";
            var actualValue = App.exportParser.parseSymbols();

            expect(expectedValue).toBe(actualValue);
        });

        it('should ensure node text is null', function () {
            var nodeText = null;

            var expectedValue = "";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(expectedValue).toBe(actualValue);
        });

        it('should ensure node text is empty string', function () {
            var nodeText = "";

            var expectedValue = "";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(expectedValue).toBe(actualValue);
        });

        it('should ensure node text is white space', function () {
            var nodeText = " ";

            var expectedValue = " ";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(expectedValue).toBe(actualValue);
        });

        it('should ensure node text does not have any special character', function () {
            var nodeText = "no special character";

            var expectedValue = "no special character";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(expectedValue).toBe(actualValue);
        });
    });

    describe('should ensure nodeString functionality', function () {
        it('should return node string for a node with position missing', function () {
            var nodeId = "nodeId";
            var nodeText = "nodeText";

            var expectedValue = "<node TEXT=\"nodeText\">";
            var actualValue = App.exportParser.nodeString(nodeId, nodeText);

            expect(expectedValue).toBe(actualValue);
        });

        it('should return node string for a node with position as left', function () {
            var nodeId = "nodeId";
            var nodeText = "nodeText";
            var nodePosition = App.exportParser.positions.LEFT;

            var expectedValue = "<node TEXT=\"nodeText\" POSITION=\"left\">";
            var actualValue = App.exportParser.nodeString(nodeId, nodeText, nodePosition);

            expect(expectedValue).toBe(actualValue);
        });

        it('should return node string for a node with position as right', function () {
            var nodeId = "nodeId";
            var nodeText = "nodeText";
            var nodePosition = App.exportParser.positions.RIGHT;

            var expectedValue = "<node TEXT=\"nodeText\" POSITION=\"right\">";
            var actualValue = App.exportParser.nodeString(nodeId, nodeText, nodePosition);

            expect(expectedValue).toBe(actualValue);
        });

        it('should return node string for a node with position as null', function () {
            var nodeId = "nodeId";
            var nodeText = "nodeText";
            var nodePosition = null;

            var expectedValue = "<node TEXT=\"nodeText\">";
            var actualValue = App.exportParser.nodeString(nodeId, nodeText, nodePosition);

            expect(expectedValue).toBe(actualValue);
        });

        it('should return node string for a node with position as empty string', function () {
            var nodeId = "nodeId";
            var nodeText = "nodeText";
            var nodePosition = "";

            var expectedValue = "<node TEXT=\"nodeText\">";
            var actualValue = App.exportParser.nodeString(nodeId, nodeText, nodePosition);

            expect(expectedValue).toBe(actualValue);
        });

        it('should return node string for a node with position as non empty string', function () {
            var nodeId = "nodeId";
            var nodeText = "nodeText";
            var nodePosition = "nodePosition";

            var expectedValue = "<node TEXT=\"nodeText\" POSITION=\"nodePosition\">";
            var actualValue = App.exportParser.nodeString(nodeId, nodeText, nodePosition);

            expect(expectedValue).toBe(actualValue);
        });

        it('should return node string for a node with position as whitespace', function () {
            var nodeId = "nodeId";
            var nodeText = "nodeText";
            var nodePosition = " ";

            var expectedValue = "<node TEXT=\"nodeText\" POSITION=\" \">";
            var actualValue = App.exportParser.nodeString(nodeId, nodeText, nodePosition);

            expect(expectedValue).toBe(actualValue);
        });
    });
});