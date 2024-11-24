// Daniel Shiffman
// http://codingtra.in
// Islamic Star Patterns
// Video: https://youtu.be/sJ6pMLp_IaI
// Based on: http://www.cgl.uwaterloo.ca/csk/projects/starpatterns/

function Hankin(a, v) {
  this.a = a;
  this.v = v;
  this.end = p5.Vector.add(a, v);

  this.show = function(progress = 1) {
    stroke(255);
    strokeWeight(params.lineThickness);
    
    // Calculate intermediate point based on progress
    let currentEnd = p5.Vector.lerp(this.a, this.end, progress);
    line(this.a.x, this.a.y, currentEnd.x, currentEnd.y);
  }
}
