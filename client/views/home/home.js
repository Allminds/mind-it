/* global MindMapService */
/* global Router */
/* global mindMapService */
mindMapService = new MindMapService();
Template.MyButton.events({
	'click #clickme': function () {
		// 1. cretate root node with defualt title
		var mindMapId = mindMapService.createRootNode('New Mindmap'),
			link = '/create/' + mindMapId;
		// 2. Go to canvas root note
		Router.go(link);
		localStorage.clear();
	}
});

var i = 0;
var path = new Array();

// LIST OF IMAGES
path[0] = "SliderImage1-Schedule.png";
path[1] = "SliderImage2-Pune.png";
path[2] = "SliderImage3-MovieDialogues.png";

function swapImage()
{

   setInterval(function() {
	   var img = document.querySelector(".home-bg img");
	   if(img)
		img.src = path[i];
	   if(i < path.length - 1) i++; else i = 0;
   }, 2000)
}
swapImage();


$(".aboutus").click(function() {
	$('html, body').animate({scrollTop: $("#aboutus").offset().top}, "slow");
})