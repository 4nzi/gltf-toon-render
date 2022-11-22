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
out vec4 vFactor;
out vec2 vUv;

void main(void){
    vec3  pos      = position;
    vec3  invLight     = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
    float halfLambert  = dot(normal, invLight) * 0.5 + 0.5;

    if(edge){
        pos      += normal * 0.03;
    }
    gl_Position    = pMatrix * vMatrix * mMatrix * vec4(pos, 1.0);

    vFactor        = vec4(vec3(step(0.5, halfLambert)), 1.0);
    vUv            = uv;
}