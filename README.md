# 휴롬 급속 해동기 (가칭) — 신제품 기획 제안서 v2 · 물 재킷 트레이

- 페이지: https://simjb23-oss.github.io/hurom-thaw/
- v2(2026-11-15): 물통에 담그는 v1 → **물 재킷 트레이**(원물을 스테인리스 트레이에 그대로, 물은 바깥 알루미늄 재킷에 밀봉 0.5L). 24×18×11cm, 안쪽 순환 팬, 평평한 유리 뚜껑. 형태(납작 트레이형 vs 세로 타워형)는 `#design` 칸에서 준보 결정 대기.
- 구조 3D: `explode.js` (three.js, 스크롤 분해도 · `?p=0~1` 진행도 강제, `?c=yellow|purple|red` 하단 색, `?cy=` 카메라 높이, `?nolid ?nomeat ?nowater ?noadapter` 숨기기)
- 최종 이미지: `captures/` (hero = 대표 앞 45° · explode = 분해도) — 예전 시안·캡처(하단 3색·타워·돔·유리 뚜껑·스테인리스 트레이)는 2026-11-15 모두 삭제. 캡처 쿼리: `p=0&ang=45&noairg&noadapter&cy=-0.3` / `p=0.67&ang=62` · 테스트 페이지 `test/t.html` (work/ 에서 `python -m http.server 8766` 후 `test/shotq.sh "p=0" name`)
- 서늘고(https://github.com/simjb23-oss/hurom-seoneulgo)와 같은 틀. 펀딩 내용 없음. 원가·판매가는 두팔의 견적 전 추정만 `#cost` 에 표기.
