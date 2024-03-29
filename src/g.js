var $canvas = undefined;
var ctx = undefined;
var mousePos = {x : 9999, y : 9999};
var lastPixelTouched = undefined;
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
	paintcan: 1,
	eyedropper: 2
};

var toolContext = tools.brush;

var working = false;

window.onload = () => {
	$canvas = document.getElementById ("canvas");
	$canvas.width = window.innerWidth * 0.6;
	$canvas.height = window.innerHeight > $canvas.width ? $canvas.width : window.innerHeight;
	ctx = $canvas.getContext ("2d");
	
	clearCanvas ();
	
	document.getElementById ("clear").addEventListener ("click", clearCanvas);
	document.getElementById ("brush_size").addEventListener ("change", e => brushSize = parseInt (e.target.value))
	document.addEventListener ("mousemove", mousePosUpdate);
	document.addEventListener ("mousedown", handlerMouseDown);
	document.addEventListener ("mouseup", handlerMouseUp);
	document.getElementById ("rgb_r").addEventListener ("change", e => updateBrushColor ('r', parseInt (e.target.value)));
	document.getElementById ("rgb_g").addEventListener ("change", e => updateBrushColor ('g', parseInt (e.target.value)));
	document.getElementById ("rgb_b").addEventListener ("change", e => updateBrushColor ('b', parseInt (e.target.value)));
	document.getElementById ("tool_brush").addEventListener ("click", () => toolContext = tools.brush);
	document.getElementById ("tool_paintcan").addEventListener ("click", () => toolContext = tools.paintcan);
	document.getElementById ("tool_eyedropper").addEventListener ("click", () => toolContext = tools.eyedropper);
	
	document.querySelectorAll ("#color_saver .color_box").forEach (
		v => v.addEventListener ("click", e => updateSavedColor (e))
	);
	
	requestAnimationFrame (eventLoop);
};

function handlerMouseDown() {
	mouseDown = true;
	lastPixelTouched = {
		x: mousePos.x,
		y: mousePos.y
	};
}

function handlerMouseUp() {
	mouseDown = false;
	lastPixelTouched = undefined;
}


function updateSavedColor (e) {
	let $block = e.target;
	
	if ($block.classList.contains ("empty")) {
		$block.classList = "color_box";
		$block.style.backgroundColor = brushColor.fill;
		$block.dataset.hex_ref = brushColor.fill;
	} else {
		brushColor.fill = $block.dataset.hex_ref;
		ctx.fillStyle = brushColor.fill;
		ctx.strokeStyle = brushColor.fill;
		brushColor.r = parseInt (brushColor.fill.substr(1, 2), 16);
		brushColor.g = parseInt (brushColor.fill.substr(3, 2), 16);
		brushColor.b = parseInt (brushColor.fill.substr(5, 2), 16);
		document.getElementById ("rgb_r").value = brushColor.r;
		document.getElementById ("rgb_g").value = brushColor.g;
		document.getElementById ("rgb_b").value = brushColor.b;
		document.getElementById ("rgb_result").style.backgroundColor = brushColor.fill;
	}
}

/**
 * Fills currently selected color over all pixels with the color of the pixel
 * clicked.
 * 
 * @param  {Object} mousePos mouse coordinates of fill click
 */
