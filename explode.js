import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// 휴롬 급속 해동기(가칭) · 구조 3D v6 (7.9만 원 안, 2026-11-15 준보 확정) — 겉모습 확정안 U4(2026-11-14 준보 확정, 두팔 U4 + 구조 검토 반영): 휴롬 식자재 세척기 UC-B01 계열
//   흰 하단 1.5cm(「Hurom」) · 이중벽 스모크 PC 칸 6cm(앞·옆) · 얇은 흰 테 · 아무것도 없는 스모크 PC 뚜껑(떼어 씻음)
//   뒤 고정 부품 칸 4.5cm: 윗면 = 블랙 유리 조작부(터치 + 15°C) · 속 = 펠티어 40mm 2장(세움) + 구리 블록 + 방열판 + 블로어 · 아래 1.5cm 전선 보관함 · 배기는 뒷면
//   바닥엔 얇은 냉각판(물길 내장)만, 옆 재킷 없음 → 옆·위는 뒤 벽 냉각 핀을 지난 15°C 바람. 단위 10cm. 바깥 26 × 25 × 9cm. 고기 두께 최대 4cm
const sec = document.getElementById('structure');
const canvas = document.getElementById('xv-canvas');
const labelLayer = document.getElementById('xv-labels');
const stepEls = [...document.querySelectorAll('.xv-step')];

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.add(new THREE.HemisphereLight(0xffffff, 0xe6ddcf, 1.0));
const sun = new THREE.DirectionalLight(0xfffaf2, 1.5); sun.position.set(-2, 9, 5); scene.add(sun);
const fill = new THREE.DirectionalLight(0xffffff, 0.55); fill.position.set(6, 2, 3); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 1.0); rim.position.set(1, 4, -7); scene.add(rim);
const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);

/* ---------- 글자 텍스처 (조작부 · 로고) ---------- */
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
// 뒤 칸 윗면 조작부(U4 배열): 전원 · 모드(눈꽃) · 15°C · − · +
const touchTex = canvasTex(2400, 300, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  g.strokeStyle = g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 7; g.lineCap = 'round';
  const y = h / 2;
  g.globalAlpha = 0.85; g.beginPath(); g.arc(330, y, 34, -Math.PI / 2 + 0.7, -Math.PI / 2 - 0.7 + Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(330, y - 44); g.lineTo(330, y - 4); g.stroke();
  g.font = '400 86px "Segoe UI Symbol", "Segoe UI", sans-serif'; g.fillText('❄', 640, y + 4);
  g.globalAlpha = 1; g.font = '300 130px "Segoe UI Light", "Segoe UI", Pretendard, sans-serif'; g.shadowColor = 'rgba(200,220,255,.8)'; g.shadowBlur = 20; g.fillText('15°C', 1200, y + 2); g.shadowBlur = 0;
  g.globalAlpha = 0.85; g.lineWidth = 8; g.beginPath(); g.moveTo(1720, y); g.lineTo(1800, y); g.stroke();
  g.beginPath(); g.moveTo(2040, y); g.lineTo(2120, y); g.stroke(); g.beginPath(); g.moveTo(2080, y - 40); g.lineTo(2080, y + 40); g.stroke();
});
const logoTex = canvasTex(512, 128, (g, w, h) => {
  g.clearRect(0, 0, w, h); g.fillStyle = '#8b8e93'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '600 70px "Segoe UI", Helvetica, Arial, sans-serif'; g.fillText('Hurom', w / 2, h / 2 + 2);
});

