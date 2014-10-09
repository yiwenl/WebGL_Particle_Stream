// ViewSave.js

(function() {
	ViewSave = function(particles) {
		this.particles = particles;
		View.call(this, "assets/shaders/save.vert", "assets/shaders/save.frag");
	}

	var p = ViewSave.prototype = new View();
	var s = View.prototype;

	p._init = function() {
		var positions = [];
		var colors = [];
		var coords = [];
		var indices = [];
		var size = 2;
		var index = 0;

		var numParticles = params.numParticles;

		for(var i=0; i<this.particles.length; i++) {
			var p = this.particles[i];

			var tx = i % numParticles;
			var ty = Math.floor(i/numParticles);
			var ux = tx / numParticles;
			var uy = ty / numParticles;

			ux -= 1.0;
			// ux = (ux-.5) * 2.0;
			uy = (uy-.5) * 2.0;

			// console.log( ux, uy );

			positions.push([ux, uy, 0]);
			coords.push([0, 0]);
			indices.push(index);
			colors.push([p.x, p.y, p.z]);

			index++;
		}


		this.mesh = new Mesh(positions.length, indices.length, GL.gl.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);
		this.mesh.bufferData(colors, "aVertexColor", 3);
	};


	p.render = function() {
		this.shader.bind();
		// texture.bind(0);
		GL.draw(this.mesh);
	};
})();