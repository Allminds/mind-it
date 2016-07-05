describe('Create Tree', function () {
    it('Should return null when input string is null', function () {
        expect(App.MindmapTextParser.parse(null)).toBeNull()
    });

    it('Should return null when input string is undefined', function () {
        expect(App.MindmapTextParser.parse(undefined)).toBeNull();
    });

    it('Should return null when input is empty string', function () {
        expect(App.MindmapTextParser.parse('')).toBeNull();
    });

    it('Should return input string\'s only name as root node name', function () {
        var inputNodeText = "TW";

        var node = App.MindmapTextParser.parse(inputNodeText);
        expect(node.name).toBe('TW');
    });

    it('Should return input string\'s first name as root node name', function () {
        var inputNodeText = "TW";
        var node = App.MindmapTextParser.parse(inputNodeText);
        expect(node.name).toBe('TW');
    });

    it('Root\'s child name should be Asia', function () {
        var inputNodeText = "TW\n\tAsia";
        var node = App.MindmapTextParser.parse(inputNodeText);
        expect(node.name).toBe('TW');
        expect(App.Node.getChildren(node)[0].name).toBe('Asia');
    });

    it('Should return China and India as root\'s grandchildren', function () {
        var inputNodeText = "TW\n\tAsia\n\t\tChina\n\t\tIndia";
        var node = App.MindmapTextParser.parse(inputNodeText);
        var child = App.Node.getChildren(node)[0];


        expect(node.name).toBe('TW');
        expect(child.name).toBe('Asia');
        expect(App.Node.getChildren(child)[0].name).toBe('China');
        expect(App.Node.getChildren(child)[1].name).toBe('India');
    });

    it('Two children with equal number of tabs should be at equal level', function () {
        var inputNodeText = "Asia\n\tChina\n\tIndia";
        var node = App.MindmapTextParser.parse(inputNodeText);

        expect(node.name).toBe('Asia');
        expect(App.Node.getChildren(node)[0].name).toBe('China');
        expect(App.Node.getChildren(node)[1].name).toBe('India');
    });

    it('For multiple consecutive line breaks it should consider line break only once', function () {
        var inputNodeText = "Asia\n\n\n\n";
        var node = App.MindmapTextParser.parse(inputNodeText);
        expect(node.name).toBe('Asia');
    });

    it('Should create root node with no name when supplied with blank name', function () {
        var inputNodeText = "\n\t";
        var rootNode = App.MindmapTextParser.parse(inputNodeText);
        expect(rootNode.name).toBe('');
    });

    it('Should ignore nodes with blank name', function () {
        var inputNodeText = "Asia\n\t\n";
        var rootNode = App.MindmapTextParser.parse(inputNodeText);
        expect(rootNode.name).toBe('Asia');
        expect(App.Node.hasChildren(rootNode)).toBe(false);
    });

    it('Should return with root nodes and sub nodes when given a input string with depth 6', function () {
        var inputNodeText = "TW\n\tAsia\n\t\tChina\n\t\tIndia\n\t\t\tPune\n\t\t\t\t4th floor\n\t\t\t\t6th floor\n\t\t\tBangalore\n\t\t\t\tKormangla\n\t\t\t\t\tBuilding One\n\t\t\t\t\tBuilding Two";

        var rootNode = App.MindmapTextParser.parse(inputNodeText);

        var asiaNode = App.Node.getChildren(rootNode)[0];
        var chinaNode = App.Node.getChildren(asiaNode)[0];
        var indiaNode = App.Node.getChildren(asiaNode)[1];

        var puneNode = App.Node.getChildren(indiaNode)[0];
        var floor4Node = App.Node.getChildren(puneNode)[0];
        var floor6Node = App.Node.getChildren(puneNode)[1];

        var bangaloreNode = App.Node.getChildren(indiaNode)[1];
        var kormanglaNode = App.Node.getChildren(bangaloreNode)[0];

        var buildingOneNode = App.Node.getChildren(kormanglaNode)[0];
        var buildingTwoNode = App.Node.getChildren(kormanglaNode)[1];


        expect(rootNode.name).toBe('TW');
        expect(asiaNode.name).toBe('Asia');
        expect(chinaNode.name).toBe('China');
        expect(indiaNode.name).toBe('India');
        expect(puneNode.name).toBe('Pune');
        expect(floor4Node.name).toBe('4th floor');
        expect(floor6Node.name).toBe('6th floor');
        expect(bangaloreNode.name).toBe('Bangalore');
        expect(kormanglaNode.name).toBe('Kormangla');
        expect(buildingOneNode.name).toBe('Building One');
        expect(buildingTwoNode.name).toBe('Building Two');

    });

    it('Should return with root nodes and sub nodes when given a input string with depth 5', function () {
        var inputNodeText = 'India\n\tState\n\t\tRajasthan\n\t\t\tJaipur\n\t\t\t\tMansarovar\n\t\t\tAjmer\n\t\tMaharastra\n\t\t\tPune\n\tUnion Territory\n\t\tDelhi\n\t\tChandigarh';
        var rootNode = App.MindmapTextParser.parse(inputNodeText);

        var stateNode = App.Node.getChildren(rootNode)[0];
        var rajasthanNode = App.Node.getChildren(stateNode)[0];
        var jaipurNode = App.Node.getChildren(rajasthanNode)[0];
        var ajmerNode = App.Node.getChildren(rajasthanNode)[1];

        var mansarovarNode = App.Node.getChildren(jaipurNode)[0];

        var maharastraNode = App.Node.getChildren(stateNode)[1];
        var puneNode = App.Node.getChildren(maharastraNode)[0];

        var unionNode = App.Node.getChildren(rootNode)[1];
        var delhiNode = App.Node.getChildren(unionNode)[0];
        var chandigarhNode = App.Node.getChildren(unionNode)[1];


        expect(rootNode.name).toBe('India');
        expect(stateNode.name).toBe('State');
        expect(rajasthanNode.name).toBe('Rajasthan');
        expect(jaipurNode.name).toBe('Jaipur');
        expect(mansarovarNode.name).toBe('Mansarovar');
        expect(ajmerNode.name).toBe('Ajmer');
        expect(maharastraNode.name).toBe('Maharastra');
        expect(puneNode.name).toBe('Pune');
        expect(unionNode.name).toBe('Union Territory');
        expect(delhiNode.name).toBe('Delhi');
        expect(chandigarhNode.name).toBe('Chandigarh');
    });

    it('Should return node with tab when given input with tab', function () {
        var inputText = "Hello\n\tNamaste\t\n\t\tPeri pauna";
        var helloNode = App.MindmapTextParser.parse(inputText);
        var namasteNode = App.Node.getChildren(helloNode)[0];
        var periPaunaNode = App.Node.getChildren(namasteNode)[0];

        expect(helloNode.name).toBe('Hello');
        expect(namasteNode.name).toBe('Namaste');
        expect(periPaunaNode.name).toBe('Peri pauna');
    });
});