function fill (mousePos) {
	let imageData = ctx.getImageData (0, 0, $canvas.width, $canvas.height);
	let pixelData = imageData.data;
	
	let oPos = mousePos.y * $canvas.width * 4 + mousePos.x * 4;
	
	let clickedPixel = {
		dataPosition: oPos,
		gridPosition: {
			x: mousePos.x,
			y: mousePos.y
		},
		pixelColor: {
			r: pixelData[oPos],
			g: pixelData[oPos + 1],
			b: pixelData[oPos + 2]
		}
	};
	
	let fillColor = {
		r: brushColor.r,
		g: brushColor.g,
		b: brushColor.b
	};
	
	if (
		clickedPixel.pixelColor.r === fillColor.r &&
		clickedPixel.pixelColor.g === fillColor.g &&
		clickedPixel.pixelColor.b === fillColor.b
	) {
		// Don't bother if the clicked pixel and the fill color are the same
		// since it's already technically filled
		return;
	}
	
	let expandOrigins = [
		clickedPixel
	];
	
	do {
		let newExpandOrigins = [];
		
		for (let i = 0; i < expandOrigins.length; i++) {
			// For each expandable origin pixel, check around each of its four
			// corners. If there is a spot that is not the original fill color
			// AND the same color as the clicked pixel color, fill it with the
			// fill color and add that filled pixel to a new expandable origins
			// list that will replace the current expandable origins list on next
			// iteration of outside while loop.
			
			// Up
			if (expandOrigins[i].gridPosition.y > 0) {
				// If grid position is more than 0, we are NOT on the top row
				// so we can go up further
				
				let currentPixel = {
					dataPosition: expandOrigins[i].dataPosition - ($canvas.width * 4),
					gridPosition: {
						x: expandOrigins[i].gridPosition.x,
						y: expandOrigins[i].gridPosition.y - 1
					},
					pixelColor: {}
				};
				
				currentPixel.pixelColor = {
					r: pixelData[currentPixel.dataPosition],
					g: pixelData[currentPixel.dataPosition + 1],
					b: pixelData[currentPixel.dataPosition + 2],
				};
				
				if (
					currentPixel.pixelColor.r === clickedPixel.pixelColor.r &&
					currentPixel.pixelColor.g === clickedPixel.pixelColor.g &&
					currentPixel.pixelColor.b === clickedPixel.pixelColor.b
				) {
					// Pixel is a fillable color
					currentPixel.pixelColor = fillColor;
					
					// Update pixel to fill color
					pixelData[currentPixel.dataPosition] = fillColor.r;
					pixelData[currentPixel.dataPosition + 1] = fillColor.g;
					pixelData[currentPixel.dataPosition + 2] = fillColor.b;
					
					// Add to processing list
					newExpandOrigins.push (currentPixel);
				}
			}
			
			// Down
			if (expandOrigins[i].gridPosition.y < $canvas.height - 1) {
				// If grid position is less than height - 1, we are NOT on the
				// bottom row so we can go down further
				
				let currentPixel = {
					dataPosition: expandOrigins[i].dataPosition + ($canvas.width * 4),
					gridPosition: {
						x: expandOrigins[i].gridPosition.x,
						y: expandOrigins[i].gridPosition.y + 1
					},
					pixelColor: {}
				};
				
				currentPixel.pixelColor = {
					r: pixelData[currentPixel.dataPosition],
					g: pixelData[currentPixel.dataPosition + 1],
					b: pixelData[currentPixel.dataPosition + 2],
				};
				
				if (
					currentPixel.pixelColor.r === clickedPixel.pixelColor.r &&
					currentPixel.pixelColor.g === clickedPixel.pixelColor.g &&
					currentPixel.pixelColor.b === clickedPixel.pixelColor.b
				) {
					// Pixel is a fillable color
					currentPixel.pixelColor = fillColor;
					
					// Update pixel to fill color
					pixelData[currentPixel.dataPosition] = fillColor.r;
					pixelData[currentPixel.dataPosition + 1] = fillColor.g;
					pixelData[currentPixel.dataPosition + 2] = fillColor.b;
					
					// Add to processing list
					newExpandOrigins.push (currentPixel);
				}
			}
			
			// Left
			if (expandOrigins[i].gridPosition.x > 0) {
				// If grid position is more than 0, we are NOT on the leftmost
				// column so we can go left further
				
				let currentPixel = {
					dataPosition: expandOrigins[i].dataPosition - 4,
					gridPosition: {
						x: expandOrigins[i].gridPosition.x - 1,
						y: expandOrigins[i].gridPosition.y
					},
					pixelColor: {}
				};
				
				currentPixel.pixelColor = {
					r: pixelData[currentPixel.dataPosition],
					g: pixelData[currentPixel.dataPosition + 1],
					b: pixelData[currentPixel.dataPosition + 2],
				};
				
				if (
					currentPixel.pixelColor.r === clickedPixel.pixelColor.r &&
					currentPixel.pixelColor.g === clickedPixel.pixelColor.g &&
					currentPixel.pixelColor.b === clickedPixel.pixelColor.b
				) {
					// Pixel is a fillable color
					currentPixel.pixelColor = fillColor;
					
					// Update pixel to fill color
					pixelData[currentPixel.dataPosition] = fillColor.r;
					pixelData[currentPixel.dataPosition + 1] = fillColor.g;
					pixelData[currentPixel.dataPosition + 2] = fillColor.b;
					
					// Add to processing list
					newExpandOrigins.push (currentPixel);
				}
			}
			
			// Right
			if (expandOrigins[i].gridPosition.x < $canvas.width - 1) {
				// If grid position is less than width - 1, we are NOT on the
				// rightmost column so we can go right further
				
				let currentPixel = {
					dataPosition: expandOrigins[i].dataPosition + 4,
					gridPosition: {
						x: expandOrigins[i].gridPosition.x + 1,
						y: expandOrigins[i].gridPosition.y
					},
					pixelColor: {}
				};
				
				currentPixel.pixelColor = {
					r: pixelData[currentPixel.dataPosition],
					g: pixelData[currentPixel.dataPosition + 1],
					b: pixelData[currentPixel.dataPosition + 2],
				};
				
				if (
					currentPixel.pixelColor.r === clickedPixel.pixelColor.r &&
					currentPixel.pixelColor.g === clickedPixel.pixelColor.g &&
					currentPixel.pixelColor.b === clickedPixel.pixelColor.b
				) {
					// Pixel is a fillable color
					currentPixel.pixelColor = fillColor;
					
					// Update pixel to fill color
					pixelData[currentPixel.dataPosition] = fillColor.r;
					pixelData[currentPixel.dataPosition + 1] = fillColor.g;
					pixelData[currentPixel.dataPosition + 2] = fillColor.b;
					
					// Add to processing list
					newExpandOrigins.push (currentPixel);
				}
			}
		}
		
		expandOrigins = newExpandOrigins.map (x => x);
	} while (expandOrigins.length > 0);
	
	ctx.putImageData (imageData, 0, 0);
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
	ctx.strokeStyle = brushColor.fill;
}

