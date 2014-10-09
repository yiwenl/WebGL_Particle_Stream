// ProjectionPerspectiveMatrix.js

if(window.bongiovi === undefined ) window.bongiovi = {};

(function() {
	if(bongiovi.ProjectionPerspectiveMatrix === undefined) {
		var ProjectionPerspectiveMatrix = function ProjectionPerspectiveMatrix() {
			this.matrix = mat4.create();
			mat4.identity(this.matrix);
		}

		bongiovi.ProjectionPerspectiveMatrix = ProjectionPerspectiveMatrix;
		var p = ProjectionPerspectiveMatrix.prototype;


		p.perspective = function(fov, aspect, near, far) {
			this.matrix = mat4.perspective(fov, aspect, near, far);
		}
	}

})();