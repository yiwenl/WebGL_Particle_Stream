// Framebuffer.js

(function() {
	var gl;

	Framebuffer = function(width, height, magFilter, minFilter) {
		if(!GL) return;

		gl          = GL.gl;
		this.width  = width;
		this.height = height;
		this.magFilter = magFilter==undefined ? gl.LINEAR : magFilter;
		this.minFilter = minFilter==undefined ? gl.LINEAR_MIPMAP_NEAREST : minFilter;

		this._init();
	}

	var p = Framebuffer.prototype;


	p._init = function() {
		this.depthTextureExt 	= gl.getExtension("WEBKIT_WEBGL_depth_texture"); // Or browser-appropriate prefix
		this.floatTextureExt 	= gl.getExtension("OES_texture_float") // Or browser-appropriate prefix

		var floatTextures = gl.getExtension('OES_texture_float');
		if (!floatTextures) {
		    alert('no floating point texture support');
		    return;
		}


		this.texture            = gl.createTexture();
		this.depthTexture       = gl.createTexture();
		this.glTexture			= new GLTexture(this.texture, true);
		this.glDepthTexture		= new GLTexture(this.depthTexture, true);
		this.frameBuffer        = GL.gl.createFramebuffer();		
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
		this.frameBuffer.width  = this.width;
		this.frameBuffer.height = this.height;
		var size                = this.width;

		gl.bindTexture(gl.TEXTURE_2D, this.texture);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		if(this.magFilter == gl.NEAREST && this.minFilter == gl.NEAREST) 
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.frameBuffer.width, this.frameBuffer.height, 0, gl.RGBA, gl.FLOAT, null);
		else
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.frameBuffer.width, this.frameBuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

		gl.generateMipmap(gl.TEXTURE_2D);

	    // var renderbuffer = gl.createRenderbuffer();
	    // gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
	    // gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.frameBuffer.width, this.frameBuffer.height);
	    
		gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, this.width, this.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

	    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
	    // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
	    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);

	    gl.bindTexture(gl.TEXTURE_2D, null);
	    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	};


	p.bind = function() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
	};


	p.unbind = function() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	};


	p.getTexture = function() {
		return this.glTexture;
	};


	p.getDepthTexture = function() {
		return this.glDepthTexture;
	};
})();