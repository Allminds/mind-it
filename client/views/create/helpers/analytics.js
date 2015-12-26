App.mapsCount = 0;
App.setMapsCount = function () {
  Meteor.call('countMaps', function (error, count) {
    App.mapsCount = count;
  });
};
