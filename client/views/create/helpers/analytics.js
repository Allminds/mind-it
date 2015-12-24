application.mapsCount = 0;
application.setMapsCount = function () {
    Meteor.call('countMaps', function (error, count) {
        application.mapsCount = count;
    });
};
