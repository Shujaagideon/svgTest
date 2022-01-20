uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec2 pixels;
uniform vec2 uTextureSize;
uniform vec2 uQuadSize;

uniform float uDistortionFrequency;
uniform float uDistortionStrength;
uniform float uDisplacementFrequency;
uniform float uDisplacementStrength;

#pragma glslify: perlin4d = require('./noise.glsl');
// #pragma glslify: cnoise = require('./noise.glsl');

vec3 getDisplacedPosition(vec3 _position){
    vec3 distoredPosition = _position;
    distoredPosition += perlin4d(vec4(distoredPosition * uDistortionFrequency, (time * 0.1))) * uDistortionStrength;

    float perlinStrength = perlin4d(vec4(distoredPosition * uDisplacementFrequency, (time * 0.1)));
    
    vec3 displacedPosition = _position;
    displacedPosition += normalize(_position) * perlinStrength * uDisplacementStrength;

    return displacedPosition;
}
vec2 getUv(vec2 uv){
    vec2 fin = uv - vec2(0.5);

    float quadAspect = uQuadSize.x/uQuadSize.y;
    float texAspect = uTextureSize.x/uTextureSize.y;
    quadAspect < texAspect ? fin*= vec2( quadAspect / texAspect , 1.) : fin *= vec2(1. , texAspect / quadAspect);

    fin += vec2(0.5);
    return fin;
}

void main(){
    // vUv = getUv(uv);
    vUv = uv;
    vPosition = getDisplacedPosition(vec3(uv, 1.));
    vec3 newPosition = position;
    newPosition += vPosition;
    // noise distorting the positions.
    // float noise = cnoise(3.*vec3(position.x + time/50.0 ,position.y + time/50.0 ,position.z + time/30.));
    // newposition.x += 10.*sin(dist*10. + time + noise);
    // newposition.z += 10.*sin(dist*10. + time + noise);
    // newposition.y += sin(time*0.3)*10.5* noise;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}