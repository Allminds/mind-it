// TODO: Use singleton pattern (make currentDir and canToggle - private)
App.DirectionToggler = {
  currentDir: "right",
  canToggle: false,

  changeDirection: function () {
    this.currentDir = (this.currentDir== "right") ? "left" : "right";
  }
};