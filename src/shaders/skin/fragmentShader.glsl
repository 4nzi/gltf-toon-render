#version 300 es
precision mediump float;

uniform sampler2D albedoTex;
uniform sampler2D normalTex;
uniform bool edge;
in vec4 vFactor;
in vec2 vUv;
out vec4 outColor;

void main(void){
    if(edge){
       outColor   = vec4(0.0, 0.0, 0.0, 1.0);
       
    }else{
        vec4 smpColor = texture(albedoTex, vUv);
        vec4 smpColor2 = texture(normalTex, vUv);
        vec4 sdwColor = vec4(0.3, 0.3, 0.3, 1.0);

        outColor = smpColor * (1.0 - vFactor) + sdwColor * smpColor * vFactor;
    }
}