/* ---------- 재질 ---------- */
const M = {
  case: new THREE.MeshPhysicalMaterial({ color: 0xf4f4f1, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.35, transparent: true, opacity: 1 }),
  panel: new THREE.MeshPhysicalMaterial({ color: 0x0b0c0e, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.4, transparent: true, opacity: 1 }),
  smoke: new THREE.MeshPhysicalMaterial({ color: 0x3a3f46, roughness: 0.05, transparent: true, opacity: 0.36, envMapIntensity: 1.0, depthWrite: false, side: THREE.DoubleSide }),
  lidGlass: new THREE.MeshPhysicalMaterial({ color: 0x2b2f35, roughness: 0.46, transparent: true, opacity: 0.9, envMapIntensity: 0.25, clearcoat: 0, depthWrite: false }),   // 뚜껑: 스모크 PC(플라스틱) — 유리처럼 비치지 않게 무광
  touch: new THREE.MeshBasicMaterial({ map: touchTex, transparent: true, depthWrite: false }),
  logo: new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, depthWrite: false }),
  steel: new THREE.MeshStandardMaterial({ color: 0xb4b8bc, metalness: 0.55, roughness: 0.6 }),   // 트레이: 무광 회색 알루미늄(아노다이징)
  alu: new THREE.MeshStandardMaterial({ color: 0xc9ced4, metalness: 0.9, roughness: 0.35, transparent: true, opacity: 1 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x3a3c40, roughness: 0.6 }),
  ceramic: new THREE.MeshStandardMaterial({ color: 0xf4f2ee, roughness: 0.4 }),
  water: new THREE.MeshPhysicalMaterial({ color: 0x5fa9ee, roughness: 0.35, transparent: true, opacity: 0.6, envMapIntensity: 0.3, depthWrite: false }),
  meat: new THREE.MeshStandardMaterial({ color: 0xc9565a, roughness: 0.7 }),
  fat: new THREE.MeshStandardMaterial({ color: 0xf3e4d8, roughness: 0.8 }),
  pcb: new THREE.MeshStandardMaterial({ color: 0x1f6b3a, roughness: 0.7 }),
  chip: new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.5 }),
  cap: new THREE.MeshStandardMaterial({ color: 0x3f4a8a, roughness: 0.5 }),
  copper: new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.75, roughness: 0.35 }),
  wireB: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 }),
  tube: new THREE.MeshStandardMaterial({ color: 0xbfd8f0, roughness: 0.4, transparent: true, opacity: 0.8 }),
  vent: new THREE.MeshStandardMaterial({ color: 0x55575c, roughness: 0.7 }),
  label: new THREE.MeshStandardMaterial({ color: 0xd9d6cf, roughness: 0.6 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: 0.9 }),
  led: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xdde8ff, emissiveIntensity: 1.6 }),
  flow: new THREE.MeshBasicMaterial({ color: 0x2f86ea, transparent: true, opacity: 0 }),
  air: new THREE.MeshBasicMaterial({ color: 0x7cc4f5, transparent: true, opacity: 0 }),
};

/* ---------- 치수 (10cm 단위) ---------- */
const W = 2.6, D = 2.5, R = 0.16;                     // 바깥 26 × 25cm · 모서리 1.6cm
const BASE = 0.15, GL = 0.6, RIM = 0.05, LID = 0.1;   // 흰 하단 1.5cm · 스모크 칸 6cm · 흰 테 0.5cm · 뚜껑 자리 1cm(유리 0.8 + 여유)
const H = BASE + GL + RIM + LID;                      // = 0.9 (9cm)
const GT = 0.02;                                      // PC 벽 한 겹 2mm (이중벽, 사이 공기층 4mm)
const MR = 0.45;                                      // 뒤 고정 부품 칸 깊이 4.5cm (z = -D/2 … -D/2+MR), 높이는 뚜껑 윗면까지
const MZ = -D / 2 + MR / 2;                           // 부품 칸 중심 z
const FD = D - MR, FZ = MR / 2;                        // 앞 칸(유리·뚜껑) 깊이 20.5cm · 그 중심 z
const CAB = 0.15;                                     // 뒤 칸 아래 전선 보관함 높이 1.5cm (y = BASE … BASE+CAB), 칸막이로 위와 분리
const TW = 2.0, TD = 1.6, TDEEP = 0.2;                // 트레이 안쪽 20 × 16cm · 깊이 2cm
const ZC = FZ;                                        // 트레이·냉각판 중심 z = 앞 칸 가운데
const PW = 2.16, PD = 1.7, PT = 0.05;                 // 냉각판 21.6 × 17cm · 통 알루미늄 5mm(물 없음) (하단 속, 윗면이 하단 윗면과 같은 높이)
const product = new THREE.Group(); scene.add(product);
const parts = [];
function part(name, obj, offset, labelAnchor = new THREE.Vector3(), inner = false) {
  obj.userData.home = obj.position.clone();
  obj.userData.off = new THREE.Vector3(...offset);
  obj.userData.inner = inner;
  product.add(obj);
  const el = document.createElement('div'); el.className = 'xv-label'; el.textContent = name; labelLayer.appendChild(el);
  parts.push({ obj, el, anchor: labelAnchor });
  return obj;
}
function rrect(w, h, r, s = new THREE.Shape(), cx = 0, cy = 0) {
  s.moveTo(cx - w / 2 + r, cy - h / 2); s.lineTo(cx + w / 2 - r, cy - h / 2); s.quadraticCurveTo(cx + w / 2, cy - h / 2, cx + w / 2, cy - h / 2 + r);
  s.lineTo(cx + w / 2, cy + h / 2 - r); s.quadraticCurveTo(cx + w / 2, cy + h / 2, cx + w / 2 - r, cy + h / 2); s.lineTo(cx - w / 2 + r, cy + h / 2);
  s.quadraticCurveTo(cx - w / 2, cy + h / 2, cx - w / 2, cy + h / 2 - r); s.lineTo(cx - w / 2, cy - h / 2 + r); s.quadraticCurveTo(cx - w / 2, cy - h / 2, cx - w / 2 + r, cy - h / 2);
  return s;
}
// ㄷ자 벽(앞 + 양옆, 뒤는 열림): 모양 좌표 y = -z. inset 만큼 안쪽으로 들어간 벽, 두께 t
function uShape(inset, t) {
  const s = new THREE.Shape(); const hw = W / 2 - inset, hd = FD / 2 - inset, r = Math.max(0.02, R - inset), cy = -FZ;
  s.moveTo(-hw, cy + hd); s.lineTo(-hw, cy - hd + r); s.quadraticCurveTo(-hw, cy - hd, -hw + r, cy - hd); s.lineTo(hw - r, cy - hd); s.quadraticCurveTo(hw, cy - hd, hw, cy - hd + r); s.lineTo(hw, cy + hd);
  s.lineTo(hw - t, cy + hd); s.lineTo(hw - t, cy - hd + r); s.quadraticCurveTo(hw - t, cy - hd + t, hw - r, cy - hd + t); s.lineTo(-hw + r, cy - hd + t); s.quadraticCurveTo(-hw + t, cy - hd + t, -hw + t, cy - hd + r); s.lineTo(-hw + t, cy + hd); s.closePath();
  return s;
}
// 세워 뽑기: XY 모양을 바닥(XZ)에 눕혀 위(+Y)로 뽑는다 (모양의 y 는 세계 -z)
function extrudeUp(shape, height, mat, y0, bevel = 0.02) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: height - 2 * bevel, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 24 });
  const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.y = y0 + bevel; return m;
}

