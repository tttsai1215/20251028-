// 已重寫：每次從題庫隨機抽 5 題、淺藍背景、答題有回饋與煙火動畫、結果顯示對應文字

let questionTable;
let allQuestions = [];
let quizQuestions = []; // 儲存本次測驗的5個題目
let currentQuestionIndex = 0;
let score = 0;
let gameState = 'START'; // START, QUESTION, FEEDBACK, RESULT

// 按鈕物件
let answerButtons = [];
let startButton, restartButton;

// 背景粒子 (裝飾)
let bgParticles = [];

// 煙火系統
let fireworks = [];
let fireworksTimer = 0;

// 回饋
let feedbackMessage = '';
let feedbackColor;
let feedbackTimer = 0;

function preload() {
  // 載入 CSV 檔案，指定 'csv' 格式且沒有標頭
  questionTable = loadTable('questions.csv', 'csv');
}

function setup() {
  createCanvas(800, 600);
  if (!questionTable) {
    console.error('questions.csv 載入失敗，請確定檔案位於同一資料夾。');
    noLoop();
    return;
  }
  processData();
  setupButtons();
  setupBgParticles();
  startGame();
}

function draw() {
  // 淺藍背景
  background(173, 216, 230);
  drawBgParticles();

  // 顯示左上學號（若需要可移除）
  push();
  fill(0);
  textSize(16);
  textAlign(LEFT, TOP);
  text('414730134', 10, 10);
  pop();

  // 根據不同的遊戲狀態繪製不同畫面
  switch (gameState) {
    case 'START':
      drawStartScreen();
      break;
    case 'QUESTION':
      drawQuestionScreen();
      break;
    case 'FEEDBACK':
      drawFeedbackScreen();
      break;
    case 'RESULT':
      drawResultScreen();
      break;
  }

  // 更新並繪製煙火（若有）
  updateFireworks();
  drawFireworks();
}

// ---------------------------------
// 遊戲流程函數
// ---------------------------------

// 1. 處理CSV資料
function processData() {
  allQuestions = []; // 重設
  for (let row of questionTable.getRows()) {
    allQuestions.push({
      question: row.getString(0),
      opA: row.getString(1),
      opB: row.getString(2),
      opC: row.getString(3),
      opD: row.getString(4),
      correct: row.getString(5).trim().toUpperCase() // 'A','B','C','D'
    });
  }
}

// 2. 設定按鈕位置
function setupButtons() {
  // 開始按鈕
  startButton = { x: width / 2 - 100, y: height / 2 + 50, w: 200, h: 60, text: '開始測驗' };
  // 重新開始按鈕
  restartButton = { x: width / 2 - 100, y: height / 2 + 150, w: 200, h: 60, text: '重新開始' };

  // 四個答案按鈕 (固定位置)
  answerButtons = [];
  let btnW = 350;
  let btnH = 80;
  let gap = 20;
  answerButtons.push({ x: 40, y: 250, w: btnW, h: btnH, option: 'A', text: '' });
  answerButtons.push({ x: 40 + btnW + gap, y: 250, w: btnW, h: btnH, option: 'B', text: '' });
  answerButtons.push({ x: 40, y: 250 + btnH + gap, w: btnW, h: btnH, option: 'C', text: '' });
  answerButtons.push({ x: 40 + btnW + gap, y: 250 + btnH + gap, w: btnW, h: btnH, option: 'D', text: '' });
}

// 3. 開始或重新開始遊戲
function startGame() {
  score = 0;
  currentQuestionIndex = 0;
  // 清除舊的煙火
  fireworks = [];
  fireworksTimer = 0;
  // 從全部題目隨機排序並取前5題；若題目不足則全部取用
  let take = min(5, allQuestions.length);
  quizQuestions = shuffle(allQuestions).slice(0, take);
  gameState = 'START';
}

