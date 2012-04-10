

//Misc TODOs:
//Add an eraser (draw line with 0 opacity)
//Can has screenshot saved to PNG? Also, being able to attach the screenshot to a ticket in Jira just by specifying a ticket number would be awesome... 1 tool to do it all
//Make "pen" and "highlighter" mode. What about a mode that allows clicking without drawing, and actually triggers the underlying stuff not canvas? Can do that without hiding the canvas?
//Make straight-edge mode, horizontal-edge mode, and free-form mode to allow for accurate highlighting and underlining. Default = free-form or perhaps save it in storage
//Nice way to put in a text box right on the canvas?
//Would be really nice if the toolbar would animate and hide itself when the mouse isn't near it (mousemove, distance from bottom of window below a threshold = show, else hide)
//Pretty-ify the toolbar with some CSS3. You know, metallic-looking toolbar, shiny buttons
//Apply a cool CSS3 shadow to the buttons for whichever color and tool is selected
//Related to the shadow, for colors, make the shadow the same color as the selected color maybe? As for the tools selected, shade them a bit. Would look pretty and give the user some feedback as to what the settings are.
//make proper dev/live setup, not hacky "dev" var
//use multi-canvas approach to show what would be drawn while mouse is up
//use multi-canvas approach to allow drawing of arrows
//When 100% complete, sit back and relax and enjoy the warm and fuzzy feeling of completion and satisfaction before moving on to something else.
//Style the toggle button so it looks like a toggle button, not just some random green rectangle
//TODO: Make sure the jQuerys don't collide x.x
//control bar and canvas really should be separate classes and stuck into skribl
//Is borkd in chrome x.x
var dev = false,
	linker = {
		css: dev ? 'skribl.css' : 'http://glaciusor.github.com/sandbox/Draw/skribl.css'
	};

var Skribl = {
	$canvas:  null,
	$control_bar: null,
	mouse_held: false,
	color: "#000",
	size: 4,
	last_mouse_pos: null,
	initSkribl: function () {
		//Prevent loading in iframes
		if (!window.parent) {
			return;
		}

		$('head').append('<link type="text/css" rel="stylesheet" href="' + linker.css + '" />');
		this.initToggleButton();
	},
	toggleSkribl: function () {
		this.$canvas.toggle();
		this.$control_bar.toggle();
	},
	initToggleButton: function () {
		var that = this;

		$('body').append('<div id="skribl_toggle_button"></div>');

		$('#skribl_toggle_button').delegate("", 'click', function (ev) {
			if (!that.$canvas) {
				that.initCanvas();
				that.initControlBar();
			}
			else {
				that.toggleSkribl();
			}
		});
	},
	initControlBar: function () {
		var that = this;

		//TODO: Make a nice way to create these, not specifying the whole html+css in one hardcoded string
		$('body').append('<div id="skribl_control_bar"></div>');

		this.$control_bar = $('#skribl_control_bar');

		this.$control_bar
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
			.append('<div><input type="text" id="size_change" value="' + that.size + '" size="3" /></div>');

		//Bind an onblur handler to the size changer input
		$('#size_change').blur(function () {
			that.getSize();
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
	},
	initCanvas: function () {
		var width = $(document).width(),
			height = $(document).height(),
			that = this;

		//TODO: On document resize, resize the canvas or find a way to make it auto-resize with the document
		//TODO: make this auto-detect the highest Z-index and go 1 higher than it
		$('body').append('<canvas id="skribl_draw_plane" width="' + width + 'px" height="' + height + 'px"></canvas>')

		//Give us a jQuery reference to the canvas
		this.$canvas = $('#skribl_draw_plane');

		//What to do when the user presses down on the mouse...
		this.$canvas.delegate("", 'mousedown', function (ev) {
			that.mouse_held = true;
			that.last_mouse_pos = {
				x: ev.pageX,
				y: ev.pageY
			};

			//Make sure we get the size from the size box before drawing
			that.getSize();

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
	},
	getSize: function () {
		var clean_input = parseInt($('#size_change').val(), 10);

		if (isNaN(clean_input) || clean_input < 1 || clean_input > 256) {
			console.log("Warning: Invalid size selected. Restoring previous value.");
			clean_input = that.size;
		}

		$('#size_change').val(clean_input);
		this.size = clean_input;

		return this;
	}

};

