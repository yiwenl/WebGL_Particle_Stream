// Index.js
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

(function() {
	var random = function(min, max) { return min + Math.random() * ( max - min); }	
	var getRandomElement = function(ary) {	return ary[Math.floor(Math.random() * ary.length)]; }

	Main = function() {
		this._init();
	}

	var p = Main.prototype;

	p._init = function() {
		this._canvas 			= document.createElement("canvas");
		document.body.appendChild(this._canvas);
		this._canvas.width 		= window.innerWidth;
		this._canvas.height 	= window.innerHeight;

		console.log( "INIT GL TOOLS" );
		GL.init(this._canvas);

		this.scene = new SceneFlowers();
		var that = this;
		setTimeout(function() {
			that.start();
		}, 500);

	};



	p.start = function() {
		// scheduler.addEF(this.scene, this.scene.loop, []);
		scheduler.addEF(this, this.render, []);
	};

	p.render = function() {
		this.scene.loop();
	};	
	
})();