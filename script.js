const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.style.touchAction = "none";

// ================= RESIZE =================
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// ================= CONFIG =================
const ROWS = 25;
const COLS = 25;
const CELL = 38;
const START_Y = 80;
const LOCK_DISTANCE = 1.2; // 🔥 minimum cells before locking direction

function startX() {
  return (canvas.width - COLS * CELL) / 2;
}

// ================= GRID =================
const GRID = [
"ZESPTMMGUNGFUMEANINGFULHD",
"EPYLZPUZYLZASVQYNXNCZUZFY",
"FREEDOMQAWARENESSNGREENLT",
"FSCIHTESSENTIALJHAINCYUYI",
"IHASERWDDTCPEACEAESTOGQLL",
"CTEVPJXIKRTNLBVYBLETNCFSI",
"IHAPROGRESSLARCHICDIMOETB",
"ELTHTLAEHSDRELVGTYEYCWCRA",
"NTTWIZYCHSISYIAESBNUHPIUN",
"CVBBOTQTJWNMSJQBLMSQERGCI",
"YKULXRIISONIPOYLSFTJIOOTA",
"RREDROGOCUOMXLENITUORDLUT",
"ENNRZNANFNOSIWIXOMISSXERS",
"SOOEUCALMTWILLRCSMELOBOEU",
"PIISJRSPACELCFULICRSLGGRS",
"OTTISYTILIBATSAFVTLAONLUA",
"NACLYLDFLBSMWONCEUYCHPEKT",
"SZEISEWYYNPIGFOOFCIMAZRSA",
"IILETRHCGQZNJUKDCXRXXEBUS",
"BNFNEEXLKEMITYNDECLUTTERP",
"LAECMDVATPTMTIVGYTIROIRPN",
"EGRESUKRTWUAMRECYCLENSZOR",
"PRODUCTIVITYRGNINNALPIETD",
"MOGJLELTLANOITNETNIESUERD",
"CONTROLYMQGYSZSDISCIPLINE",
].map(r => r.split(""));

// ================= WORD LIST =================
const WORDS = new Set([
"CLARITY","FOCUS","CALM","BALANCE","MINDFUL","AWARENESS","INTENTIONAL",
"PURPOSE","VISION","DIRECTION","ORDER","SIMPLICITY","MINIMALISM",
"DECLUTTER","SPACE","PEACE","STILLNESS","DISCIPLINE","HABITS","ROUTINE",
"SYSTEMS","STRUCTURE","LOGIC","PLANNING","PRIORITY","PRODUCTIVITY",
"EFFICIENCY","ORGANIZATION","GOALS","STRATEGY","GROWTH","RESILIENCE",
"REFLECTION","ETHICS","HEALTH","HARMONY","WELLBEING","SUSTAINABILITY",
"ECO","GREEN","REDUCE","REUSE","RECYCLE","CONSERVE","RESOURCEFUL",
"RESPONSIBLE","CONSCIOUS","CLEAN","ESSENTIAL","MEANINGFUL","PROGRESS",
"STABILITY","FREEDOM","CONTROL","DESIGN"
]);

document.getElementById("totalCount").textContent = WORDS.size;

// ================= STATE =================
let selected = [];
let lockedPaths = [];
let foundWords = new Set();
let dragging = false;
let direction = null;
let startCell = null;
let flashRed = false;

// ================= HELPERS =================
function getCell(x, y) {
  const c = Math.floor((x - startX()) / CELL);
  const r = Math.floor((y - START_Y) / CELL);
  if (r >= 0 && r < ROWS && c >= 0 && c < COLS) return [r, c];
  return null;
}

function computeDirection(a, b) {
  const dr = b[0] - a[0];
  const dc = b[1] - a[1];
  const absR = Math.abs(dr);
  const absC = Math.abs(dc);

  const DIAG_TOLERANCE = 0.85;

  if (absR > 0 && absC > 0) {
    const ratio = absR / absC;
    if (ratio > DIAG_TOLERANCE && ratio < 1 / DIAG_TOLERANCE) {
      return [dr / absR, dc / absC];
    }
  }

  if (absR > absC) return [dr / absR, 0];
  return [0, dc / absC];
}

function isNextStep(prev, curr, d) {
  return curr[0] === prev[0] + d[0] && curr[1] === prev[1] + d[1];
}

// ================= DRAW =================
function drawOverlay(cells, color) {
  ctx.fillStyle = color;
  cells.forEach(([r, c]) => {
    ctx.fillRect(startX() + c * CELL, START_Y + r * CELL, CELL, CELL);
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  lockedPaths.forEach(p => drawOverlay(p, "rgba(0,200,0,0.35)"));

  if (selected.length) {
    drawOverlay(selected, flashRed ? "rgba(200,0,0,0.35)" : "rgba(0,0,255,0.25)");
  }

  ctx.fillStyle = "white";
  ctx.font = "22px Epoch";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.fillText(GRID[r][c],
        startX() + c * CELL + CELL / 2,
        START_Y + r * CELL + CELL / 2
      );
    }
  }

  requestAnimationFrame(draw);
}

// ================= INPUT =================
canvas.addEventListener("pointerdown", e => {
  dragging = true;
  selected = [];
  direction = null;
  startCell = getCell(e.clientX, e.clientY);
  if (startCell) selected.push(startCell);
});

canvas.addEventListener("pointermove", e => {
  if (!dragging || !startCell) return;

  const cell = getCell(e.clientX, e.clientY);
  if (!cell) return;

  // 🔥 WAIT before locking direction
  if (!direction) {
    const dist = Math.hypot(cell[0] - startCell[0], cell[1] - startCell[1]);
    if (dist >= LOCK_DISTANCE) {
      direction = computeDirection(startCell, cell);
    } else {
      return;
    }
  }

  const last = selected[selected.length - 1];
  if (
    isNextStep(last, cell, direction) &&
    !selected.some(p => p[0] === cell[0] && p[1] === cell[1])
  ) {
    selected.push(cell);
  }
});

canvas.addEventListener("pointerup", () => {
  dragging = false;

  const word = selected.map(([r, c]) => GRID[r][c]).join("");
  if (WORDS.has(word)) {
    lockedPaths.push([...selected]);
    if (!foundWords.has(word)) {
      foundWords.add(word);
      document.getElementById("foundCount").textContent = foundWords.size;
      const li = document.createElement("li");
      li.textContent = word;
      document.getElementById("foundList").appendChild(li);
    }
  } else {
    flashRed = true;
    setTimeout(() => (flashRed = false), 300);
  }

  selected = [];
  direction = null;
  startCell = null;
});

// ================= START =================
document.fonts.ready.then(draw);
