describe('App.exportParser', function () {
    it('Should return xml string when root node is null', function () {
        spyOn(App.presentation, 'getRootNode').and.returnValue(null);

        var actualString = App.JSONConverter();

        expect(actualString).toBe('');
    });

    it('Should return xml string when root node is undefined', function () {
        spyOn(App.presentation, 'getRootNode').and.returnValue(undefined);

        var actualString = App.JSONConverter();

        expect(actualString).toBe('');
    });

    it('Should return xml string when left sub node is null', function () {
        var rootNode = new App.Node('root node text with < symbol');
        rootNode.left = [null];

        spyOn(App.presentation, 'getRootNode').and.returnValue(rootNode);
        spyOn(Mindmaps, 'findOne').and.returnValues(null);

        var actualString = App.JSONConverter();
        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text with &lt; symbol\"></node>\n</map>";

        expect(actualString).toBe(expectedString);
    });

    it('Should return xml string when left sub node is undefined', function () {
        var rootNode = new App.Node('root node text with < symbol');
        rootNode.left = [undefined];

        spyOn(App.presentation, 'getRootNode').and.returnValue(rootNode);
        spyOn(Mindmaps, 'findOne').and.returnValues(undefined);

        var actualString = App.JSONConverter();
        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text with &lt; symbol\"></node>\n</map>";

        expect(actualString).toBe(expectedString);
    });

    it('Should return xml string when right sub node is null', function () {
        var rootNode = new App.Node('root node text with < symbol');
        rootNode.right = [null];

        spyOn(App.presentation, 'getRootNode').and.returnValue(rootNode);
        spyOn(Mindmaps, 'findOne').and.returnValues(null);

        var actualString = App.JSONConverter();
        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text with &lt; symbol\"></node>\n</map>";

        expect(actualString).toBe(expectedString);
    });

    it('Should return xml string when right sub node is undefined', function () {
        var rootNode = new App.Node('root node text with < symbol');
        rootNode.right = [undefined];

        spyOn(App.presentation, 'getRootNode').and.returnValue(rootNode);
        spyOn(Mindmaps, 'findOne').and.returnValues(undefined);

        var actualString = App.JSONConverter();
        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text with &lt; symbol\"></node>\n</map>";

        expect(actualString).toBe(expectedString);
    });

    it('Should return xml string when left leaf node is null', function () {
        var rootNode = new App.Node('root node text ');

        var leftSubNode = new App.Node('left node text', App.Constants.Direction.LEFT, rootNode, 1);

        rootNode.left = [leftSubNode];

        leftSubNode.childSubTree = [null];

        spyOn(App.presentation, 'getRootNode').and.returnValue(rootNode);
        spyOn(Mindmaps, 'findOne').and.returnValues(leftSubNode, null);

        var actualString = App.JSONConverter();
        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text \"><node TEXT=\"left node text\" POSITION=\"left\"></node>\n</node>\n</map>";

        expect(actualString).toBe(expectedString);
    });

    it('Should return xml string when left leaf node is undefined', function () {
        var rootNode = new App.Node('root node text ');

        var leftSubNode = new App.Node('left node text', App.Constants.Direction.LEFT, rootNode, 1);

        rootNode.left = [leftSubNode];

        leftSubNode.childSubTree = [undefined];

        spyOn(App.presentation, 'getRootNode').and.returnValue(rootNode);
        spyOn(Mindmaps, 'findOne').and.returnValues(leftSubNode, undefined);

        var actualString = App.JSONConverter();
        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text \"><node TEXT=\"left node text\" POSITION=\"left\"></node>\n</node>\n</map>";

        expect(actualString).toBe(expectedString);
    });

    it('Should return xml string when right leaf node is null', function () {
        var rootNode = new App.Node('root node text ');

        var rightSubNode = new App.Node('left node text', App.Constants.Direction.RIGHT, rootNode, 1);

        rootNode.right = [rightSubNode];

        rightSubNode.childSubTree = [null];

        spyOn(App.presentation, 'getRootNode').and.returnValue(rootNode);
        spyOn(Mindmaps, 'findOne').and.returnValues(rightSubNode, null);

        var actualString = App.JSONConverter();
        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text \"><node TEXT=\"left node text\" POSITION=\"right\"></node>\n</node>\n</map>";

        expect(actualString).toBe(expectedString);
    });

    it('Should return xml string when right leaf node is undefined', function () {
        var rootNode = new App.Node('root node text ');

        var rightSubNode = new App.Node('left node text', App.Constants.Direction.RIGHT, rootNode, 1);

        rootNode.right = [rightSubNode];

        rightSubNode.childSubTree = [undefined];

        spyOn(App.presentation, 'getRootNode').and.returnValue(rootNode);
        spyOn(Mindmaps, 'findOne').and.returnValues(rightSubNode, undefined);

        var actualString = App.JSONConverter();
        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text \"><node TEXT=\"left node text\" POSITION=\"right\"></node>\n</node>\n</map>";

        expect(actualString).toBe(expectedString);
    });

    it('should ensure root node text have special character like less than sign', function () {
        var rootNode = new App.Node('root node text with < symbol');

        spyOn(App.presentation, 'getRootNode').and.returnValue(rootNode);

        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text with &lt; symbol\"></node>\n</map>";
        var actualString = App.JSONConverter();

        expect(actualString).toBe(expectedString);
    });

    it('should ensure left sub node text have special character like greater than sign', function () {
        var rootNode = new App.Node('root node text ');
        var leftLeafNode = new App.Node('left node text with > sign', App.Constants.Direction.LEFT, rootNode, 1);

        rootNode.left = [leftLeafNode];

        spyOn(App.presentation, 'getRootNode').and.returnValues(rootNode);
        spyOn(Mindmaps, 'findOne').and.returnValues(leftLeafNode);

        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text \"><node TEXT=\"left node text with &gt; sign\" POSITION=\"left\"></node>\n</node>\n</map>";
        var actualString = App.JSONConverter();

        expect(actualString).toBe(expectedString);
    });

    it('should ensure right sub node text have special character like ampersand sign', function () {
        var rootNode = new App.Node('root node text ');
        var rightLeafNode = new App.Node('right node text with & sign', App.Constants.Direction.RIGHT, rootNode, 1);

        rootNode.right = [rightLeafNode];

        spyOn(App.presentation, 'getRootNode').and.returnValues(rootNode);
        spyOn(Mindmaps, 'findOne').and.returnValues(rightLeafNode);

        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text \"><node TEXT=\"right node text with &amp; sign\" POSITION=\"right\"></node>\n</node>\n</map>";
        var actualString = App.JSONConverter();

        expect(actualString).toBe(expectedString);
    });

    it('should ensure left leaf child node text have special character like double quote sign', function () {
        var rootNode = new App.Node('root node text ');
        var leftSubNode = new App.Node('left node text', App.Constants.Direction.LEFT, rootNode, 1);
        var leftLeafNode = new App.Node('left node child text with \" sign', App.Constants.Direction.LEFT, rootNode, 2);

        rootNode.left = [leftSubNode];
        leftSubNode.childSubTree = [leftLeafNode];

        spyOn(App.presentation, 'getRootNode').and.returnValues(rootNode);
        spyOn(Mindmaps, 'findOne').and.returnValues(leftSubNode, leftLeafNode);

        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text \"><node TEXT=\"left node text\" POSITION=\"left\"><node TEXT=\"left node child text with &quot; sign\"></node>\n</node>\n</node>\n</map>";
        var actualString = App.JSONConverter();

        expect(actualString).toBe(expectedString);
    });

    it('should ensure right leaf child node text have special character like apostrophe sign', function () {
        var rootNode = new App.Node('root node text ');
        var rightSubNode = new App.Node('right node text', App.Constants.Direction.RIGHT, rootNode, 1);
        var rightLeafNode = new App.Node("right node child text with ' sign", App.Constants.Direction.RIGHT, rootNode, 2);

        rootNode.right = [rightSubNode];
        rightSubNode.childSubTree = [rightLeafNode];

        spyOn(App.presentation, 'getRootNode').and.returnValues(rootNode);
        spyOn(Mindmaps, 'findOne').and.returnValues(rightSubNode, rightLeafNode);

        var expectedString = "<map version=\"1.0.1\">\n<node TEXT=\"root node text \"><node TEXT=\"right node text\" POSITION=\"right\"><node TEXT=\"right node child text with &apos; sign\"></node>\n</node>\n</node>\n</map>";
        var actualString = App.JSONConverter();

        expect(actualString).toBe(expectedString);
    });

    describe('should ensure parseSymbols functionality', function () {
        it('should ensure node text can have special character like less than sign', function () {
            var nodeText = "<";

            var expectedValue = "&lt;";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(actualValue).toBe(expectedValue);
        });

        it('should ensure node text can have special character like greater than sign', function () {
            var nodeText = ">";

            var expectedValue = "&gt;";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(actualValue).toBe(expectedValue);
        });

        it('should ensure node text can have special character like Quote sign', function () {
            var nodeText = "\"";

            var expectedValue = "&quot;";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(actualValue).toBe(expectedValue);
        });

        it('should ensure node text can have special character like apostrophe sign', function () {
            var nodeText = "'";

            var expectedValue = "&apos;";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(actualValue).toBe(expectedValue);
        });

        it('should ensure node text can have special character like ampersand sign', function () {
            var nodeText = "&";

            var expectedValue = "&amp;";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(actualValue).toBe(expectedValue);
        });

        it('should ensure node text can have multiple special characters', function () {
            var nodeText = "<>";

            var expectedValue = "&lt;&gt;";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(actualValue).toBe(expectedValue);
        });

        it('should ensure node text is undefined', function () {
            var expectedValue = "";
            var actualValue = App.exportParser.parseSymbols(undefined);

            expect(actualValue).toBe(expectedValue);
        });

        it('should ensure node text is null', function () {
            var nodeText = null;

            var expectedValue = "";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(actualValue).toBe(expectedValue);
        });

        it('should ensure node text is empty string', function () {
            var nodeText = "";

            var expectedValue = "";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(actualValue).toBe(expectedValue);
        });

        it('should ensure node text is white space', function () {
            var nodeText = " ";

            var expectedValue = " ";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(actualValue).toBe(expectedValue);
        });

        it('should ensure node text does not have any special character', function () {
            var nodeText = "no special character";

            var expectedValue = "no special character";
            var actualValue = App.exportParser.parseSymbols(nodeText);

            expect(actualValue).toBe(expectedValue);
        });
    });

    describe('should ensure nodeStart functionality', function () {
        it('should return node string for a node with position missing', function () {
            var nodeText = "nodeText";

            var expectedValue = "<node TEXT=\"nodeText\">";
            var actualValue = App.exportParser.nodeStart(nodeText);

            expect(actualValue).toBe(expectedValue);
        });

        it('should return node string for a node with position as left', function () {
            var nodeText = "nodeText";
            var nodePosition = App.Constants.Direction.LEFT;

            var expectedValue = "<node TEXT=\"nodeText\" POSITION=\"left\">";
            var actualValue = App.exportParser.nodeStart(nodeText, nodePosition);

            expect(actualValue).toBe(expectedValue);
        });

        it('should return node string for a node with position as right', function () {
            var nodeText = "nodeText";
            var nodePosition = App.Constants.Direction.RIGHT;

            var expectedValue = "<node TEXT=\"nodeText\" POSITION=\"right\">";
            var actualValue = App.exportParser.nodeStart(nodeText, nodePosition);

            expect(actualValue).toBe(expectedValue);
        });

        it('should return node string for a node with position as null', function () {
            var nodeText = "nodeText";
            var nodePosition = null;

            var expectedValue = "<node TEXT=\"nodeText\">";
            var actualValue = App.exportParser.nodeStart(nodeText, nodePosition);

            expect(actualValue).toBe(expectedValue);
        });

        it('should return node string for a node with position as undefined', function () {
            var nodeText = "nodeText";
            var nodePosition = undefined;

            var expectedValue = "<node TEXT=\"nodeText\">";
            var actualValue = App.exportParser.nodeStart(nodeText, nodePosition);

            expect(actualValue).toBe(expectedValue);
        });

        it('should return node string for a node with position as empty string', function () {
            var nodeText = "nodeText";
            var nodePosition = "";

            var expectedValue = "<node TEXT=\"nodeText\">";
            var actualValue = App.exportParser.nodeStart(nodeText, nodePosition);

            expect(actualValue).toBe(expectedValue);
        });

        it('should return node string for a node with position as non empty string', function () {
            var nodeText = "nodeText";
            var nodePosition = "nodePosition";

            var expectedValue = "<node TEXT=\"nodeText\" POSITION=\"nodePosition\">";
            var actualValue = App.exportParser.nodeStart(nodeText, nodePosition);

            expect(actualValue).toBe(expectedValue);
        });

        it('should return node string for a node with position as whitespace', function () {
            var nodeText = "nodeText";
            var nodePosition = " ";

            var expectedValue = "<node TEXT=\"nodeText\" POSITION=\" \">";
            var actualValue = App.exportParser.nodeStart(nodeText, nodePosition);

            expect(actualValue).toBe(expectedValue);
        });
    });
});