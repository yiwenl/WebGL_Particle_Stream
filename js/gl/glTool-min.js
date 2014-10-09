// GLTools.js

GL = {};
GL.id = "GLTools";
GL.aspectRatio = window.innerWidth/window.innerHeight;
GL.fieldOfView = 45;
GL.zNear = 5;
GL.zFar = 3000;

GL.init = function(canvas) {

	console.log( 'INIT : ', canvas, this, this.resize );
	this.canvas = canvas;
	this.gl = this.canvas.getContext("experimental-webgl", {antialias:true});
	this.resize();

	var size = this.gl.getParameter(this.gl.SAMPLES);
	var antialias = this.gl.getContextAttributes().antialias;
	console.log( "Sample size : ", size, antialias );

	this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE)
	this.gl.enable(this.gl.BLEND);
	this.gl.clearColor( 0, 0, 0, 1 );
	this.gl.clearDepth( 1 );

	this.matrix 		= mat4.create();
	mat4.identity(this.matrix);

	

	var that = this;
	window.addEventListener("resize", function() {
		console.log( "resize" );
		console.log( "resize" );
		console.log( "resize" );
		console.log( "resize" );
		console.log( "resize" );
		that.resize();
	});
} 

GL.resize = function(e) {
	if( this.id == undefined) return;
	this.W 	= window.innerWidth;
	this.H  = window.innerHeight;

	this.canvas.width = this.W;
	this.canvas.height = this.H;
	this.gl.viewportWidth = this.W;
	this.gl.viewportHeight = this.H;
	this.gl.viewport(0, 0, this.W, this.H);
	this.aspectRatio = window.innerWidth/window.innerHeight;

	this.projection 	= mat4.perspective(this.fieldOfView, this.aspectRatio, this.zNear, this.zFar);

	this.render();
}


GL.setViewport = function(x, y, w, h) {
	this.gl.viewport(x, y, w, h);
}

GL.setMatrices = function(camera) {
	this.camera = camera;
	
}

GL.rotate = function(rotation) {
	// quat4.toMat4(quat, this.matrix);
	mat4.set(rotation, this.matrix);
}


GL.render = function() {
	if(!this.shaderProgram) return;
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
}


GL.draw = function(mesh) {
	this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.camera.getMatrix() );
	this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.matrix );

	// 	VERTEX POSITIONS
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.vBufferPos);
	var vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
	this.gl.vertexAttribPointer(vertexPositionAttribute, mesh.vBufferPos.itemSize, this.gl.FLOAT, false, 0, 0);
	this.gl.enableVertexAttribArray(vertexPositionAttribute);

	//	TEXTURE COORDS
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.vBufferUV);
	var textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
	this.gl.vertexAttribPointer(textureCoordAttribute, mesh.vBufferUV.itemSize, this.gl.FLOAT, false, 0, 0);
	this.gl.enableVertexAttribArray(textureCoordAttribute);

	//	INDICES
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.iBuffer);

	//	EXTRA ATTRIBUTES
	for(var i=0; i<mesh.extraAttributes.length; i++) {
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.extraAttributes[i].buffer);
		var attrPosition = this.gl.getAttribLocation(this.shaderProgram, mesh.extraAttributes[i].name);
		this.gl.vertexAttribPointer(attrPosition, mesh.extraAttributes[i].itemSize, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(attrPosition);		
	}

	//	DRAWING
	this.gl.drawElements(mesh.drawType, mesh.iBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);	
}






// GLShader.js

(function() {
	var gl;
	GLShader = function(vertexShaderID, fragmentShaderID) {
		if(!GL) return;
		gl         		= GL.gl;
		this.idVertex   = vertexShaderID;
		this.idFragment = fragmentShaderID;
		this.getShader(this.idVertex, true);
		this.getShader(this.idFragment, false);
		this.parameters = [];
	}

	var p = GLShader.prototype;

	p.init = function() {
		this.shaderProgram = gl.createProgram();
		gl.attachShader(this.shaderProgram, this.vertexShader);
		gl.attachShader(this.shaderProgram, this.fragmentShader);
		gl.linkProgram(this.shaderProgram);
		console.log( "Shader program created : ", this.idVertex, this.idFragment );
	};


	p.getShader = function(id, isVertexShader) {
		var req = new XMLHttpRequest();
		req.hasCompleted = false;
		var that = this;
		req.onreadystatechange = function(e) {
			if(e.target.readyState == 4) that.createShaderProgram(e.target.responseText, isVertexShader)
		};
		req.open("GET", id, true);
		req.send(null);
	}


	p.createShaderProgram = function(str, isVertexShader) {
		var shader = isVertexShader ? gl.createShader(gl.VERTEX_SHADER) : gl.createShader(gl.FRAGMENT_SHADER);

		gl.shaderSource(shader, str);
	    gl.compileShader(shader);

	    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	        alert(gl.getShaderInfoLog(shader));
	        return null;
	    }


	    if(isVertexShader) this.vertexShader = shader;
	    else this.fragmentShader = shader;

	    if(this.vertexShader!=undefined && this.fragmentShader!=undefined) this.init();
	};


	p.bind = function() {
		gl.useProgram(this.shaderProgram);

		this.shaderProgram.pMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
		this.shaderProgram.mvMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uMVMatrix");

		GL.shader 			= this;
		GL.shaderProgram 	= this.shaderProgram;

		this.uniformTextures = [];
	};


	p.uniform = function(name, type, value) {

		for(var i=0; i<this.parameters.length; i++) {
			var oUniform = this.parameters[i];
			if(oUniform.name == name) {
				oUniform.value = value;
				return;
			}
		}
		this.parameters.push( {name:name, type:type, value:value} );
		this.shaderProgram[name] = gl.getUniformLocation(this.shaderProgram, name);


		if(type.indexOf("Matrix") == -1) gl[type](gl.getUniformLocation(this.shaderProgram, name), value);
		else {
			gl.uniformMatrix3fv(gl.getUniformLocation(this.shaderProgram, name), false, value);
		}

		if(type == "uniform1i") {	//	TEXTURE
			this.uniformTextures[value] = gl.getUniformLocation(this.shaderProgram, name);
		}
	}



	p.unbind = function() {
		
	};
})();


