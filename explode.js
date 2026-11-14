import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// 휴롬 급속 해동기(가칭) · 구조 3D v2 — 물 재킷 트레이형. 단위 10cm. 바깥 약 24 × 18 × 11cm(W×D×H) · 뚜껑이 몸체와 평평한 납작 상자
// 원물은 스테인리스 트레이에 그대로 올리고, 물은 트레이 바깥 알루미늄 재킷 안에 밀봉돼 돈다(사용자는 물을 만지지 않는다).
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
  case: new THREE.MeshPhysicalMaterial({ color: 0xf6f3ec, roughness: 0.6, clearcoat: 0.15, clearcoatRoughness: 0.5, transparent: true, opacity: 1 }),
  band: new THREE.MeshStandardMaterial({ color: 0xf2c84b, roughness: 0.7, transparent: true, opacity: 1 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xe9ecef, metalness: 0.5, roughness: 0.3 }),
  alu: new THREE.MeshStandardMaterial({ color: 0xc9ced4, metalness: 0.9, roughness: 0.35, transparent: true, opacity: 1 }),
  aluHandle: new THREE.MeshStandardMaterial({ color: 0xd8dde3, metalness: 0.95, roughness: 0.25 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x3a3c40, roughness: 0.6 }),
  ceramic: new THREE.MeshStandardMaterial({ color: 0xf4f2ee, roughness: 0.4 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0xd4d9df, roughness: 0.06, transparent: true, opacity: 0.26, envMapIntensity: 0.8, depthWrite: false }),
  water: new THREE.MeshPhysicalMaterial({ color: 0x5fa9ee, roughness: 0.35, transparent: true, opacity: 0.55, envMapIntensity: 0.3, depthWrite: false }),
  meat: new THREE.MeshStandardMaterial({ color: 0xcf6f6f, roughness: 0.72 }),
  fat: new THREE.MeshStandardMaterial({ color: 0xf3e4d8, roughness: 0.8 }),
  pcb: new THREE.MeshStandardMaterial({ color: 0x1f6b3a, roughness: 0.7 }),
  chip: new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.5 }),
  cap: new THREE.MeshStandardMaterial({ color: 0x3f4a8a, roughness: 0.5 }),
  copper: new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.75, roughness: 0.35 }),
  wireR: new THREE.MeshStandardMaterial({ color: 0xd23a2f, roughness: 0.5 }),
  wireB: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 }),
  tube: new THREE.MeshStandardMaterial({ color: 0xbfd8f0, roughness: 0.4, transparent: true, opacity: 0.8 }),
  vent: new THREE.MeshStandardMaterial({ color: 0x55575c, roughness: 0.7 }),
  label: new THREE.MeshStandardMaterial({ color: 0xd9d6cf, roughness: 0.6 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: 0.9 }),
  btnRing: new THREE.MeshStandardMaterial({ color: 0x5aa0ff, emissive: 0x2f7ef5, emissiveIntensity: 2.0, metalness: 0.2, roughness: 0.4 }),
  btnCap: new THREE.MeshStandardMaterial({ color: 0xdedad2, metalness: 0.3, roughness: 0.4 }),
  flow: new THREE.MeshBasicMaterial({ color: 0x2f86ea, transparent: true, opacity: 0 }),
  air: new THREE.MeshBasicMaterial({ color: 0x7cc4f5, transparent: true, opacity: 0 }),
};

/* ---------- 치수 (10cm 단위) ---------- */
const W = 2.4, D = 1.8, BASE = 0.22, BODY = 0.88, H = BASE + BODY, R = 0.45;   // 모서리는 조약돌처럼 크게 · 높이 11cm
const TW = 2.0, TD = 1.4, TDEEP = 0.32, TT = 0.008;       // 트레이 안쪽 20 × 14cm · 깊이 3.2cm · 스테인리스 0.8mm
const AIR = 0.2;                                            // 트레이 위 공기층 2cm(순환 팬 바람길)
const JW = 2.16, JD = 1.56, JH = 0.4, JY0 = H - AIR - JH;  // 재킷 바깥 21.6 × 15.6cm · 높이 4cm · 바닥 y=0.5
const TRAY_Y0 = JY0 + 0.08;                                // 트레이 바닥 높이(재킷 바닥판 위) = 0.58
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
function extrudeUp(shape, height, mat, y0, bevel = 0.03) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: height - 2 * bevel, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 24 });
  const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.y = y0 + bevel; return m;
}

