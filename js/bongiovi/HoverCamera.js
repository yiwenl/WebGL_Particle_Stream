// HoverCamera.js

if(window.bongiovi === undefined ) window.bongiovi = {};

(function() {
	if(bongiovi.HoverCamera === undefined) {
		var HoverCamera = function HoverCamera() {
		}

		bongiovi.HoverCamera = HoverCamera;

		var p = HoverCamera.prototype = new bongiovi.SimpleCamera();
		var s = bongiovi.SimpleCamera.prototype;

		p.init = function(radius, speed) {
			this._radius = radius;
			this._speed = speed == undefined ? .1 : speed;

			this._targetRX = Math.PI/6;
			this._tempRX = 0;
			this.rx = 0;
			this._targetRY = -Math.PI*3/8;
			this._tempRY = -Math.PI/2;
			this.ry = -Math.PI/2;
			this._distx = 0;
			this._disty = 0;
			this._prex = 0;
			this._prey = 0;
			this.mouseX = 0;
			this.mouseY = 0;
			this._needUpdate = false;

			var that = this;
			document.addEventListener("mousedown", function(e) {	that._onMouseDown(e);	}	);
			document.addEventListener("mouseup", function(e) {		that._onMouseUp(e);		}	);
			document.addEventListener("mousemove", function(e) {	that._onMouseMove(e);	}	);

			document.addEventListener("mousewheel", function(e) {	that._onMouseWheel(e);	} );
			document.addEventListener("DOMMouseScroll", function(e) {	that._onMouseWheel(e);	} );

			return this;
		}


		p._onMouseDown = function(e) {
			this._needUpdate = true;
			this._prex = e.clientX;
			this._prey = e.clientY;
			this._tempRX = this.rx;
			this._tempRY = this.ry;
		}


		p._onMouseUp = function(e) {
			this._needUpdate = false;
		}


		p._onMouseMove = function(e) {
			this.mouseX = e.clientX;
			this.mouseY = e.clientY;
		}


		p._onMouseWheel = function(e) {
			e.preventDefault();
			var w = e.wheelDelta;
			var d = e.detail;
			var value = 0;
			if (d){
				if (w) value = w/d/40*d>0?1:-1; // Opera
			    else value = -d/3;              // Firefox;         TODO: do not /3 for OS X
			} else value = w/120; 

			this._radius -= value*5;
		}


		p._updateDistance = function() {
			this._distx = (this.mouseY - this._prey) / 200;
			this._disty = (this.mouseX - this._prex) / 200;
		}


		p.update = function() {
			if(this._needUpdate) {
				this._updateDistance();
				this._targetRX = this._tempRX + this._distx;
				this._targetRY = this._tempRY + this._disty;
			}

			this.rx += (this._targetRX - this.rx) * this._speed;
			this.ry += (this._targetRY - this.ry) * this._speed;
			if(this.rx > Math.PI/2) {
				this.rx = Math.PI/2;
				this._targetRX = Math.PI/2;
			} else if(this.rx < -Math.PI/2) {
				this.rx = -Math.PI/2;
				this._targetRX = -Math.PI/2;
			}
			
			this.x = -Math.cos(this.rx) * Math.cos(this.ry) * this._radius;
			this.y = -Math.sin(this.rx) * this._radius;
			this.z = Math.cos(this.rx) * Math.sin(this.ry) * this._radius;

			// console.log( this.x + "/" + this.z );

			return s.update.call(this);;
		}

	}
})();