// GLTexture.js

(function() {
	var gl;

	GLTexture = function(source) {
		gl = GL.gl;
		this.texture = gl.createTexture();
		this._isVideo = (source.tagName == "VIDEO");


		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

		if(!this._isVideo) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
			gl.generateMipmap(gl.TEXTURE_2D);
		}

		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	var p = GLTexture.prototype;


	p.updateTexture = function(source) {
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

		if(!this._isVideo) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}

		gl.bindTexture(gl.TEXTURE_2D, null);
	};


	p.bind = function(index) {
		if(index == undefined) index = 0;

		gl.activeTexture(gl.TEXTURE0 + index);
		// console.log( gl.TEXTURE0 + i, this._textures[i].texture );
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		// gl.uniform1i(shaderProgram["samplerUniform"+i], i);
		gl.uniform1i(GL.shader.uniformTextures[index], index);
		this._bindIndex = index;
	};


	p.unbind = function() {
		gl.bindTexture(gl.TEXTURE_2D, null);
	};
})();


// Camera.js


(function() {
	Camera = function() {
		this.matrix = mat4.create();
		mat4.identity(this.matrix);
	}

	var p = Camera.prototype;

	p.getMatrix = function() {
		return this.matrix;
	};
})();


(function() {
	CameraPersp = function() {
		Camera.call(this);
		this.projection = mat4.create();
		mat4.identity(this.projection);
		this.mtxFinal = mat4.create();
	}

	var p = CameraPersp.prototype = new Camera();
	var s = Camera.prototype;


	p.setPerspective = function(fov, aspectRatio, near, far) {
		this.projection = mat4.perspective(fov, aspectRatio, near, far);
	};


	p.lookAt = function(eye, center, up) {
		mat4.identity(this.matrix);
		this.matrix = mat4.lookAt(eye, center, up);
	};


	p.getMatrix = function() {
		mat4.multiply(this.projection, this.matrix, this.mtxFinal);
		return this.mtxFinal;
	};
	
})();


// Mesh.js

(function() {
	Mesh = function(vertexSize, indexSize, drawType) {
		if(GL == undefined) return;
		this.gl = GL.gl;
		this.vertexSize = vertexSize;
		this.indexSize = indexSize;
		this.drawType = drawType;
		this.extraAttributes = [];

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

		this.vBufferPos = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferPos);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
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
		for(var i=0; i<this.extraAttributes.length; i++) {
			if(this.extraAttributes[i].name == name) {
				this.extraAttributes[i].data = data;
				return;
			}
		}

		var bufferData = [];
		for(var i=0; i<data.length; i++) {
			for(var j=0; j<data[i].length; j++) bufferData.push(data[i][j]);
		}
		var buffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(bufferData), this.gl.STATIC_DRAW);	

		this.extraAttributes.push({name:name, data:data, itemSize:itemSize, buffer:buffer});
	};


	p.bufferIndices = function(aryIndices) {
		this.iBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(aryIndices), this.gl.STATIC_DRAW);
		this.iBuffer.itemSize = 1;
		this.iBuffer.numItems = aryIndices.length;
	};
})();


// SceneRotation.js

