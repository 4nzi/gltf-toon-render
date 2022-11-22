#version 300 es

layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 uv;

uniform mat4 mMatrix;
uniform mat4 vMatrix;
uniform mat4 pMatrix;
uniform mat4 invMatrix;
uniform vec3 lightDirection;
uniform bool edge;
out vec2 vTextureCoord;
out vec3 vLightDirection;
out vec2 vUv;

void main(void){
	vec3 pos = position;
	vec3 worldPosition  = (mMatrix * vec4(position, 0.0)).xyz;
	vec3 invLight = (invMatrix * vec4(lightDirection, 0.0)).xyz;
	vec3 light    = invLight;
	vec3 n = normalize(normal);
	vec3 t = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
	vec3 b = cross(n, t);

	vLightDirection.x = dot(t, light);
	vLightDirection.y = dot(b, light);
	vLightDirection.z = dot(n, light);
	normalize(vLightDirection);
    vUv            = uv;

    if(edge){
        pos      += normal * 0.03;
    }
    gl_Position    = pMatrix * vMatrix * mMatrix * vec4(pos, 1.0);

}