/* 하단 색 — 서늘고와 같은 3색(노랑·보라·빨강) */
const COLORS = { yellow: 0xf2c84b, purple: 0x8e6bc8, red: 0xe4573f };
function setColor(k) {
  M.band.color.set(COLORS[k] || COLORS.yellow);
  document.querySelectorAll('[data-xv-color]').forEach(b => b.classList.toggle('on', b.dataset.xvColor === k));
}
window.xvSetColor = setColor;

/* 1. 몸체(흰 무광 사출) — 가운데에 재킷 자리가 뚫린 낮은 틀. 나사·통풍구 없음 */
{
  const s = rrect(W, D, R); s.holes.push(rrect(JW + 0.04, JD + 0.04, 0.15));
  const m = extrudeUp(s, BODY, M.case, BASE);
  part('몸체 · 흰 무광 사출(금형 1)', m, [0, 0, 0], new THREE.Vector3(-1.05, 0.45, 0.75));
}
/* 2. 하단 몸통(색) — 전기부가 들어가는 얇은 받침. 흡기 슬릿은 바닥에 숨김 */
{
  const m = extrudeUp(rrect(W, D, R), BASE, M.band, 0);
  part('하단 몸통 · 3색 중 하나(금형 2)', m, [0, 0, 0], new THREE.Vector3(1.05, 0.11, 0.75));
}
/* 3. 트레이 — 스테인리스 0.8mm, 원물을 그대로 올림. 가장자리 핏물 홈, 들어서 빼고 식기세척기 */
const tray = new THREE.Group();
{
  const w = TW, d = TD, t = 0.012;
  const floor = new THREE.Mesh(new THREE.BoxGeometry(w, t, d), M.steel); floor.position.y = t / 2; tray.add(floor);
  // 가운데 받침면이 살짝 솟고, 둘레 1cm 가 핏물 홈이 된다
  const deck = new THREE.Mesh(new RoundedBoxGeometry(w - 0.2, 0.03, d - 0.2, 2, 0.01), M.steel); deck.position.y = t + 0.015; tray.add(deck);
  [[0, d / 2 - t / 2, w, t], [0, -d / 2 + t / 2, w, t]].forEach(([x, z, bw, bd]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(bw, TDEEP, bd), M.steel); m.position.set(x, TDEEP / 2, z); tray.add(m); });
  [w / 2 - t / 2, -w / 2 + t / 2].forEach(x => { const m = new THREE.Mesh(new THREE.BoxGeometry(t, TDEEP, d - 2 * t), M.steel); m.position.set(x, TDEEP / 2, 0); tray.add(m); });
  // 위 테두리(재킷 위에 걸치는 턱) — 손가락이 들어가는 폭
  const rimS = rrect(w + 0.3, d + 0.3, 0.14); rimS.holes.push(rrect(w - 0.01, d - 0.01, 0.05));
  const rimM = new THREE.Mesh(new THREE.ExtrudeGeometry(rimS, { depth: 0.025, bevelEnabled: false, curveSegments: 24 }), M.steel); rimM.rotation.x = -Math.PI / 2; rimM.position.y = TDEEP; tray.add(rimM);
  tray.position.set(0, TRAY_Y0, 0);
  part('트레이 · 스테인리스 0.8mm · 핏물 홈 · 들어서 뺌', tray, [0, 2.0, 0], new THREE.Vector3(-1.0, 0.3, 0.7));
}
/* 4. 원물 고기 — 지퍼백 없이 트레이에 그대로 */
{
  const g = new THREE.Group();
  const meat = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.22, 0.85, 3, 0.07), M.meat); g.add(meat);
  [[-0.35, 0.12], [0.05, -0.1], [0.4, 0.2]].forEach(([x, z]) => { const f = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.23, 0.14, 2, 0.05), M.fat); f.position.set(x, 0, z); f.rotation.y = 0.3; g.add(f); });
  g.name = 'meat';
  g.position.set(0, TRAY_Y0 + 0.045 + 0.11, 0);
  part('원물 고기 · 포장 없이 그대로', g, [0, 2.8, 0], new THREE.Vector3(0.65, 0.12, 0.1));
}
/* 5. 뚜껑 — 평평한 스모크 유리판. 몸체 윗면과 같은 높이로 들어가 쌓거나 서랍에 넣기 좋다. 앞쪽 알루미늄 손끝 홈 */
{
  const g = new THREE.Group();
  const LW = JW + 0.02, LD = JD + 0.02;
  const lid = new THREE.Mesh(new RoundedBoxGeometry(LW, 0.07, LD, 3, 0.02), M.glass); lid.name = 'lid'; g.add(lid);
  const strip = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.075, 0.1, 2, 0.02), M.aluHandle); strip.position.set(0, 0.0, LD / 2 - 0.05); g.add(strip);
  const sealS = rrect(LW - 0.02, LD - 0.02, 0.14); sealS.holes.push(rrect(LW - 0.16, LD - 0.16, 0.1));
  const seal = new THREE.Mesh(new THREE.ExtrudeGeometry(sealS, { depth: 0.015, bevelEnabled: false, curveSegments: 24 }), M.rubber); seal.rotation.x = -Math.PI / 2; seal.position.y = -0.05; g.add(seal);
  g.position.set(0, H - 0.035, 0);
  part('뚜껑 · 평평한 스모크 유리 · 몸체와 같은 높이', g, [0, 3.7, 0], new THREE.Vector3(0.85, 0.05, 0.4));
}
/* 6. 물 재킷 — 알루미늄 다이캐스팅. 트레이 바닥·옆 네 면을 감싸는 밀봉 물길 */
const jacket = new THREE.Group();
{
  const s = rrect(JW, JD, 0.14); s.holes.push(rrect(TW + 0.02, TD + 0.02, 0.05));
  const wall = extrudeUp(s, JH - 0.08, M.alu, 0.08, 0.02); jacket.add(wall);
  const bottom = new THREE.Mesh(new RoundedBoxGeometry(JW, 0.08, JD, 2, 0.02), M.alu); bottom.position.y = 0.04; jacket.add(bottom);
  // 재킷 옆면에 붙는 물 온도 센서
  const ntc = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.05), M.chip); ntc.position.set(-0.6, 0.2, JD / 2 + 0.02); jacket.add(ntc);
  jacket.position.set(0, JY0, 0);
  part('물 재킷 · 알루미늄 · 밀봉 0.5L · 온도 센서', jacket, [0, 1.1, 0], new THREE.Vector3(-1.05, 0.2, 0.6));
}
/* 7. 재킷 속 물 — 사용자가 붓거나 버리지 않는다. 처음부터 밀봉 */
const jwater = new THREE.Group();
{
  const s = rrect(JW - 0.04, JD - 0.04, 0.13); s.holes.push(rrect(TW + 0.05, TD + 0.05, 0.05));
  const ring = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: JH - 0.12, bevelEnabled: false, curveSegments: 24 }), M.water); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.1; jwater.add(ring);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(JW - 0.06, 0.04, JD - 0.06), M.water); slab.position.y = 0.04; jwater.add(slab);
  jwater.name = 'water';
  jwater.position.set(0, JY0, 0);
  part('재킷 속 물 · 15°C 로 돈다', jwater, [0, 1.1, 0], new THREE.Vector3(1.05, 0.25, 0.3), true);
}
/* 8. 펠티어 2개 + 구리 열전달 블록 — 재킷 바닥 가운데. 전류 방향을 바꿔 가열(해동)·냉각(보관) */
{
  const g = new THREE.Group();
  const block = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.5), M.copper); block.position.y = 0.065; g.add(block);
  [-0.3, 0.3].forEach(x => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.4), M.ceramic); c.position.set(x, 0.02, 0); g.add(c);
    const r = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(x + 0.2, 0.02, 0.18), new THREE.Vector3(x + 0.3, -0.02, 0.4), new THREE.Vector3(x + 0.3, -0.06, 0.7)]), 10, 0.009, 6), M.wireR); g.add(r);
    const b = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(x + 0.2, 0.02, -0.18), new THREE.Vector3(x + 0.3, -0.02, 0.1), new THREE.Vector3(x + 0.34, -0.06, 0.7)]), 10, 0.009, 6), M.wireB); g.add(b);
  });
  g.position.set(0, JY0 - 0.09, 0);
  part('펠티어 2개 + 구리 블록 · 가열 ↔ 냉각', g, [0, 0.35, 0], new THREE.Vector3(0.6, 0.05, 0.2), true);
}
/* 9. 방열판 — 펠티어 바깥쪽 열을 아래로 받는다 */
{
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.9), M.alu); g.add(base);
  for (let i = 0; i < 12; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.18, 0.9), M.alu); f.position.set(-0.68 + i * 0.124, -0.11, 0); g.add(f); }
  g.position.set(0, JY0 - 0.12, 0);
  part('방열판 · 열을 아래로', g, [0, -0.35, 0], new THREE.Vector3(0.7, -0.1, 0.45), true);
}
/* 10. 팬 — 납작하게 눕혀 바닥 흡기 → 방열판 → 뒤 아래 슬릿으로 */
function fan(size = 0.5) {
  const g = new THREE.Group();
  const s = rrect(size, size, 0.05); const hole = new THREE.Path(); hole.absarc(0, 0, size * 0.46, 0, Math.PI * 2, true); s.holes.push(hole);
  const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: false, curveSegments: 32 }), M.dark); frame.rotation.x = -Math.PI / 2; frame.position.y = -0.05; g.add(frame);
  const rotor = new THREE.Group();
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 24), M.dark); rotor.add(hub);
  for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.01, 0.07), M.dark); const a = i / 7 * Math.PI * 2; b.position.set(Math.cos(a) * 0.14, 0, Math.sin(a) * 0.14); b.rotation.y = -a; b.rotation.x = 0.45; rotor.add(b); }
  rotor.userData.spinY = true; g.add(rotor);
  return g;
}
{
  const g = fan(0.5);
  g.position.set(0, 0.11, 0);
  part('팬 · 바닥 흡기 → 뒤 배기', g, [0, -1.0, 0], new THREE.Vector3(0.3, 0, 0.1), true);
}
/* 11. 소형 펌프 — 재킷 물을 돌린다. 밀봉 회로라 물에 닿는 전기부 없음 */
{
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.16, 24), M.dark); body.rotation.z = Math.PI / 2; g.add(body);
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 10, 24), M.copper); coil.rotation.y = Math.PI / 2; coil.position.x = 0.05; g.add(coil);
  // 재킷으로 가는 호스 2개
  const t1 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.1, 0.06, 0), new THREE.Vector3(0.25, 0.18, 0.05), new THREE.Vector3(0.3, 0.3, 0.1)]), 10, 0.02, 8), M.tube); g.add(t1);
  const t2 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.1, 0.06, 0), new THREE.Vector3(-0.2, 0.18, -0.1), new THREE.Vector3(-0.1, 0.3, -0.2)]), 10, 0.02, 8), M.tube); g.add(t2);
  g.position.set(-0.95, 0.3, -0.55);
  part('소형 펌프 · 재킷 물을 돌림', g, [-1.5, 0.6, 0.4], new THREE.Vector3(0.0, -0.08, 0), true);
}
/* 12. 제어 보드 — 버튼 1·LED·펠티어 H브리지·펌프·팬·완료 감지 */
{
  const g = new THREE.Group();
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.02), M.pcb); g.add(board);
  const mcu = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.03), M.chip); mcu.position.set(-0.4, 0.0, 0.02); g.add(mcu);
  [[-0.1, 0.07], [0.06, 0.07], [-0.1, -0.07], [0.06, -0.07]].forEach(([x, y]) => { const q = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.04), M.chip); q.position.set(x, y, 0.025); g.add(q); });
  [0.35, 0.5].forEach(x => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.11, 16), M.cap); c.rotation.x = Math.PI / 2; c.position.set(x, 0, 0.065); g.add(c); });
  g.position.set(0, 0.3, D / 2 - 0.14);
  part('제어 보드 · 버튼 1 · H브리지 · 완료 감지', g, [0, -0.3, 1.3], new THREE.Vector3(0.65, 0.08, 0), true);
}
/* 13. 버튼 — 앞면 하나. 파란 링은 해동 중, 초록은 완료 */
const btn = new THREE.Group();
{
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.012, 12, 48), M.btnRing); ring.position.z = 0.01; btn.add(ring);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.05, 48), M.btnCap); cap.rotation.x = Math.PI / 2; btn.add(cap);
  btn.position.set(0, 0.5, D / 2 + 0.03);
  part('버튼 1개 · 시작/정지', btn, [0, 0.1, 2.0], new THREE.Vector3(0.18, 0, 0));
}
/* 14. 뒷면 아래 — 배기 슬릿(턱 아래 숨김) · 12V 단자 · 명판 */
{
  const g = new THREE.Group();
  for (let i = 0; i < 9; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.1, 0.02), M.vent); s.position.set(0.2 + i * 0.09, 0, 0); g.add(s); }
  const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 20), M.dark); jack.rotation.x = Math.PI / 2; jack.position.set(-0.85, 0.02, 0); g.add(jack);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.01), M.label); plate.position.set(-0.4, 0, 0); g.add(plate);
  g.position.set(0, 0.12, -D / 2 - 0.045);
  part('뒷면 아래 · 배기 슬릿 · 12V 단자', g, [0, -0.2, -1.5], new THREE.Vector3(0.7, 0, 0));
}
/* 15. 바닥 — 고무발 4개 · 흡기 슬릿(보이지 않는 자리) */
{
  const g = new THREE.Group();
  [[-1.0, -0.7], [1.0, -0.7], [-1.0, 0.7], [1.0, 0.7]].forEach(([x, z]) => { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 20), M.rubber); f.position.set(x, -0.015, z); g.add(f); });
  for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.01, 0.03), M.vent); s.position.set(0, 0.0, -0.3 + i * 0.1); g.add(s); }
  g.position.set(0, 0, 0);
  part('바닥 · 고무발 · 흡기 슬릿 숨김', g, [0, -1.6, 0], new THREE.Vector3(-1.0, 0, 0.7), true);
}
/* 16. 챔버 순환 팬 — 뒤 벽 속 30mm. 뚜껑 아래 공기를 돌려 고기 윗면도 15°C 공기가 스친다 */
{
  const g = new THREE.Group();
  const s = rrect(0.3, 0.3, 0.04); const hole = new THREE.Path(); hole.absarc(0, 0, 0.135, 0, Math.PI * 2, true); s.holes.push(hole);
  const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: false, curveSegments: 32 }), M.dark); frame.position.z = -0.035; g.add(frame);
  const rotor = new THREE.Group();
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 20), M.dark); hub.rotation.x = Math.PI / 2; rotor.add(hub);
  for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.01), M.dark); const a = i / 5 * Math.PI * 2; b.position.set(Math.cos(a) * 0.085, Math.sin(a) * 0.085, 0); b.rotation.z = a; b.rotation.x = 0.45; rotor.add(b); }
  rotor.userData.spin = true; g.add(rotor);
  // 덕트: 재킷 뒤 벽 가운데의 마른 통로 (물길이 비켜 감)
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.01), M.steel); grille.position.set(0, 0, 0.06); g.add(grille);
  [-0.75, 0.75].forEach(x => { const o = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.01), M.vent); o.position.set(x, -0.02, 0.06); g.add(o); });
  g.position.set(0, H - AIR / 2 - 0.04, -(JD / 2 + 0.07));
  part('안쪽 순환 팬 · 뒤 벽 속 30mm · 망 뒤', g, [0, 1.3, -1.2], new THREE.Vector3(0.2, 0.05, 0), true);
}
/* 17. 12V 어댑터 — 바깥, KC 받은 기성품 */
{
  const g = new THREE.Group();
  const brick = new THREE.Mesh(new RoundedBoxGeometry(0.8, 0.26, 0.4, 2, 0.04), M.dark); brick.position.set(1.5, 0.13, -1.5); g.add(brick);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(1.1, 0.13, -1.5), new THREE.Vector3(0.2, 0.08, -1.7), new THREE.Vector3(-0.7, 0.15, -1.3), new THREE.Vector3(-0.85, 0.14, -D / 2 - 0.07)]), 30, 0.013, 6), M.wireB); g.add(cable);
  g.name = 'adapter';
  part('12V 외장 어댑터 · 기성품(60W)', g, [1.0, -0.6, -0.6], new THREE.Vector3(1.5, 0.28, -1.5));
}
/* 물살 — 재킷 벽 속을 한 바퀴 (바닥 → 옆 네 면 → 펌프로) */
const flowG = new THREE.Group(); product.add(flowG);
{
  const y = JY0 + 0.22, X = TW / 2 + 0.045, Z = TD / 2 + 0.045;
  const pts = [new THREE.Vector3(-X, y, -Z * 0.3), new THREE.Vector3(-X, y, Z * 0.6), new THREE.Vector3(-X * 0.6, y, Z), new THREE.Vector3(X * 0.6, y, Z), new THREE.Vector3(X, y, Z * 0.6), new THREE.Vector3(X, y, -Z * 0.6), new THREE.Vector3(X * 0.6, y, -Z), new THREE.Vector3(-X * 0.6, y, -Z)];
  const c = new THREE.CatmullRomCurve3(pts, true);
  flowG.add(new THREE.Mesh(new THREE.TubeGeometry(c, 100, 0.012, 6, true), M.flow));
  flowG.userData.curve = c;
  for (let i = 0; i < 14; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), M.flow); d.userData.t = i / 14; flowG.add(d); }
}