function getClickedColor (x, y) {
	let imageData = ctx.getImageData (0, 0, $canvas.width, $canvas.height);
	let pixelData = imageData.data;
	
	let realPos = y * $canvas.width * 4 + x * 4;
	
	brushColor.r = pixelData[realPos];
	brushColor.g = pixelData[realPos + 1];
	brushColor.b = pixelData[realPos + 2];
	
	brushColor.fill = rgbToHex (brushColor.r, brushColor.g, brushColor.b);
	
	ctx.fillStyle = brushColor.fill;
	ctx.strokeStyle = brushColor.fill;
	
	document.getElementById ("rgb_r").value = brushColor.r;
	document.getElementById ("rgb_g").value = brushColor.g;
	document.getElementById ("rgb_b").value = brushColor.b;
	document.getElementById ("rgb_result").style.backgroundColor = brushColor.fill;
}

function mousePosUpdate (e) {
	lastPixelTouched = {
		x: mousePos.x,
		y: mousePos.y
	};
	
	mousePos = {
		x: e.pageX,
		y: e.pageY
	};
}

function eventLoop () {
	if (mouseDown === true && mousePos.x <= $canvas.width && mousePos.y <= $canvas.height) {
		if (toolContext === tools.brush) {
			ctx.beginPath();
			ctx.moveTo(lastPixelTouched.x, lastPixelTouched.y);
			ctx.lineTo(mousePos.x, mousePos.y);
			ctx.lineWidth = brushSize;
			ctx.stroke();
			
			let a = new Path2D();
			a.arc(mousePos.x, mousePos.y, brushSize / 2, 0, 2 * Math.PI);
			ctx.fill(a);
		} else if (toolContext === tools.paintcan && working === false) {
			working = true;
			fill (mousePos);
			setTimeout (() => working = false, 200);
		} else if (toolContext === tools.eyedropper) {
			getClickedColor (mousePos.x, mousePos.y);
		}
	}
	
	requestAnimationFrame (eventLoop);
}

function clearCanvas () {
	ctx.fillStyle = "#000";
	ctx.fillRect (0, 0, $canvas.width, $canvas.height);
	ctx.fillStyle = brushColor.fill;
	ctx.strokeStyle = brushColor.fill;
}
