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

window.onload = () => {
	ctx = document.getElementById ("canvas").getContext ("2d");
	
	clearCanvas ();
	
	document.getElementById ("clear").addEventListener ("click", clearCanvas);
	document.getElementById ("brush_size").addEventListener ("change", (e) => brushSize = parseInt (e.target.value))
	document.addEventListener ("mousemove", mousePosUpdate);
	document.addEventListener ("mousedown", () => mouseDown = true);
	document.addEventListener ("mouseup", () => mouseDown = false);
	document.getElementById ("rgb_r").addEventListener ("change", (e) => updateBrushColor ('r', parseInt (e.target.value)));
	document.getElementById ("rgb_g").addEventListener ("change", (e) => updateBrushColor ('g', parseInt (e.target.value)));
	document.getElementById ("rgb_b").addEventListener ("change", (e) => updateBrushColor ('b', parseInt (e.target.value)));
	
	requestAnimationFrame (eventLoop);
};

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
	console.log (rgb);
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
		ctx.fillRect (mousePos.x, mousePos.y, brushSize, brushSize);
	}
	
	requestAnimationFrame (eventLoop);
}

function clearCanvas () {
	ctx.fillStyle = "#000";
	ctx.fillRect (0, 0, 500, 500);
	ctx.fillStyle = brushColor.fill;
}