/* 공기 흐름 — 뚜껑 아래: 뒤 구석에서 나와 옆을 타고 앞으로, 고기 위를 지나 뒤 가운데로 */
const airG = new THREE.Group(); product.add(airG);
const airCurves = [];
{
  const y = H - AIR / 2 - 0.02;
  [[-1, 1], [1, -1]].forEach(([sx]) => {
    const pts = [new THREE.Vector3(sx * 0.8, y - 0.05, -0.62), new THREE.Vector3(sx * 0.9, y, -0.1), new THREE.Vector3(sx * 0.85, y + 0.02, 0.5), new THREE.Vector3(sx * 0.3, y + 0.05, 0.6), new THREE.Vector3(sx * 0.1, y + 0.03, 0.0), new THREE.Vector3(0, y, -0.62)];
    const c = new THREE.CatmullRomCurve3(pts, false); airCurves.push(c);
    airG.add(new THREE.Mesh(new THREE.TubeGeometry(c, 60, 0.008, 6, false), M.air));
    for (let i = 0; i < 7; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), M.air); d.userData.t = i / 7; d.userData.c = c; airG.add(d); }
  });
}

/* 바닥 그림자 */
const ground = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.09 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -H / 2 - 0.001; ground.receiveShadow = true; scene.add(ground);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 8;
Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
product.traverse(o => { if (o.isMesh && o.material !== M.glass && o.material !== M.water && o.material !== M.flow && o.material !== M.air) o.castShadow = true; });
product.position.y = -H / 2;

