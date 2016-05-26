App.Constants = {};
App.Constants.MinTextBoxWidth = 100;
App.Constants.DeltaTextBoxWidth = 10;
App.Constants.HttpProtocol = "http";
App.Constants.DefaultNodeName = "Untitled";

App.Constants.KeyPressed = {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right"
};

App.Constants.Direction = {
    RIGHT: 'right',
    LEFT: 'left',
    ROOT: 'root'
};

Object.freeze(App.Constants.KeyPressed);

App.Constants.tagsSupported = ["font", "edge", "hook", "node", "icon"];

Object.freeze(App.Constants.tagsSupported);

App.Constants.Mode = {
    READ: "read",
    WRITE: "write"
};
App.Constants.CharacterSet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
