// Daniel Shiffman
// http://codingtra.in
// Islamic Star Patterns
// Video: https://youtu.be/sJ6pMLp_IaI
// Based on: http://www.cgl.uwaterloo.ca/csk/projects/starpatterns/

function Edge(a, b) {
  this.a = a;
  this.b = b;
  this.h1;
  this.h2;
  this.sidesOfParent;
  
  this.show = function(currentLineIndex, progress = 1, lastEndpoint = null) {
    if (gridCheck.checked()) {
      stroke(255, 25);
      line(this.a.x, this.a.y, this.b.x, this.b.y);
    }
    
    if (currentLineIndex === this.lineIndex) {
      if (progress <= 1) {
        // Draw first line
        let currentEnd = p5.Vector.lerp(this.h1.a, this.h1.end, progress);
        this.h1.showSegment(this.h1.a, currentEnd);
      } else {
        // Draw first line complete
        this.h1.showSegment(this.h1.a, this.h1.end);
        // Draw second line starting from its actual start point
        let currentEnd = p5.Vector.lerp(this.h2.a, this.h2.end, progress - 1);
        this.h2.showSegment(this.h2.a, currentEnd);
      }
    } else if (currentLineIndex > this.lineIndex) {
      this.h1.show(1);
      this.h2.show(1);
    }
  }

  this.hankin = function(alpha) {
    var mid = p5.Vector.add(this.a, this.b);
    mid.mult(0.5);

    var v1 = p5.Vector.sub(this.a, mid);
    var v2 = p5.Vector.sub(this.b, mid);

    var half_len = v1.mag();

    var offset1 = mid;
    var offset2 = mid;
    if (params.delta > 0) {
      v1.setMag(params.delta);
      v2.setMag(params.delta);
      offset1 = p5.Vector.add(mid, v2);
      offset2 = p5.Vector.add(mid, v1);
    }
    v1.normalize();
    v2.normalize();

    v1.rotate(radians(-params.angle));
    v2.rotate(radians(params.angle));

    var alpha = alpha / 2;
    var beta = PI - alpha - radians(params.angle);
    var len = sin(alpha) * ((half_len + params.delta) / sin(beta));

    v1.setMag(len);
    v2.setMag(len);

    this.h1 = new Hankin(offset1, v1);
    this.h2 = new Hankin(offset2, v2);
  }

  this.findEnds = function(edge) {
    this.h1.findEnd(edge.h1);
    this.h1.findEnd(edge.h2);
    this.h2.findEnd(edge.h1);
    this.h2.findEnd(edge.h2);
  }

}
