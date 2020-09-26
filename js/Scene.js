"use strict";
/* exported Scene */
class Scene extends UniformProvider {
  constructor(gl) {
    super("scene");
    this.programs = [];
    this.gameObjects = [];

    this.fsTextured = new Shader(gl, gl.FRAGMENT_SHADER, "textured-fs.glsl");
    this.vsTextured = new Shader(gl, gl.VERTEX_SHADER, "textured-vs.glsl");
    this.programs.push(
    	this.texturedProgram = new TexturedProgram(gl, this.vsTextured, this.fsTextured));

    this.vsQuad = new Shader(gl, gl.VERTEX_SHADER, "quad-vs.glsl");
    this.fsTrace = new Shader(gl, gl.FRAGMENT_SHADER, "trace-fs.glsl");
    this.fsShow = new Shader(gl, gl.FRAGMENT_SHADER, "show-fs.glsl");
    this.fsRay = new Shader(gl, gl.FRAGMENT_SHADER, "raycast-fs.glsl");
    this.programs.push(
      this.rayProgram = new TexturedProgram(gl, this.vsQuad, this.fsRay));
    this.programs.push(
      this.traceProgram = new TexturedProgram(gl, this.vsQuad, this.fsTrace));
    this.programs.push(
      this.showProgram = new TexturedProgram(gl, this.vsQuad, this.fsShow));

    this.texturedQuadGeometry = new TexturedQuadGeometry(gl);

    this.timeAtFirstFrame = new Date().getTime();
    this.timeAtLastFrame = this.timeAtFirstFrame;

    //this.traceMaterial = new Material(this.traceProgram);
    this.traceMaterial = new Material(this.rayProgram);
    this.traceMaterial.shininess = 10;
    this.traceMaterial.specularColor.set(0, 0, 0);

    this.envTexture = new TextureCube(gl, [
    "media/posx512.jpg",
    "media/negx512.jpg",
    "media/posy512.jpg",
    "media/negy512.jpg",
    "media/posz512.jpg",
    "media/negz512.jpg",]
    );

    this.traceMaterial.envTexture.set(this.envTexture);
    this.traceMesh = new Mesh(this.traceMaterial, this.texturedQuadGeometry);

    this.traceQuad = new GameObject(this.traceMesh);
    this.gameObjects.push(this.traceQuad);

    this.camera = new PerspectiveCamera(...this.programs);
    this.camera.position.set(0, 1, 15);
    this.camera.update();
    this.addComponentsAndGatherUniforms(...this.programs);

    this.clippedQuadrics = [];
    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[0].makeChessboard();

    // make pawn
    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[1].makeUnitCone();
    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[2].makeUnitSphere();

    // make bishop
    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[3].makeUnitCylinder();
    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[4].makeBishopTop();

    // make king
    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[5].makeKingBottom();
    this.clippedQuadrics.push(
      new ClippedQuadric(this.clippedQuadrics.length, ...this.programs));
    this.clippedQuadrics[6].makeKingTop();

    this.lights = [];
    this.lights.push(new Light(this.lights.length, ...this.programs));
    this.lights[0].position.set(10, 0, 1, 0).normalize();
    this.lights[0].powerDensity.set(1, 1, 1);
    this.lights.push(new Light(this.lights.length, ...this.programs));
    this.lights[1].position.set(1, 25, 1, 1);
    this.lights[1].powerDensity.set(800, 800, 800);

    // lights for king
    this.lights.push(new Light(this.lights.length, ...this.programs));
    this.lights[2].position.set(-1, 3, 6, 1);
    this.lights[2].powerDensity.set(16, 8, 2);
    this.lights.push(new Light(this.lights.length, ...this.programs));
    this.lights[3].position.set(-6, 10, 5, 1);
    this.lights[3].powerDensity.set(50, 15, 25);

    gl.enable(gl.DEPTH_TEST);
  }

  resize(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    this.camera.setAspectRatio(canvas.width / canvas.height);
  }

  update(gl, keysPressed) {
    //jshint bitwise:false
    //jshint unused:false
    const timeAtThisFrame = new Date().getTime();
    const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
    const t = (timeAtThisFrame - this.timeAtFirstFrame) / 1000.0;
    this.timeAtLastFrame = timeAtThisFrame;
    //this.time.set(t);
    this.time = t;

    // clear the screen
    gl.clearColor(0.3, 0.0, 0.3, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.camera.move(dt, keysPressed);

    for(const gameObject of this.gameObjects) {
        gameObject.update();
    }
    for(const gameObject of this.gameObjects) {
        gameObject.draw(this, this.camera, ...this.clippedQuadrics, ...this.lights);
    }
  }
}
