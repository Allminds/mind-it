App.CreateTree = {};

var isNewLineCharacter = function (inputString, counter) {
    var newLineCharacterCode = 10;
    return inputString.charCodeAt(counter) === newLineCharacterCode;
};

var isTabCharacter = function (inputString, counter) {
    var tabCharacterCode = 9;
    return inputString.charCodeAt(counter) === tabCharacterCode;
};

var replaceNewLineCharacterWithEscapeCharacter = function (inputString) {
    var inputCharacters = inputString.split('');
    var newLineEscapeCharacter = '\n';

    for (var charCounter = 0; charCounter < inputCharacters.length; charCounter++) {
        if (isNewLineCharacter(inputString, charCounter)) {
            inputCharacters[charCounter] = newLineEscapeCharacter;
        }
    }

    return inputCharacters.join('');
};

var replaceTabCharacterWithEscapeCharacter = function (inputString) {
    var inputCharacters = inputString.split('');
    var tabEscapeCharacter = '\t';

    for (var charCounter = 0; charCounter < inputCharacters.length; charCounter++) {
        if (isTabCharacter(inputString, charCounter)) {
            inputCharacters[charCounter] = tabEscapeCharacter;
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
    return isCharacter(arrayCounter, array, '\\');
};

var isCharacterN = function (arrayCounter, array) {
    return isCharacter(arrayCounter, array, 'n');
};

var isCharacterT = function (arrayCounter, array) {
    return isCharacter(arrayCounter, array, 't');
};

var isNonLastSlashCharacter = function (arrayCounter, array) {
    return isSlashCharacter(arrayCounter, array) && !isLastCharacterOfArray(arrayCounter, array);
};

var sanitizeForNewLineEscapeCharacter = function (inputString) {
    var inputCharacters = inputString.split('');
    var outputCharacters = [];
    var outputCharacterCounter = 0;
    var newLineEscapeCharacter = '\n';

    for (var inputCharacterCounter = 0; inputCharacterCounter < inputCharacters.length; inputCharacterCounter++) {
        outputCharacters[outputCharacterCounter] = charFromArray(inputCharacterCounter, inputCharacters);

        var nextInputCharacterCounter = inputCharacterCounter + 1;
        if (isNonLastSlashCharacter(inputCharacterCounter, inputCharacters) && isCharacterN(nextInputCharacterCounter, inputCharacters)) {
            outputCharacters[outputCharacterCounter] = newLineEscapeCharacter;
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
    var tabEscapeCharacter = '\t';

    for (var inputCharacterCounter = 0; inputCharacterCounter < inputCharacters.length; inputCharacterCounter++) {
        outputCharacters[outputCharacterCounter] = charFromArray(inputCharacterCounter, inputCharacters);

        var nextInputCharacterCounter = inputCharacterCounter + 1;
        if (isNonLastSlashCharacter(inputCharacterCounter, inputCharacters) && isCharacterT(nextInputCharacterCounter, inputCharacters)) {
            outputCharacters[outputCharacterCounter] = tabEscapeCharacter;
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

var nodeData = function (array, arrayCounter) {
    var tabEscapeCharacter = '\t';
    var tabs = array[arrayCounter].split(tabEscapeCharacter);
    var lastTabCount = tabs.length - 1;

    var nodeData = {};
    nodeData.name = tabs[lastTabCount];
    nodeData.tabCount = lastTabCount;

    return nodeData;
};

var formatString = function (inputString) {
    var sanitizedString = sanitizeForEscapeCharacters(inputString);
    return replaceNewLineOrTabCharactersWithEscapeCharacters(sanitizedString);
};

var nodeNames = function (formattedString) {
    var newLineEscapeCharacter = '\n';
    return formattedString.split(newLineEscapeCharacter);
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

App.CreateTree.MakeTree = function (inputString) {
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