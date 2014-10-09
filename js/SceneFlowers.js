// SceneFlowers.js

(function() {

	var random = function(min, max) { return min + Math.random() * (max - min); }

	SceneFlowers = function() {
		Scene.call(this);
		this.camera.setPerspective(45, window.innerWidth/window.innerHeight, 5, 5000);
		GL.gl.disable(GL.gl.DEPTH_TEST);
		this.hasSaved = false;
	}

	var p = SceneFlowers.prototype = new Scene();
	var s = Scene.prototype;

	p._initParticles = function() {
		var numParticles = params.numParticles * params.numParticles;
		console.log( "Total : ", numParticles );

		this.particles = [];
		// var range = 1;
		for(var i=0; i<numParticles; i++) {
			var x = Math.random();
			var y = random(.4, .6);
			var z = random(.4, .6);

			this.particles.push({x:x, y:y, z:z});
		}


		window.addEventListener("keypress", this._keyPressed.bind(this));
	};


	p._keyPressed = function(e) {
		// console.log( e.charCode, e.keyCode );

		if(e.keyCode == 107) {
			params.velOffset = 0.04;
			params.accOffset = 0.004;
			params.posOffset = 10.0;
		}
	};


	p._initTextures = function() {
		console.log( "Init Texture" );
		this.tex = new GLTexture(images["bg"]);
		this.texDot = new GLTexture(images["dot"]);
		this.fboCurrent = new Framebuffer(params.numParticles*2.0, params.numParticles, GL.gl.NEAREST, GL.gl.NEAREST);
		this.fboTarget = new Framebuffer(params.numParticles*2.0, params.numParticles, GL.gl.NEAREST, GL.gl.NEAREST);
		this.fboForce = new Framebuffer(256, 256, GL.gl.NEAREST, GL.gl.NEAREST);
	};


	p._initViews = function() {
		console.log( "Init Views" );

		this._initParticles();
		this._vSave 	 = new ViewSave(this.particles);
		this._vMap 		 = new ViewMap(this.particles);
		this._vCopy		 = new ViewCopy();
		this._vCopyForce = new ViewCopy("assets/shaders/copy.vert", "assets/shaders/copyFlip.frag");
		this._vCal		 = new ViewCalculate();
		this._vForce 	 = new ViewForce();
	};


	p.render = function() {
		var easing = .05;
		params.velOffset += (.01 - params.velOffset) * easing*.5;
		params.accOffset += (.001 - params.accOffset) * easing*.5;
		params.posOffset += (4.5 - params.posOffset) * easing;

		if(!this.hasSaved) {
			this.fboCurrent.bind();
			GL.gl.viewport(0, 0, this.fboCurrent.width, this.fboCurrent.height);
			GL.gl.clearColor( 0.35, 0.5, 0.5, 1 );
			GL.gl.clear(GL.gl.COLOR_BUFFER_BIT | GL.gl.DEPTH_BUFFER_BIT);
			GL.setMatrices(this.cameraOtho);
			GL.rotate(this.rotationFront);
			this._vSave.render();
			this.fboCurrent.unbind();

			this.fboTarget.bind();
			GL.gl.clear(GL.gl.COLOR_BUFFER_BIT | GL.gl.DEPTH_BUFFER_BIT);
			this.fboTarget.unbind();

			this.fboForce.bind();
			GL.gl.viewport(0, 0, this.fboForce.width, this.fboForce.height);
			GL.gl.clearColor( 0.5, 0.5, 0.5, 1 );
			GL.gl.clear(GL.gl.COLOR_BUFFER_BIT | GL.gl.DEPTH_BUFFER_BIT);
			this.fboForce.unbind();


			GL.gl.clearColor( 0, 0, 0, 1 );
			GL.gl.viewport(0, 0, window.innerWidth, window.innerHeight);
			this.hasSaved = true;
			return;
		}


		GL.setMatrices(this.cameraOtho);
		GL.rotate(this.rotationFront);


		GL.gl.viewport(0, 0, this.fboForce.width, this.fboForce.height);
		this.fboForce.bind();
		this._vForce.render();
		this.fboForce.unbind();

		GL.gl.viewport(0, 0, this.fboCurrent.width, this.fboCurrent.height);
		this.fboTarget.bind();
		this._vCal.render( this.fboCurrent.getTexture(), this.fboForce.getTexture() );
		this.fboTarget.unbind();

		GL.gl.viewport(0, 0, window.innerWidth, window.innerHeight);
		this._vCopy.render( this.tex );
		if(params.showForceMap)	this._vCopyForce.render( this.fboForce.getTexture() );
		if(params.showMap)	this._vCopy.render( this.fboTarget.getTexture() );
		GL.setMatrices(this.camera);
		GL.rotate(this.sceneRotation.matrix);
		this._vMap.render(this.fboTarget.getTexture(), this.texDot);

		this.swapFbos();
	};


	p.swapFbos = function() {
		var tmp = this.fboTarget;
		this.fboTarget = this.fboCurrent;
		this.fboCurrent = tmp;
	};


	p.resetCamera = function() {
		this.sceneRotation.setCameraPos(quat4.create([1, 0, 0, 0]));
	};
})();