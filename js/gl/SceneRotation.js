// SceneRotation.js

(function() {
	SceneRotation = function(listenerTarget) {
		if(listenerTarget == undefined) listenerTarget = document;

		this._z             = 0;
		this._mouseZ        = 0;
		this._preZ          = 0;
		this._isRotateZ     = 0;
		this.matrix         = mat4.create();
		this.m              = mat4.create();
		this._vZaxis        = vec3.create([0, 0, 0]);
		this._zAxis         = vec3.create([0, 0, -1]);
		this.preMouse       = {x:0, y:0};
		this.mouse          = {x:0, y:0};
		this._isMouseDown   = false;
		this._rotation      = quat4.create([1, 0, 0, 0]);
		this.tempRotation   = quat4.create([0, 0, 0, 0]);
		this._rotateZMargin = 0;
		this.diffX          = 0;
		this.diffY          = 0;
		this._currDiffX     = 0;
		this._currDiffY     = 0;
		this._offset        = .004;
		this._easing        = .1;
		this._slerp			= -1;

		var that = this;
		listenerTarget.addEventListener("mousedown", function(e) {	that._onMouseDown(e);	}	);
		listenerTarget.addEventListener("touchstart", function(e) {	that._onMouseDown(e);	}	);
		listenerTarget.addEventListener("mouseup", function(e) {		that._onMouseUp(e);		}	);
		listenerTarget.addEventListener("touchend", function(e) {		that._onMouseUp(e);		}	);
		listenerTarget.addEventListener("mousemove", function(e) {	that._onMouseMove(e);	}	);
		listenerTarget.addEventListener("touchmove", function(e) {	that._onMouseMove(e);	}	);
		listenerTarget.addEventListener("mousewheel", function(e) {	that._onMouseWheel(e);	} );
		listenerTarget.addEventListener("DOMMouseScroll", function(e) {	that._onMouseWheel(e);	} );
	}

	var p = SceneRotation.prototype;


	var getMousePos = function(e) {
		var mouseX, mouseY;

		if(e.changedTouches != undefined) {
			mouseX = e.changedTouches[0].pageX;
			mouseY = e.changedTouches[0].pageY;
		} else {
			mouseX = e.clientX;
			mouseY = e.clientY;
		}
		
		return {x:mouseX, y:mouseY};	
	}


	p._onMouseDown = function(e) {
		if(this._isMouseDown) return;

		var mouse = getMousePos(e);
		var tempRotation = quat4.create(this._rotation);
		this._updateRotation(tempRotation);
		this._rotation = tempRotation;

		this._isMouseDown = true;
		this._isRotateZ = 0;
		this.preMouse = {x:mouse.x, y:mouse.y};

		if(mouse.y < this._rotateZMargin || mouse.y > (window.innerHeight - this._rotateZMargin) ) this._isRotateZ = 1;
		else if(mouse.x < this._rotateZMargin || mouse.x > (window.innerWidth - this._rotateZMargin) ) this._isRotateZ = 2;	
		
		this._z = this._preZ;

		this._currDiffX = this.diffX = 0;
		this._currDiffY = this.diffY = 0;
	};

	p._onMouseMove = function(e) {
		this.mouse = getMousePos(e);
		if(e.touches) e.preventDefault();
	};

	p._onMouseUp = function(e) {
		if(!this._isMouseDown) return;
		this._isMouseDown = false;
	};

	p._onMouseWheel = function(e) {
		e.preventDefault();
		var w = e.wheelDelta;
		var d = e.detail;
		var value = 0;
		if (d){
			if (w) value = w/d/40*d>0?1:-1; // Opera
		    else value = -d/3;              // Firefox;         TODO: do not /3 for OS X
		} else value = w/120; 

		this._preZ -= value*5;
	};


	p.setCameraPos = function(quat) {
		if(this._slerp > 0) return;
		// quat4.set(quat, this._rotation);
		var tempRotation = quat4.create(this._rotation);
		this._updateRotation(tempRotation);
		this._rotation = quat4.create(tempRotation);
		this._currDiffX = this.diffX = 0;
		this._currDiffY = this.diffY = 0;

		// return;

		this._isMouseDown = false;
		this._isRotateZ = 0;

		this._targetQuat = quat4.create(quat);
		this._slerp = 1;
	};


	p.resetQuat = function() {
		this._rotation    = quat4.create([1, 0, 0, 0]);
		this.tempRotation = quat4.create([0, 0, 0, 0]);
		this._targetQuat  = undefined;
		this._slerp       = -1;

		// quat4.set(this._rotation, this.tempRotation);
	};


	p.update = function() {
		mat4.identity(this.m);

		if(this._targetQuat == undefined) { 
			quat4.set(this._rotation, this.tempRotation);
			this._updateRotation(this.tempRotation);
		} else {
			this._slerp += (0 - this._slerp) * .05;

			if(this._slerp < .001) {
				quat4.set(this._targetQuat, this._rotation);
				this._targetQuat = undefined;
				this._slerp = -1;
			} else {
				quat4.set([0, 0, 0, 0], this.tempRotation);
				// quat4.slerp(this._rotation, this._targetQuat, this._slerp, this.tempRotation);
				quat4.slerp(this._targetQuat, this._rotation, this._slerp, this.tempRotation);
			}
			
		}

		vec3.set([0, 0, this._z], this._vZaxis)
		quat4.multiplyVec3(this.tempRotation, this._vZaxis);

		mat4.translate(this.m, this._vZaxis);
		this.matrix = quat4.toMat4(this.tempRotation);
		mat4.multiply(this.matrix, this.m);

		// console.log( quat4.str(this.tempRotation) );
	};


	p._updateRotation = function(tempRotation) {
		if(this._isMouseDown && !this._isLocked) {
			this.diffX = (this.mouse.x - this.preMouse.x) ;
			this.diffY = -(this.mouse.y - this.preMouse.y) ;

			if(this._isInvert) this.diffX = -this.diffX;
			if(this._isInvert) this.diffY = -this.diffY;
		}
		
		this._currDiffX += (this.diffX - this._currDiffX) * this._easing;
		this._currDiffY += (this.diffY - this._currDiffY) * this._easing;

		if(this._isRotateZ > 0) {
			if(this._isRotateZ == 1) {
				var angle = -this._currDiffX * this._offset; 
				angle *= (this.preMouse.y < this._rotateZMargin) ? -1 : 1;
				var quat = quat4.create( [0, 0, Math.sin(angle), Math.cos(angle) ] );
				quat4.multiply(tempRotation, quat);
			} else {
				var angle = -this._currDiffY * this._offset; 
				angle *= (this.preMouse.x < this._rotateZMargin) ? 1 : -1;
				var quat = quat4.create( [0, 0, Math.sin(angle), Math.cos(angle) ] );
				quat4.multiply(tempRotation, quat);
			}
		} else {
			var v = vec3.create([this._currDiffX, this._currDiffY, 0]);
			var axis = vec3.create();
			vec3.cross(v, this._zAxis, axis);
			vec3.normalize(axis);
			var angle = vec3.length(v) * this._offset;

			var quat = quat4.create( [Math.sin(angle) * axis[0], Math.sin(angle) * axis[1], Math.sin(angle) * axis[2], Math.cos(angle) ] );
			quat4.multiply(tempRotation, quat);
		}
		
		// this._z += (this._preZ - this._z) * this._easing;
	};

})();