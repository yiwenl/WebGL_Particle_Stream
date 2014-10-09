// Camera.js


(function() {
	Camera = function() {
		this.matrix = mat4.create();
		mat4.identity(this.matrix);
	}

	var p = Camera.prototype;

	p.lookAt = function(eye, center, up) {
		mat4.identity(this.matrix);
		this.matrix = mat4.lookAt(eye, center, up);
	};

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

	p.getMatrix = function() {
		mat4.multiply(this.projection, this.matrix, this.mtxFinal);
		return this.mtxFinal;
	};
	
})();