class LayerBuilder {
	buildLayerHTML (layerObj, deleteEvent, dragEvent, flagActive = false, flagDelete = true, ) {
		let layer = document.createElement ("div");
		layer.classList = "layer" + (!flagActive ? '' : " active");
		layer.dataset.layer_id = layerObj.id;
		
		let activeBar = document.createElement ("div");
		activeBar.classList = "active_bar";
		
		layer.appendChild (activeBar);
		
		if (flagDelete === true) {
			let btnDelete = document.createElement ("div");
			btnDelete.classList = "btn_delete";
			btnDelete.innerHTML = 'X';
			btnDelete.addEventListener ("click", () => deleteEvent (layerObj.id));
			
			layer.appendChild (btnDelete);
		}
		
		let name = document.createElement ("div");
		name.classList = "name";
		name.innerHTML = layerObj.title;
		
		layer.appendChild (name);
		
		return layer;
	}
}