// 4. 檢查答案
function checkAnswer(selectedOption) {
  let correctOption = quizQuestions[currentQuestionIndex].correct;

  if (selectedOption === correctOption) {
    score++;
    feedbackMessage = '答對了！';
    feedbackColor = color(0, 200, 100, 220); // 綠色
    // 產生煙火
    spawnFirework(random(100, width - 100), random(150, height - 150));
  } else {
    feedbackMessage = `答錯了... 正確答案是 ${correctOption}`;
    feedbackColor = color(200, 50, 50, 220); // 紅色
  }
  
  gameState = 'FEEDBACK';
  feedbackTimer = 90; // 顯示回饋 1.5 秒 (60fps * 1.5)
}

// 5. 進入下一題
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex >= quizQuestions.length) {
    gameState = 'RESULT';
    // 在進入結果畫面時產生對應數量的煙火
    spawnResultFireworks();
  } else {
    gameState = 'QUESTION';
  }
}

// 新增：根據分數在結果頁面生成煙火（數量與強度依分數決定）
function spawnResultFireworks() {
  let total = quizQuestions.length;
  let cnt = 0;
  if (score === total) cnt = 12;
  else if (score >= 4) cnt = 8;
  else if (score === 3) cnt = 4;
  else if (score === 2) cnt = 2;
  else if (score === 1) cnt = 1;
  else cnt = 0;

  for (let i = 0; i < cnt; i++) {
    // 在上半部隨機位置產生
    spawnFirework(random(100, width - 100), random(80, height / 2));
  }
}

// 6. 結果字串
function getResultText() {
  let total = quizQuestions.length;
  if (score === total) return `${score}/${total} 全對`;
  if (score === total - 1) return `${score}/${total} 請加油`;
  if (score === 3 && total === 5) return `${score}/${total} 請加油`;
  if (score === 2 && total === 5) return `${score}/${total} 待加油`;
  if (score === 1 && total === 5) return `${score}/${total} 再加油`;
  return `${score}/${total}`;
}

// ---------------------------------
// 畫面繪製函數
// ---------------------------------

function drawStartScreen() {
  textAlign(CENTER, CENTER);
  fill(30, 60, 90);
  textSize(48);
  text('p5.js 題庫測驗', width / 2, height / 2 - 100);
  textSize(24);
  text(`從 ${allQuestions.length} 題中隨機抽取 ${min(5, allQuestions.length)} 題`, width / 2, height / 2 - 30);
  
  // 繪製開始按鈕
  drawButton(startButton);
}

function drawQuestionScreen() {
  if (quizQuestions.length === 0) return; // 防止資料還沒載入
  
  let q = quizQuestions[currentQuestionIndex];
  
  // 繪製問題
  textAlign(LEFT, TOP);
  fill(20);
  textSize(20);
  text(`第 ${currentQuestionIndex + 1} 題 / ${quizQuestions.length} 題`, 40, 40);
  textSize(28);
  text(q.question, 40, 80, width - 80, 150); // 自動換行
  
  // 更新並繪製答案按鈕
  answerButtons[0].text = 'A. ' + q.opA;
  answerButtons[1].text = 'B. ' + q.opB;
  answerButtons[2].text = 'C. ' + q.opC;
  answerButtons[3].text = 'D. ' + q.opD;
  
  for (let btn of answerButtons) {
    drawButton(btn);
  }
}

function drawFeedbackScreen() {
  // 半透明覆蓋
  push();
  noStroke();
  fill(red(feedbackColor), green(feedbackColor), blue(feedbackColor), 140);
  rect(0, 0, width, height);
  pop();

  // 顯示回饋文字
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(48);
  text(feedbackMessage, width / 2, height / 2);

  // 計時
  feedbackTimer--;
  if (feedbackTimer <= 0) {
    nextQuestion();
  }
}

function drawResultScreen() {
  textAlign(CENTER, CENTER);
  fill(20);
  
  textSize(50);
  text('測驗結束！', width / 2, 120);
  
  textSize(36);
  text(`你的成績: ${score} / ${quizQuestions.length}`, width / 2, 200);
  
  textSize(28);
  fill(80, 30, 200);
  // 依題數顯示對應訊息（符合需求的文字）
  let total = quizQuestions.length;
  let resultMsg = '';
  if (score === 0) resultMsg = `${score}/${total} 再接再厲`;
  else if (score === 1) resultMsg = `${score}/${total} 再加油`;
  else if (score === 2) resultMsg = `${score}/${total} 待加油`;
  else if (score === 3) resultMsg = `${score}/${total} 請加油`;
  else if (score === 4) resultMsg = `${score}/${total}`;
  else if (score === total) resultMsg = `${score}/${total} 全對`;
  text(resultMsg, width / 2, 260);

  // 繪製重新開始按鈕
  drawButton(restartButton);
}

