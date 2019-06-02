class LayerManager {
	constructor (layerBuilder) {
		this.builder = layerBuilder;
		
		this.currentID = 1;
		this.layers = [];
		this.layersCount = 0;
		this.layersHTML = document.getElementById ("layers");
	}
	
	newLayer (imgData) {
		let newLayer = new Layer (
			++this.currentID,
			imgData,
			`Layer ${this.currentID}`
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
