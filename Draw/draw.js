

//Misc TODOs:
//When they change size and click on the canvas, the dot they draw is the old size; the click event happens before the blur event - FIX IT!
//Make a "go away" button that will get rid of all the canvas stuff
//Add an eraser (draw line with 0 opacity)
//Create a userscript that can pull in this file from somewhere, also loads jquery and jcanvas if they aren't available
//Put a lot of these styles into a stylesheet? If that's done then this JS file needs to pull the CSS or die trying (maybe can provide a monochrome degraded performance mode with a warning)
//Can has screenshot saved to PNG? Also, being able to attach the screenshot to a ticket in Jira just by specifying a ticket number would be awesome... 1 tool to do it all
//Make "pen" and "highlighter" mode. What about a mode that allows clicking without drawing, and actually triggers the underlying stuff not canvas? Can do that without hiding the canvas?
//Make straight-edge mode, horizontal-edge mode, and free-form mode to allow for accurate highlighting and underlining. Default = free-form or perhaps save it in storage
//Nice way to put in a text box right on the canvas?
//Displaying by mouse the size/shape/color of the settings would be nice before clicking. This may require saving the canvas and redrawing it a lot with the additional dot on top on a mouse-move with mouse_held being false. 
//Fix the CSS issue in all the toolbar divs (float: left; display: block; should do it)
//Would be really nice if the toolbar would animate and hide itself when the mouse isn't near it (mousemove, distance from bottom of window below a threshold = show, else hide)
//Pretty-ify the toolbar with some CSS3. You know, metallic-looking toolbar, shiny buttons
//Apply a cool CSS3 shadow to the buttons for whichever color and tool is selected
//Related to the shadow, for colors, make the shadow the same color as the selected color maybe? As for the tools selected, shade them a bit. Would look pretty and give the user some feedback as to what the settings are.
//When 100% complete, sit back and relax and enjoy the warm and fuzzy feeling of completion and satisfaction before moving on to something else.

//Note: Intentionally using some of the older jQuery methods as the page this is loaded on may use an old version already
//TODO: any way to see if $.(whatever) exists, if not then define from the jQuery library I want, to give the features I want on pages reliant on old jQuery?


var doodle = {
	$canvas:  null,
	mouse_held: false,
	color: "#000",
	size: 4,
	last_mouse_pos: null,
	initCanvas: function () {
		var width = $(document).width(),
			height = $(document).height(),
			that = this;

		//This is only here so I can just copy and paste all this into the console window and get this dependency
		//TODO: Put in an "if (!jQuery)" to do the same to load jQuery if needed.
		$('head').append('<script src="http://calebevans.me/projects/jcanvas/resources/jcanvas/builds/5.1/jcanvas.min.js" type="text/javascript"></script>');

		//TODO: On document resize, resize the canvas or find a way to make it auto-resize with the document
		//TODO: make this auto-detect the highest Z-index and go 1 higher than it
		$('body').append('<canvas id="draw_plane" width="' + width + 'px" height="' + height + 'px" style="position: absolute; top: 0px; left: 0px; z-index: 10000;"></canvas>')
			.append('<div id="control_bar" style="position: fixed; bottom: 0px; width: 100%; height: 32px; background: #cccccc; z-index: 10001;"></div>');

		//TODO: Make a nice way to create these, not specifying the whole html+css in one hardcoded string
		//TODO: Fix the vertical positioning issue x.x
		$('div#control_bar')
			.append('<div id="color_picker" style="display: inline-block; width: 20px; height: 20px; background-color: #F00; margin: 6px;"></div>')
			.append('<div id="color_picker" style="display: inline-block; width: 20px; height: 20px; background-color: #F60; margin: 6px;"></div>')
			.append('<div id="color_picker" style="display: inline-block; width: 20px; height: 20px; background-color: #FF0; margin: 6px;"></div>')
			.append('<div id="color_picker" style="display: inline-block; width: 20px; height: 20px; background-color: #0F0; margin: 6px;"></div>')
			.append('<div id="color_picker" style="display: inline-block; width: 20px; height: 20px; background-color: #0FF; margin: 6px;"></div>')
			.append('<div id="color_picker" style="display: inline-block; width: 20px; height: 20px; background-color: #7CF; margin: 6px;"></div>')
			.append('<div id="color_picker" style="display: inline-block; width: 20px; height: 20px; background-color: #00F; margin: 6px;"></div>')
			.append('<div id="color_picker" style="display: inline-block; width: 20px; height: 20px; background-color: #606; margin: 6px;"></div>')
			.append('<div id="color_picker" style="display: inline-block; width: 20px; height: 20px; background-color: #F0F; margin: 6px;"></div>')
			.append('<div id="color_picker" style="display: inline-block; width: 20px; height: 20px; background-color: #FFF; margin: 6px;"></div>')
			.append('<div id="color_picker" style="display: inline-block; width: 20px; height: 20px; background-color: #888; margin: 6px;"></div>')
			.append('<div id="color_picker" style="display: inline-block; width: 20px; height: 20px; background-color: #000; margin: 6px;"></div>')
			.append('<div style="display: inline-block; margin: 6px;"><input type="button" id="clear_canvas" value="Clear" /></div>')
			.append('<div style="display: inline-block; margin: 6px;"><input type="text" id="size_change" value="' + that.size + '" size="5" /></div>');

		//Give us a jQuery reference to the canvas
		this.$canvas = $('canvas#draw_plane');

		//Bind an onblur handler to the size changer input
		$('#size_change').blur(function (ev) {
			var clean_input = parseInt($(ev.currentTarget).val(), 10);

			if (isNaN(clean_input) || clean_input < 1 || clean_input > 256) {
				console.log("Warning: Invalid size selected. Restoring previous value.");
				clean_input = that.size;
			}

			$('#size_change').val(clean_input);
			that.size = clean_input;
		});
		

		//Clear button
		$('#clear_canvas').delegate("", 'click', function (ev) {
			that.$canvas.clearCanvas();
		});

		//This fun little code reads the color off of any color_picker div and pulls the background color of it
		//Just add more divs with more colors and it will use them :)
		$('div#color_picker').delegate("", 'click', function (ev) {
			that.color = $(ev.currentTarget).css('background-color');
		});

		//What to do when the user presses down on the mouse...
		this.$canvas.delegate("", 'mousedown', function (ev) {
			that.mouse_held = true;
			that.last_mouse_pos = {
				x: ev.pageX,
				y: ev.pageY
			};
			that.$canvas.drawEllipse({
				x: ev.pageX,
				y: ev.pageY,
				width: that.size,
				height: that.size,
				fillStyle: that.color
			});
		});

		//When the user lets go of the mouse
		this.$canvas.delegate("", 'mouseup mouseleave', function () {
			that.mouse_held = false;
			that.last_mouse_pos = null;
		});

		//If mouse is held down, start drawing lines every time it moves
		this.$canvas.delegate("", 'mousemove', function (ev) {
			if (that.mouse_held) {
				that.$canvas.drawLine({
					strokeStyle: that.color,
					strokeWidth: that.size,
					strokeCap: "round",
					x1: that.last_mouse_pos.x,
					y1: that.last_mouse_pos.y,
					x2: ev.pageX,
					y2: ev.pageY
				});

				that.last_mouse_pos = { x: ev.pageX, y: ev.pageY };
			}

		});

		//Allow chaining in the future :)
		return this;
	}
};



$('document').ready(function(){
	doodle.initCanvas();

});
