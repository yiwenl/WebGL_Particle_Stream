// ViewCalculate.js

(function() {
	ViewCalculate = function() {
		View.call(this, "assets/shaders/copy.vert", "assets/shaders/cal.frag");
		this.count = 0;
	}

	var p = ViewCalculate.prototype = new View();
	var s = View.prototype;


	p._init = function() {
		var positions = [];
		var coords = [];
		var indices = [0, 1, 2, 0, 2, 3];

		positions.push([-1,	-1,  0]);
		positions.push([ 1,	-1,  0]);
		positions.push([ 1,	 1,  0]);
		positions.push([-1,	 1,  0]);

		coords.push([0, 0]);
		coords.push([1, 0]);
		coords.push([1, 1]);
		coords.push([0, 1]);

		this.mesh = new Mesh(positions.length, indices.length, GL.gl.TRIANGLES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);
	};

	p.render = function(texture, textureForce) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("textureForce", "uniform1i", 1);
		this.shader.uniform("time", "uniform1f", this.count++ * .001);

		this.shader.uniform("velOffset", "uniform1f", params.velOffset);
		this.shader.uniform("accOffset", "uniform1f", params.accOffset);
		this.shader.uniform("posOffset", "uniform1f", params.posOffset);
		texture.bind(0);
		textureForce.bind(1, true);
		GL.draw(this.mesh);
	};
})();