/* 몸체 색 — 확정은 흰색(U4). 비교용으로 그래파이트·블랙을 남겨 둠 */
const COLORS = {
  white: { case: 0xf4f4f1, rough: 0.42, clear: 0.35 },
  graphite: { case: 0x4b4f55, rough: 0.5, clear: 0.2 },
  black: { case: 0x15171a, rough: 0.14, clear: 1 },
};
function setColor(k) {
  const c = COLORS[k] || COLORS.white;
  M.case.color.set(c.case); M.case.roughness = c.rough; M.case.clearcoat = c.clear;
  document.querySelectorAll('[data-xv-color]').forEach(b => b.classList.toggle('on', b.dataset.xvColor === k));
}
window.xvSetColor = setColor;

/* 1. 하단 몸통(흰 사출, 1.5cm) — 가운데 냉각판 자리가 뚫린 얇은 받침. 앞 가운데 「Hurom」 */
{
  const g = new THREE.Group();
  const s = rrect(W, D, R); s.holes.push(rrect(PW + 0.02, PD + 0.02, 0.08, new THREE.Shape(), 0, -ZC));
  g.add(extrudeUp(s, BASE, M.case, 0, 0.015));
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.1), M.logo); logo.position.set(0, BASE / 2, D / 2 + 0.017); g.add(logo);
  part('하단 몸통 · 흰 사출 1.5cm · Hurom', g, [0, 0, 0], new THREE.Vector3(-1.1, 0.07, 1.05));
}
/* 2. 뒤 고정 부품 칸 — 흰 사출 4.5cm, 뚜껑 윗면 높이까지. 윗면은 블랙 유리 조작부(터치 5 + 15°C). 안쪽(앞) 면에 송풍 망·흡입 망·LED, 뚜껑 댐퍼 경첩 */
{
  const g = new THREE.Group();
  g.add(extrudeUp(rrect(W, MR, R, new THREE.Shape(), 0, -MZ), H - BASE, M.case, BASE, 0.012));
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 32), M.dark); btn.position.set(0.7, H + 0.004, MZ); g.add(btn);   // 버튼 1
  [[0.2, 0x5fa9ee], [0.38, 0x3cab6e], [0.56, 0xcccccc]].forEach(([x, c], i) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 16), i === 0 ? M.led : new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 })); l.position.set(x, H + 0.002, MZ); g.add(l); });   // 불빛 3: 해동 중 · 완료 · 보관
  const zf = MZ + MR / 2;   // 앞면(안쪽) z
  const up = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.14, 0.01), M.vent); up.position.set(0, BASE + GL - 0.14, zf + 0.006); g.add(up);
  for (let i = 0; i < 5; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.012, 0.012), M.case); l.position.set(0, BASE + GL - 0.14 - 0.048 + i * 0.024, zf + 0.012); g.add(l); }
  [-0.85, 0.85].forEach(x => { const lo = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.07, 0.01), M.vent); lo.position.set(x, BASE + CAB + 0.08, zf + 0.006); g.add(lo); });
  const led = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.012, 0.01), M.led); led.position.set(0, BASE + GL + 0.01, zf + 0.006); g.add(led);
  [-0.6, 0.6].forEach(x => { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.26, 16), M.dark); h.rotation.z = Math.PI / 2; h.position.set(x, BASE + GL + RIM + 0.035, zf + 0.03); g.add(h); });
  part('뒤 고정 칸 · 흰 사출 4.5cm · 윗면 버튼 1 + 불빛 3 · 뚜껑 경첩', g, [0, 0, -1.9], new THREE.Vector3(1.1, 0.55, 0.22));
}
/* 3. 스모크 칸 — 이중벽 투명 PC(트라이탄), 앞·옆을 두름. 사이 공기층이 결로·열 손실을 막는다 */
{
  const g = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.ExtrudeGeometry(uShape(0, GT), { depth: GL, bevelEnabled: false, curveSegments: 32 }), M.smoke); outer.rotation.x = -Math.PI / 2; outer.position.y = BASE; g.add(outer);
  part('스모크 칸 · 한 겹 스모크 PC 6cm · 앞·옆', g, [0, 2.0, 0], new THREE.Vector3(-1.2, 0.3, 1.1));
}
/* 4. 흰 테 — 스모크 칸과 뚜껑 사이의 얇은 틀(뚜껑이 앉는 턱 · 패킹) */
{
  const g = new THREE.Group();
  const s = rrect(W, FD, R, new THREE.Shape(), 0, -FZ); s.holes.push(rrect(W - 0.14, FD - 0.14, R - 0.07, new THREE.Shape(), 0, -FZ));
  g.add(extrudeUp(s, RIM, M.case, BASE + GL, 0));
  const q = rrect(W - 0.14, FD - 0.14, R - 0.07, new THREE.Shape(), 0, -FZ); q.holes.push(rrect(W - 0.26, FD - 0.26, R - 0.1, new THREE.Shape(), 0, -FZ));
  const seal = new THREE.Mesh(new THREE.ExtrudeGeometry(q, { depth: 0.012, bevelEnabled: false, curveSegments: 24 }), M.rubber); seal.rotation.x = -Math.PI / 2; seal.position.y = BASE + GL + RIM - 0.012; g.add(seal);
  part('흰 테 · 뚜껑 턱 · 패킹', g, [0, 2.8, 0], new THREE.Vector3(1.2, 0.0, 1.0));
}
/* 5. 뚜껑 — 아무것도 없는 스모크 PC(플라스틱) 한 장(2~3mm, 바깥 하드코팅·안쪽 김 서림 방지). 뒤 칸 앞 모서리의 경첩에 걸치고, 들어 올려 떼어 씻는다 */
{
  const g = new THREE.Group();
  g.add(extrudeUp(rrect(W - 0.02, FD - 0.02, R, new THREE.Shape(), 0, -FZ), 0.05, M.lidGlass, 0, 0.01));
  [-0.6, 0.6].forEach(x => { const c = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.08), M.dark); c.position.set(x, 0.04, -FD / 2 + 0.06); g.add(c); });
  g.position.set(0, BASE + GL + RIM, 0);
  part('뚜껑 · 스모크 PC 3mm · 안쪽 김 서림 방지 · 아무것도 없음 · 떼어 씻음', g, [0, 3.7, 0], new THREE.Vector3(1.0, 0.05, 1.0));
}
/* 6. 트레이 — 알루미늄 2mm + 경질 아노다이징(식품 등급), 원물을 그대로 올림. 가장자리 핏물 홈, 들어서 빼고 손 세척 */
const tray = new THREE.Group();
{
  const w = TW, d = TD, t = 0.012;
  const floor = new THREE.Mesh(new THREE.BoxGeometry(w, t, d), M.steel); floor.position.y = t / 2; tray.add(floor);
  const deck = new THREE.Mesh(new RoundedBoxGeometry(w - 0.2, 0.03, d - 0.2, 2, 0.01), M.steel); deck.position.y = t + 0.015; tray.add(deck);
  [[0, d / 2 - t / 2, w, t], [0, -d / 2 + t / 2, w, t]].forEach(([x, z, bw, bd]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(bw, TDEEP, bd), M.steel); m.position.set(x, TDEEP / 2, z); tray.add(m); });
  [w / 2 - t / 2, -w / 2 + t / 2].forEach(x => { const m = new THREE.Mesh(new THREE.BoxGeometry(t, TDEEP, d - 2 * t), M.steel); m.position.set(x, TDEEP / 2, 0); tray.add(m); });
  const rimS = rrect(w + 0.1, d + 0.1, 0.08); rimS.holes.push(rrect(w - 0.01, d - 0.01, 0.04));
  const rimM = new THREE.Mesh(new THREE.ExtrudeGeometry(rimS, { depth: 0.02, bevelEnabled: false, curveSegments: 24 }), M.steel); rimM.rotation.x = -Math.PI / 2; rimM.position.y = TDEEP; tray.add(rimM);
  tray.position.set(0, BASE, ZC);
  part('트레이 · 식품용 알루미늄 3003 1.5mm 경질 아노다이징 · 핏물 홈', tray, [0, 1.1, 0], new THREE.Vector3(-1.0, 0.2, 0.8));
}
/* 7. 원물 고기 — 지퍼백 없이 트레이에 그대로. 두께 4cm 까지 */
{
  const g = new THREE.Group();
  const meat = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.26, 0.95, 3, 0.08), M.meat); g.add(meat);
  [[-0.35, 0.12], [0.05, -0.1], [0.4, 0.2]].forEach(([x, z]) => { const f = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.27, 0.14, 2, 0.05), M.fat); f.position.set(x, 0, z); f.rotation.y = 0.3; g.add(f); });
  g.name = 'meat';
  g.position.set(0, BASE + 0.045 + 0.13, ZC);
  part('원물 고기 · 포장 없이 · 두께 4cm 까지', g, [0, 1.7, 0], new THREE.Vector3(0.68, 0.1, 0.1));
}
/* 8. 냉각판 — 알루미늄, 속에 사행 물길. 하단 속에 들어가 윗면이 하단과 같은 높이. 트레이가 바로 올라앉는다(옆 재킷 없음) */
{
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new RoundedBoxGeometry(PW, PT, PD, 2, 0.02), M.alu));
  g.position.set(0, BASE - PT / 2, ZC);
  part('냉각판 · 식품용 알루미늄 1050 통판 5mm · 경질 아노다이징 · 물 없음', g, [0, 0.55, 0], new THREE.Vector3(-1.05, 0, 0.55));
}
/* 10. 펠티어 40mm 2장 + 구리 블록 — 뒤 칸에 세움(전선 보관함 칸막이 위). 찬 면은 블록을 거쳐 냉각판(물 밀봉, 돌지 않음)과 안쪽 냉각 핀으로, 더운 면은 방열판으로 */
const SY = BASE + CAB + 0.3;   // 뒤 칸 부품 줄 중심 높이
{
  const g = new THREE.Group();
  const block = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.46, 0.05), M.copper); g.add(block);
  [0].forEach(x => { const c = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.04), M.ceramic); c.position.set(x, 0, -0.045); g.add(c); });
  g.position.set(0, SY, MZ + 0.15);
  part('펠티어 40mm 1장(세움) + 구리 블록 · 가열 ↔ 냉각', g, [0, 0.9, -1.1], new THREE.Vector3(0.6, 0.05, 0.1), true);
}
/* 11. 방열판 — 펠티어 더운 면 뒤, 세로 핀 20mm. 열을 뒤로 */
{
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.48, 0.03), M.alu); g.add(base);
  for (let i = 0; i < 9; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.48, 0.17), M.alu); f.position.set(-0.48 + i * 0.12, 0, -0.1); g.add(f); }
  g.position.set(0, SY, MZ + 0.06);
  part('방열판 · 냉각 핀과 한 몸 · 열을 뒤로', g, [0, 0.4, -1.7], new THREE.Vector3(0.75, 0.2, -0.05), true);
}
/* 12. 블로어 팬 — 방열판 뒤. 뒷면 아래 슬롯으로 들이고 뒷면 위 슬롯으로 뺀다 */
function fan(size = 0.5) {
  const g = new THREE.Group();
  const s = rrect(size, size, 0.05); const hole = new THREE.Path(); hole.absarc(0, 0, size * 0.46, 0, Math.PI * 2, true); s.holes.push(hole);
  const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: false, curveSegments: 32 }), M.dark); frame.position.z = -0.05; g.add(frame);
  const rotor = new THREE.Group();
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 24), M.dark); hub.rotation.x = Math.PI / 2; rotor.add(hub);
  for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.07, 0.01), M.dark); const a = i / 7 * Math.PI * 2; b.position.set(Math.cos(a) * 0.14, Math.sin(a) * 0.14, 0); b.rotation.z = a; b.rotation.y = 0.45; rotor.add(b); }
  rotor.userData.spin = true; g.add(rotor);
  return g;
}
{
  const g = fan(0.45);
  g.position.set(0, SY, MZ - 0.13);
  part('블로어 팬 40×40×10mm · 뒷면 슬롯으로 배기', g, [0, -0.2, -2.3], new THREE.Vector3(0.3, 0, 0), true);
}
/* 14. 냉각 핀 + 순환 팬 30mm — 뒤 칸 안쪽 면, 망 뒤. 구리 블록에서 이어진 찬 핀을 지난 바람을 고기 위로 */
{
  const g = new THREE.Group();
  const s = rrect(0.3, 0.3, 0.04); const hole = new THREE.Path(); hole.absarc(0, 0, 0.135, 0, Math.PI * 2, true); s.holes.push(hole);
  const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: false, curveSegments: 32 }), M.dark); frame.position.z = -0.035; g.add(frame);
  const rotor = new THREE.Group();
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 20), M.dark); hub.rotation.x = Math.PI / 2; rotor.add(hub);
  for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.01), M.dark); const a = i / 5 * Math.PI * 2; b.position.set(Math.cos(a) * 0.085, Math.sin(a) * 0.085, 0); b.rotation.z = a; b.rotation.x = 0.45; rotor.add(b); }
  rotor.userData.spin = true; g.add(rotor);
  g.position.set(0, BASE + GL - 0.14, MZ + MR / 2 - 0.05);
  part('순환 팬 30mm · 망 뒤 · 고기 위로 15°C 바람', g, [0, 1.5, -1.2], new THREE.Vector3(0.3, 0.05, 0), true);
}
/* 15. 제어·터치 보드 — 뒤 칸 윗면 조작부 바로 아래. 정전식 패드 5 · 표시 LED · 펠티어 H브리지 · 펌프 · 팬 · 완료 감지. 경첩을 지나는 선이 없다 */
{
  const g = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.02, 0.28), M.pcb); g.add(board);
  [-0.64, -0.41, 0.41, 0.63].forEach(x => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.006, 20), M.copper); p.position.set(x, 0.013, 0); g.add(p); });
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.12), M.chip); led.position.set(0, 0.015, 0); g.add(led);
  const mcu = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.03, 0.16), M.chip); mcu.position.set(-0.85, -0.025, 0); g.add(mcu);
  [[0.8, 0.06], [0.8, -0.06]].forEach(([x, z]) => { const q = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.04, 0.09), M.chip); q.position.set(x, -0.03, z); g.add(q); });
  g.position.set(0, H - 0.04, MZ);
  part('제어 보드 · 버튼·불빛 3 바로 아래 · H브리지 · 완료 감지', g, [0, 3.0, -0.4], new THREE.Vector3(1.0, 0, 0), true);
}
/* 16. 전선 보관함 — 뒤 칸 아래 1.5cm. 칸막이로 위 바람길과 나눔. DC 선 1.2m 를 감아 넣고 옆 홈으로 뺀다 */
{
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) { const loop = new THREE.Mesh(new THREE.TorusGeometry(0.42 + i * 0.012, 0.012, 8, 48), M.wireB); loop.rotation.x = Math.PI / 2; loop.position.set(0.3, 0.03 + i * 0.026, 0); loop.scale.set(1.9, 1, 0.32); g.add(loop); }
  g.position.set(0, BASE, MZ);
  part('선 감는 홈 · 뒤 칸 아래 · DC 선 감아 둠(보관함 없음)', g, [0, -0.45, -1.3], new THREE.Vector3(-0.9, 0.07, 0), true);
}
/* 16b. 온도 센서 3 — NTC ① 냉각판 · NTC ② 순환 바람 입구(아래 망 안) · NTC ③ 방열판(과열 차단). 적외선(고기 겉면)은 넣지 않음(준보 확정) */
{
  const g = new THREE.Group();
  const mk = (x, y, z, ir = false) => { const m = new THREE.Mesh(ir ? new THREE.CylinderGeometry(0.035, 0.035, 0.05, 16) : new THREE.BoxGeometry(0.06, 0.04, 0.04), ir ? M.dark : M.chip); if (ir) m.rotation.x = Math.PI / 2; m.position.set(x, y, z); g.add(m); const w = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(x, y, z), new THREE.Vector3(x * 0.8, y + 0.15, MZ - 0.05), new THREE.Vector3(x * 0.5, H - 0.06, MZ)]), 12, 0.006, 5), M.wireB); g.add(w); };
  mk(0.9, BASE - 0.02, ZC - PD / 2 - 0.02);                 // ① 냉각판 가장자리
  mk(0.55, SY + 0.2, MZ + 0.02);                           // ③ 방열판 위
  part('온도 센서 NTC 2 · 냉각판 · 방열판(과열 차단)', g, [0.6, 1.0, 0.4], new THREE.Vector3(0.85, BASE + CAB + 0.08, MZ + MR / 2 - 0.03), true);
}
/* 17. 뒷면 — 위 배기 슬롯 · 아래 흡기 슬롯 · 전선 보관함 덮개 · 왼쪽 옆 선 홈 · 명판 */
{
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.025, 0.015), M.vent); s.position.set(0, BASE + GL + 0.02 - i * 0.06, -D / 2 - 0.012); g.add(s); }
  for (let i = 0; i < 2; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.025, 0.015), M.vent); s.position.set(0, BASE + CAB + 0.1 + i * 0.06, -D / 2 - 0.012); g.add(s); }
  const notch = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.09, 0.09), M.vent); notch.position.set(-W / 2 - 0.004, BASE + CAB / 2 + 0.01, MZ); g.add(notch);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.01), M.label); plate.position.set(0.9, BASE + CAB + 0.28, -D / 2 - 0.012); g.add(plate);
  part('뒷면 · 배기·흡기 슬롯 · 옆 선 홈', g, [0, -0.3, -2.6], new THREE.Vector3(0.7, BASE + GL - 0.2, -D / 2));
}
/* 18. 바닥 — 고무발 4개 */
{
  const g = new THREE.Group();
  [[-1.1, -1.05], [1.1, -1.05], [-1.1, 1.05], [1.1, 1.05]].forEach(([x, z]) => { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 20), M.rubber); f.position.set(x, -0.015, z); g.add(f); });
  part('바닥 · 고무발 4', g, [0, -1.5, 0], new THREE.Vector3(-1.0, 0, 1.0), true);
}
/* 19. 12V 어댑터 — 바깥, KC 받은 기성품. 선은 왼쪽 옆 홈으로 들어간다 */
{
  const g = new THREE.Group();
  const brick = new THREE.Mesh(new RoundedBoxGeometry(0.8, 0.26, 0.4, 2, 0.04), M.dark); brick.position.set(1.6, 0.13, -1.9); g.add(brick);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(1.2, 0.13, -1.9), new THREE.Vector3(0.3, 0.08, -2.05), new THREE.Vector3(-1.0, 0.1, -1.85), new THREE.Vector3(-1.45, 0.15, -1.3), new THREE.Vector3(-W / 2 - 0.02, BASE + CAB / 2 + 0.01, MZ)]), 40, 0.013, 6), M.wireB); g.add(cable);
  g.name = 'adapter';
  part('12V 외장 어댑터 · 기성품(36W) · 선은 옆 홈으로', g, [1.2, -0.7, -0.7], new THREE.Vector3(1.6, 0.28, -1.9));
}
/* 공기 흐름 — 뒤 위 망(냉각 핀)에서 나와 뚜껑 아래로 앞까지, 내려와 트레이 옆을 지나 뒤 아래 망으로 */
const airG = new THREE.Group(); airG.name = 'airg'; product.add(airG);
{
  const zb = MZ + MR / 2, yTop = BASE + GL - 0.1, yLow = BASE + CAB + 0.08;
  [[-1], [1]].forEach(([sx]) => {
    const pts = [new THREE.Vector3(sx * 0.15, yTop - 0.04, zb), new THREE.Vector3(sx * 0.3, yTop, FZ - 0.2), new THREE.Vector3(sx * 0.55, yTop - 0.04, FZ + 0.6), new THREE.Vector3(sx * 0.9, yTop - 0.25, FZ + 0.85), new THREE.Vector3(sx * 1.15, yLow + 0.1, FZ + 0.4), new THREE.Vector3(sx * 1.15, yLow, FZ - 0.5), new THREE.Vector3(sx * 0.85, yLow, zb)];
    const c = new THREE.CatmullRomCurve3(pts, false);
    airG.add(new THREE.Mesh(new THREE.TubeGeometry(c, 60, 0.008, 6, false), M.air));
    for (let i = 0; i < 8; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), M.air); d.userData.t = i / 8; d.userData.c = c; airG.add(d); }
  });
}

