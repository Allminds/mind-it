App.MindmapTextParser = {};
App.MindmapTextParser.Constants = {};
App.MindmapTextParser.Constants.tabEscapeCharacter = '\t';
App.MindmapTextParser.Constants.newlineEscapeCharacter = '\n';
App.MindmapTextParser.Constants.tabCharacterCode = 9;
App.MindmapTextParser.Constants.newLineCharacterCode = 10;
App.MindmapTextParser.Constants.doulbeSlash = '\\';

var isNewLineCharacter = function (inputString, counter) {
    return inputString.charCodeAt(counter) === App.MindmapTextParser.Constants.newLineCharacterCode;
};

var isTabCharacter = function (inputString, counter) {
    return inputString.charCodeAt(counter) === App.MindmapTextParser.Constants.tabCharacterCode;
};

var replaceNewLineCharacterWithEscapeCharacter = function (inputString) {
    var inputCharacters = inputString.split('');

    for (var charCounter = 0; charCounter < inputCharacters.length; charCounter++) {
        if (isNewLineCharacter(inputString, charCounter)) {
            inputCharacters[charCounter] = App.MindmapTextParser.Constants.newlineEscapeCharacter;
        }
    }

    return inputCharacters.join('');
};

var replaceTabCharacterWithEscapeCharacter = function (inputString) {
    var inputCharacters = inputString.split('');

    for (var charCounter = 0; charCounter < inputCharacters.length; charCounter++) {
        if (isTabCharacter(inputString, charCounter)) {
            inputCharacters[charCounter] = App.MindmapTextParser.Constants.tabEscapeCharacter;
        }
    }

    return inputCharacters.join('');
};

var replaceNewLineOrTabCharactersWithEscapeCharacters = function (inputString) {
    var stringWithoutNewLineCharacter = replaceNewLineCharacterWithEscapeCharacter(inputString);

    return replaceTabCharacterWithEscapeCharacter(stringWithoutNewLineCharacter);
};

var isLastCharacterOfArray = function (arrayCounter, array) {
    return arrayCounter < array.length - 1;
};

var charFromArray = function (arrayCounter, array) {
    return array[arrayCounter];
};

var isCharacter = function (arrayCounter, array, character) {
    return charFromArray(arrayCounter, array) === character;
};

var isSlashCharacter = function (arrayCounter, array) {
    return isCharacter(arrayCounter, array, App.MindmapTextParser.Constants.doulbeSlash);
};

var isCharacterN = function (arrayCounter, array) {
    return isCharacter(arrayCounter, array, 'n');
};

var isCharacterT = function (arrayCounter, array) {
    return isCharacter(arrayCounter, array, 't');
};

var isCharacterTab = function (arrayCounter, array) {
    return charFromArray(arrayCounter, array) === App.MindmapTextParser.Constants.tabEscapeCharacter;
};

var isNonLastSlashCharacter = function (arrayCounter, array) {
    return isSlashCharacter(arrayCounter, array) && !isLastCharacterOfArray(arrayCounter, array);
};

var sanitizeForNewLineEscapeCharacter = function (inputString) {
    var inputCharacters = inputString.split('');
    var outputCharacters = [];
    var outputCharacterCounter = 0;

    for (var inputCharacterCounter = 0; inputCharacterCounter < inputCharacters.length; inputCharacterCounter++) {
        outputCharacters[outputCharacterCounter] = charFromArray(inputCharacterCounter, inputCharacters);

        var nextInputCharacterCounter = inputCharacterCounter + 1;
        if (isNonLastSlashCharacter(inputCharacterCounter, inputCharacters) && isCharacterN(nextInputCharacterCounter, inputCharacters)) {
            outputCharacters[outputCharacterCounter] = App.MindmapTextParser.Constants.newlineEscapeCharacter;
            inputCharacterCounter++;
        }

        outputCharacterCounter++;
    }

    return outputCharacters.join('');
};

var sanitizeForTabEscapeCharacter = function (inputString) {
    var inputCharacters = inputString.split('');
    var outputCharacters = [];
    var outputCharacterCounter = 0;

    for (var inputCharacterCounter = 0; inputCharacterCounter < inputCharacters.length; inputCharacterCounter++) {
        outputCharacters[outputCharacterCounter] = charFromArray(inputCharacterCounter, inputCharacters);

        var nextInputCharacterCounter = inputCharacterCounter + 1;
        if (isNonLastSlashCharacter(inputCharacterCounter, inputCharacters) && isCharacterT(nextInputCharacterCounter, inputCharacters)) {
            outputCharacters[outputCharacterCounter] = App.MindmapTextParser.Constants.tabEscapeCharacter;
            inputCharacterCounter++;
        }

        outputCharacterCounter++;
    }

    return outputCharacters.join('');
};

var sanitizeForEscapeCharacters = function (inputString) {
    var stringWithNewLineEscapeCharacter = sanitizeForNewLineEscapeCharacter(inputString);

    return sanitizeForTabEscapeCharacter(stringWithNewLineEscapeCharacter);
};

var validateInput = function (inputString) {
    if (!Boolean(inputString)) {
        return null;
    }

    return inputString;
};

var createNode = function (nodeName, nodes, tabCount) {
    var newNode = new App.Node(nodeName);
    var parentNode = nodes[tabCount - 1];
    newNode.parent = parentNode;
    parentNode.childSubTree.push(newNode);

    return newNode;
};

var leftTrimArrayForTabCharacter = function (array, arrayCounter) {
    var characterArray = array[arrayCounter].split('');
    var characterCounter = 0;
    var inputTabCount = 0;

    while (isCharacterTab(characterCounter, characterArray)) {
        inputTabCount++;
        characterArray.shift();
    }

    var tabCount = {};
    tabCount.characterArray = characterArray;
    tabCount.inputTabCount = inputTabCount;
    return tabCount;
};

var nodeData = function (array, arrayCounter) {
    var tabCountValue = leftTrimArrayForTabCharacter(array, arrayCounter);
    var nodeName = tabCountValue.characterArray.join('');
    
    var nodeData = {};
    nodeData.name = nodeName.trim();
    nodeData.tabCount = tabCountValue.inputTabCount;

    return nodeData;
};

var formatString = function (inputString) {
    var sanitizedString = sanitizeForEscapeCharacters(inputString);
    return replaceNewLineOrTabCharactersWithEscapeCharacters(sanitizedString);
};

var nodeNames = function (formattedString) {
    return formattedString.split(App.MindmapTextParser.Constants.newlineEscapeCharacter);
};

var appendChildNodes = function (nodeNames, nodes) {
    for (var nodeNameCounter = 1; nodeNameCounter < nodeNames.length; nodeNameCounter++) {
        var nodeDataValue = nodeData(nodeNames, nodeNameCounter);

        if (Boolean(nodeDataValue.name)) {
            nodes.splice(nodeDataValue.tabCount);

            nodes.push(createNode(nodeDataValue.name, nodes, nodeDataValue.tabCount));
        }
    }
};

var firstNode = function (nodeNames) {
    var firstNodeName = nodeNames[0];
    return new App.Node(firstNodeName);
};

App.MindmapTextParser.parse = function (inputString) {
    if (!Boolean(validateInput(inputString))) {
        return null;
    }

    var formattedString = formatString(inputString);
    var nodes = [];
    var nodeNamesValue = nodeNames(formattedString);
    var firstNodeValue = firstNode(nodeNamesValue);

    nodes.push(firstNodeValue);
    appendChildNodes(nodeNamesValue, nodes);

    return firstNodeValue;
};