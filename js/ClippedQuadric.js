"use strict";
/* exported Material */
class ClippedQuadric extends UniformProvider {
    constructor(id, ...programs) {
      super(`clippedQuadrics[${id}]`);
      this.surface = new Mat4();
      this.clipper = new Mat4();
      this.addComponentsAndGatherUniforms(...programs);
    }

    transform(T, A) {
      T.invert();
      A.premul(T);
      T.transpose();
      A.mul(T);

    }

    makeKingBottom() {
      this.surface.set(1,  0,  0,  0,
                  0,  0,  0,  0,
                  0,  0,  1,  0,
                  0,  0,  0, -0.15);
      this.clipper.set(0,  0,  0,  0,
                  0,  1,  0,  0,
                  0,  0,  0,  0,
                  0,  0,  0, -1);

      var surfaceMatrix = new Mat4();
      surfaceMatrix.translate(-5.0, -1.0, 5.0);
      this.transform(surfaceMatrix, this.surface);

      var clipperMatrix = new Mat4();
      clipperMatrix.translate(0, -1.0, 0);
      this.transform(clipperMatrix, this.clipper);
    }

    makeKingTop() {
      this.surface.set(1, 0, 0, 0,
                      0, 1, 0, 0,
                      0, 0, 0, 0,
                      0, 0, -0.7, 0);

      this.clipper.set(0, 0, 0, 0,
                      0, 1, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, -1.5);


      var surfaceMatrix = new Mat4();
      surfaceMatrix.set(1, 0, 0, 0, // rotation along x axis
                        0, 0, -1.0, 0,
                        0, 1.0, 0, 0,
                        0, 0, 0, 1.0);
      surfaceMatrix.translate(-5.0, -0.1, 5.0);
      this.transform(surfaceMatrix, this.surface);
      var clipMatrix = new Mat4();
      clipMatrix.translate(0, -0.1, 0);
      this.transform(clipMatrix, this.clipper);
    }

    makeUnitCylinder(){
      this.surface.set(1,  0,  0,  0,
                  0,  0,  0,  0,
                  0,  0,  1,  0,
                  0,  0,  0, -0.15);
      this.clipper.set(0,  0,  0,  0,
                  0,  1,  0,  0,
                  0,  0,  0,  0,
                  0,  0,  0, -1);

      var surfaceMatrix = new Mat4();
      surfaceMatrix.translate(-1, -1.0, 5.0);
      this.transform(surfaceMatrix, this.surface);

      var clipperMatrix = new Mat4();
      clipperMatrix.translate(-1, -1.0, 0);
      this.transform(clipperMatrix, this.clipper);
    }

    makeBishopTop() {
      this.surface.set(1,  0,  0,  0,
                  0,  1,  0,  0,
                  0,  0,  1,  0,
                  0,  0,  0, -0.8);
      this.clipper.set(-1,  0,  0,  0,
                  0,  0,  0,  0,
                  0,  0,  -1,  0,
                  0,  0,  0, 0.2);

      var surfaceMatrix = new Mat4();
      var clipperMatrix = new Mat4();
      clipperMatrix.set(0, -1.0, 0, 0,
                        1.0, 0, 0, 0,
                        0, 0, 1.0, 0,
                        0, 0, 0, 1.0);
      surfaceMatrix.translate(-1, 0.5, 5.0);
      clipperMatrix.translate(-1, 0.5, 5);
      this.transform(clipperMatrix, this.clipper);
      this.transform(surfaceMatrix, this.surface);

    }

    makeRing() {
      this.surface.set(	1.0, 0, 0, 0,
                      0, 1.0, 0, 0,
                      0, 0, 1.0, 0,
                      0, 0, 0, -9.0	);

      this.clipper.set(	0, 1.0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, -1.0);

    }

    makeUnitCone() {
      this.surface.set( 1.0, 0, 0, 0,
                       0, 1.0, 0, 0,
                       0, 0, -0.5, 0,
                       0, 0, 0, 0 );

     this.clipper.set(0.0,  0,  0,  0,
                       0,  0.0,  0,  0,
                       0,  0,  1.0,  0,
                       0,  0,  0, -1.0);

     var transMatrix = new Mat4();
     transMatrix.set(1, 0, 0, 0,
                    0, 0, -1.0, 0,
                    0, 1.0, 0, 0,
                    0, 0, 0, 1.0  );
     this.transform(transMatrix, this.surface);
     this.transform(transMatrix, this.clipper);
     this.clipper.translate(0, -1.5, 0);
    }

    makeUnitSphere() {
      this.surface.set(	1.0, 0, 0, 0,
                      0, 1.0, 0, 0,
                      0, 0, 1.0, 0,
                      0, 0, 0, -0.6	);

      this.clipper.set(	0, 1.0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, 0,
                      0, 0, 0, -10.0);
      var transMatrix = new Mat4();
      transMatrix.translate(0, 0.8, 0);
      this.transform(transMatrix, this.surface);
      this.transform(transMatrix, this.clipper);
    }

    makeChessboard() {
      this.surface.set(	0, 0, 0, 0,
                      0, 1.0, 0, 0,
                      0, 0, 0.0, 0,
                      0, 0, 0, -1.0	);

      this.clipper.set(	0.0, 0, 0, 0,
                      0, 1.0, 0, 0,
                      0, 0, 0.0, 0,
                      0, 0, 0, -4.0);

      var transMatrix = new Mat4();
      transMatrix.translate(0, -2.9, 0);
      this.transform(transMatrix, this.surface);
    }


}
