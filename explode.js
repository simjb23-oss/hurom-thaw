import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// 휴롬 급속 해동기(가칭) · 구조 3D — 찬물 순환형(A안). 단위 10cm. 바깥 약 30 × 18 × 22cm(W×H×D)
const sec = document.getElementById('structure');
const canvas = document.getElementById('xv-canvas');
const labelLayer = document.getElementById('xv-labels');
const stepEls = [...document.querySelectorAll('.xv-step')];

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.add(new THREE.HemisphereLight(0xffffff, 0xe6ddcf, 1.1));
const sun = new THREE.DirectionalLight(0xfffaf2, 1.6); sun.position.set(-2, 9, 5); scene.add(sun);
const fill = new THREE.DirectionalLight(0xffffff, 0.6); fill.position.set(6, 2, 3); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 0.9); rim.position.set(1, 4, -7); scene.add(rim);
const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);

/* ---------- 재질 ---------- */
const M = {
  case: new THREE.MeshPhysicalMaterial({ color: 0xf6f3ec, roughness: 0.55, clearcoat: 0.2, clearcoatRoughness: 0.45, transparent: true, opacity: 1 }),
  band: new THREE.MeshStandardMaterial({ color: 0x6aa8e8, roughness: 0.7, transparent: true, opacity: 1 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xe9ecef, metalness: 0.45, roughness: 0.32 }),
  alu: new THREE.MeshStandardMaterial({ color: 0xc9ced4, metalness: 0.9, roughness: 0.35 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x3a3c40, roughness: 0.6 }),
  ceramic: new THREE.MeshStandardMaterial({ color: 0xf4f2ee, roughness: 0.4 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.12, transparent: true, opacity: 0.18, envMapIntensity: 0.5, depthWrite: false }),
  bag: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.1, transparent: true, opacity: 0.16, depthWrite: false }),
  water: new THREE.MeshPhysicalMaterial({ color: 0x6fb3f0, roughness: 0.4, transparent: true, opacity: 0.4, envMapIntensity: 0.25, depthWrite: false }),
  meat: new THREE.MeshStandardMaterial({ color: 0xd97a7a, roughness: 0.7 }),
  fat: new THREE.MeshStandardMaterial({ color: 0xf3e4d8, roughness: 0.8 }),
  pcb: new THREE.MeshStandardMaterial({ color: 0x1f6b3a, roughness: 0.7 }),
  chip: new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.5 }),
  cap: new THREE.MeshStandardMaterial({ color: 0x3f4a8a, roughness: 0.5 }),
  copper: new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.7, roughness: 0.4 }),
  wireR: new THREE.MeshStandardMaterial({ color: 0xd23a2f, roughness: 0.5 }),
  wireB: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 }),
  vent: new THREE.MeshStandardMaterial({ color: 0x55575c, roughness: 0.7 }),
  label: new THREE.MeshStandardMaterial({ color: 0xd9d6cf, roughness: 0.6 }),
  btnRing: new THREE.MeshStandardMaterial({ color: 0x5aa0ff, emissive: 0x3c82ff, emissiveIntensity: 1.2, metalness: 0.2, roughness: 0.4 }),
  btnCap: new THREE.MeshStandardMaterial({ color: 0xf0ede6, roughness: 0.5 }),
  flow: new THREE.MeshBasicMaterial({ color: 0x3f8ff0, transparent: true, opacity: 0 }),
};

/* ---------- 치수 ---------- */
const W = 3.0, D = 2.2, BASE = 0.5, BODY = 1.3, H = BASE + BODY, R = 0.32;
const TW = 2.4, TD = 1.6, TH = 1.1, TT = 0.03;           // 물통 안쪽 24 × 16cm · 깊이 11cm
const TANK_Y0 = BASE + 0.15;                              // 물통 바닥 높이
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
function rrect(w, h, r, s = new THREE.Shape()) {
  s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}
