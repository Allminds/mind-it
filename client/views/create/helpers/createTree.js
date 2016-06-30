App.CreateTree = {};

var formatText = function (inputString) {
    var inputCharacters = inputString.split('');
    var outCharArray = [];
    var arrayCounter = 0;

    for (var charCounter = 0; charCounter < inputCharacters.length; charCounter++) {
        outCharArray[arrayCounter] = inputCharacters[charCounter];

        if (inputCharacters[charCounter] === '\\') {
            if (charCounter < inputCharacters.length - 1 && inputCharacters[charCounter + 1] === 'n') {
                outCharArray[arrayCounter] = '\n';
                charCounter++;
            }

            if (charCounter < inputCharacters.length - 1 && inputCharacters[charCounter + 1] === 't') {
                outCharArray[arrayCounter] = '\t';
                charCounter++;
            }
        } 

        if (inputString.charCodeAt(charCounter) === 10) {
            outCharArray[arrayCounter] = '\n';
        }

        if (inputString.charCodeAt(charCounter) === 9) {
            outCharArray[arrayCounter] = '\t';
        }

        arrayCounter++;
    }

    return outCharArray.join('');
};

var validateInput = function (inputString) {
    if (!Boolean(inputString)) {
        return null;
    }

    return inputString;
};

App.CreateTree.MakeTree = function (inputString) {
    if (validateInput(inputString) === null) {
        return null;
    }

    var formattedString = formatText(inputString);
    var nodeArray = [];
    var wordArray = formattedString.split('\n');
    var root = new App.Node(wordArray[0]);
    nodeArray[0] = root;

    for (var wordCounter = 1; wordCounter < wordArray.length; wordCounter++) {
        var tabArray = wordArray[wordCounter].split('\t');
        var tabCount = tabArray.length - 1;
        var nodeText = tabArray[tabCount];

        if (nodeText !== '') {
            nodeArray.splice(tabCount);
            var newNode = new App.Node(nodeText);
            var parentNode = nodeArray[tabCount - 1];
            newNode.parent = parentNode;
            parentNode.childSubTree.push(newNode);
            nodeArray[tabCount] = newNode;
        }
    }

    return root;
};