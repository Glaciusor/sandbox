

//Misc TODOs:
//When they change size and click on the canvas, the dot they draw is the old size; the click event happens before the blur event - FIX IT!
//Make a "go away" button that will get rid of all the canvas stuff
//Add an eraser (draw line with 0 opacity)
//Put a lot of these styles into a stylesheet? If that's done then this JS file needs to pull the CSS or die trying (maybe can provide a monochrome degraded performance mode with a warning)
//Can has screenshot saved to PNG? Also, being able to attach the screenshot to a ticket in Jira just by specifying a ticket number would be awesome... 1 tool to do it all
//Make "pen" and "highlighter" mode. What about a mode that allows clicking without drawing, and actually triggers the underlying stuff not canvas? Can do that without hiding the canvas?
//Make straight-edge mode, horizontal-edge mode, and free-form mode to allow for accurate highlighting and underlining. Default = free-form or perhaps save it in storage
//Nice way to put in a text box right on the canvas?
//Displaying by mouse the size/shape/color of the settings would be nice before clicking. This may require saving the canvas and redrawing it a lot with the additional dot on top on a mouse-move with mouse_held being false. 
//Would be really nice if the toolbar would animate and hide itself when the mouse isn't near it (mousemove, distance from bottom of window below a threshold = show, else hide)
//Pretty-ify the toolbar with some CSS3. You know, metallic-looking toolbar, shiny buttons
//Apply a cool CSS3 shadow to the buttons for whichever color and tool is selected
//Related to the shadow, for colors, make the shadow the same color as the selected color maybe? As for the tools selected, shade them a bit. Would look pretty and give the user some feedback as to what the settings are.
//Do proper loading of jquery and jcanvas instead of @require in the userscript. Priority depends on whether it overrides jquery on the current page or just for this script.
//make proper dev/live setup, not hacky "dev" var
//use multi-canvas approach to show what would be drawn while mouse is up
//use multi-canvas approach to allow drawing of arrows
//When 100% complete, sit back and relax and enjoy the warm and fuzzy feeling of completion and satisfaction before moving on to something else.

//Note: Intentionally using some of the older jQuery methods as the page this is loaded on may use an old version already
//TODO: any way to see if $.(whatever) exists, if not then define from the jQuery library I want, to give the features I want on pages reliant on old jQuery?



var dev = false,
	linker = {
		css: dev ? 'skribl.css' : 'http://glaciusor.github.com/sandbox/Draw/skribl.css'
	};

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

		//TODO: On document resize, resize the canvas or find a way to make it auto-resize with the document
		//TODO: make this auto-detect the highest Z-index and go 1 higher than it
		$('body').append('<canvas id="draw_plane" width="' + width + 'px" height="' + height + 'px" style="position: absolute; top: 0px; left: 0px; z-index: 10000;"></canvas>')
			.append('<div id="control_bar" style="position: fixed; bottom: 0px; width: 100%; height: 32px; background: #cccccc; z-index: 10001;"></div>');
		$('head').append('<link type="text/css" rel="stylesheet" href="' + linker.css + '" />');

		//TODO: Make a nice way to create these, not specifying the whole html+css in one hardcoded string
		$('#control_bar')
			.append('<div class="color_picker" style="background-color: #F00;"></div>')
			.append('<div class="color_picker" style="background-color: #F60;"></div>')
			.append('<div class="color_picker" style="background-color: #FF0;"></div>')
			.append('<div class="color_picker" style="background-color: #0F0;"></div>')
			.append('<div class="color_picker" style="background-color: #0FF;"></div>')
			.append('<div class="color_picker" style="background-color: #7CF;"></div>')
			.append('<div class="color_picker" style="background-color: #00F;"></div>')
			.append('<div class="color_picker" style="background-color: #606;"></div>')
			.append('<div class="color_picker" style="background-color: #F0F;"></div>')
			.append('<div class="color_picker" style="background-color: #FFF;"></div>')
			.append('<div class="color_picker" style="background-color: #888;"></div>')
			.append('<div class="color_picker" style="background-color: #000;"></div>')
			.append('<div><input type="button" id="clear_canvas" value="Clear" /></div>')
			.append('<div><input type="text" id="size_change" value="' + that.size + '" size="5" /></div>');

		//Give us a jQuery reference to the canvas
		this.$canvas = $('#draw_plane');

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
		$('div.color_picker').delegate("", 'click', function (ev) {
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


if (!dev) {
	doodle.initCanvas();
}

