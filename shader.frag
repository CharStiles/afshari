#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D tex0;      // Current frame
uniform sampler2D prevFrame; // Previous frame
uniform vec2 resolution;     // Screen resolution
uniform float time;         // Time in seconds
uniform float amplitude;  // Audio amplitude

// Better random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// 2D random
vec2 random2(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

#define NUM_RAYS 8
#define RAY_STEPS 16
#define BOUNCE_SPEED 2.0
#define RAY_BRIGHTNESS 0.5

// Blur function
vec4 blur(sampler2D tex, vec2 uv, vec2 resolution) {
    float blurSize = 2.0/resolution.x;  // Adjust blur size
    vec4 sum = vec4(0.0);
    
    // 9-tap gaussian blur
    sum += texture2D(tex, uv + vec2(-blurSize, -blurSize)) * 0.0625;
    sum += texture2D(tex, uv + vec2(0.0, -blurSize)) * 0.125;
    sum += texture2D(tex, uv + vec2(blurSize, -blurSize)) * 0.0625;
    
    sum += texture2D(tex, uv + vec2(-blurSize, 0.0)) * 0.125;
    sum += texture2D(tex, uv) * 0.25;
    sum += texture2D(tex, uv + vec2(blurSize, 0.0)) * 0.125;
    
    sum += texture2D(tex, uv + vec2(-blurSize, blurSize)) * 0.0625;
    sum += texture2D(tex, uv + vec2(0.0, blurSize)) * 0.125;
    sum += texture2D(tex, uv + vec2(blurSize, blurSize)) * 0.0625;
    
    return sum;
}

void main() {
  vec2 uv = vTexCoord;

  // Flip the y coordinate
  uv.y = 1.0 - uv.y;
  
  vec2 centeredUV = uv - 0.5;

  // Get current and previous frame colors
  vec4 currentColor = texture2D(tex0, uv);
  vec4 prevColor = texture2D(prevFrame, uv);
  
  // Calculate movement with blur
  vec4 blurredCurrent = blur(tex0, uv, resolution);
  vec4 blurredPrev = blur(prevFrame, uv, resolution);
  float movement = length(blurredCurrent.rgb - blurredPrev.rgb);
  
  vec4 finalColor = currentColor;
  
  // Only process white/bright areas
  if (length(currentColor.rgb) > 0.1) {
    for(int i = 0; i < NUM_RAYS; i++) {
      // Use random function for ray positions
      vec2 randOffset =vec2(0);//random2(uv + time * 0.1 + float(i));
      vec2 rayPos = randOffset * 0.01;
      
      // Random direction that changes with time
      float randAngle = (uv.x/uv.y + (time/3.)*(1.-length(centeredUV)) * 0.5 + float(i)) +(length(centeredUV))*10.3 ;//random(uv + time * 0.5 + float(i));
      vec2 rayDir = vec2(
        cos(randAngle * 6.28),
        sin(randAngle * 6.28)
      );
      
      // Trace ray through white area
      vec4 rayColor = vec4(0.0);
      vec2 rayStep = rayDir * 0.005* amplitude;
      vec2 tracePos = uv + rayPos;
      
      for(int step = 0; step < RAY_STEPS; step++) {
        vec4 sampleColor = texture2D(tex0, tracePos);
        
        // Only accumulate color in white areas
        if(length(sampleColor.rgb) > 0.1) {
          rayColor += sampleColor * (1.0 - float(step) / float(RAY_STEPS))*0.42;
        }
        
        tracePos += rayStep;
      }
      
      finalColor += rayColor * RAY_BRIGHTNESS / float(NUM_RAYS);
    }
  }
  
  // Add extra glow for moving parts
  if (movement > 0.01) {
    finalColor += vec4(1.0) * movement;
  }
  
  // Smooth transition based on currentColor.r
  float mixFactor = smoothstep(0.0, 0.999, blurredCurrent.r);
  vec4 brightColor = (finalColor * 2.2) - 1.2;
  vec4 moveColor = vec4(movement * 80.0);
  gl_FragColor =  mix(brightColor, moveColor, mixFactor);
} 

// #ifdef GL_ES
// precision mediump float;
// #endif

// varying vec2 vTexCoord;

// uniform sampler2D tex0;      // Current frame
// uniform sampler2D prevFrame; // Previous frame
// uniform vec2 resolution;     // Screen resolution
// uniform float time;         // Time in seconds

// #define SAMPLES 64
// #define DENSITY 0.75
// #define BRIGHTNESS 1.0
// #define RAY_LENGTH 0.005

// void main() {
//   vec2 uv = vTexCoord;
//   // Flip the y coordinate
//   uv.y = 1.0 - uv.y;
  
//   // Get current and previous frame colors
//   vec4 currentColor = texture2D(tex0, uv);
//   vec4 prevColor = texture2D(prevFrame, uv);
  
//   // Detect movement by comparing frames
//   float movement = length(currentColor.rgb - prevColor.rgb);
  
//   // Calculate light ray contribution
//   vec4 rays = vec4(0.0);
//   float brightness = currentColor.r + currentColor.g + currentColor.b;
  
//   // Only calculate rays for bright areas
//   if (brightness > 0.1 || movement > 0.1) {
//     // Create rays emanating from bright points
//     for(int i = 0; i < SAMPLES; i++) {
//       float angle = float(i) * 6.283 / float(SAMPLES) + time;
//       float rayLength = RAY_LENGTH ;//* (0.5 + 0.5 * sin(time));
//       vec2 rayDir = vec2(cos(angle), sin(angle));
//       vec4 rayColor = texture2D(tex0, uv + rayDir * rayLength);
//       rays += rayColor * DENSITY*0.01;
//     }
//   }
  
//   // Blend between current and previous frame
//   float blend = 0.5; // Adjust this value to control trail length
//   vec4 color = vec4(0.0); //mix(currentColor, previousColor, blend);
  
//   gl_FragColor = rays+movement;
// } 
