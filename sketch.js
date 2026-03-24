let inputElement, sliderElement, selectEffectElement, selectSiteElement, btnShowElement, btnSendElement, iframeDiv;
let colors = "2a9d8f-e9c46a-f4a261-e76f51-8338ec".split("-").map(tx => "#" + tx); 
let jellyParticles = []; 
let isShow = true; 

// 音效變數
let popSound;

// 水族箱系統物件
let seaGrasses = []; 
let fishes = []; 
let bubbles = [];
let cursorJelly; 

// --- 新增：預載音效 ---
function preload() {
  // 請確保 pop.mp3 與你的 js 檔在同一個目錄，或使用正確的 URL
  popSound = loadSound('pop.mp3'); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor(); 
  
  // 初始化海草叢
  let grassCount = 45; 
  for (let i = 0; i < grassCount; i++) {
    seaGrasses.push({
      x: map(i, 0, grassCount, width * -0.05, width * 1.05) + random(-20, 20),
      rid: random(1000),      
      clr: color(random(30, 60), random(100, 160), random(80, 120), 200), 
      h: random(height * 0.4, height * 0.8),    
      w: random(15, 30)
    });
  }

  // 初始化魚群 (20條)
  for (let i = 0; i < 20; i++) {
    let type = random(['nemo', 'dory']);
    fishes.push(new Fish(random(width), random(height * 0.2, height * 0.9), type));
  }

  // 初始化氣泡
  for (let i = 0; i < 20; i++) {
    bubbles.push(new Bubble(random(width), random(height), random(2, 8)));
  }

  cursorJelly = new MouseJelly();
  setupUI();
}

function draw() {
  drawDeepSeaBackground();

  // 1. 繪製氣泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    
    // 當泡泡飄出畫面頂端時消失並撥放聲音
    if (bubbles[i].y < -10) {
      // 隨機機率播放，避免太多泡泡同時破掉聲音太吵
      if (random(1) < 0.5 && popSound.isLoaded()) {
        popSound.play();
      }
      bubbles.splice(i, 1);
    }
  }
  
  // 自動補充氣泡
  if(random(1) < 0.05) {
    bubbles.push(new Bubble(random(width), height + 10, random(3, 10)));
  }

  // 2. 背景文字層
  drawPerfectNeonText();

  // 3. 海草叢
  push();
  translate(0, height); 
  for (let g of seaGrasses) {
    drawRibbonGrass(g);
  }
  pop();

  // 4. 魚群
  for (let f of fishes) {
    f.update();
    f.display();
  }

  // 5. 果凍字粒子
  for (let i = jellyParticles.length - 1; i >= 0; i--) {
    let p = jellyParticles[i];
    p.update();
    p.display();
    if (p.y > height + 200) jellyParticles.splice(i, 1);
  }
  
  cursorJelly.update();
  cursorJelly.display();

  drawWatermark();
}

// --- 氣泡類別 (維持原本視覺) ---
class Bubble {
  constructor(x, y, r) { 
    this.x = x; 
    this.y = y; 
    this.r = r; 
    this.velY = -r/4; 
  }
  update() { 
    this.y += this.velY; 
    this.x += sin(frameCount * 0.1 + this.x) * 0.5; 
  }
  display() {
    stroke(255, 80); 
    noFill(); 
    ellipse(this.x, this.y, this.r*2);
    fill(255, 120); 
    noStroke(); 
    ellipse(this.x-this.r*0.3, this.y-this.r*0.3, this.r*0.5);
  }
}

// --- 魚類別 ---
class Fish {
  constructor(x, y, type) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(0.8, 3) * (random(1)>0.5?1:-1), random(-0.2, 0.2));
    this.type = type;
    this.sizeMod = random(0.6, 1.2);
    this.w = 40 * this.sizeMod; 
    this.h = 25 * this.sizeMod; 
    this.tOffset = random(100);
    this.mainCol = (this.type === 'nemo') ? color(244, 111, 81) : color(67, 97, 238);
    this.stripeCol = (this.type === 'nemo') ? color(255, 220) : color(255, 214, 10);
  }
  update() {
    this.pos.add(this.vel);
    if (this.pos.x > width + 100) this.pos.x = -100;
    if (this.pos.x < -100) this.pos.x = width + 100;
    this.vel.y += sin(frameCount * 0.05 + this.tOffset) * 0.02;
  }
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    if (this.vel.x < 0) scale(-1, 1);
    noStroke();
    fill(this.mainCol); ellipse(0, 0, this.w, this.h);
    push();
    translate(-this.w*0.4, 0);
    rotate(sin(frameCount * 0.2 + this.tOffset) * 0.3);
    triangle(0, 0, -this.w*0.4, -this.h*0.5, -this.w*0.4, this.h*0.5);
    pop();
    fill(this.stripeCol);
    if (this.type === 'nemo') {
      rect(-this.w*0.1, -this.h*0.48, this.w*0.2, this.h*0.96, 2);
    } else {
      beginShape(); vertex(0, -this.h*0.2); vertex(-this.w*0.3, -this.h*0.4); vertex(-this.w*0.2, this.h*0.4); endShape(CLOSE);
    }
    fill(0); ellipse(this.w * 0.35, -this.h * 0.1, 4 * this.sizeMod, 4 * this.sizeMod);
    pop();
  }
}

