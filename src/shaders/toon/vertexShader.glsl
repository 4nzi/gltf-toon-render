#version 300 es

layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 uv;

uniform mat4 mvpMatrix;
uniform mat4 invMatrix;
uniform vec3 lightDirection;
out vec4 vFactor;
out vec2 vUv;

void main(void){
    vec3  invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
    float halfLambert  = dot(normal, invLight) * 0.5 + 0.5;

    gl_Position    = mvpMatrix * vec4(position, 1.0);
    vUv            = uv;
    vFactor        = vec4(vec3(step(0.5, halfLambert)), 1.0);
}