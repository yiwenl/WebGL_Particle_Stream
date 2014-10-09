// View.js

(function() {
	View = function(pathVert, pathFrag) {
		if(pathVert == undefined) return;
		this.shader = new GLShader(pathVert, pathFrag);
		this._init();
	}

	var p = View.prototype;


	p._init = function() {
		//	INITIAL MESH HERE
	};


	p.render = function() {
		
	};

})();



(function() {
	ViewCopy = function(pathVert, pathFrag) {
		if(pathVert == undefined) {
			pathVert = "assets/shaders/copy.vert";
			pathFrag = "assets/shaders/copy.frag";
		}

		View.call(this, pathVert, pathFrag);
	}

	var p = ViewCopy.prototype = new View();
	var s = View.prototype;


	p._init = function() {
		var positions = [];
		var coords = [];
		var indices = [0, 1, 2, 0, 2, 3];


		var size = 1;
		positions.push([-size, -size, 0]);
		positions.push([ size, -size, 0]);
		positions.push([ size,  size, 0]);
		positions.push([-size,  size, 0]);

		coords.push([0, 0]);
		coords.push([1, 0]);
		coords.push([1, 1]);
		coords.push([0, 1]);


		this.mesh = new Mesh(4, 6, GL.gl.TRIANGLES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);
	};


	p.render = function(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		GL.draw(this.mesh);
	};
})();