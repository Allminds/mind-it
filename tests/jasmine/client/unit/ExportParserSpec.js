describe('App.exportParser', function () {
    it('should ensure root node text have special character like less than sign', function () {
        spyOn(App.presentation, 'getRootNode').and.returnValue({
            _id: "rootNodeId",
            name: "root node text with < symbol",
            left: [],
            right: []
        });

        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text with &lt; symbol\"></node>\n</map>";
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

        spyOn(App.presentation, 'getRootNode').and.returnValues(rootNode);
        spyOn(Mindmaps, 'findOne').and.returnValues(leftNode);

        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text \"><node TEXT=\"left node text with &gt; sign\" POSITION=\"left\"></node>\n</node>\n</map>";
        var actualString = App.JSONConverter();
        expect(expectedString).toBe(actualString);
    });

    it('should ensure right child node text have special character like ampersand sign', function () {
        var rootNode = {
            _id: "rootNodeId",
            name: "root node text ",
            left: [],
            right: ["rightNodeId"]
        };

        var rightNode = {
            _id: "rightNodeId",
            name: "right node text with & sign",
            childSubTree: []
        };

        spyOn(App.presentation, 'getRootNode').and.returnValues(rootNode);
        spyOn(Mindmaps, 'findOne').and.returnValues(rightNode);

        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text \"><node TEXT=\"right node text with &amp; sign\" POSITION=\"right\"></node>\n</node>\n</map>";
        var actualString = App.JSONConverter();
        expect(expectedString).toBe(actualString);
    });

    it('should ensure left grand child node text have special character like double quote sign', function () {
        var rootNode = {
            _id: "rootNodeId",
            name: "root node text ",
            left: ["leftNodeId"],
            right: []
        };

        var leftNode = {
            _id: "leftNodeId",
            name: "left node text",
            childSubTree: ["leftNodeChildId"]
        };

        var leftNodeChild = {
            _id: "leftNodeChildId",
            name: "left node child text with \" sign",
            childSubTree: []
        };

        spyOn(App.presentation, 'getRootNode').and.returnValues(rootNode);
        spyOn(Mindmaps, 'findOne').and.returnValues(leftNode, leftNode, leftNodeChild);

        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text \"><node TEXT=\"left node text\" POSITION=\"left\"><node TEXT=\"left node child text with &quot; sign\"></node>\n</node>\n</node>\n</map>";
        var actualString = App.JSONConverter();
        expect(expectedString).toBe(actualString);
    });

    it('should ensure right grand child node text have special character like apostrophe sign', function () {
        var rootNode = {
            _id: "rootNodeId",
            name: "root node text ",
            left: [],
            right: ["rightNodeId"]
        };

        var rightNode = {
            _id: "rightNodeId",
            name: "right node text",
            childSubTree: ["rightNodeChildId"]
        };

        var rightNodeChild = {
            _id: "rightNodeChildId",
            name: "right node child text with ' sign",
            childSubTree: []
        };

        spyOn(App.presentation, 'getRootNode').and.returnValues(rootNode);
        spyOn(Mindmaps, 'findOne').and.returnValues(rightNode, rightNode, rightNodeChild);

        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text \"><node TEXT=\"right node text\" POSITION=\"right\"><node TEXT=\"right node child text with &apos; sign\"></node>\n</node>\n</node>\n</map>";
        var actualString = App.JSONConverter();
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