application.directionToggler = {
  currentDir: "right",
  canToggle: false,

  changeDirection: function () {
    switch (application.directionToggler.currentDir) {
      case "left" :
        application.directionToggler.currentDir = "right";
        break;
      case "right":
        application.directionToggler.currentDir = "left";
        break;
    }
  }
};