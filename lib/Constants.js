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

App.Constants.Mindmap= {};
App.Constants.Mindmap.tagsSupported = ["font", "edge", "hook", "node", "icon"];

App.Constants.Mindmap.FileExtension = ".mm";
App.Constants.Mindmap.MapXmlNodeText = 'map';
App.Constants.Mindmap.NodeXmlNodeText = 'node';
App.Constants.Mindmap.ExportedMindmapVersion = '1.0.1';

Object.freeze(App.Constants.Mindmap.tagsSupported);

App.Constants.Mode = {
    READ: "read",
    WRITE: "write"
};
App.Constants.CharacterSet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
