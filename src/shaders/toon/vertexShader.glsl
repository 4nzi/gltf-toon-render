#version 300 es

in vec3 position;
in vec3 normal;
in vec2 textureCoord;
uniform mat4 mvpMatrix;
uniform mat4 invMatrix;
uniform vec3 lightDirection;
out vec4 vFactor;
out vec2 vTextureCoord;

void main(void){
    vec3  invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
    float halfLambert  = dot(normal, invLight) * 0.5 + 0.5;

    gl_Position    = mvpMatrix * vec4(position, 1.0);
    vTextureCoord  = textureCoord;
    vFactor        = vec4(vec3(step(0.5, halfLambert)), 1.0);
}