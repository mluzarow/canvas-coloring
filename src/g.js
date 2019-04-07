var ctx = undefined;
var mousePos = {x : 9999, y : 9999};
var mouseDown = false;
var brushSize = 1;

window.onload = () => {
	ctx = document.getElementById ("canvas").getContext ("2d");
	
	clearCanvas ();
	
	document.getElementById ("clear").addEventListener ("click", clearCanvas);
	document.getElementById ("brush_size").addEventListener ("change", (e) => brushSize = parseInt (e.target.value))
	document.addEventListener ("mousemove", mousePosUpdate);
	document.addEventListener ("mousedown", () => mouseDown = true);
	document.addEventListener ("mouseup", () => mouseDown = false);
	
	requestAnimationFrame (eventLoop);
};

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
	ctx.fillStyle = "#fff";
}
