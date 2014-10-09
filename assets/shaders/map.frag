precision highp float;

varying float toDiscard;
varying float alpha;
//uniform sampler2D textureParticle;

#define PI2 1.5708

void main(void) {
	
    //gl_FragColor = texture2D(textureParticle, gl_PointCoord);
    gl_FragColor = vec4(1.0);
    gl_FragColor.a *= alpha;
    if(toDiscard >= .5) {
    	discard;
    	gl_FragColor.a = 0.0;
    }
}