/* ---------- 스크롤 ---------- */
const Q = new URLSearchParams(location.search);
product.traverse(o => { if (o.name && Q.has('no' + o.name)) o.visible = false; });   // 디버그: ?nowater ?nolid ?nomeat ?noadapter
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
  // 0~.1 앞모습 · .1~.26 뒤로 돌아 뒷모습 · .26~.4 몸체 투명 + 재킷 물살 · .4~.58 분해 · .58~.76 분해 유지 · .76~.95 조립하며 앞으로
  const e = p < 0.4 ? 0 : p < 0.58 ? ease((p - 0.4) / 0.18) : p < 0.76 ? 1 : p < 0.95 ? 1 - ease((p - 0.76) / 0.19) : 0;
  parts.forEach(({ obj }) => obj.position.copy(obj.userData.home).addScaledVector(obj.userData.off, e));
  const ghost = p < 0.24 ? 0 : p < 0.32 ? (p - 0.24) / 0.08 : p < 0.82 ? 1 : p < 0.94 ? 1 - (p - 0.82) / 0.12 : 0;
  M.case.opacity = 1 - 0.86 * ghost; M.case.depthWrite = ghost < 0.01;
  M.band.opacity = 1 - 0.8 * ghost; M.band.depthWrite = ghost < 0.01;
  // 재킷은 물살 구간(분해 전)에만 비친다. 분해되면 다시 불투명
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
  ground.material.opacity = 0.09 * (1 - e);
  const dist = 7.2 + e * 8.2;
  const camY = p < 0.26 ? 3.2 : p < 0.4 ? 3.2 + 1.2 * ease((p - 0.26) / 0.14) : 4.4;
  camera.position.set(Math.sin(ang) * dist, camY + CY + e * 2.2, Math.cos(ang) * dist);
  camera.lookAt(0, -0.15 + e * 1.15, 0);
  const fk = Q.get('focus');
  if (fk) { const pt = parts.find(q => q.el.textContent.includes(fk)); if (pt) { const c = new THREE.Box3().setFromObject(pt.obj).getCenter(new THREE.Vector3()); camera.position.set(c.x + 1.0, c.y + 1.2, c.z + 1.0); camera.lookAt(c); } }

  // 버튼 링: 해동 중(파랑) 숨 쉬듯 켜짐
  M.btnRing.emissiveIntensity = 1.4 + 0.8 * Math.sin(now / 600);
  product.traverse(o => { if (o.userData.spinY) o.rotation.y += dt * (3 + 10 * (1 - e)); if (o.userData.spin) o.rotation.z += dt * (3 + 10 * (1 - e)); });
  // 공기 흐름: 조립 상태(처음·끝)와 물살 구간에 보임
  const airOn = (p < 0.1 || p > 0.96) ? 0.9 : (ghost > 0.3 && e < 0.4) ? 0.7 * (1 - e / 0.4) : 0;
  M.air.opacity += (airOn - M.air.opacity) * 0.1;
  airG.children.forEach(ch => { if (ch.userData.c) { ch.userData.t = (ch.userData.t + dt * 0.12) % 1; ch.position.copy(ch.userData.c.getPointAt(ch.userData.t)); } });

  // 물살: 몸체가 비치는 구간(분해 전)에만 보임
  const flowOn = (ghost > 0.3 && e < 0.4) ? 0.95 * (1 - e / 0.4) : 0;
  M.flow.opacity += (flowOn - M.flow.opacity) * 0.1;
  const c = flowG.userData.curve;
  flowG.children.forEach(ch => { if (ch.userData.t !== undefined) { ch.userData.t = (ch.userData.t + dt * 0.08) % 1; ch.position.copy(c.getPointAt(ch.userData.t)); } });

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
setColor(Q.get('c') || 'yellow');
document.querySelectorAll('[data-xv-color]').forEach(b => b.addEventListener('click', () => setColor(b.dataset.xvColor)));
document.documentElement.classList.add('xv-ready');
