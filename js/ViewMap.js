// ViewMap.js


(function() {
	ViewMap = function(particles) {
		this.particles = particles;
		View.call(this, "assets/shaders/map.vert", "assets/shaders/map.frag");
	}

	var p = ViewMap.prototype = new View();
	var s = View.prototype;


	p._init = function() {
		var positions = [];
		var coords = [];
		var indices = [];
		var extra = [];

		var numParticles = params.numParticles;

		for(var i=0; i<this.particles.length; i++) {
			positions.push([0, 0, 0]);

			var tx = i % numParticles;
			var ty = Math.floor(i/numParticles);
			var ux = tx / numParticles;
			var uy = ty / numParticles;

			coords.push([ux, uy]);
			indices.push(i);
			extra.push([Math.random() * 3 + .1, Math.random() * .9 + .1, 0])
		}

		this.mesh = new Mesh(positions.length, indices.length, GL.gl.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);
		this.mesh.bufferData(extra, "aExtra", 3);


		// console.log( positions.length, indices.length );
	};


	p.render = function(texturePos, texture) {
		// return;
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		// this.shader.uniform("textureParticle", "uniform1i", 1);
		texturePos.bind(0);
		// texture.bind(1);
		GL.draw(this.mesh);
	};
})();