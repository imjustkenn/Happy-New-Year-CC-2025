// Frames per second variable. You can adjust this according to your like. 
const N_FRAMES = 60;

let backGraph;
let fireworks = [];
let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

function setup() {
  createCanvas(600, 600);
  pixelDensity(2);
  frameRate(30);
  noStroke();

  // Create a graphics buffer for the background text
  backGraph = createGraphics(width, height);
  backGraph.pixelDensity(1);
  backGraph.textFont("Arial", 32);
  backGraph.textAlign(CENTER, CENTER);

  backGraph.background(255);
  backGraph.noStroke();
  backGraph.fill(0);

  // Render the text
  backGraph.text("Happy New Year!\n Happy New Year!\n Happy New Year!", backGraph.width / 2, backGraph.height / 2);
  backGraph.loadPixels();
}

function draw() {
  background(0);

  let t = (frameCount % N_FRAMES) / N_FRAMES;

  let s = 3;
  fill(250, 250, 0);
  pixelate(s, t);
  fill(240);
  pixelate(s, t + 4 / N_FRAMES);

  // Update and display the fireworks
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();

    // Remove finished fireworks (else decayed)
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }

  // Launch new fireworks at slower intervals
  if (frameCount % 40 === 0) { // Increased interval
    fireworks.push(new Firework(random(width), random(height / 2)));
  }
}

function pixelate(s, t) {
  for (let x = 0; x < width; x += s) {
    for (let y = 0; y < height; y += s) {
      let xOffset = (s * (1 + cos(t * TAU - y / 10)) / 2);
      let yOffset = (s * (1 + cos(t * TAU - x / 10)) / 2);

      let newX = constrain(round(x + xOffset), 0, width - 1);
      let newY = constrain(round(y + yOffset), 0, height - 1);
      let index = 4 * (newY * width + newX);

      if (index >= 0 && index < backGraph.pixels.length) {
        let val = backGraph.pixels[index];
        if (val < 128) {
          square(x, y, s);
        }
      }
    }
  }
}

// Firework class
class Firework {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.exploded = false;
    this.timer = 0;
    this.color = color(random(255), random(255), random(255)); // Single color for the burst

    // Initialize particles with a single color for the burst
    for (let i = 0; i < 100; i++) {
      let angle = random(TWO_PI);
      let speed = random(2, 5);
      let vx = speed * cos(angle);
      let vy = speed * sin(angle);
      if (isNaN(vx) || isNaN(vy)) { // Debug safeguard
        console.error("Invalid velocity:", vx, vy);
        vx = 0;
        vy = 0;
      }
      this.particles.push(new Particle(this.x, this.y, vx, vy, this.color)); // Pass color to particles
    }
  }

  update() {
    if (!this.exploded) {
      this.exploded = true;
    } else {
      for (let particle of this.particles) {
        particle.update();
      }
    }
    this.timer++;
  }

  show() {
    for (let particle of this.particles) {
      particle.show();
    }
  }

  done() {
    return this.timer > 60; // Remove after 60 frames
  }
}

// Particle class
class Particle {
  constructor(x, y, vx, vy, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.alpha = 255;
    this.char = characters.charAt(floor(random(characters.length))); // Initial character
    this.timer = 0; // Tracks time for character change
    this.changeInterval = 3; // Number of frames between character changes
    this.color = color; // Store the color for this particle
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 5; // Fade out over time

    // Update character more frequently
    if (this.timer % this.changeInterval === 0) {
      this.char = characters.charAt(floor(random(characters.length)));
    }

    this.timer++;
  }

  show() {
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.alpha); // Use the stored color
    textSize(16);
    text(this.char, this.x, this.y);
  }
}

