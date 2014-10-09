// GLModelShader.js

if(window.bongiovi === undefined ) window.bongiovi = {};

(function() {
	if(bongiovi.GLModelShader === undefined) {
		var GLModelShader = function GLModelShader(gl, vertexShaderID, fragmentShaderID) {
			if(gl == undefined || vertexShaderID == undefined || fragmentShaderID == undefined) return;

			this.gl = gl;
			this.idVertex = vertexShaderID;
			this.idFragment = fragmentShaderID;
			this.vertexShader = getShader(this.gl, this.idVertex);
			this.fragmentShader = getShader(this.gl, this.idFragment);
			this.parameters = [];

			this.init();
		}


		bongiovi.GLModelShader = GLModelShader;
		var p = GLModelShader.prototype;


		p.init = function() {
			this.shaderProgram = this.gl.createProgram();
			this.gl.attachShader(this.shaderProgram, this.vertexShader);
			this.gl.attachShader(this.shaderProgram, this.fragmentShader);
			this.gl.linkProgram(this.shaderProgram);
		}


		p.setParameter = function(name, type, value) {
			for(var i=0; i<this.parameters.length; i++) {
				var oUniform = this.parameters[i];
				if(oUniform.name == name) {
					oUniform.value = value;
					return;
				}
			}
			this.parameters.push( {name:name, type:type, value:value} );
			this.shaderProgram[name] = this.gl.getUniformLocation(this.shaderProgram, name);
		}
		

		var getShader = function(gl, id) {
			if(shaders == undefined) {
				console.log( "Shader not exist ! ", id );
				return null;
			}

			if(shaders[id] == undefined) {
				console.log( "Shader not exist ! ", id );
				return null;
			}

			var shaderScript = shaders[id];
			var str = shaderScript.glsl.join("\n");

			var shader;
		    if (shaderScript.type == "fragment-shader") {
		        shader = gl.createShader(gl.FRAGMENT_SHADER);
		    } else if (shaderScript.type == "vertex-shader") {
		        shader = gl.createShader(gl.VERTEX_SHADER);
		    } else {
		        return null;
		    }

		    gl.shaderSource(shader, str);
		    gl.compileShader(shader);

		    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		        alert(gl.getShaderInfoLog(shader));
		        return null;
		    }

		    return shader;
		}
	}
})();