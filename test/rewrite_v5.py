import re, sys, io
p='../index.html'; s=open(p,encoding='utf-8').read()
def rep(a,b):
    global s
    if a not in s:
        print('MISSING:', a[:70]); return
    s=s.replace(a,b)
def sec(id_, new):
    global s
    m=re.search(r'<section id="%s"[^>]*>.*?</section>' % id_, s, re.S); assert m, id_
    s=s[:m.start()]+new+s[m.end():]

rep("기획 제안서 v3 (UC-B01 결)</title>","기획 제안서 v4 (U4 납작형 · UC-B01 계열)</title>")
rep('<li><a href="#design">형태·부피</a></li>','<li><a href="#design">디자인</a></li>')
rep('alt="휴롬 급속 해동기 v3 구조 모형 렌더 · 초음파 세척기 UC-B01 결의 유광 블랙 몸체"','alt="휴롬 급속 해동기 v4 구조 모형 렌더 · 식자재 세척기 UC-B01 계열 · 흰 하단 · 스모크 칸 · 뒤 조작부"')
rep('<div class="eyebrow">휴롬 신제품 기획 제안서 v3 ·','<div class="eyebrow">휴롬 신제품 기획 제안서 v4 ·')
rep('<div class="sub">냉동 고기를 올리기만 하면, 15°C 물이 트레이 바깥에서 돕니다</div>','<div class="sub">냉동 고기를 올리기만 하면, 15°C 냉각판과 15°C 바람이 감쌉니다</div>')
rep('급속 해동기는 고기를 스테인리스 트레이에 그대로 올리고 상판의 「시작」을 한 번 누르면 됩니다. 물은 트레이 바깥의 밀봉된 재킷 안에서만 돌고, 사용자는 물을 붓지도 버리지도 않습니다.',
    '급속 해동기는 고기를 스테인리스 트레이에 그대로 올리고 뒤쪽 조작부의 「시작」을 한 번 누르면 됩니다. 물은 트레이 아래 밀봉된 냉각판 속에서만 돌고, 사용자는 물을 붓지도 버리지도 않습니다.')
rep('<span class="chip">터치 한 번 · 남은 시간 표시</span>','<span class="chip">터치 한 번 · 15°C 표시</span>')
rep('<span class="chip">24×18×11cm · 서랍에 들어감</span>','<span class="chip">26×25×9cm · 높이 9cm</span>')
# summary
rep('트레이 바닥과 옆 네 면을 감싼 밀봉 물 재킷이 15°C 안팎으로 돌고, 뚜껑 아래 작은 팬이 같은 온도의','트레이 아래 밀봉 냉각판 속 물이 15°C 안팎으로 돌고, 뒤 벽의 작은 팬이 같은 온도의')
rep('30×18×22cm(11.9L) → <b>24×18×11cm(4.8L)</b>, 부피 60% 감소.','30×18×22cm(11.9L) → <b>26×25×9cm(5.9L)</b>, 부피 50% 감소. 높이는 절반 아래(22 → 9cm).')
m=re.search(r'<li><b>너무 안 예쁘다 → 휴롬 초음파 세척기\(UC-B01\) 디자인을 따라가자</b>.*?</li>', s, re.S)
if m: s=s[:m.start()]+'<li><b>너무 안 예쁘다 → 초음파 세척기(UC-B01)처럼 · 하단은 얇게 · 더 납작하게</b>(준보) → 두팔 시안 U1~U4 중 <b>U4(26×25×9cm)</b>로 확정. 흰 하단 1.5cm · 이중벽 스모크 칸 6cm · 아무것도 없는 스모크 유리 뚜껑 · 조작부(터치 + 15°C)는 뒤 고정 칸 윗면. 펠티어·방열판·팬은 뒤 칸(4.5cm)에 세우고 그 아래는 전선 보관함. 고기 두께 최대 4cm. <a href="#design">디자인</a> 칸.</li>'+s[m.end():]
else: print('MISSING summary bullet')
rep('<td>재킷 다섯 면 + 윗면 바람으로 차이를 1.3~1.5배 안에 묶음. 대신 봉지·물 없음이 매일의 편함</td>','<td>바닥 냉각판 + 위·옆 15°C 바람으로 차이를 1.5배 안팎에 묶음(2cm 60~70분 추정). 대신 봉지·물 없음이 매일의 편함</td>')
rep('「온도를 재고 다섯 면에서 안전하게 지킨다」를 앞세움.','「온도를 재고 바닥·바람으로 안전하게 지키고, 끝나면 10°C 로 보관한다」를 앞세움.')
# how
rep('<small>급속 해동기 · 15°C 물 재킷 + 안쪽 바람</small><strong>얇은 고기 15~20분, 2cm 한 시간 안팎</strong><p>트레이 바닥·옆 네 면을 15°C 물이 감싸고 윗면은 같은 온도의 바람이 스칩니',
    '<small>급속 해동기 · 15°C 냉각판 + 15°C 바람</small><strong>얇은 고기 20분 안팎, 2cm 한 시간 남짓</strong><p>트레이 아래 냉각판 속 15°C 물이 바닥을 데우고(얼음 기준) 위·옆은 같은 온도의 바람이 스칩니')