(function() {
	SceneRotation = function(listenerTarget) {
		if(listenerTarget == undefined) listenerTarget = document;

		this._z             = 0;
		this._mouseZ        = 0;
		this._preZ          = 0;
		this._isRotateZ     = 0;
		this.matrix         = mat4.create();
		this.m              = mat4.create();
		this._vZaxis        = vec3.create([0, 0, 0]);
		this._zAxis         = vec3.create([0, 0, -1]);
		this.preMouse       = {x:0, y:0};
		this.mouse          = {x:0, y:0};
		this._isMouseDown   = false;
		this._rotation      = quat4.create([1, 0, 0, 0]);
		this.tempRotation   = quat4.create([0, 0, 0, 0]);
		this._rotateZMargin = 0;
		this.diffX          = 0;
		this.diffY          = 0;
		this._currDiffX     = 0;
		this._currDiffY     = 0;
		this._offset        = .004;
		this._easing        = .1;

		var that = this;
		listenerTarget.addEventListener("mousedown", function(e) {	that._onMouseDown(e);	}	);
		listenerTarget.addEventListener("touchstart", function(e) {	that._onMouseDown(e);	}	);
		listenerTarget.addEventListener("mouseup", function(e) {		that._onMouseUp(e);		}	);
		listenerTarget.addEventListener("touchend", function(e) {		that._onMouseUp(e);		}	);
		listenerTarget.addEventListener("mousemove", function(e) {	that._onMouseMove(e);	}	);
		listenerTarget.addEventListener("touchmove", function(e) {	that._onMouseMove(e);	}	);
		listenerTarget.addEventListener("mousewheel", function(e) {	that._onMouseWheel(e);	} );
		listenerTarget.addEventListener("DOMMouseScroll", function(e) {	that._onMouseWheel(e);	} );
	}

	var p = SceneRotation.prototype;


	var getMousePos = function(e) {
		var mouseX, mouseY;

		if(e.changedTouches != undefined) {
			mouseX = e.changedTouches[0].pageX;
			mouseY = e.changedTouches[0].pageY;
		} else {
			mouseX = e.clientX;
			mouseY = e.clientY;
		}
		
		return {x:mouseX, y:mouseY};	
	}


	p._onMouseDown = function(e) {
		if(this._isMouseDown) return;

		var mouse = getMousePos(e);
		var tempRotation = quat4.create(this._rotation);
		this._updateRotation(tempRotation);
		this._rotation = tempRotation;

		this._isMouseDown = true;
		this._isRotateZ = 0;
		this.preMouse = {x:mouse.x, y:mouse.y};

		if(mouse.y < this._rotateZMargin || mouse.y > (window.innerHeight - this._rotateZMargin) ) this._isRotateZ = 1;
		else if(mouse.x < this._rotateZMargin || mouse.x > (window.innerWidth - this._rotateZMargin) ) this._isRotateZ = 2;	
		
		this._z = this._preZ;

		this._currDiffX = this.diffX = 0;
		this._currDiffY = this.diffY = 0;
	};

	p._onMouseMove = function(e) {
		this.mouse = getMousePos(e);
	};

	p._onMouseUp = function(e) {
		if(!this._isMouseDown) return;
		this._isMouseDown = false;
	};

	p._onMouseWheel = function(e) {
		e.preventDefault();
		var w = e.wheelDelta;
		var d = e.detail;
		var value = 0;
		if (d){
			if (w) value = w/d/40*d>0?1:-1; // Opera
		    else value = -d/3;              // Firefox;         TODO: do not /3 for OS X
		} else value = w/120; 

		this._preZ -= value*5;
	};


	p.update = function() {
		mat4.identity(this.m);

		quat4.set(this._rotation, this.tempRotation);
		this._updateRotation(this.tempRotation);

		vec3.set([0, 0, this._z], this._vZaxis)
		quat4.multiplyVec3(this.tempRotation, this._vZaxis);

		mat4.translate(this.m, this._vZaxis);
		this.matrix = quat4.toMat4(this.tempRotation);
		mat4.multiply(this.matrix, this.m);

	};


	p._updateRotation = function(tempRotation) {
		if(this._isMouseDown && !this._isLocked) {
			this.diffX = -(this.mouse.x - this.preMouse.x) ;
			this.diffY = -(this.mouse.y - this.preMouse.y) ;

			if(this._isInvert) this.diffX = -this.diffX;
			if(this._isInvert) this.diffY = -this.diffY;
		}
		
		this._currDiffX += (this.diffX - this._currDiffX) * this._easing;
		this._currDiffY += (this.diffY - this._currDiffY) * this._easing;

		if(this._isRotateZ > 0) {
			if(this._isRotateZ == 1) {
				var angle = -this._currDiffX * this._offset; 
				angle *= (this.preMouse.y < this._rotateZMargin) ? -1 : 1;
				var quat = quat4.create( [0, 0, Math.sin(angle), Math.cos(angle) ] );
				quat4.multiply(tempRotation, quat);
			} else {
				var angle = -this._currDiffY * this._offset; 
				angle *= (this.preMouse.x < this._rotateZMargin) ? 1 : -1;
				var quat = quat4.create( [0, 0, Math.sin(angle), Math.cos(angle) ] );
				quat4.multiply(tempRotation, quat);
			}
		} else {
			var v = vec3.create([this._currDiffX, this._currDiffY, 0]);
			var axis = vec3.create();
			vec3.cross(v, this._zAxis, axis);
			vec3.normalize(axis);
			var angle = vec3.length(v) * this._offset;

			var quat = quat4.create( [Math.sin(angle) * axis[0], Math.sin(angle) * axis[1], Math.sin(angle) * axis[2], Math.cos(angle) ] );
			quat4.multiply(tempRotation, quat);
		}
		
		this._z += (this._preZ - this._z) * this._easing;
		
	};
})();