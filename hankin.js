// Daniel Shiffman
// http://codingtra.in
// Islamic Star Patterns
// Video: https://youtu.be/sJ6pMLp_IaI
// Based on: http://www.cgl.uwaterloo.ca/csk/projects/starpatterns/

function Hankin(a, v) {
  this.a = a;
  this.v = v;
  this.end = p5.Vector.add(a, v);

  this.showSegment = function(start, end) {
    stroke(255);
    strokeWeight(params.lineThickness);
    line(start.x, start.y, end.x, end.y);
  }

  this.show = function(progress = 1) {
    this.showSegment(this.a, p5.Vector.lerp(this.a, this.end, progress));
  }
}
