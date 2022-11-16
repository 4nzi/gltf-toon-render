#version 300 es
precision mediump float;

in vec4 vFactor;
in vec2 vUv;
out vec4 outColor;

void main(void){
    vec4 smpColor = vec4(0.3, 0.3, 1.0, 1.0);
    vec4 sdwColor = vec4(0.3, 0.3, 0.3, 1.0);

    outColor = smpColor * (1.0 - vFactor) + sdwColor * smpColor * vFactor;
    // outColor = vFactor;
}