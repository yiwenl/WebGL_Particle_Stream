// GLModel.js

if(window.bongiovi === undefined ) window.bongiovi = {};

(function() {
	if(bongiovi.GLModel === undefined) {
		var GLModel = function GLModel(gl, numVertex, type) {
			if(gl == undefined) return;
			this.gl = gl;
			this._numVertex = numVertex;
			this._vertices = [];
			this._uvs = [];
			this._indices = [];
			this._textures = [];
			this._attributes = [];
			this._attrBuffers = [];
			this.debug = false;
			this._isUniformSet = false;
			this._uniforms = {};
			this.showWireFrame = false;
			this.lineWidth = 2;

			this._createIndexBuffer();
		}

		bongiovi.GLModel = GLModel;
		bongiovi.GLModel.QUAD 		= "quad";
		bongiovi.GLModel.TRIANGLE 	= "triangle";
		var p = GLModel.prototype;


		p.updateVertex = function(index, x, y, z) {
			this._vertices[index*3] = x;
			this._vertices[index*3+1] = y;
			this._vertices[index*3+2] = z;
		}


		p.updateTextCoord = function(index, u, v) {
			this._uvs[index*2] = u;
			this._uvs[index*2+1] = v;
		} 


		p.setTexture = function(index, text) {
			this._textures[index] = text;
		}


		p.setAttribute = function(index, name, size){
			this._attributes[index] = {name:name, size:size, attributes:[] };
		}


		p.updateAttribute = function(attributeIndex, index, value) {
			var attr = this._attributes[attributeIndex];
			var attributes = attr.attributes;
			var ary;
			if(!isArray(value)) ary = [value];
			else ary = value;

			for ( var i=0; i<ary.length; i++) {
				attributes[index*attr.size + i] = ary[i];
			}
		}


		p.render = function(shader, mvMatrix, pMatrix, output) {

			if(output != undefined) {
				this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, output.frameBuffer);
				this.gl.viewport(0, 0, output.frameBuffer.width, output.frameBuffer.height);
        		// this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			} 

			var shaderProgram = shader.shaderProgram;
			this.gl.useProgram(shaderProgram);

			this.attachAttributes(shaderProgram);
			
			this.bindBuffers(shaderProgram);
			
			this.setupUniforms(shader, shaderProgram, mvMatrix, pMatrix);
			this.bindTextures(shaderProgram);

			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
			if(!this.showWireFrame) this.gl.drawElements(this.gl.TRIANGLES, this.iBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);	
			else {
				this.gl.lineWidth(this.lineWidth);
				this.gl.drawElements(this.gl.LINES, this.iBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);	
			}

			if(output != undefined) {
				this.gl.bindTexture(this.gl.TEXTURE_2D, output.texture);
		        this.gl.generateMipmap(this.gl.TEXTURE_2D);
		        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
		        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        		// this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			}

			// this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
			// this._cleanUniforms(shader);
			// this._unBindBuffer(shaderProgram);
			// this._unbindTextures();
		}


		p._unbindTextures = function(shaderProgram) {
			for ( var i=0 ; i<this._textures.length; i++) {
				this.gl.bindTexture(this.gl.TEXTURE_2D, null);
			} 
		};


		p._unBindBuffer = function(shaderProgram) {
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

			for( var i=0; i<this._attributes.length; i++) {
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
			}
		};


		p._cleanUniforms = function(shader) {
			return;
			var shaderProgram = shader.shaderProgram;
			for ( var i=0; i<shader.parameters.length; i++) {
				var o = shader.parameters[i];
				if(o.type.indexOf("Matrix") == -1) this.gl[o.type](shaderProgram[o.name], null);
				else {
					this.gl.uniformMatrix3fv(shaderProgram[o.name], false, o.value);
				}
			}

			this.gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, null );
			this.gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, null );
		};


		p.bindTextures = function(shaderProgram) {
			// if(this.debug) console.log( this._textures.length );
			for ( var i=0 ; i<this._textures.length; i++) {
				if(this._textures[i] == null) continue;
				this.gl.activeTexture(this.gl.TEXTURE0 + i);
				// console.log( this.gl.TEXTURE0 + i, this._textures[i].texture );
				this.gl.bindTexture(this.gl.TEXTURE_2D, this._textures[i].texture);
				this.gl.uniform1i(shaderProgram["samplerUniform"+i], i);
			} 
		}


		p.bindBuffers = function(shaderProgram) {
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferPos);
			this.gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vBufferPos.itemSize, this.gl.FLOAT, false, 0, 0);

			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferUV);
			this.gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.vBufferUV.itemSize, this.gl.FLOAT, false, 0, 0);

			for( var i=0; i<this._attributes.length; i++) {
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._attributes[i].buffer);
				this.gl.vertexAttribPointer(shaderProgram[this._attributes[i].name], this._attributes[i].size, this.gl.FLOAT, false, 0, 0);
			}
		}


		p.setupUniforms = function(shader, shaderProgram, mvMatrix, pMatrix) {
			// console.log( "setupUniforms" );
			for ( var i=0; i<this._textures.length; i++) {
				shaderProgram["samplerUniform"+i] = this.gl.getUniformLocation(shaderProgram, "uSampler" + i.toString());
			}

				
			for ( var i=0; i<shader.parameters.length; i++) {
				var o = shader.parameters[i];
				if(this._uniforms[o.name] == undefined || this._uniforms[o.name]!=o.value) {
					if(o.type.indexOf("Matrix") == -1) this.gl[o.type](shaderProgram[o.name], o.value);
					else {
						this.gl.uniformMatrix3fv(shaderProgram[o.name], false, o.value);
					}
				}

				this._uniforms[o.name] = o.value;
			}
				
			this.gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
			this.gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix );
			this._isUniformSet = true;
		}


		p.attachAttributes = function(shaderProgram) {
			shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(shaderProgram, "aVertexPosition");
			this.gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

			shaderProgram.textureCoordAttribute = this.gl.getAttribLocation(shaderProgram, "aTextureCoord");
			this.gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

			for( var i=0; i<this._attributes.length; i++) {
				shaderProgram[this._attributes[i].name] = this.gl.getAttribLocation(shaderProgram, this._attributes[i].name);
				this.gl.enableVertexAttribArray(shaderProgram[this._attributes[i].name]);
			}
			

			shaderProgram.pMatrixUniform = this.gl.getUniformLocation(shaderProgram, "uPMatrix");
			shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(shaderProgram, "uMVMatrix");
			// shaderProgram.samplerUniform = this.gl.getUniformLocation(shaderProgram, "uSampler");
		}


		p.generateBuffer = function() {
			this.vBufferPos = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferPos);
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this._vertices), this.gl.STATIC_DRAW);
			this.vBufferPos.itemSize = 3;
			// this.vBufferPos.numItems = this._numVertex;

			this.vBufferUV = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferUV);
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this._uvs), this.gl.STATIC_DRAW);
			this.vBufferUV.itemSize = 2;
			// this.vBufferUV.numItems = this._numVertex;


			for ( var i=0; i<this._attributes.length; i++) {
				this._attributes[i].buffer = this.gl.createBuffer();
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._attributes[i].buffer);
				this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this._attributes[i].attributes), this.gl.STATIC_DRAW);	
			}
		}


		p._createIndexBuffer = function() {
			var numQuad = this._numVertex/4;
			for ( var i=0; i<numQuad; i++) {
				this._indices.push(0+i*4, 1+i*4, 2+i*4, 0+i*4, 2+i*4, 3+i*4);
			}

			this.iBuffer = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
			this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._indices), this.gl.STATIC_DRAW);
			this.iBuffer.itemSize = 1;
			this.iBuffer.numItems = this._indices.length;
		}


		var isArray = function(someVar) {
			if( Object.prototype.toString.call( someVar ) === '[object Array]' ) return true;
			else return false;
		}

	}
})();