Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es
  precision highp float;

  out vec4 fragmentColor;
  in vec4 rayDir;

  uniform struct {
  	samplerCube envTexture;
    vec4 solidColor;
    vec3 specularColor;
    float shininess;
  } material;

  uniform struct {
    mat4 viewProjMatrix;
    mat4 rayDirMatrix;
    vec3 position;
  } camera;

  uniform struct {
    mat4 surface;
    mat4 clipper;
  } clippedQuadrics[16];

  uniform struct {
    vec4 position;
    vec3 powerDensity;
  } lights[8];

  vec3 shade(vec3 normal, vec3 lightDir, vec3 viewDir,
             vec3 powerDensity, vec3 materialColor, vec3 specularColor, float shininess) {

    float cosa = clamp( dot(lightDir, normal), 0.0, 1.0);
    vec3 halfway = normalize(viewDir + lightDir);
    float cosDelta = clamp(dot(halfway, normal), 0.0, 1.0);

    return powerDensity * materialColor * cosa
    + powerDensity * specularColor * pow(cosDelta, shininess);
  }

  float intersectClippedQuadric(mat4 A, mat4 B, vec4 e, vec4 d) {
    float b = dot(d * A, e) + dot(e * A, d);
    float a = dot(d * A, d);
    float c = dot(e * A, e);
    float discriminate = (b * b) - (4.0 * a * c);

    if (discriminate < 0.0) {
      return -1.0;
    } else {
      float t1 = (-b + sqrt(discriminate)) / (2.0 * a);
      float t2 = (-b - sqrt(discriminate)) / (2.0 * a);
      vec4 r1 = e + d * t1;
      vec4 r2 = e + d * t2;
      if (dot(r1 * B, r1) > 0.0) {
        t1 = -1.0;
      }
      if (dot(r2 * B, r2) > 0.0) {
        t2 = -1.0;
      }
      return (t1<0.0)?t2:((t2<0.0)?t1:min(t1, t2));
    }
  }

  bool findBestHit(vec4 e, vec4 d, out float bestT, out int bestIndex,
                   out float bestShadowT) {
    bool result = false;
    bestT = 10000.0;
    for(int i = 0; i < 7; i++) {
      float t = intersectClippedQuadric(clippedQuadrics[i].surface, clippedQuadrics[i].clipper, e, d);
      if((t > 0.0) && (t < bestT)) {
          bestT = t;
          bestShadowT = t;
          bestIndex = i;
          result = true;
      }
    }
    return result;
  }

  float snoise(vec3 r) {
    vec3 s = vec3(7502, 22777, 4767);
    float f = 0.0;
    for(int i=0; i<16; i++) {
      f += sin( dot(s - vec3(32768, 32768, 32768), r)
                                   / 65536.0);
      s = mod(s, 32768.0) * 2.0 + floor(s / 32768.0);
    }
    return f / 32.0 + 0.5;
  }

  vec3 noiseGrad(vec3 r) {
    vec3 s = vec3(7502, 22777, 4767);
    vec3 f = vec3(0.0, 0.0, 0.0);
    for(int i=0; i<16; i++) {
      f += cos( dot(s - vec3(32768, 32768, 32768), r*40.0)
                   / 65536.0) * (s - vec3(32768, 32768, 32768)) * 40.0;
      s = mod(s, 32768.0) * 2.0 + floor(s / 32768.0);
    }
    return f / 65536.0;
  }

  void main(void) {
    vec4 e = vec4(camera.position, 1.0);            //< ray origin
    vec4 d = vec4(normalize(rayDir).xyz, 0.0);      //< ray direction

    float bestT = 10000.0;
    int bestIndex = 0;
    float bestShadowT = 0.0;

    if ( findBestHit(e, d, bestT, bestIndex, bestShadowT)) {
      vec4 hit = e + d * bestT;
      vec3 normal = normalize( (hit * clippedQuadrics[bestIndex].surface +
                                clippedQuadrics[bestIndex].surface * hit).xyz);
      vec3 diffuseColor = vec3(0, 0, 0);
      vec3 specColor = material.specularColor;

      if(hit.x < 8.0 && hit.x > -8.0 && hit.z < 8.0 && hit.z > -8.0) {

        if (bestIndex == 0) { // chessboard
          if(fract(hit.x * 0.25) < 0.5 && fract(hit.z * 0.25) < 0.5 ){
            diffuseColor = vec3(1, 1, 1);
          }else if(fract(hit.x * 0.25) > 0.5 && fract(hit.z * 0.25) > 0.5){
            diffuseColor = vec3(1, 1, 1);
          }else{
            diffuseColor = vec3(0, 0, 0);
          }
        } else if (bestIndex == 3 || bestIndex == 4) {
          vec3 specColor = vec3(1.0, 1.0, 1.0);
          vec3 noiseNormal = noiseGrad(0.9 * hit.xyz) * 0.008;
          diffuseColor = vec3(0.7, 0.7, 1.0);
          normal = normalize(noiseNormal + normal);
        } else {
          float w = pow((sin(hit.x * 10.0 +
                        pow(snoise(hit.xyz * 8.0), 1.0)
                        * 75.0) + 1.0) / 2.0, 4.0);
          diffuseColor = mix(vec3(0.4, 0.2, 0.14), vec3(0.05, 0.05, 0.05), w);
        }

        vec3 color = vec3(0, 0, 0);
        for(int i = 0; i < 3; i++){
          vec3 lightDiff = lights[i].position.xyz - hit.xyz * lights[i].position.w;
          vec3 lightDir = normalize(lightDiff);
          float distanceSquared = dot(lightDiff, lightDiff);
          vec3 powerDensity = lights[i].powerDensity / distanceSquared;
          if (dot(normal, d.xyz) > 0.0) {
            normal = -normal;
          }
          vec4 hitAltered = hit;
          hitAltered.xyz += (0.1 * normal.xyz);
          hitAltered.w = 1.0;
          bool shadowRayHitSomething = findBestHit(hitAltered, vec4(lightDir, 0.0), bestT, bestIndex, bestShadowT);
          if(!shadowRayHitSomething ||
            bestShadowT * lights[i].position.w > sqrt(dot(lightDiff, lightDiff))) {

            color += shade(normal, lightDir, d.xyz, powerDensity,
              diffuseColor, specColor, material.shininess).xyz;
          }
        }
        fragmentColor = vec4(color, 1.0);
        vec4 ndcHit = hit * camera.viewProjMatrix;
        gl_FragDepth = ndcHit.z / ndcHit.w * 0.5 + 0.5;

      } else {
        fragmentColor = texture(material.envTexture, d.xyz);
        gl_FragDepth = 0.9999;
      }
    } else {
      fragmentColor = texture(material.envTexture, d.xyz);
      gl_FragDepth = 0.9999;
    }


  }

`;
