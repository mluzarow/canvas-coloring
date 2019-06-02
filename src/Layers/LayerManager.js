class LayerManager {
	constructor (builder, pixelData, pixelHeight, pixelWidth) {
		this.builder = builder;
		
		this.currentID = 2;
		this.layers = [
			this.builder.buildLayer (1, pixelHeight, pixelWidth, "Base Layer", pixelData)
		];
		this.layersCount = 1;
		this.layersHTML = document.getElementById ("layers");
	}
	
	newLayer (canvasHeight, canvasWidth) {
		let newLayer = this.builder.buildLayer (
			++this.currentID,
			canvasHeight,
			canvasWidth
		);
		
		this.layersCount++;
		
		this.layers.unshift (newLayer);
		
		this.layersHTML.appendChild (
			this.builder.buildLayerHTML (
				newLayer,
				this.deleteLayer.bind (this),
				this.dragLayer.bind (this)
			)
		);
	}
	
	deleteLayer (id) {
		let i = -1;
		
		for (let layerIndex in this.layers) {
			if (this.layers[layerIndex].id === id) {
				i = layerIndex;
				break;
			}
		}
		
		if (i === -1) {
			return;
		}
		
		this.layers = this.layers.splice (i, 1);
		this.layersCount--;
		
		document.querySelector (`#layers .layer[data-layer_id="${id}"]`).remove ();
	}
	
	moveLayer (id, hookID) {
		
	}
	
	dragLayer () {
		
	}
}
