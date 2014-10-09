// Scene.js

if(window.bongiovi === undefined ) window.bongiovi = {};

(function() {
	var W, H;

	if(bongiovi.Scene == undefined) {
		var Scene = function(container) {
			if(container == undefined) return;
			this._canvas = document.createElement("canvas");
			this._canvas.width = window.innerWidth;
			this._canvas.height = window.innerHeight;
			this.container = container;
			this.container.appendChild(this._canvas);
			this.gl = this._canvas.getContext("experimental-webgl");
			this.matrix = mat4.create();
			mat4.identity(this.matrix);

			console.log( this.gl );
			console.log( this.gl );
			console.log( this.gl );
			console.log( this.gl );

			W = window.innerWidth;
			H = window.innerHeight;
			this._init();
		}

		bongiovi.Scene = Scene;
		var p = Scene.prototype;

		p._init = function() {
			this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
	        this.gl.enable(this.gl.DEPTH_TEST);
	        this.gl.enable(this.gl.CULL_FACE)
			this.gl.enable(this.gl.BLEND);
			this.gl.clearColor( 0, 0, 0, 1 );
			this.gl.clearDepth( 1 );

			this.projection  = new bongiovi.ProjectionPerspectiveMatrix();
			this.projection.perspective(70, W/H, .1, 10000);
			this.camera      = new bongiovi.HoverCamera();
			this.camera.init(1250);
			this.sceneMatrix = new SceneMatrix(this._canvas);

			var that = this;
			window.addEventListener("resize", function(e) {
				that._onResize(e);
			});
			this._onResize();
		};


		p.render = function() {
			// this.sceneMatrix.update();
			this.matrix = this.camera.update();
			// mat4.multiply(this.matrix, this.sceneMatrix.matrix);

			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		};


		p._onResize = function(e) {
			W = window.innerWidth;
			H = window.innerHeight;

			this._canvas.width = window.innerWidth;
			this._canvas.height = window.innerHeight;
			this.gl.viewportWidth  = window.innerWidth;
			this.gl.viewportHeight = window.innerHeight;
	    	this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
	    	this.projection.perspective(70, W/H, .1, 10000);
	    	this.render();
		};

	}
})();