rep('<b>유리 뚜껑을 덮고 상판의 「시작」을 누릅니다</b>','<b>유리 뚜껑을 덮고 뒤쪽 조작부의 「시작」을 누릅니다</b>')
rep('alt="급속 해동기 v3 앞모습 · UC-B01 결 · 검은 유리 상판 터치 조작부 · 투명 창 아래 고기 한 팩"','alt="급속 해동기 v4 앞모습 · 흰 하단 · 스모크 칸 너머 트레이 위 고기 · 뒤 고정 칸 윗면 조작부"')
# structure steps
m=re.search(r'<div class="xv-step on">.*?</p></div>\s*<div class="xv-step">.*?</p></div>\s*<div class="xv-step">.*?</p></div>\s*<div class="xv-step">.*?</p></div>', s, re.S)
assert m
steps='''<div class="xv-step on"><div class="kicker">구조 · 겉모습 U4 (식자재 세척기 UC-B01 계열)</div><h2>높이 9cm, 세척기와 한 식구.</h2><p>흰 하단 1.5cm 위에 이중벽 스모크 칸 6cm, 그 위에 아무것도 없는 스모크 유리 뚜껑. 뒤쪽 4.5cm는 움직이지 않는 부품 칸이고, 그 윗면의 블랙 유리에 터치 아이콘과 「15°C」가 있습니다. 스크롤을 내리면 부품별로 분해됩니다.</p></div>
      <div class="xv-step"><div class="kicker">구조 · 뒷모습</div><h2>더운 바람과 전선은 모두 뒤로.</h2><p>방열판 바람은 뒷면 위 슬롯으로 나가고, 아래 슬롯으로 들어옵니다. 뒤 칸 맨 아래 1.5cm는 칸막이로 나눈 전선 보관함 — DC 선 1.2m를 감아 넣고 옆 홈으로 필요한 만큼만 뺍니다. 윗면엔 구멍이 없어 핏물·물이 들어갈 데가 없습니다.</p></div>
      <div class="xv-step"><div class="kicker">구조 · 냉각판과 바람</div><h2>물은 바닥 냉각판 속에서만 돕니다.</h2><p>옆면이 유리라 옆 재킷은 없습니다. 대신 트레이 아래 알루미늄 냉각판(1cm) 속을 15°C 물이 사행으로 돌고(파란 점), 뒤 벽 안쪽 냉각 핀을 지난 같은 온도의 바람이 고기 위·옆을 스칩니다(하늘색). 펠티어 2장의 찬 면이 냉각판 물과 냉각 핀을 같이 식힙니다.</p></div>
      <div class="xv-step"><div class="kicker">구조 · 분해</div><h2>부품 20개, 경첩을 지나는 선이 없습니다.</h2><p>트레이와 뚜껑은 들어서 빼 씻습니다. 온도 센서는 4개(냉각판·바람 입구·방열판 NTC + 고기 겉면 적외선)입니다. 뒤 칸에 펠티어 40mm 2장(세움) → 구리 블록 → 방열판 20mm → 블로어 팬이 한 줄로 서고, 펌프·순환 팬·제어 보드도 같은 칸에 있어 배선이 짧습니다. 어댑터는 바깥 기성품입니다.</p></div>'''
s=s[:m.start()]+steps+s[m.end():]
rep('<div class="xv-colors" role="group" aria-label="몸체 색 · UC-B01 과 같은 체계"><button data-xv-color="black" class="on"><i style="background:#15171a"></i>블랙(UC-B01)</button><button data-xv-color="white"><i style="background:#f3f3f0;border:1px solid #ccc"></i>화이트</button><button data-xv-color="graphite"><i style="background:#4b4f55"></i>그래파이트 무광</button></div>',
    '<div class="xv-colors" role="group" aria-label="몸체 색 · 확정은 화이트"><button data-xv-color="white" class="on"><i style="background:#f3f3f0;border:1px solid #ccc"></i>화이트(확정)</button><button data-xv-color="graphite"><i style="background:#4b4f55"></i>그래파이트</button><button data-xv-color="black"><i style="background:#15171a"></i>블랙</button></div>')
