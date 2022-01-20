uniform float time;
uniform vec3 color;
uniform float rg;
uniform float progress;
uniform sampler2D uImg;
uniform sampler2D texture2;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;


void main(){
    vec3 col = vPosition;
    float _color = 1. - distance(vec3(vUv, 1.),col);
    _color = step(0.997, _color);
    vec4 finalColor = mix(vec4(0.), vec4(color, 1.), _color);
    vec4 final = texture2D(texture2, vUv);
    // gl_FragColor = vec4(finalColor);
    gl_FragColor = texture2D(texture2, vUv);
    gl_FragColor.rg -= rg;
    // if(gl_FragColor.r < 0.1) gl_FragColor.a = 0.;
    // if(gl_FragColor.g < 0.1) gl_FragColor.a = 0.;
    // if(gl_FragColor.b < 0.1) gl_FragColor.a = 0.;
}