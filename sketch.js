// Daniel Shiffman
// http://codingtra.in
// Islamic Star Patterns
// Video: https://youtu.be/sJ6pMLp_IaI
// Based on: http://www.cgl.uwaterloo.ca/csk/projects/starpatterns/

// var poly;
var polys = [];

var angle = 73;
var delta = 0;

var tilingTypeSelect;
var gridCheck;

let song;
let playPauseButton;
let amp;
let fft;

let params = {
  lineThickness: 1,
  angle: 73,
  delta: 0,
  speed: 0.05,
  selected: "hexa_triangle_square",
  backgroundColor: 51,
  ampSmooth: 0.9,
  maxThicknessMultiplier: 4,
};

let theShader;
let mainGraphics;
let canvasGraphics;

function preload() {
  song = loadSound("Afshari.m4a");
  theShader = loadShader('shader.vert', 'shader.frag');
}

let isStarted = false;
let startButton;

let orderedPolys = [];

let startTime;
const ACCELERATION_TIME = 67000; // 1:07 in milliseconds
let drawingMultiple = false;
let drawSpeed = 0.02;

function setup() {
  var canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.drop(gotFile);
  
  // Just one buffer for previous frame
  canvasGraphics = createGraphics(windowWidth, windowHeight, P2D);
  
  amp = new p5.Amplitude();
  amp.toggleNormalize(true);
  fft = new p5.FFT();

  // Create start button
  startButton = createButton('START');
  startButton.class('start-button'); // For styling
  // Center the button
  startButton.position(windowWidth/2 - 100, windowHeight/2 - 50);
  startButton.mousePressed(startExperience);
  background(51);
  // tilingTypeSelect = select('#tiling');
  // tilingTypeSelect.changed(chooseTiling);
  gridCheck = select('#showGrid');
  chooseTiling();
  // Initialize other variables
  completedPolys = [];
  currentPoly = 0;
  currentLineIndex = 0;
  lineProgress = 0;
  
  // Setup GUI and other elements
  let gui = new dat.GUI();
  // ... rest of your GUI setup ...
  
  var choices = ['hexa_triangle_square', 'square', 'hexagonal', '4.8.8', 'dodeca_hex_square'];

gui.add(params, 'selected', choices)
    .name('Pattern Type')
    .onChange(chooseTiling);
  
  gui.add(params, "lineThickness").min(0.1).max(8.0).step(0.01);
  gui.add(params, "maxThicknessMultiplier").min(1).max(10).step(0.1).name("Max Thickness Multiplier");
  gui.add(params, "delta").min(0).max(50.0).step(1);
  gui.add(params, "angle").min(0).max(90.0).step(1);
  gui.add(params, "speed").min(0.01).max(2.0).step(0.01).name("Drawing Speed");
  gui.add(params, "backgroundColor").min(0).max(255).step(1).name("Background");
  gui.add(params, "ampSmooth").min(0.01).max(0.99).step(0.01).name("Audio Smooth");
  
  // Remove the fill and motion parameters
  
  // Remove old play/pause button if it exists
  if (playPauseButton) {
    playPauseButton.remove();
  }
}



function gotFile(file) {
    if (file.type === 'audio') {
        song = loadSound(file, song.stop());
    } else {
        alert("Not an audio file!");
    }
}

function startExperience() {
  isStarted = true;
  song.play();
  startButton.remove();
  background(51);
  chooseTiling();
  orderPolysFromCenter();
  currentPoly = 0;
  currentLineIndex = 0;
  lineProgress = 0;
  completedPolys = [];
  startTime = millis();
  drawingMultiple = false;
  drawSpeed = 0.02;
}

