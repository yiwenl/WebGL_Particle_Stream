precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aExtra;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform sampler2D texture;

varying float toDiscard;
varying float alpha;

void main(void) {
	vec3 pos = aVertexPosition;
	vec4 color = texture2D(texture, aTextureCoord);
	float range = 1000.0;
	pos = color.rgb - vec3(.5);
	alpha = (1.0 - abs(pos.x/.5) ) * aExtra.y;
	pos *= range;

	toDiscard = aTextureCoord.x;

    gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);
    gl_PointSize = 1.0;
}