# design section
design='''<section id="design" style="background:var(--paper)">
  <div class="wrap">
    <div class="rv">
      <div class="kicker">디자인 · 확정 (2026-11-14 준보)</div>
      <h2>휴롬 식자재 세척기 옆에 두면, 같은 식구로 보입니다.</h2>
      <p class="lead2">준보 님이 「너무 안 예쁘다 → 초음파 세척기 디자인처럼 → 하단은 얇게 → 더 납작하게」로 고르신 끝에 두팔의 <b>U4</b>가 확정됐습니다. 세척기(UC-B01)에서 가져온 것은 <b>모서리를 작게 굴린 반듯한 흰 상자 · 스모크 창 · 블랙 유리 조작부 · 아래 흰 면의 회색 「Hurom」</b>입니다. 시안은 Figma AI가 그린 이미지이고, 아래 3D는 그 비율로 다시 만든 구조 모형입니다.</p>
    </div>
    <div class="photo rv" style="margin-top:32px"><img src="img/U4.jpg" alt="U4 시안 · 26×25×9cm · 흰 하단 · 스모크 칸 · 블랙 유리 조작부 (Figma AI, 곽두팔)"></div>
    <div class="sum2 rv" style="margin-top:28px">
      <div><small>U1 · 닫힌 모습 (첫 확정안, 14cm)</small><div class="photo" style="margin:0 0 10px;border-radius:16px"><img src="img/U1.jpg" alt="U1 시안"></div></div>
      <div><small>U2 · 뚜껑을 연 모습</small><div class="photo" style="margin:0 0 10px;border-radius:16px"><img src="img/U2.jpg" alt="U2 시안"></div></div>
      <div><small>기준 · 휴롬 식자재 세척기 UC-B01</small><div class="photo" style="margin:0 0 10px;border-radius:16px"><img src="img/UC-B01_ref.jpg" alt="휴롬 초음파 식자재 세척기 UC-B01"></div></div>
    </div>
    <div class="sum2 rv">
      <div><small>높이 9cm 나눠 쓰기</small><ul>
        <li><b>흰 하단 1.5cm</b> — 냉각판(1cm)이 속에 들어가 윗면이 평평. 앞 가운데 「Hurom」.</li>
        <li><b>스모크 칸 6cm</b> — 이중벽 투명 PC(트라이탄), 사이 공기층으로 결로·열 손실을 막음. 트레이(2cm) + 고기 최대 4cm.</li>
        <li><b>흰 테 0.5cm + 뚜껑 1cm</b> — 뚜껑은 아무것도 없는 스모크 유리. 댐퍼 경첩에 걸쳐 두고 들어 올려 떼어 씻음.</li></ul></div>
      <div><small>뒤 고정 칸 4.5cm (움직이지 않는 부분)</small><ul>
        <li><b>윗면 = 조작부.</b> 블랙 유리에 터치 5(전원·모드·−·+)와 「15°C」. 기판이 바로 아래라 경첩을 지나는 선이 없고, 결로·세척 문제도 없음.</li>
        <li><b>속 = 펠티어 40mm 2장(세움)</b> → 구리 블록 → 방열판 20mm → 블로어 팬. 배기·흡기는 뒷면 슬롯.</li>
        <li><b>안쪽 면 = 냉각 핀 + 순환 팬 30mm + 센서.</b> 찬 바람을 고기 위로, 아래 망으로 되돌림. 적외선 센서가 고기 겉면을, NTC가 바람 입구 온도를 잼(준보 「온도 센서도 있어야」).</li>
        <li><b>맨 아래 1.5cm = 전선 보관함.</b> DC 선 1.2m 감아 넣기, 뒷면 작은 덮개, 옆 홈으로 빼 씀. 위 바람길과 칸막이로 분리(준보 「뒷공간에 전선 보관」).</li></ul></div>
      <div><small>U4 이미지 그대로는 안 되는 곳 → 이렇게 품 (두팔 구조 검토)</small><ul>
        <li>옆면이 유리 → <b>옆 재킷 없음</b>, 바닥 냉각판 + 바람. 2cm 고기 50~60분 → <b>60~70분(추정)</b>.</li>
        <li>유리 한 겹 → 이중벽 PC. 뒤 칸 <b>윗면 슬롯 → 뒷면</b>으로(핏물 유입 방지), 윗면은 조작부.</li>
        <li>뚜껑 터치 → 뒤 칸 윗면으로. 무거운 유리 뚜껑 → 댐퍼 경첩 + 분리.</li>
        <li>추가 안전: 해동 끝나면 알림 후 <b>10°C 로 최대 2시간 보관</b>.</li></ul></div>
    </div>
  </div>
</section>'''
sec('design', design)
# compare
rep('<h2>물에 담그지 않고도, 다섯 면에서 15°C로 감쌉니다.</h2>','<h2>물에 담그지 않고도, 아래는 냉각판 · 위와 옆은 15°C 바람으로 감쌉니다.</h2>')
rep('<td class="pick">바닥 + 옆 네 면(물 재킷) + 윗면(바람)</td>','<td class="pick">바닥(냉각판) + 위·옆(15°C 바람)</td>')
rep('<td class="pick">24×18×11cm · 서랍에 들어감</td>','<td class="pick">26×25×9cm · 높이 9cm</td>')
rep('<li><b>재킷은 알루미늄(다이캐스팅 또는 판금).</b> 펠티어 두 곳의 열을 트레이 바닥·옆면 전체에 고르게 퍼뜨립니다.','<li><b>냉각판은 알루미늄(다이캐스팅, 물길 내장).</b> 뒤 칸 펠티어의 열을 물이 실어 와 트레이 바닥 전체에 고르게 퍼뜨립니다.')
rep('<li><b>뚜껑은 평평한 유리 한 장.</b> 찬 공기를 가두고 먼지·핏물 튐을 막으면서, 돔처럼 높지 않아 보관이 편합니다.</li>','<li><b>뚜껑은 아무것도 없는 스모크 유리 한 장.</b> 찬 공기를 가두고 먼지·핏물 튐을 막고, 떼어 씻습니다. 조작부는 뒤 고정 칸 윗면에 있어 경첩을 지나는 선이 없습니다.</li>')
# spec
rep('<h2>트레이 하나, 터치 한 줄, 어댑터 하나. 물은 없습니다.</h2>','<h2>트레이 하나, 뚜껑 하나, 뒤에 터치 한 줄. 물은 없습니다.</h2>')
rep('<div><b>600g</b><span>한 번에 고기 1~2팩 · 트레이 안쪽 20×14×3cm</span></div>','<div><b>600g</b><span>한 번에 고기 1~2팩 · 트레이 안쪽 20×16×2cm · 두께 4cm 까지</span></div>')
rep('<div><b>24×18×11</b><span>W×D×H cm · 도마 두께 · 서랍·선반에 들어감</span></div>','<div><b>26×25×9</b><span>W×D×H cm · 높이 9cm · 바닥은 A4 한 장</span></div>')
rep('<div><b>5+2</b><span>상판 터치 5 · 남은 시간 2자리 · UC-B01 과 같은 조작부 · 앱·블루투스 없음</span></div>','<div><b>5</b><span>뒤 칸 윗면 터치 5 + 「15°C」 표시 · 앱·블루투스 없음</span></div>')
rep('<div><b>3벌</b><span>새 금형 · 몸체·하단 몸통·뚜껑 테두리 · 트레이는 프레스, 재킷은 다이캐스팅</span></div>','<div><b>3벌</b><span>새 금형 · 하단 몸통 · 뒤 칸 · 흰 테 · 트레이는 프레스, 냉각판은 다이캐스팅, 스모크 칸은 PC 사출</span></div>')
rep('약 24 × 18 × 11cm (W×D×H) · 약 1.8kg (목표, 재킷 물 포함) · 타워형이면 약 Ø16 × 30cm','약 26 × 25 × 9cm (W×D×H, 뒤 부품 칸 4.5cm 포함) · 약 2.0kg (목표, 물 포함)')
rep('안쪽 약 20 × 14 × 3cm · 둘레 1cm 핏물 홈','안쪽 약 20 × 16 × 2cm · 둘레 1cm 핏물 홈 · 올릴 수 있는 고기 두께 최대 4cm')
rep('<tr><td>물 재킷</td><td>알루미늄 · 트레이 바닥·옆 네 면을 감싸는 밀봉 물길 약 0.5L · 공장에서 채워 봉함(사용자 보충 없음) · 온도 센서 1개</td></tr>',
    '<tr><td>냉각판 · 물</td><td>알루미늄 다이캐스팅 약 21.6 × 17 × 1cm, 속에 사행 물길 약 0.3L · 공장에서 채워 봉함(사용자 보충 없음) · 온도 센서 1개 · 옆 재킷 없음(옆면이 유리)</td></tr>')
