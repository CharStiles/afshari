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
  angle:73,
  delta:0,
  motion:false,
  fill:false,
  selected: "hexa_triangle_square"
};

function preload() {
  song = loadSound("Afshari.m4a");
}

let isStarted = false;
let startButton;

let orderedPolys = [];

let startTime;
const ACCELERATION_TIME = 67000; // 1:07 in milliseconds
let drawingMultiple = false;
let drawSpeed = 0.02;

function setup() {
  var canvas = createCanvas(windowWidth, windowHeight);
  canvas.drop(gotFile);

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
    .name('Multiple Select')
    .onChange(chooseTiling);
  
  //gui.add(params, "showUnsmoothed");
  gui.add(params, "fill");
  gui.add(params, "motion");
  gui.add(params, "lineThickness").min(0.1).max(8.0).step(0.01);
    gui.add(params, "delta").min(0).max(50.0).step(1);
    gui.add(params, "angle").min(0).max(90.0).step(1);
    song.stop();
  
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
  
  background(51);
  fft.analyze();
  amp.smooth(0.9);
  let level = amp.getLevel();
  
  let elapsedTime = millis() - startTime;
  
  // Check if we should switch to accelerated mode
  if (elapsedTime > ACCELERATION_TIME && !drawingMultiple) {
    drawingMultiple = true;
    drawSpeed = 0.05; // Initial speed increase
  }
  
  // Increase speed over time in accelerated mode
  if (drawingMultiple) {
    drawSpeed = min(drawSpeed + 0.0001, 0.2); // Gradually increase speed, cap at 0.2
  }
  
  // Update line progress with time
  lineProgress += drawSpeed;
  
  // When line is complete, move to next line
  if (lineProgress >= 1) {
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
  
  // Modulate progress with audio level
  let audioModulation = map(level, 0.2, 1, 0.5, 1.5);
  audioModulation = constrain(audioModulation, 0, 1);
  let displayProgress = lineProgress * audioModulation;
  
  // Draw completed polygons
  for (let poly of completedPolys) {
    poly.hankin();
    poly.show(poly.edges.length, 1);
  }
  
  // Draw current and additional polygons in accelerated mode
  if (currentPoly < orderedPolys.length) {
    let polysToDraw = drawingMultiple ? 3 : 1; // Draw 3 polygons at once in accelerated mode
    
    for (let i = 0; i < polysToDraw; i++) {
      let polyIndex = currentPoly + i;
      if (polyIndex < orderedPolys.length && !completedPolys.includes(orderedPolys[polyIndex])) {
        orderedPolys[polyIndex].hankin();
        orderedPolys[polyIndex].show(currentLineIndex, displayProgress);
      }
    }
  }
  
  // Optional: Visual feedback for acceleration
  if (drawingMultiple) {
    let intensity = map(drawSpeed, 0.05, 0.2, 0, 255);
    stroke(255, intensity);
    strokeWeight(2);
    noFill();
    rect(0, 0, width, height);
  }
}

function octSquareTiling() {
  var octSqTiles = new SquareOctagonTiling(50);
  octSqTiles.buildGrid();
  polys = octSqTiles.polys;
}

function hexTiling() {
  var hexTiles = new HexagonalTiling(50);
  hexTiles.buildGrid();
  polys = hexTiles.polys;
}

function hexTriangleSquareTiling() {
  var tiles = new HexaTriangleSquareTiling(50.);
  tiles.buildGrid();
  polys = tiles.polys;
}

function squareTiling() {
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
  switch (params.selected) {
    case "4.8.8":
      octSquareTiling();
      break;
    case "square":
      squareTiling();
      break;
    case "hexagonal":
      hexTiling();
      break;
    case "dodeca_hex_square":
      dodecaHexSquareTiling();
      break;
    case "hexa_triangle_square":
      hexTriangleSquareTiling();
      break;
    default:
      hexTriangleSquareTiling();
      break;
  }
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