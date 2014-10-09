// ViewForce.js

(function() {

	var map = function(value, min, max, tmin, tmax) {
		var p = (value-min)/(max-min);
		if(p<0) p = 0;
		else if( p>1) p = 1; 
		return tmin + (tmax - tmin) * p;
	}

	ViewForce = function() {
		View.call(this, "assets/shaders/copy.vert", "assets/shaders/force.frag");
	}

	var p = ViewForce.prototype = new View();
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

		
		this._leap = new Leap.Controller();
		this._leap.loop(this._onLeapFrame.bind(this));

		this.position0 = {x:-99, y:-99};
		this.targetRadius0 = 0.0;
		this.radius0 = 0.0;
		this.targetStrength0 = 0.0;
		this.strength0 = 0.0;
		this.handDirection0 = [.5, .5, .5];


		this.position1 = {x:-99, y:-99};
		this.targetRadius1 = 0.0;
		this.radius1 = 0.0;
		this.targetStrength1 = 0.0;
		this.strength1 = 0.0;
		this.handDirection1 = [.5, .5, .5];
	};


	p._onLeapFrame = function(frame) {
		if(frame.hands.length == 0) {
			this.position0 = {x:-99, y:-99};
			this.targetStrength0 = 0.0;
			this.targetRadius0 = 0.0;

			this.position1 = {x:-99, y:-99};
			this.targetStrength1 = 0.0;
			this.targetRadius1 = 0.0;

			return;
		} else if (frame.hands.length == 1) {
			this.updateHand(0, frame);
			this.position1 = {x:-99, y:-99};
			this.targetStrength1 = 0.0;
			this.targetRadius1 = 0.0;			
		} else {
			this.updateHand(0, frame);
			this.updateHand(1, frame);
		}
	};


	p.updateHand = function(index, frame) {
		var xRange = 200;
		var positionLeap = frame.hands[index].palmPosition;
		var velocityLeap = frame.hands[index].palmVelocity;
		var vel = vec3.create(velocityLeap);
		var directionLeap = vec3.create();
		vec3.normalize(vel, directionLeap);
		var velLength = vec3.length(vel);
		this["targetStrength"+index] = map(velLength, 0, 700, 0, .5);
		var normal = vec3.create(frame.hands[index].palmNormal);
		this["position"+index].x = map(positionLeap[0], -xRange, xRange, 0, 1);
		this["position"+index].y = map(positionLeap[1], 120, 300, 0, 1);

		if(vec3.dot(directionLeap, normal) < 0) {
			this["targetStrength"+index] = 0.0;
			this["targetRadius"+index] = 0.0;
			return;
		}

		this["targetRadius"+index] = .1 + this["targetStrength"+index] * .3;

		this["handDirection"+index][0] = (normal[0] + 1) * .5;
		this["handDirection"+index][1] = (normal[1] + 1) * .5;
		this["handDirection"+index][2] = (normal[2] + 1) * .5;
	};


	p.render = function() {
		this.radius0 += (this.targetRadius0 - this.radius0) * .1;
		this.strength0 += (this.targetStrength0 - this.strength0) * .1;
		this.radius1 += (this.targetRadius1 - this.radius1) * .1;
		this.strength1 += (this.targetStrength1 - this.strength1) * .1;

		this.shader.bind();
		this.shader.uniform("handPosition0", "uniform2fv", [1.0-this.position0.x, this.position0.y]);
		this.shader.uniform("handDirection0", "uniform3fv", this.handDirection0);
		this.shader.uniform("radius0", "uniform1f", this.radius0);
		this.shader.uniform("strength0", "uniform1f", this.strength0);

		this.shader.uniform("handPosition1", "uniform2fv", [1.0-this.position1.x, this.position1.y]);
		this.shader.uniform("handDirection1", "uniform3fv", this.handDirection1);
		this.shader.uniform("radius1", "uniform1f", this.radius1);
		this.shader.uniform("strength1", "uniform1f", this.strength1);

		GL.draw(this.mesh);
	};
})();