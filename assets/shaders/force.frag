precision mediump float;

uniform vec2 handPosition0;
uniform vec3 handDirection0;
uniform float radius0;
uniform float strength0;

uniform vec2 handPosition1;
uniform vec3 handDirection1;
uniform float radius1;
uniform float strength1;

varying vec2 vTextureCoord;

#define PI2 1.5708

void main(void) {
    vec4 color = vec4(.5, .5, .5, 1.0);

    float distToCenter = distance(vTextureCoord, handPosition0);

    if(distToCenter < radius0) {
	    float offset = 1.0 - distToCenter / radius0;
	    offset = sin(offset*PI2);
	    color.g += (handDirection0.y-.5) * offset * strength0 * 1.2;

	    float offsetX = .5;
	    if(handDirection0.x < .5) offsetX = .75;
	    color.r -= (handDirection0.x-.5) * offset * strength0 * offsetX;
    }

    distToCenter = distance(vTextureCoord, handPosition1);
    if(distToCenter < radius1) {
	    float offset = 1.0 - distToCenter / radius1;
	    offset = sin(offset*PI2);
	    color.g += (handDirection1.y-.5) * offset * strength1 * 1.2;

	    float offsetX = .5;
	    if(handDirection1.x < .5) offsetX = .75;
	    color.r -= (handDirection1.x-.5) * offset * strength1 * offsetX;
    }

    gl_FragColor = color;
}