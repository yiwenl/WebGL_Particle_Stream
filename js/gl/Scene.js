// Scene.js

(function() {
	var gl;

	Scene = function() {
		if(GL == undefined) return;
		gl = GL.gl;	

		this._init();
	}

	var p = Scene.prototype;


	p._init = function() {
		this.camera 		= new CameraPersp();
		this.camera.setPerspective(45, window.innerWidth/window.innerHeight, 5, 3000);
		var eye = vec3.create([0, 0, 500]);
		var center = vec3.create([0, 0, 0]);
		var up = vec3.create([0, -1, 0]);
		this.camera.lookAt(eye, center, up);
		this.sceneRotation = new SceneRotation();
		this.rotationFront = mat4.create();
		mat4.identity(this.rotationFront);

		this.cameraOtho 	= new Camera();

		this._initTextures();
		this._initViews();
	};



	p._initTextures = function() {
		
	};


	p._initViews = function() {
		
	};


	p.loop = function() {
		this.update();
		this.render();
	};


	p.update = function() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		this.sceneRotation.update();
		GL.setMatrices(this.camera);
		GL.rotate(this.sceneRotation.matrix);
	};


	p.render = function() {
		
	};



})();