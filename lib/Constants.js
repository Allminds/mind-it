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

App.Constants.Mindmap = {};
App.Constants.Mindmap.tagsSupported = ["font", "edge", "hook", "node", "icon"];

App.Constants.Mindmap.FileExtension = ".mm";

App.Constants.Mindmap.MapXmlElementName = 'map';
App.Constants.Mindmap.VersionXmlAttributeName = 'version';
App.Constants.Mindmap.VersionXmlAttributeValue = '1.0.1';

App.Constants.Mindmap.NodeXmlElementName = 'node';
App.Constants.Mindmap.TextXmlAttributeName = 'TEXT';
App.Constants.Mindmap.PositionXmlAttributeName = 'POSITION';

App.Constants.Mindmap.ParseErrorXmlElementName = 'parsererror';

Object.freeze(App.Constants.Mindmap.tagsSupported);

App.Constants.Mode = {
    READ: "read",
    WRITE: "write"
};
App.Constants.CharacterSet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
