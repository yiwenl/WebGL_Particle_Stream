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
		this._isReady = false;
	}

	var p = GLShader.prototype;

	p.init = function() {
		this.shaderProgram = gl.createProgram();
		gl.attachShader(this.shaderProgram, this.vertexShader);
		gl.attachShader(this.shaderProgram, this.fragmentShader);
		gl.linkProgram(this.shaderProgram);
		this._isReady = true;
		// console.log( "Shader program created : ", this.idVertex, this.idFragment );
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

		if(this.shaderProgram.pMatrixUniform == undefined) this.shaderProgram.pMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
		if(this.shaderProgram.mvMatrixUniform == undefined) this.shaderProgram.mvMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uMVMatrix");

		GL.shader 			= this;
		GL.shaderProgram 	= this.shaderProgram;

		this.uniformTextures = [];
	};


	p.uniform = function(name, type, value) {
		if(type == "texture") type = "uniform1i";
		
		var hasUniform = false;
		var oUniform;
		for(var i=0; i<this.parameters.length; i++) {
			oUniform = this.parameters[i];
			if(oUniform.name == name) {
				oUniform.value = value;
				hasUniform = true;
				break;
			}
		}

		if(!hasUniform) {
			this.shaderProgram[name] = gl.getUniformLocation(this.shaderProgram, name);
			this.parameters.push( {name:name, type:type, value:value, uniformLoc:this.shaderProgram[name]} );
		} else {
			this.shaderProgram[name] = oUniform.uniformLoc;
		}


		if(type.indexOf("Matrix") == -1) {
			gl[type](this.shaderProgram[name], value);
		} else {
			gl[type](this.shaderProgram[name], false, value);
		}

		if(type == "uniform1i") {	//	TEXTURE
			this.uniformTextures[value] = this.shaderProgram[name];
			// if(name == "textureForce") console.log( "Texture Force : ",  this.uniformTextures[value], value );
		}
	}



	p.unbind = function() {
		
	};

	p.isReady = function() {	return this._isReady;	};
})();