// ---------------------------------
// 互動與輔助函數
// ---------------------------------

// 繪製按鈕 (含 hover 效果)
function drawButton(btn) {
  let isHover = isMouseOver(btn);
  
  push(); // 保存繪圖狀態
  if (isHover) {
    fill(100, 180, 255); // hover 亮藍色
    stroke(255);
    strokeWeight(2);
    cursor(HAND); // 改變滑鼠游標
  } else {
    fill(50, 100, 200, 200); // 預設藍色
    noStroke();
  }
  rect(btn.x, btn.y, btn.w, btn.h, 10); // 圓角矩形
  
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(btn.text, btn.x + btn.w / 2, btn.y + btn.h / 2); // 按鈕文字置中
  pop(); // 恢復繪圖狀態
}

// 檢查滑鼠是否在按鈕上
function isMouseOver(btn) {
  return (mouseX > btn.x && mouseX < btn.x + btn.w &&
          mouseY > btn.y && mouseY < btn.y + btn.h);
}

// 滑鼠點擊事件
function mousePressed() {
  // 重設游標
  cursor(ARROW);

  if (gameState === 'START') {
    if (isMouseOver(startButton)) {
      gameState = 'QUESTION';
    }
  } else if (gameState === 'QUESTION') {
    for (let btn of answerButtons) {
      if (isMouseOver(btn)) {
        checkAnswer(btn.option);
        break; // 點擊後就停止檢查
      }
    }
  } else if (gameState === 'RESULT') {
    if (isMouseOver(restartButton)) {
      startGame();
    }
  }
}

// ---------------------------------
// 背景粒子 (裝飾)
// ---------------------------------

function setupBgParticles() {
  bgParticles = [];
  for (let i = 0; i < 60; i++) {
    bgParticles.push({
      x: random(width),
      y: random(height),
      vx: random(-0.3, 0.3),
      vy: random(-0.2, 0.2),
      r: random(2, 6),
      alpha: random(50, 120)
    });
  }
}

function drawBgParticles() {
  for (let p of bgParticles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;
    noStroke();
    fill(255, p.alpha);
    ellipse(p.x, p.y, p.r);
  }
}

// ---------------------------------
// 煙火系統
// ---------------------------------

function spawnFirework(x, y) {
  // 一個煙火包含多個碎片
  let colors = [
    [255, 100, 100],
    [100, 255, 150],
    [255, 255, 100],
    [150, 150, 255],
    [255, 150, 255]
  ];
  let col = random(colors);
  for (let i = 0; i < 60; i++) {
    let angle = random(TWO_PI);
    let speed = random(1, 6);
    fireworks.push({
      x: x,
      y: y,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      life: random(40, 100),
      age: 0,
      r: random(2, 4),
      col: col.slice()
    });
  }
  fireworksTimer = 120; // 最多顯示時間
}

function updateFireworks() {
  for (let i = fireworks.length - 1; i >= 0; i--) {
    let f = fireworks[i];
    f.x += f.vx;
    f.y += f.vy;
    // 模擬重力與空氣阻力
    f.vy += 0.06;
    f.vx *= 0.995;
    f.vy *= 0.995;
    f.age++;
    if (f.age > f.life) {
      fireworks.splice(i, 1);
    }
  }
  if (fireworksTimer > 0) fireworksTimer--;
}

function drawFireworks() {
  noStroke();
  for (let f of fireworks) {
    let alpha = map(f.age, 0, f.life, 255, 0);
    fill(f.col[0], f.col[1], f.col[2], alpha);
    ellipse(f.x, f.y, f.r * 2);
  }
}

// ---------------------------------
// 檢查並確保執行
// ---------------------------------

// 確保當題目只有少於5題時也能運作
// （processData 與 startGame 已處理）
