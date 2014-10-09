// SimpleCamera.js

if(window.bongiovi === undefined ) window.bongiovi = {};

(function() {
	if(bongiovi.SimpleCamera === undefined) {
		var SimpleCamera = function SimpleCamera() {
			this.matrix = mat4.create();
			mat4.identity(this.matrix);

			this.x = 0;
			this.y = 0;
			this.z = 0;

			this.target = vec3.create([0, 0, 0]);
			this.eye = vec3.create([0, 0, 0]);
			this.up = vec3.create([0, -1, 0]);
		}

		bongiovi.SimpleCamera = SimpleCamera;
		var p = SimpleCamera.prototype;


		p.update = function() {
			mat4.identity(this.matrix);
			vec3.set([this.x, this.y, this.z], this.eye)
			this.matrix = mat4.lookAt(this.eye, this.target, this.up);
			return this.matrix;
		}
	}
})();