// 세워 뽑기: XY 모양을 바닥(XZ)에 눕혀 위(+Y)로 뽑는다
function extrudeUp(shape, height, mat, y0, bevel = 0.04) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: height - 2 * bevel, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 24 });
  const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.y = y0 + bevel; return m;
}

/* 하단 색 — 미정. 하늘(기본)·회색·빨강 셋을 비교용으로 둔다 */
const COLORS = { sky: 0x6aa8e8, gray: 0x8e9299, red: 0xe4573f };
function setColor(k) {
  M.band.color.set(COLORS[k] || COLORS.sky);
  document.querySelectorAll('[data-xv-color]').forEach(b => b.classList.toggle('on', b.dataset.xvColor === k));
}
window.xvSetColor = setColor;

/* 1. 몸체(흰 사출) — 가운데에 물통 자리가 뚫린 틀 */
{
  const s = rrect(W, D, R); s.holes.push(rrect(TW + 2 * TT + 0.08, TD + 2 * TT + 0.08, 0.12));
  const m = extrudeUp(s, BODY, M.case, BASE);
  part('몸체 · 흰 사출(금형 1)', m, [0, 0, 0], new THREE.Vector3(-1.3, 0.5, 0.9));
}
/* 2. 하단 몸통(색) — 전기부가 들어가는 아래 몸통 */
{
  const m = extrudeUp(rrect(W, D, R), BASE, M.band, 0);
  part('하단 몸통 · 색상(금형 2)', m, [0, 0, 0], new THREE.Vector3(1.3, 0.25, 0.9));
}
/* 3. 물통 — 스테인리스, 들어서 뺀다 */
const tank = new THREE.Group();
{
  const w = TW + 2 * TT, d = TD + 2 * TT;
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(w, TT, d), M.steel); bottom.position.y = TT / 2; tank.add(bottom);
  [[0, d / 2 - TT / 2, w, TT], [0, -d / 2 + TT / 2, w, TT]].forEach(([x, z, bw, bd]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(bw, TH, bd), M.steel); m.position.set(x, TH / 2, z); tank.add(m); });
  [w / 2 - TT / 2, -w / 2 + TT / 2].forEach(x => { const m = new THREE.Mesh(new THREE.BoxGeometry(TT, TH, d - 2 * TT), M.steel); m.position.set(x, TH / 2, 0); tank.add(m); });
  // 위 테두리(몸체 위에 걸치는 턱)
  const rimS = rrect(w + 0.26, d + 0.26, 0.14); rimS.holes.push(rrect(w - 0.02, d - 0.02, 0.06));
  const rimM = new THREE.Mesh(new THREE.ExtrudeGeometry(rimS, { depth: 0.04, bevelEnabled: false, curveSegments: 24 }), M.steel); rimM.rotation.x = -Math.PI / 2; rimM.position.y = TH; tank.add(rimM);
  // 물(사용 수위 약 80%)
  const water = new THREE.Mesh(new THREE.BoxGeometry(TW - 0.01, 0.85, TD - 0.01), M.water); water.position.y = TT + 0.425; water.name = 'water'; tank.add(water);
  // 임펠러 자리(바닥 뒤 오른쪽 둥근 홈)
  const well = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.02, 10, 32), M.alu); well.rotation.x = Math.PI / 2; well.position.set(1.0, TT + 0.02, -0.5); tank.add(well);
  // 수위 선
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.012, 0.004), M.dark); line.position.set(0, TT + 0.85, TD / 2 - 0.004); tank.add(line);
  tank.position.set(0, TANK_Y0, 0);
  part('물통 · 스테인리스 · 들어서 뺌', tank, [0, 1.2, 0], new THREE.Vector3(-1.3, 0.9, 0.8));
}
/* 4. 받침 망 — 고기를 띄워 물이 아래로도 돈다 */
{
  const g = new THREE.Group();
  for (let i = 0; i < 7; i++) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, TD - 0.3, 8), M.steel); r.rotation.x = Math.PI / 2; r.position.x = -0.9 + i * 0.3; g.add(r); }
  [-0.6, 0.6].forEach(z => { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.84, 8), M.steel); r.rotation.z = Math.PI / 2; r.position.z = z; g.add(r); });
  [[-0.85, -0.6], [0.85, -0.6], [-0.85, 0.6], [0.85, 0.6]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8), M.steel); l.position.set(x, -0.06, z); g.add(l); });
  g.position.set(-0.1, TANK_Y0 + TT + 0.12, 0);
  part('받침 망 · 고기를 띄움', g, [0, 2.45, 0], new THREE.Vector3(0.6, 0, 0.6));
}
/* 5. 진공팩 고기 — 밀봉 상태로 그대로 넣는다 */
{
  const g = new THREE.Group();
  const meat = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.24, 0.9, 3, 0.06), M.meat); g.add(meat);
  [[-0.35, 0.12], [0.05, -0.1], [0.4, 0.2]].forEach(([x, z]) => { const f = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.25, 0.14, 2, 0.05), M.fat); f.position.set(x, 0, z); f.rotation.y = 0.3; g.add(f); });
  const bag = new THREE.Mesh(new RoundedBoxGeometry(1.46, 0.3, 1.04, 3, 0.05), M.bag); bag.name = 'bag'; g.add(bag);
  g.position.set(-0.1, TANK_Y0 + TT + 0.12 + 0.14, 0);
  part('진공팩 고기 · 밀봉 필수', g, [0, 2.85, 0], new THREE.Vector3(0.7, 0.15, 0));
}
/* 6. 뚜껑 — 투명, 뒤 경첩 */
{
  const g = new THREE.Group();
  const LW = W - 0.16, LD = D - 0.12;
  const lid = new THREE.Mesh(new RoundedBoxGeometry(LW, 0.08, LD, 3, 0.03), M.glass); lid.name = 'lid'; g.add(lid);
  const lip = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.05, 0.16, 2, 0.02), M.ceramic); lip.position.set(0, 0.0, LD / 2 + 0.06); g.add(lip);
  [-1.0, 1.0].forEach(x => { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 12), M.dark); h.rotation.z = Math.PI / 2; h.position.set(x, -0.09, -LD / 2 + 0.06); g.add(h); });
  g.position.set(0, H + 0.08, 0);
  part('뚜껑 · 투명 PC(금형 3)', g, [0, 3.3, 0], new THREE.Vector3(1.0, 0.05, 0.6));
}
/* 7. 임펠러 — 물통 안 바닥의 자석 날개. 전선 없이 아래 모터가 자석으로 돌림 */
{
  const g = new THREE.Group();
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 20), M.dark); hub.position.y = 0.04; g.add(hub);
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.02), M.ceramic); const a = i / 6 * Math.PI * 2; b.position.set(Math.cos(a) * 0.1, 0.04, Math.sin(a) * 0.1); b.rotation.y = -a; g.add(b); }
  g.userData.spinY = true;
  g.position.set(1.0, TANK_Y0 + TT + 0.01, -0.5);
  part('자석 임펠러 · 물살을 만듦', g, [2.0, 1.25, 0.7], new THREE.Vector3(0.15, 0.1, 0));
}
/* 8. 온도판 — 물통 바닥에 밀착하는 알루미늄 판 + 물 온도 센서 */
{
  const g = new THREE.Group();
  const plate = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 1.3), M.alu); g.add(plate);
  const ntc = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.08), M.chip); ntc.position.set(-0.8, 0.05, 0.55); g.add(ntc);
  const wire = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.8, 0.05, 0.6), new THREE.Vector3(-0.9, -0.1, 0.75), new THREE.Vector3(-0.9, -0.3, 0.9)]), 10, 0.01, 6), M.wireB); g.add(wire);
  g.position.set(0, TANK_Y0 - 0.03, 0);
  part('온도판 · 알루미늄 + 물 온도 센서', g, [0, 0.9, 0], new THREE.Vector3(0.9, 0, 0.5), true);
}
/* 9. 펠티어 소자 2개 — 전류 방향을 바꿔 가열(해동)·냉각(보관) 둘 다 */
{
  const g = new THREE.Group();
  [-0.45, 0.45].forEach(x => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.4), M.ceramic); c.position.x = x; g.add(c);
    const r = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(x + 0.2, 0, 0.18), new THREE.Vector3(x + 0.3, -0.06, 0.4), new THREE.Vector3(x + 0.3, -0.12, 0.7)]), 10, 0.01, 6), M.wireR); g.add(r);
    const b = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(x + 0.2, 0, -0.18), new THREE.Vector3(x + 0.3, -0.06, 0.1), new THREE.Vector3(x + 0.34, -0.12, 0.7)]), 10, 0.01, 6), M.wireB); g.add(b);
  });
  g.position.set(0, TANK_Y0 - 0.08, 0);
  part('펠티어 2개 · 가열 ↔ 냉각', g, [0, 0.55, 0], new THREE.Vector3(0.65, 0, 0.2), true);
}
/* 10. 방열판 — 펠티어 바깥쪽 열을 아래로 받아 팬으로 내보냄 */
{
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 1.2), M.alu); g.add(base);
  for (let i = 0; i < 13; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.26, 1.2), M.alu); f.position.set(-0.75 + i * 0.125, -0.155, 0); g.add(f); }
  g.position.set(0, TANK_Y0 - 0.125, 0);
  part('방열판 · 열을 밖으로', g, [0, 0.2, 0], new THREE.Vector3(0.8, -0.1, 0.6), true);
}
/* 11. 팬 — 방열판 사이 공기를 뒤 슬릿으로 */
function fan(size = 0.4) {
  const g = new THREE.Group();
  const s = rrect(size, size, 0.05); const hole = new THREE.Path(); hole.absarc(0, 0, size * 0.46, 0, Math.PI * 2, true); s.holes.push(hole);
  const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: false, curveSegments: 32 }), M.dark); frame.position.z = -0.05; g.add(frame);
  const rotor = new THREE.Group();
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 24), M.dark); hub.rotation.x = Math.PI / 2; rotor.add(hub);
  for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.07, 0.01), M.dark); const a = i / 7 * Math.PI * 2; b.position.set(Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0); b.rotation.z = a; b.rotation.x = 0.45; rotor.add(b); }
  rotor.userData.spin = true; g.add(rotor);
  return g;
}
{
  const g = fan(0.4);
  g.position.set(0.9, 0.26, -D / 2 + 0.16);
  part('팬 · 뒤로 배기', g, [0, 0.05, -1.4], new THREE.Vector3(0.25, 0.1, 0), true);
}
/* 12. 펌프 모터 — 물통 밖(아래)에서 자석으로 임펠러를 돌림. 물에 닿는 전기부 없음 */
{
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.16, 24), M.dark); g.add(body);
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 10, 24), M.copper); coil.rotation.x = Math.PI / 2; coil.position.y = 0.06; g.add(coil);
  g.position.set(1.05, TANK_Y0 - 0.1, -0.5);
  part('자석 구동 펌프 모터', g, [2.0, 0.5, 0.7], new THREE.Vector3(0.15, -0.05, 0), true);
}
/* 13. 제어 보드 — 버튼 1·LED·펠티어 H브리지·펌프·팬·완료 감지 */
{
  const g = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.36, 0.02), M.pcb); g.add(board);
  const mcu = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.03), M.chip); mcu.position.set(-0.45, 0.02, 0.02); g.add(mcu);
  [[-0.1, 0.08], [0.08, 0.08], [-0.1, -0.08], [0.08, -0.08]].forEach(([x, y]) => { const q = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.04), M.chip); q.position.set(x, y, 0.025); g.add(q); });
  [0.4, 0.55].forEach(x => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 16), M.cap); c.rotation.x = Math.PI / 2; c.position.set(x, 0, 0.07); g.add(c); });
  const conn = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.08), M.ceramic); conn.position.set(-0.65, -0.1, 0.04); g.add(conn);
  g.position.set(0, 0.25, D / 2 - 0.13);
  part('제어 보드 · 버튼 1 · H브리지 · 완료 감지', g, [0, 0.0, 1.3], new THREE.Vector3(0.75, 0.1, 0), true);
}
/* 14. 버튼 — 앞면 하나. 파란 링은 해동 중, 초록은 완료 */
const btn = new THREE.Group();
{
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.016, 12, 48), M.btnRing); btn.add(ring);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.03, 32), M.btnCap); cap.rotation.x = Math.PI / 2; btn.add(cap);
  btn.position.set(0, 0.26, D / 2 + 0.04 + 0.015);
  part('버튼 1개 · 시작/정지', btn, [0, 0, 2.1], new THREE.Vector3(0.2, 0, 0));
}
/* 15. 뒷면 — 배기 슬릿 · 12V 단자 · 명판 */
{
  const g = new THREE.Group();
  for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.02), M.vent); s.position.set(0.5 + i * 0.11, 0, 0); g.add(s); }
  const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 20), M.dark); jack.rotation.x = Math.PI / 2; jack.position.set(-1.0, 0, 0); g.add(jack);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.01), M.label); plate.position.set(-0.3, 0, 0); g.add(plate);
  g.position.set(0, 0.26, -D / 2 - 0.045);
  part('뒷면 · 배기 슬릿 · 12V 단자', g, [0, 0, -1.6], new THREE.Vector3(0.9, 0, 0));
}
/* 16. 12V 어댑터 — 바깥, KC 받은 기성품 */
{
  const g = new THREE.Group();
  const brick = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.3, 0.45, 2, 0.04), M.dark); brick.position.set(1.7, 0.15, -1.75); g.add(brick);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(1.3, 0.15, -1.75), new THREE.Vector3(0.2, 0.1, -1.9), new THREE.Vector3(-0.8, 0.2, -1.5), new THREE.Vector3(-1.0, 0.26, -D / 2 - 0.07)]), 30, 0.014, 6), M.wireB); g.add(cable);
  g.name = 'adapter';
  part('12V 외장 어댑터 · 기성품', g, [0.9, 0, -0.9], new THREE.Vector3(1.7, 0.3, -1.75));
}
/* 물살 — 임펠러에서 나와 고기 아래·위를 한 바퀴 */
const flowG = new THREE.Group(); product.add(flowG);
{
  const y = TANK_Y0 + TT;
  const pts = [new THREE.Vector3(0.95, y + 0.12, -0.5), new THREE.Vector3(0.2, y + 0.08, -0.62), new THREE.Vector3(-0.9, y + 0.1, -0.3), new THREE.Vector3(-1.0, y + 0.3, 0.45), new THREE.Vector3(-0.2, y + 0.7, 0.5), new THREE.Vector3(0.7, y + 0.65, 0.1), new THREE.Vector3(1.05, y + 0.35, -0.4)];
  const c = new THREE.CatmullRomCurve3(pts, true);
  flowG.add(new THREE.Mesh(new THREE.TubeGeometry(c, 90, 0.014, 6, true), M.flow));
  flowG.userData.curve = c;
  for (let i = 0; i < 12; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), M.flow); d.userData.t = i / 12; flowG.add(d); }
}

