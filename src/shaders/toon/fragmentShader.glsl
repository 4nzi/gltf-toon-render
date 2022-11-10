#version 300 es
precision mediump float;

uniform sampler2D texture2dSampler;
in vec4 vFactor;
in vec2 vTextureCoord;
out vec4 outColor;

void main(void){
    vec4 smpColor = texture(texture2dSampler, vTextureCoord);
    vec4 sdwColor = vec4(0.3, 0.3, 0.3, 1.0);

    outColor = smpColor * (1.0 - vFactor) + sdwColor * smpColor * vFactor;
    // outColor = vFactor;
}