// --- 文字特效 ---
function drawPerfectNeonText() {
  let txt = inputElement.value(); 
  let tSize = sliderElement.value();
  let effect = selectEffectElement.value();
  textAlign(LEFT, CENTER);
  let spacingY = tSize * 2.8;
  for (let y = spacingY; y < height; y += spacingY) {
    let xOffset = sin(frameCount * 0.02 + y) * 30; 
    let x = 0;
    while (x < width + textWidth(txt)) {
      let col = color(131, 56, 236);
      let dy = 0, dx = 0, finalSize = tSize;
      if (effect === 'dance') dy = cos(frameCount * 0.05 + x * 0.01) * 15;
      else if (effect === 'blink') col.setAlpha(map(sin(frameCount * 0.1 + x), -1, 1, 40, 255));
      else if (effect === 'wave') {
        dy = sin(frameCount * 0.03 + x * 0.005) * 40;
        finalSize = tSize * (1 + sin(frameCount * 0.05 + x * 0.002) * 0.2);
      } else if (effect === 'rainbow') {
        push(); colorMode(HSB, 360, 100, 100);
        col = color((frameCount + x * 0.2 + y * 0.1) % 360, 60, 100); pop();
      } else if (effect === 'glitch') {
        if (random(1) > 0.92) { dx = random(-15, 15); col = color(255, 50, 50); }
      }
      push(); translate(x + xOffset + dx, y + dy);
      drawingContext.shadowBlur = 15; drawingContext.shadowColor = col;
      fill(col); textSize(finalSize); text(txt, 0, 0);
      pop();
      x += textWidth(txt) + 150;
    }
  }
}

// --- 水母游標 ---
class MouseJelly {
  constructor() {
    this.pos = createVector(mouseX, mouseY);
    this.history = []; this.maxLen = 10;
  }
  update() {
    this.pos.x = lerp(this.pos.x, mouseX, 0.2);
    this.pos.y = lerp(this.pos.y, mouseY, 0.2);
    this.history.push(createVector(this.pos.x, this.pos.y));
    if (this.history.length > this.maxLen) this.history.shift();
  }
  display() {
    push(); noFill();
    for (let i = 0; i < this.history.length; i++) {
      let alpha = map(i, 0, this.history.length, 0, 200);
      let size = map(i, 0, this.history.length, 5, 15);
      stroke(100, 200, 255, alpha); strokeWeight(2);
      let offset = sin(frameCount * 0.2 + i) * 5;
      ellipse(this.history[i].x + offset, this.history[i].y + (this.history.length-i)*2, size, size*0.6);
    }
    drawingContext.shadowBlur = 20; drawingContext.shadowColor = color(0, 255, 255);
    fill(255, 200); noStroke(); arc(this.pos.x, this.pos.y, 25, 20, PI, TWO_PI, CHORD);
    pop();
  }
}

// --- 其他功能 ---
function drawDeepSeaBackground() {
  let topCol = color(15, 32, 50); let botCol = color(5, 10, 15);
  for(let y=0; y<height; y++){
    let inter = map(y, 0, height, 0, 1);
    stroke(lerpColor(topCol, botCol, inter)); line(0, y, width, y);
  }
}

function drawWatermark() {
  fill(255, 100); noStroke(); textSize(14); textAlign(LEFT, TOP);
  text("414730191", 10, 10);
}

