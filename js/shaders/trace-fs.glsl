Shader.source[document.currentScript.src.split('js/shaders/')[1]] = `#version 300 es
  precision highp float;

  out vec4 fragmentColor;
  in vec4 rayDir;

  uniform struct {
  	samplerCube envTexture;
  } material;

  uniform struct {
    mat4 viewProjMatrix;
    mat4 rayDirMatrix;
    vec3 position;
  } camera;

  float intersectQuadric(mat4 A, vec4 e, vec4 d) {
    float b = dot(d * A, e) + dot(e * A, d);
    float a = dot(d * A, d);
    float c = dot(e * A, e);
    float discriminate = (b * b) - (4.0 * a * c);

    if (discriminate < 0.0) {
      return -1.0;
    } else {
      float t1 = (-b + sqrt(discriminate)) / (2.0 * a);
      float t2 = (-b - sqrt(discriminate)) / (2.0 * a);
      return (t1<0.0)?t2:((t2<0.0)?t1:min(t1, t2));
    }
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

  void main(void) {
    vec4 e = vec4(camera.position, 1.0);            //< ray origin
    vec4 d = vec4(normalize(rayDir).xyz, 0.0);      //< ray direction
    mat4 A = mat4(	1.0, 0, 0, 0,
                		0, 1.0, 0, 0,
                		0, 0, 1.0, 0,
                		0, 0, 0, -9.0	);

    mat4 B = mat4(	1, 0, 0, 0,
                		0, 0, 0, 0,
                		0, 0, 0, 0,
                		0, 0, 0, -1);

    // computing depth from world space hit coordinates ...
    //float t = intersectQuadric(A, e, d);
    float t = intersectClippedQuadric(A, B, e, d);

    // nothing hit by ray, return enviroment color
    if (t > 0.0) {
      vec4 hit = e + d * t;
      vec3 normal = normalize( (hit * A + A * hit).xyz );
      //fragmentColor.rgb = normalize(abs(hit.xyz));
      fragmentColor.rgb = normal;

      vec4 ndcHit = hit * camera.viewProjMatrix;
      gl_FragDepth = ndcHit.z / ndcHit.w * 0.5 + 0.5;
    } else {
      fragmentColor = texture(material.envTexture, d.xyz);
      gl_FragDepth = 0.9999;
    }


  }

`;
