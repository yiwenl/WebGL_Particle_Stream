// Mesh.js

(function() {
	Mesh = function(vertexSize, indexSize, drawType) {
		if(GL == undefined) return;
		this.gl = GL.gl;
		this.vertexSize = vertexSize;
		this.indexSize = indexSize;
		this.drawType = drawType;
		this.extraAttributes = [];

		this._floatArrayVertex = undefined;

		this._init();
	}

	var p = Mesh.prototype;


	p._init = function() {
		
	};


	p.bufferVertex = function(aryVertices) {
		var vertices = [];

		for(var i=0; i<aryVertices.length; i++) {
			for(var j=0; j<aryVertices[i].length; j++) vertices.push(aryVertices[i][j]);
		}

		if(this.vBufferPos == undefined ) this.vBufferPos = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferPos);

		if(this._floatArrayVertex == undefined) this._floatArrayVertex = new Float32Array(vertices);
		else {
			if(aryVertices.length != this._floatArrayVertex.length) this._floatArrayVertex = new Float32Array(vertices);
			else {
				for(var i=0;i<aryVertices.length; i++) {
					this._floatArrayVertex[i] = aryVertices[i];
				}
			}
		}

		this.gl.bufferData(this.gl.ARRAY_BUFFER, this._floatArrayVertex, this.gl.STATIC_DRAW);
		this.vBufferPos.itemSize = 3;
	};


	p.bufferTexCoords = function(aryTexCoords) {
		var coords = [];

		for(var i=0; i<aryTexCoords.length; i++) {
			for(var j=0; j<aryTexCoords[i].length; j++) coords.push(aryTexCoords[i][j]);
		}

		this.vBufferUV = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferUV);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(coords), this.gl.STATIC_DRAW);
		this.vBufferUV.itemSize = 2;
	};


	p.bufferData = function(data, name, itemSize) {
		var index = -1
		for(var i=0; i<this.extraAttributes.length; i++) {
			if(this.extraAttributes[i].name == name) {
				this.extraAttributes[i].data = data;
				index = i;
				break;
			}
		}

		var bufferData = [];
		for(var i=0; i<data.length; i++) {
			for(var j=0; j<data[i].length; j++) bufferData.push(data[i][j]);
		}

		if(index == -1) {
			var buffer = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
			var floatArray = new Float32Array(bufferData);
			this.gl.bufferData(this.gl.ARRAY_BUFFER, floatArray, this.gl.STATIC_DRAW);	
			this.extraAttributes.push({name:name, data:data, itemSize:itemSize, buffer:buffer, floatArray:floatArray});
		} else {
			var buffer = this.extraAttributes[index].buffer;
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
			var floatArray = this.extraAttributes[index].floatArray;
			for(var i=0;i<bufferData.length; i++) {
				floatArray[i] = bufferData[i];
			}
			this.gl.bufferData(this.gl.ARRAY_BUFFER, floatArray, this.gl.STATIC_DRAW);	
		}
		
	};


	p.bufferIndices = function(aryIndices) {
		this.iBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(aryIndices), this.gl.STATIC_DRAW);
		this.iBuffer.itemSize = 1;
		this.iBuffer.numItems = aryIndices.length;
	};
})();