/* 바닥 그림자 */
const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.09 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -H / 2 - 0.001; ground.receiveShadow = true; scene.add(ground);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 8;
Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
product.traverse(o => { if (o.isMesh && o.material !== M.glass && o.material !== M.bag && o.material !== M.water && o.material !== M.flow) o.castShadow = true; });
product.position.y = -H / 2;

/* ---------- 스크롤 ---------- */
const Q = new URLSearchParams(location.search);
product.traverse(o => { if (o.name && Q.has('no' + o.name)) o.visible = false; });   // 디버그: ?nowater ?nolid ?nobag
const CY = +(Q.get('cy') || 0);
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
  // 0~.1 앞모습 · .1~.28 뒤로 돌아 뒷모습 · .28~.5 분해 · .5~.74 분해 유지 · .74~.95 조립하며 앞으로
  const e = p < 0.28 ? 0 : p < 0.5 ? ease((p - 0.28) / 0.22) : p < 0.74 ? 1 : p < 0.95 ? 1 - ease((p - 0.74) / 0.21) : 0;
  parts.forEach(({ obj }) => obj.position.copy(obj.userData.home).addScaledVector(obj.userData.off, e));
  const ghost = p < 0.26 ? 0 : p < 0.34 ? (p - 0.26) / 0.08 : p < 0.8 ? 1 : p < 0.92 ? 1 - (p - 0.8) / 0.12 : 0;
  M.case.opacity = 1 - 0.86 * ghost; M.case.depthWrite = ghost < 0.01;
  M.band.opacity = 1 - 0.8 * ghost; M.band.depthWrite = ghost < 0.01;
  parts.forEach(({ obj }) => { if (obj.userData.inner) obj.visible = ghost > 0.02; });
  M.water.opacity = 0.4 * (1 - e);

  const FRONT = 0.42, BACK = Math.PI + 0.5, XA = 0.8, XB = 1.2;
  const ang = p < 0.1 ? FRONT
    : p < 0.28 ? FRONT + (BACK - FRONT) * ease((p - 0.1) / 0.18)
    : p < 0.5 ? BACK + (XA - BACK) * ease((p - 0.28) / 0.22)
    : p < 0.74 ? XA + (XB - XA) * ((p - 0.5) / 0.24)
    : p < 0.95 ? XB + (FRONT - XB) * ease((p - 0.74) / 0.21) : FRONT;
  ground.material.opacity = 0.09 * (1 - e);
  const dist = 9.5 + e * 9.5;
  camera.position.set(Math.sin(ang) * dist, 6.4 + CY + e * 1.2, Math.cos(ang) * dist);
  camera.lookAt(0, -0.3 + e * 2.1, 0);
  const fk = new URLSearchParams(location.search).get('focus');
  if (fk) { const pt = parts.find(q => q.el.textContent.includes(fk)); if (pt) { const c = new THREE.Box3().setFromObject(pt.obj).getCenter(new THREE.Vector3()); camera.position.set(c.x + 1.0, c.y + 1.3, c.z + 1.0); camera.lookAt(c); } }

  // 버튼 링: 해동 중(파랑) 숨 쉬듯 켜짐
  M.btnRing.emissiveIntensity = 0.7 + 0.5 * Math.sin(now / 600);
  product.traverse(o => { if (o.userData.spin) o.rotation.z += dt * (2 + 10 * (1 - e)); if (o.userData.spinY) o.rotation.y += dt * (3 + 12 * (1 - e)); });

  // 물살: 조립 상태(처음·끝)에서만 보임
  const flowOn = (p < 0.1 || p > 0.96) ? 0.9 : 0;
  M.flow.opacity += (flowOn - M.flow.opacity) * 0.1;
  const c = flowG.userData.curve;
  flowG.children.forEach(ch => { if (ch.userData.t !== undefined) { ch.userData.t = (ch.userData.t + dt * 0.1) % 1; ch.position.copy(c.getPointAt(ch.userData.t)); } });

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

  const idx = p < 0.1 ? 0 : p < 0.3 ? 1 : p < 0.76 ? 2 : 3;
  stepEls.forEach((s, i) => s.classList.toggle('on', i === idx));
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
setColor(new URLSearchParams(location.search).get('c') || 'sky');
document.querySelectorAll('[data-xv-color]').forEach(b => b.addEventListener('click', () => setColor(b.dataset.xvColor)));
document.documentElement.classList.add('xv-ready');
