#version 300 es

layout (location = 0) in vec3 position;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 textureCoord;
layout (location = 3) in vec4 boneIdx;
layout (location = 4) in vec4 weights;

uniform mat4 mvpMatrix;
uniform mat4 invMatrix;
uniform vec3 lightDirection;
uniform mat4 bones[4];

out vec4 vFactor;
out vec2 vTextureCoord;

void main(void){
    vec3  invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;
    float halfLambert  = dot(normal, invLight) * 0.5 + 0.5;

    vFactor        = vec4(vec3(step(0.5, halfLambert)), 1.0);
    vTextureCoord  = textureCoord;

    gl_Position = mvpMatrix * (bones[int(boneIdx[0])] * vec4(position, 1.0) * weights[0] +
                                bones[int(boneIdx[1])]  * vec4(position, 1.0) * weights[1] +
                                bones[int(boneIdx[2])]  * vec4(position, 1.0) * weights[2] +
                                bones[int(boneIdx[3])]  * vec4(position, 1.0) * weights[3]);
} 