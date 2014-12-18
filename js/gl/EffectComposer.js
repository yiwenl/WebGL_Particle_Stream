// EffectComposer.js

(function() {
	Pass = function(params, width, height) {
		if(params == undefined) return;
		if( (typeof params) == "string") {
			this.view = new ViewCopy("assets/shaders/copy.vert", params);
		} else {
			this.view = params;
		}

		this.width = width == undefined ? 512 : width;
		this.height = height == undefined ? 512 : height;
		this._init();
	}

	var p = Pass.prototype;


	p._init = function() {
		this.fbo = new Framebuffer(this.width, this.height);
		this.fbo.bind();
		GL.setViewport(0, 0, this.fbo.width, this.fbo.height);
		GL.clear(0, 0, 0, 0);
		this.fbo.unbind();
	};

	p.render = function(texture) {
		// console.log( "Set Viewport : ", this.fbo.width, this.fbo.height );
		GL.setViewport(0, 0, this.fbo.width, this.fbo.height);
		this.fbo.bind();
		GL.clear(0, 0, 0, 0);
		this.view.render(texture);
		this.fbo.unbind();

		return this.fbo.getTexture();
	};


	p.getTexture = function() {
		return this.fbo.getTexture();
	};
})();

(function() {
	EffectComposer = function() {
		this.texture;
		this._passes = [];
	}

	var p = EffectComposer.prototype = new Pass();
	var s = Pass.prototype;

	p.addPass = function(pass) {
		this._passes.push(pass);
	};

	p.render = function(texture) {
		this.texture = texture;
		for(var i=0; i<this._passes.length; i++) {
			this.texture = this._passes[i].render(this.texture);
		}

		return this.texture;
	};


	p.getTexture = function() {
		return this.texture;	
	};
	
})();