function draw() {
  if (!isStarted) return;
  
  // Store current frame before drawing new one
 
  
  // Draw directly to canvas
  translate(-width/2, -height/2);  // Move to top-left for normal coordinates
  background(params.backgroundColor);
  
  fft.analyze();
  amp.smooth(params.ampSmooth);
  let level = amp.getLevel();
  
  // Only progress if there's sound
  if (level > 0.001) {
    let elapsedTime = millis() - startTime;
    
    if (elapsedTime > ACCELERATION_TIME && !drawingMultiple) {
      drawingMultiple = true;
      drawSpeed = params.speed;
    }
    
    if (drawingMultiple) {
      drawSpeed = min(drawSpeed + (params.speed + 0.002), params.speed * 4);
    }
    
    lineProgress += drawSpeed;
    
    if (lineProgress >= 2) {
      lineProgress = 0;
      currentLineIndex++;
      
      if (currentLineIndex >= orderedPolys[currentPoly].edges.length) {
        completedPolys.push(orderedPolys[currentPoly]);
        currentPoly++;
        currentLineIndex = 0;
        
        if (currentPoly >= orderedPolys.length) {
          currentPoly = orderedPolys.length - 1;
        }
      }
    }
  }
  
  // Draw completed polygons
  for (let poly of completedPolys) {
    poly.hankin();
    poly.show(poly.edges.length, 1);
  }
  
  // Draw current polygons
  if (currentPoly < orderedPolys.length) {
    let polysToDraw = drawingMultiple ? 3 : 1;
    
    for (let i = 0; i < polysToDraw; i++) {
      let polyIndex = currentPoly + i;
      if (polyIndex < orderedPolys.length && !completedPolys.includes(orderedPolys[polyIndex])) {
        orderedPolys[polyIndex].hankin();
        orderedPolys[polyIndex].show(currentLineIndex, lineProgress);
      }
    }
  }
  
  // Capture current state before applying shader
  let currentCanvas = get();  // Capture current canvas
  
  // Apply shader as final layer
  shader(theShader);
  theShader.setUniform('tex0', currentCanvas);
  theShader.setUniform('prevFrame', canvasGraphics);  // Use same texture for both
  theShader.setUniform('resolution', [width, height]);
  theShader.setUniform('time', millis() / 1000.0);
  theShader.setUniform('amplitude', level);  // Pass amplitude to shader
  rect(-1, -1, 2, 2);  // Draw shader over everything

  canvasGraphics=currentCanvas;
}
function octSquareTiling() {
  console.log("!!Creating octagon square pattern");
  var octSqTiles = new SquareOctagonTiling(50);
  octSqTiles.buildGrid();
  polys = octSqTiles.polys;
}

function hexTiling() {
  console.log("!!Creating hexagonal pattern");
  var hexTiles = new HexagonalTiling(50);
  hexTiles.buildGrid();
  polys = hexTiles.polys;
}

function hexTriangleSquareTiling() {
  console.log("!!Creating hexa triangle square pattern");
  var tiles = new HexaTriangleSquareTiling(50.);
  tiles.buildGrid();
  polys = tiles.polys;
}

function squareTiling() {
  console.log("!!Creating square pattern");
  polys = [];
  var inc = height/13;
  for (var x = 0; x < width; x += inc) {
    for (var y = 0; y < height; y += inc) {
      var poly = new Polygon(4);
      poly.addVertex(x, y);
      poly.addVertex(x + inc, y);
      poly.addVertex(x + inc, y + inc);
      poly.addVertex(x, y + inc);
      poly.close();
      polys.push(poly);
    }
  }
}

function dodecaHexSquareTiling() {
  var tiles = new DodecaHexaSquareTiling(50);
  tiles.buildGrid();
  polys = tiles.polys;

}

function gotFile(file) {
    if (file.type === 'audio') {
        song = loadSound(file, song.stop());
    } else {
        alert("Not an audio file!");
    }
}

function chooseTiling() {
  console.log("chooseTiling called with pattern:", params.selected);
  // Clear existing arrays
  // polys = [];
  // orderedPolys = [];
  // completedPolys = [];
  
  switch (params.selected) {
    case "4.8.8":
      console.log("Creating octagon square pattern");
      octSquareTiling();
      break;
    case "square":
      console.log("Creating square pattern");
      squareTiling();
      break;
    case "hexagonal":
      console.log("Creating hexagonal pattern");
      hexTiling();
      break;
    case "dodeca_hex_square":
      console.log("Creating dodeca hex square pattern");
      dodecaHexSquareTiling();
      break;
    case "hexa_triangle_square":
      console.log("Creating hexa triangle square pattern");
      hexTriangleSquareTiling();
      break;
    default:
      console.log("Using default pattern");
      hexTriangleSquareTiling();
      break;
  }
  
  // Reset drawing state
  orderPolysFromCenter();
  currentPoly = 0;
  currentLineIndex = 0;
  lineProgress = 0;
  drawingMultiple = false;
  drawSpeed = 0.02;
  
  // Reset the background
  background(51);
}

// Add this function to order polygons from center outward
function orderPolysFromCenter() {
  let centerX = width / 2;
  let centerY = height / 2;
  
  // Calculate distances from center for each polygon
  orderedPolys = polys.map((poly, index) => {
    // Calculate center of polygon
    let avgX = 0;
    let avgY = 0;
    poly.vertices.forEach(v => {
      avgX += v.x;
      avgY += v.y;
    });
    avgX /= poly.vertices.length;
    avgY /= poly.vertices.length;
    
    // Calculate distance from center
    let dist = sqrt(pow(avgX - centerX, 2) + pow(avgY - centerY, 2));
    return { poly, dist, index };
  });
  
  // Sort by distance from center
  orderedPolys.sort((a, b) => a.dist - b.dist);
  
  // Extract just the polygons in the new order
  orderedPolys = orderedPolys.map(item => item.poly);
}