/* 바닥 그림자 */
const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.1 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -H / 2 - 0.001; ground.receiveShadow = true; scene.add(ground);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 8;
Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
const NOSHADOW = new Set([M.smoke, M.lidGlass, M.water, M.flow, M.air, M.touch, M.logo]);
product.traverse(o => { if (o.isMesh && !NOSHADOW.has(o.material)) o.castShadow = true; });
product.position.y = -H / 2;

/* ---------- 스크롤 ---------- */
const Q = new URLSearchParams(location.search);
product.traverse(o => { if (o.name && Q.has('no' + o.name)) o.visible = false; });   // 디버그: ?nowater ?nomeat ?noadapter
const CY = +(Q.get('cy') || 0);
const ANG = Q.has('ang') ? +Q.get('ang') * Math.PI / 180 : null;   // 카메라 각도 고정(도) — 최종 이미지용
const NOAIR = Q.has('noair');                                       // 바람 표시 숨김 — 최종 이미지용
const forced = Q.get('p');
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
function progress() {
  if (forced !== null) return +forced;
  const r = sec.getBoundingClientRect();
  return clamp(-r.top / (r.height - innerHeight));
}
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

const tmp = new THREE.Vector3();
let t0 = performance.now();
function frame(now) {
  const dt = Math.min(0.1, Math.max(0, (now - t0) / 1000)); t0 = now;
  const p = progress();
  // 0~.1 앞모습 · .1~.26 뒤로 돌아 뒷모습 · .26~.4 몸체 투명 + 물살 · .4~.58 분해 · .58~.76 분해 유지 · .76~.95 조립하며 앞으로
  const e = p < 0.4 ? 0 : p < 0.58 ? ease((p - 0.4) / 0.18) : p < 0.76 ? 1 : p < 0.95 ? 1 - ease((p - 0.76) / 0.19) : 0;
  parts.forEach(({ obj }) => obj.position.copy(obj.userData.home).addScaledVector(obj.userData.off, e));
  const ghost = p < 0.24 ? 0 : p < 0.32 ? (p - 0.24) / 0.08 : p < 0.82 ? 1 : p < 0.94 ? 1 - (p - 0.82) / 0.12 : 0;
  M.case.opacity = 1 - 0.86 * ghost; M.case.depthWrite = ghost < 0.01;
  M.panel.opacity = 1 - 0.86 * ghost; M.panel.depthWrite = ghost < 0.01;
  M.smoke.opacity = 0.36 - 0.26 * ghost;
  M.lidGlass.opacity = 0.9 - 0.28 * ghost;   // 분해도에서도 스모크 색이 보이게
  M.touch.opacity = 1 - 0.7 * ghost; M.logo.opacity = 1 - 0.7 * ghost;
  const jg = ghost * (1 - e);
  M.alu.opacity = 1 - 0.72 * jg; M.alu.depthWrite = jg < 0.01;
  parts.forEach(({ obj }) => { if (obj.userData.inner) obj.visible = ghost > 0.02; });

  const FRONT = 0.42, BACK = Math.PI + 0.5, XA = 0.8, XB = 1.2;
  const ang = p < 0.1 ? FRONT
    : p < 0.26 ? FRONT + (BACK - FRONT) * ease((p - 0.1) / 0.16)
    : p < 0.4 ? BACK + (XA - BACK) * ease((p - 0.26) / 0.14)
    : p < 0.58 ? XA
    : p < 0.76 ? XA + (XB - XA) * ((p - 0.58) / 0.18)
    : p < 0.95 ? XB + (FRONT - XB) * ease((p - 0.76) / 0.19) : FRONT;
  ground.material.opacity = 0.1 * (1 - e);
  const dist = 7.6 + e * 8.8;
  const camY = p < 0.26 ? 2.4 : p < 0.4 ? 2.4 + 1.8 * ease((p - 0.26) / 0.14) : 4.2;
  const angF = ANG === null ? ang : ANG;
  camera.position.set(Math.sin(angF) * dist, camY + CY + e * 2.4, Math.cos(angF) * dist);
  camera.lookAt(0, -0.1 + e * 1.2, 0);
  const fk = Q.get('focus');
  if (fk) { const pt = parts.find(q => q.el.textContent.includes(fk)); if (pt) { const c = new THREE.Box3().setFromObject(pt.obj).getCenter(new THREE.Vector3()); camera.position.set(c.x + 1.0, c.y + 1.2, c.z + 1.0); camera.lookAt(c); } }

  product.traverse(o => { if (o.userData.spin) o.rotation.z += dt * (3 + 10 * (1 - e)); });
  const airOn = NOAIR ? 0 : (p < 0.1 || p > 0.96) ? 0.35 : (ghost > 0.3 && e < 0.4) ? 0.8 * (1 - e / 0.4) : 0;
  M.air.opacity += (airOn - M.air.opacity) * 0.1;
  airG.children.forEach(ch => { if (ch.userData.c) { ch.userData.t = (ch.userData.t + dt * 0.12) % 1; ch.position.copy(ch.userData.c.getPointAt(ch.userData.t)); } });

  renderer.render(scene, camera);

  // 이름표
  const w = canvas.clientWidth, h = canvas.clientHeight, lab = [];
  parts.forEach(({ obj, el, anchor }) => {
    tmp.copy(anchor); obj.localToWorld(tmp); tmp.project(camera);
    const sx = (tmp.x * 0.5 + 0.5) * w, sy = (-tmp.y * 0.5 + 0.5) * h;
    lab.push({ el, sx, sy, w: el.offsetWidth || 160, h: el.offsetHeight || 30 });
    el.style.opacity = clamp((e - 0.7) / 0.3);
  });
  lab.sort((a, b) => a.sy - b.sy);
  for (let i = 0; i < lab.length; i++) for (let j = 0; j < i; j++) {
    const a = lab[j], b = lab[i];
    if (Math.abs(a.sx - b.sx) < (a.w + b.w) / 2 + 6 && Math.abs(a.sy - b.sy) < (a.h + b.h) / 2 + 4) b.sy = a.sy + (a.h + b.h) / 2 + 4;
  }
  lab.forEach(({ el, sx, sy }) => { el.style.transform = `translate(${sx}px, ${sy}px) translate(-50%,-50%)`; });

  const idx = p < 0.1 ? 0 : p < 0.26 ? 1 : p < 0.42 ? 2 : 3;
  stepEls.forEach((s, i) => s.classList.toggle('on', i === idx));
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
setColor(Q.get('c') || 'white');
document.querySelectorAll('[data-xv-color]').forEach(b => b.addEventListener('click', () => setColor(b.dataset.xvColor)));
document.documentElement.classList.add('xv-ready');
