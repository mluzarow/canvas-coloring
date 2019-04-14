var ctx = undefined;
var mousePos = {x : 9999, y : 9999};
var mouseDown = false;
var brushSize = 5;
var brushColor = {
	r : 255,
	g : 255,
	b : 255,
	fill: "#ffffff"
};

var tools = {
	brush: 0,
	paintcan: 1
};

var toolContext = tools.brush;

var working = false;

window.onload = () => {
	ctx = document.getElementById ("canvas").getContext ("2d");
	
	clearCanvas ();
	
	document.getElementById ("clear").addEventListener ("click", clearCanvas);
	document.getElementById ("brush_size").addEventListener ("change", e => brushSize = parseInt (e.target.value))
	document.addEventListener ("mousemove", mousePosUpdate);
	document.addEventListener ("mousedown", () => mouseDown = true);
	document.addEventListener ("mouseup", () => mouseDown = false);
	document.getElementById ("rgb_r").addEventListener ("change", e => updateBrushColor ('r', parseInt (e.target.value)));
	document.getElementById ("rgb_g").addEventListener ("change", e => updateBrushColor ('g', parseInt (e.target.value)));
	document.getElementById ("rgb_b").addEventListener ("change", e => updateBrushColor ('b', parseInt (e.target.value)));
	document.getElementById ("tool_brush").addEventListener ("click", () => toolContext = tools.brush);
	document.getElementById ("tool_paintcan").addEventListener ("click", () => toolContext = tools.paintcan);
	
	requestAnimationFrame (eventLoop);
};

/**
 * Fills currently selected color over all pixels with the color of the pixel
 * clicked.
 * 
 * @param  {Object} mousePos mouse coordinates of fill click
 */
function fill (mousePos) {
	let imageData = ctx.getImageData (0, 0, 500, 500);
	let pixelData = imageData.data;
	
	let oPos = mousePos.y * 2000 + mousePos.x * 4;
	
	let originColor = [
		pixelData[oPos],
		pixelData[oPos + 1],
		pixelData[oPos + 2],
	];
	
	imageData.data = fillHelper (mousePos, originColor, pixelData);
	
	ctx.putImageData (imageData, 0, 0);
}

/**
 * Recursive fill helper.
 * 
 * @this canvas pixel data
 * 
 * @param {Object} pixel       x,y coordinate of current pixel to be worked on.
 *                             This is the pixel position and not the position
 *                             inside the pixel data array.
 * @param {String}            originColor color of the pixel originally clicked
 * @param {Uint8ClampedArray} pixelData   canvas pixel data
 */
function fillHelper (pixel, originColor, pixelData) {
	if (pixel.x < 0 || pixel.x >= 500 || pixel.y < 0 || pixel.y >= 500) {
		// Out of bounds pixel
		return pixelData;
	}
	
	let realPos = pixel.y * 2000 + pixel.x * 4;
	
	let hex = rgbToHex (
		pixelData[realPos],
		pixelData[realPos + 1],
		pixelData[realPos + 2]
	);
	
	if (hex !== originColor) {
		// Current pixel is not the same color as the original color that was
		// clicked with the fill tool, so skip it
		return pixelData;
	}
	
	if (hex === brushColor.fill) {
		// Current pixel is the same color as the fill color, so skip it
		return pixelData;
	}
	
	// Change color of current pixel to the fill color
	pixelData[realPos] = brushColor.r;
	pixelData[realPos + 1] = brushColor.g;
	pixelData[realPos + 2] = brushColor.b;
	
	// Look at immediate four sides and check for any pixels that are not the
	// fill color or the original pixel color
	pixelData = fillHelper ({x: pixel.x, y: pixel.y + 1}, originColor, pixelData); // Up
	pixelData = fillHelper ({x: pixel.x, y: pixel.y - 1}, originColor, pixelData); // Down
	pixelData = fillHelper ({x: pixel.x + 1, y: pixel.y}, originColor, pixelData); // Right
	pixelData = fillHelper ({x: pixel.x - 1, y: pixel.y}, originColor, pixelData); // Left
	
	return pixelData;
}

function rgbToHex (r, g, b) {
	let hexData = [r.toString (16), g.toString (16), b.toString (16)].map (
		v => {while (v.length < 2) v = '0' + v; return v;}
	);
	
	return `#${hexData[0]}${hexData[1]}${hexData[2]}`;
}

function updateBrushColor (type, val) {
	switch (type) {
		case 'r': brushColor.r = val; break;
		case 'g': brushColor.g = val; break;
		case 'b': brushColor.b = val;
	}
	
	let rgb = [
		brushColor.r.toString (16),
		brushColor.g.toString (16),
		brushColor.b.toString (16)
	];
	
	let rgbh = rgb.map (v => {while (v.length < 2) v = '0' + v; return v;});
	
	brushColor.fill = `#${rgbh[0]}${rgbh[1]}${rgbh[2]}`;
	
	document.getElementById ("rgb_result").style.backgroundColor = brushColor.fill;
	
	ctx.fillStyle = brushColor.fill;
}

function mousePosUpdate (e) {
	mousePos = {
		x: e.pageX,
		y: e.pageY
	};
}

function eventLoop () {
	if (mouseDown && mousePos.x <= 500 && mousePos.y <= 500) {
		if (toolContext === tools.brush) {
			ctx.fillRect (mousePos.x, mousePos.y, brushSize, brushSize);
		} else if (toolContext === tools.paintcan && working === false) {
			working = true;
			fill (mousePos);
			setTimeout (() => working = false, 200);
		}
	}
	
	requestAnimationFrame (eventLoop);
}

function clearCanvas () {
	ctx.fillStyle = "#000";
	ctx.fillRect (0, 0, 500, 500);
	ctx.fillStyle = brushColor.fill;
}
