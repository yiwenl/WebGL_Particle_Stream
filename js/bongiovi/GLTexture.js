// GLTexture.js

if(window.bongiovi === undefined ) window.bongiovi = {};

(function(){
	if(bongiovi.GLTexture === undefined) {
		var GLTexture = function(gl, source, width, height, repeat) {
			this.gl = gl;
			this.texture = gl.createTexture();
			this.frameBuffer;

			this.width = width;
			this.height = height;
			this.depthTextureExt = gl.getExtension("WEBKIT_WEBGL_depth_texture"); // Or browser-appropriate prefix
			if(source != null) {
				this._isVideo = (source.tagName == "VIDEO");
			} else {
				this._isVideo = false;
			}
			

			if(source != undefined) {
				//	source : canvas / video / image / pixels
				gl.bindTexture(gl.TEXTURE_2D, this.texture);
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

				if(!this._isVideo) {
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
  					gl.generateMipmap(gl.TEXTURE_2D);
				} else {
					this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
					this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
  					gl.generateMipmap(gl.TEXTURE_2D);
				}

				gl.bindTexture(gl.TEXTURE_2D, null);
			} else {
				this.frameBuffer = gl.createFramebuffer();
				gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
				this.frameBuffer.width = width;
				this.frameBuffer.height = height;
				var size = width;

				gl.bindTexture(gl.TEXTURE_2D, this.texture);
		        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  				gl.generateMipmap(gl.TEXTURE_2D);

		        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.frameBuffer.width, this.frameBuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

		        var renderbuffer = gl.createRenderbuffer();
		        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
		        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.frameBuffer.width, this.frameBuffer.height);

		        this.depthTexture = gl.createTexture();
				gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, size, size, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

		        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
		        // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
		        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);

		        gl.bindTexture(gl.TEXTURE_2D, null);
		        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			}
		}

		bongiovi.GLTexture = GLTexture;
		var p = GLTexture.prototype;


		p.createFramebuffer = function(parameters) {
			this.frameBuffer = this.gl.createFramebuffer();
			// gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
			this.frameBuffer.width = this.width;
			this.frameBuffer.height = this.height;
		};

		p.updateTexture = function(source) {
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
			this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, source);

			if(!this._isVideo) {
				this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
				this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
				this.gl.generateMipmap(this.gl.TEXTURE_2D);
			} else {
				this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
				this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
			}
			

			this.gl.bindTexture(this.gl.TEXTURE_2D, null);
		}

	}
})();