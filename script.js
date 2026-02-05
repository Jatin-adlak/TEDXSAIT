const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* Disable browser gestures */
canvas.style.touchAction = "none";
canvas.style.userSelect = "none";

/* GRID CONFIG */
const ROWS = 25;
const COLS = 25;
let CELL = 40;

/* RESPONSIVE CELL SIZE (SAFE) */
function getCellSize() {
  const usableWidth = canvas.width * 0.9;
  const usableHeight = canvas.height * 0.9;
  return Math.floor(Math.min(usableWidth / COLS, usableHeight / ROWS));
}

/* CENTERING */
function startX() {
  return (canvas.width - COLS * CELL) / 2;
}

function startY() {
  return Math.max(0, (canvas.height - ROWS * CELL) / 2);
}

/* 🔑 RESIZE — BASED ON GAME AREA, NOT WINDOW */
function resize() {
  const container = canvas.parentElement;
  const rect = container.getBoundingClientRect();

  canvas.width = rect.width;
  canvas.height = rect.height;

  CELL = getCellSize();
}

resize();
window.addEventListener("resize", resize);

/* GRID DATA */
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

/* WORD LIST */
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

/* STATE */
let selected = [];
let lockedPaths = [];
let foundWords = new Set();
let dragging = false;
let direction = null;
let startCell = null;
let flashRed = false;

/* HELPERS */
function sign(n) {
  return n === 0 ? 0 : n > 0 ? 1 : -1;
}

/* 🔑 CORRECT POINTER → CELL MAPPING */
function getCell(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const c = Math.floor((x - startX()) / CELL);
  const r = Math.floor((y - startY()) / CELL);

  if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
    return [r, c];
  }
  return null;
}

/* DRAW HELPERS */
function drawOverlay(cells, color) {
  ctx.fillStyle = color;
  cells.forEach(([r, c]) => {
    ctx.fillRect(
      startX() + c * CELL,
      startY() + r * CELL,
      CELL,
      CELL
    );
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  lockedPaths.forEach(p => drawOverlay(p, "rgba(0,180,0,0.35)"));

  if (selected.length) {
    drawOverlay(
      selected,
      flashRed ? "rgba(200,0,0,0.35)" : "rgba(0,0,255,0.25)"
    );
  }

  ctx.fillStyle = "white";
  ctx.font = `${Math.max(16, CELL * 0.55)}px Epoch`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      ctx.fillText(
        GRID[r][c],
        startX() + c * CELL + CELL / 2,
        startY() + r * CELL + CELL / 2
      );
    }
  }

  requestAnimationFrame(draw);
}

/* INPUT — SMOOTH 8-DIRECTION DRAG */
canvas.addEventListener("pointerdown", e => {
  dragging = true;
  selected = [];
  direction = null;
  startCell = getCell(e.clientX, e.clientY);
  if (startCell) selected = [startCell];
});

canvas.addEventListener("pointermove", e => {
  if (!dragging || !startCell) return;

  const cell = getCell(e.clientX, e.clientY);
  if (!cell) return;

  const dr = cell[0] - startCell[0];
  const dc = cell[1] - startCell[1];
  if (dr === 0 && dc === 0) return;

  if (!direction) {
    const ar = Math.abs(dr);
    const ac = Math.abs(dc);

    if (ar && ac && ar / ac > 0.8 && ar / ac < 1.25) {
      direction = [sign(dr), sign(dc)];
    } else if (ar > ac) {
      direction = [sign(dr), 0];
    } else {
      direction = [0, sign(dc)];
    }
  }

  const steps = Math.max(
    Math.abs(dr / (direction[0] || 1)),
    Math.abs(dc / (direction[1] || 1))
  );

  const path = [];
  for (let i = 0; i <= steps; i++) {
    const r = startCell[0] + direction[0] * i;
    const c = startCell[1] + direction[1] * i;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) break;
    path.push([r, c]);
  }

  selected = path;
});

canvas.addEventListener("pointerup", () => {
  dragging = false;

  const word = selected.map(([r, c]) => GRID[r][c]).join("");

  if (WORDS.has(word) && !foundWords.has(word)) {
    foundWords.add(word);
    lockedPaths.push([...selected]);

    document.getElementById("foundCount").textContent = foundWords.size;

    const el = document.createElement("div");
    el.className = "found-word";
    el.textContent = word;
    document.getElementById("foundWordsGrid").appendChild(el);
  } else if (selected.length) {
    flashRed = true;
    setTimeout(() => (flashRed = false), 300);
  }

  selected = [];
  direction = null;
  startCell = null;
});

/* START */
document.fonts.ready.then(draw);
