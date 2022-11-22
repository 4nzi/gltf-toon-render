#version 300 es
precision mediump float;

uniform sampler2D albedoTex;
uniform sampler2D normalTex;
uniform bool edge;
in vec2 vUv;
in vec3 vLightDirection;
out vec4 outColor;

void main(void){
    if(edge){
       outColor   = vec4(0.0, 0.0, 0.0, 1.0);
       
    }else {
        vec4 smpColor   = texture(albedoTex, vUv);
        vec4 sdwColor = vec4(0.3, 0.3, 0.3, 1.0);
        vec3 mNormal    = (texture(normalTex, vUv) * 2.0 - 1.0).rgb;
        vec3 light      = normalize(vLightDirection);

        float halfLambert   = dot(mNormal, light) * 0.5 + 0.5;
        vec4  factor    = vec4(vec3(step(0.5, halfLambert)), 1.0); 

        outColor = smpColor * (1.0 - factor) + sdwColor * smpColor * factor;
    }

}