function drawRibbonGrass(grass) {
  let flowNoise = noise(frameCount / 180, grass.x / 800) - 0.5;
  let baseTilt = flowNoise * 200; 
  let mouseForce = map(mouseX, 0, width, -100, 100);
  let distToMouse = abs(grass.x - mouseX);
  let mouseFactor = map(distToMouse, 0, 300, 1, 0, true); 
  noStroke(); fill(grass.clr);
  beginShape(TRIANGLE_STRIP);
  for (let i = 0; i <= 20; i++) {
    let t = i / 20; let flexibility = pow(t, 2);
    let detailNoise = noise(frameCount / 100, grass.x, i / 8) - 0.5;
    let centerX = grass.x + (baseTilt * flexibility) + (detailNoise * 25 * t) + (mouseForce * mouseFactor * flexibility);
    let centerY = -t * grass.h;
    let curW = map(t, 0, 1, grass.w, grass.w * 0.15);
    vertex(centerX - curW/2, centerY); vertex(centerX + curW/2, centerY);
  }
  endShape();
}

class JellyText {
  constructor(t, x, y) {
    this.text = t; this.x = x; this.y = y; this.velY = 0; this.velX = random(-2, 2);
    this.gravity = 0.4; this.bounce = -0.7; this.bounceCount = 0;
    this.size = sliderElement.value() * 1.5; this.color = color(random(colors)); this.timer = 0;
  }
  update() {
    this.velY += this.gravity; this.y += this.velY; this.x += this.velX; this.timer += 0.2;
    if (this.y > height - 20 && this.bounceCount < 2) { this.y = height-20; this.velY *= this.bounce; this.bounceCount++; }
  }
  display() {
    push(); translate(this.x, this.y); scale(1+sin(this.timer)*0.1, 1-sin(this.timer)*0.1);
    textAlign(CENTER, BOTTOM); fill(this.color); textSize(this.size); text(this.text, 0, 0); pop();
  }
}

function spawnJelly() { 
  // 噴發時也可以放聲音
  if (popSound.isLoaded()) popSound.play();
  jellyParticles.push(new JellyText(inputElement.value(), random(width*0.3, width*0.7), 50)); 
}

function toggleIframe() { 
  isShow = !isShow; 
  if (isShow) iframeDiv.show(); else iframeDiv.hide(); 
  // 點擊 UI 觸發音效上下文 (解決瀏覽器自動播放限制)
  userStartAudio();
}

function updateAll() { 
  let label = selectSiteElement.elt.options[selectSiteElement.elt.selectedIndex].text;
  inputElement.value(label);
  select('iframe').attribute('src', selectSiteElement.value());
}

function setupUI() {
  btnShowElement = createButton("👁 UI 開關"); btnShowElement.position(20, 20); btnShowElement.mousePressed(toggleIframe);
  styleNeonBtn(btnShowElement, '#fff');
  btnSendElement = createButton("🚀 噴發果凍"); btnSendElement.position(120, 20); btnSendElement.mousePressed(spawnJelly);
  styleNeonBtn(btnSendElement, '#ffbe0b');
  inputElement = createInput("教科水族箱"); inputElement.position(230, 20); styleInput(inputElement);
  sliderElement = createSlider(15, 80, 30); sliderElement.position(400, 25);
  selectEffectElement = createSelect(); selectEffectElement.position(550, 25);
  selectEffectElement.option('dance'); selectEffectElement.option('blink');
  selectEffectElement.option('wave'); selectEffectElement.option('rainbow');
  selectEffectElement.option('glitch');
  styleInput(selectEffectElement);
  selectSiteElement = createSelect(); selectSiteElement.position(680, 25);
  selectSiteElement.option('淡江教科系', 'https://www.et.tku.edu.tw');
  selectSiteElement.option('淡江大學', 'https://www.tku.edu.tw');
  selectSiteElement.changed(updateAll); styleInput(selectSiteElement);
  iframeDiv = createDiv(''); iframeDiv.position(100, 100); iframeDiv.size(width-200, height-200);
  iframeDiv.style('background','rgba(0,0,0,0.8)'); iframeDiv.style('border','1px solid #fff');
  let iframe = createElement('iframe'); iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.style('width','100%'); iframe.style('height','100%'); iframe.parent(iframeDiv);
}

function styleNeonBtn(el, col) {
  el.style('background', 'rgba(0,0,0,0.5)'); el.style('color', col); el.style('border', '1px solid ' + col);
  el.style('border-radius', '10px'); el.style('padding', '5px 15px'); el.style('cursor', 'none');
}
function styleInput(el) { el.style('background', '#000'); el.style('color', '#fff'); el.style('border', '1px solid #fff'); el.style('padding', '5px'); el.style('cursor', 'none'); }
function windowResized() { resizeCanvas(windowWidth, windowHeight); }