m=re.search(r'<tr><td>겉모습 · 색상</td><td>.*?</td></tr>', s, re.S)
if m: s=s[:m.start()]+'<tr><td>겉모습 · 색상</td><td>휴롬 식자재 세척기 UC-B01 계열(U4 확정) — 흰 무광 하단 1.5cm + 「Hurom」 · 이중벽 스모크 PC 칸 6cm(앞·옆) · 흰 테 · 아무것도 없는 스모크 유리 뚜껑(댐퍼 경첩, 분리) · 뒤 고정 칸 윗면 블랙 유리 조작부. 색은 흰색 + 블랙 유리(서늘고 3색 하단은 쓰지 않음)</td></tr>'+s[m.end():]
else: print('MISSING 겉모습 row')
m=re.search(r'<tr><td>조작 · 표시</td><td>.*?</td></tr>', s, re.S)
if m: s=s[:m.start()]+'<tr><td>조작 · 표시</td><td>뒤 고정 칸 윗면 정전식 터치 5(전원 · 모드 · − · + · 시작은 전원 길게) + 흰색 「15°C」 표시 · 완료 시 알림음 → <b>10°C 로 낮춰 최대 2시간 보관</b> · 뚜껑 열림·21°C 초과는 깜빡임 + 「E1」 · 뚜껑에는 전기부 없음</td></tr>'+s[m.end():]
else: print('MISSING 조작 row')
s=s.replace('뚜껑에는 전기부 없음</td></tr>','뚜껑에는 전기부 없음</td></tr>\n      <tr><td>온도 센서 · 완료 판단</td><td>NTC 3개 — 바닥 냉각판(15°C 유지) · 순환 바람 입구(칸 안 공기, 해동 후 10°C 보관) · 방열판(과열 차단, 안전 필수) · <b>완료 판단 = 펠티어가 쓰는 힘 변화</b>(언 고기는 열을 계속 빨아들이다 다 녹으면 뚝 줄어듦) · 찌르는 탐침 없음 · 적외선(고기 겉면) 센서는 벤치 실험 결과에 따라 추가 검토</td></tr>')
s=s.replace('온도 센서는 4개(냉각판·바람 입구·방열판 NTC + 고기 겉면 적외선)입니다.','온도 센서는 NTC 3개(냉각판·바람 입구·방열판)입니다.')
s=s.replace('적외선 센서가 고기 겉면을, NTC가 바람 입구 온도를 잼(준보 「온도 센서도 있어야」).','NTC가 바람 입구 온도를 잼(준보 「온도 센서도 있어야」 → NTC 3개, 적외선은 벤치 뒤 검토).')
rep('<li>스테인리스 트레이 안쪽 20×14×3cm(0.6~0.8mm, 핏물 홈), 알루미늄 재킷 밀봉 0.5L, 식기세척기 가능</li>','<li>스테인리스 트레이 안쪽 20×16×2cm(0.6~0.8mm, 핏물 홈), 알루미늄 냉각판(물길 내장, 밀봉 0.3L), 이중벽 PC 스모크 칸, 식기세척기 가능 트레이·뚜껑</li>')
rep('<li>정전식 터치 5·2자리 LED·부저, 12V 외장 어댑터,','<li>정전식 터치 5·「15°C」 LED·부저, 전선 보관함(DC 선 1.2m), 12V 외장 어댑터,')
rep('<li>「올리기만 하면 된다」가 「더 빠르다(담금식)」보다 중요한지 · 납작형과 타워형 중 무엇을 집에 두고 싶은지</li>','<li>「올리기만 하면 된다」가 「더 빠르다(담금식)」보다 중요한지 · 세척기와 나란히 둘 디자인(U4)이 사고 싶게 보이는지</li>')
rep('알루미늄 GN 팬 2개를 포개 바깥 틈에 15°C 물을 어항 펌프로 돌리는 「재킷 모형」을 만들고, 위에 USB 팬을 답니다.','알루미늄 판 아래로 15°C 물을 어항 펌프로 돌리는 「냉각판 모형」 위에 GN 팬 트레이를 올리고, 뒤에서 USB 팬으로 같은 온도의 바람을 보냅니다.')
rep(' 세워 넣는 타워형은 같은 팬을 세워 양면 접촉으로 한 번 더 잽니다.','')
# 금형 설명 줄
rep('<td>3벌 (몸체 · 하단 몸통 · 뚜껑 테두리)','<td>3벌 (하단 몸통 · 뒤 칸 · 흰 테)')
rep('<td>몸체·하단 몸통·뚜껑 테두리 사출 금형 3벌','<td>하단 몸통·뒤 칸·흰 테 사출 금형 3벌 + 스모크 칸 PC 사출')
open(p,'w',encoding='utf-8').write(s); print('html v4 ok')
