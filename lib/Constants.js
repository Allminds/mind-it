App.Constants = {};
App.Constants.MinTextBoxWidth = 100;
App.Constants.DeltaTextBoxWidth=10;
App.Constants.KeyPressed = {
  UP : "up",
  DOWN : "down",
  LEFT : "left",
  RIGHT : "right"
};
Object.freeze(App.Constants.KeyPressed);

App.Constants.tagsSupported = ["font", "edge", "hook", "node", "icon"];

Object.freeze(App.Constants.tagsSupported);
App.Constants.Mode = {
  READ : "read",
  WRITE : "write"
};
