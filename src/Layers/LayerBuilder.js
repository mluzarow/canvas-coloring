class LayerBuilder {
	buildLayerHTML (layerObj, deleteEvent, dragEvent, flagActive = false, flagDelete = true, ) {
		let layer = document.createElement ("div");
		let classes = [];
		
		classes.push ("layer");
		
		if (flagActive === true) {
			classes.push ("active");
		}
		
		if (flagDelete === true) {
			classes.push ("deletable");
		}
		
		layer.classList = classes.join (' ');
		layer.dataset.layer_id = layerObj.id;
		
		let activeBar = document.createElement ("div");
		activeBar.classList = "active_bar";
		
		layer.appendChild (activeBar);
		
		let btnDelete = document.createElement ("div");
		btnDelete.classList = "btn_delete";
		btnDelete.innerHTML = 'X';
		btnDelete.addEventListener ("click", () => deleteEvent (layerObj.id));
		
		layer.appendChild (btnDelete);
		
		let name = document.createElement ("div");
		name.classList = "name";
		name.innerHTML = layerObj.title;
		
		layer.appendChild (name);
		
		return layer;
	}
	
	buildLayer (layerID, canvasHeight, canvasWidth, name="", pixelData=[]) {
		return new Layer (
			layerID,
			pixelData.length < 1 ? [].fill (0, 0, canvasHeight * canvasWidth * 4) : pixelData,
			name.length < 1 ? `Layer ${layerID}` : name
		);
	}
}
