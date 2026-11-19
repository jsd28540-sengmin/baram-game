// 바람의 대륙 - 공용 게임 데이터 (서버/클라이언트 공용)
(function (G) {
  const D = {};
  D.MAX_LEVEL = 100;
  D.PROMO_LEVEL = 15;
  // 초반은 쉽고 갈수록 급격히 어려워짐 (Lv50 이후 추가 가중)
  D.expNeed = l => Math.floor(14 * Math.pow(l, 2.55) * (l > 50 ? 1 + (l - 50) * 0.06 : 1) + 30);
  D.DAY_MS = 12 * 60 * 1000;   // 낮 12분
  D.NIGHT_MS = 5 * 60 * 1000;  // 밤 5분
  D.BASE_SPEED = 220;          // 한 칸 이동(ms)

  // ───────── 직업 ─────────
  D.JOBS = {
    warrior: { name: '전사', base: 'warrior', tier: 0, hp0: 70, hpL: 17, mp0: 16, mpL: 2.6, atk0: 9, atkL: 2.6, def0: 6, defL: 1.8, crit: 5, desc: '근접 전투 특화. 레벨이 오를수록 데미지가 강력해진다.' },
    mage: { name: '마법사', base: 'mage', tier: 0, hp0: 40, hpL: 8, mp0: 55, mpL: 8.5, atk0: 11, atkL: 3.1, def0: 2, defL: 0.7, crit: 5, desc: '강력한 마법과 광역기. 방어력이 약하다.' },
    healer: { name: '치유사', base: 'healer', tier: 0, hp0: 46, hpL: 9.5, mp0: 42, mpL: 7, atk0: 9, atkL: 2.4, def0: 3, defL: 0.9, crit: 7, desc: '주변 모든 아군을 치유하는 핵심 직업. 활·석궁 사용, 방어력이 약하다.' },
    guardian: { name: '수호기사', base: 'warrior', tier: 1, mHp: 1.4, mDef: 1.7, mAtk: 1.0, crit: 5, desc: '철벽 방어형 전사. 어그로를 끌고 동료를 지킨다.' },
    berserker: { name: '광전사', base: 'warrior', tier: 1, mHp: 1.1, mDef: 0.9, mAtk: 1.45, crit: 15, desc: '공격 특화 전사. 압도적인 근접 화력.' },
    elementalist: { name: '원소술사', base: 'mage', tier: 1, mHp: 1.0, mDef: 1.0, mAtk: 1.4, mMp: 1.2, crit: 8, desc: '불·얼음·번개를 다루는 공격 마법의 대가.' },
    summoner: { name: '환령술사', base: 'mage', tier: 1, mHp: 1.2, mDef: 1.1, mAtk: 1.1, mMp: 1.3, crit: 5, desc: '늑대·골렘·정령을 소환해 함께 싸운다.' },
    ranger: { name: '신궁', base: 'healer', tier: 1, mHp: 1.05, mDef: 1.0, mAtk: 1.4, crit: 15, desc: '원거리 저격 특화 + 약간의 치유.' },
    priest: { name: '대사제', base: 'healer', tier: 1, mHp: 1.2, mDef: 1.25, mAtk: 1.05, mMp: 1.4, heal: 1.8, crit: 5, desc: '강력한 광역 치유와 축복 + 약간의 공격.' },
  };
  D.PROMOS = { warrior: ['guardian', 'berserker'], mage: ['elementalist', 'summoner'], healer: ['ranger', 'priest'] };

  // ───────── 스킬 ─────────
  // kind: melee, proj, multi, aoeSelf, aoeTarget, line, heal, buff, partyBuff, summon, taunt
  D.SKILLS = [
    // 전사
    { id: 'w_smash', name: '강타', jobs: ['warrior', 'guardian', 'berserker'], lv: 1, mp: 4, cd: 1500, kind: 'melee', mul: 2.3, fx: 'slash', col: '#ffd34d', desc: '앞의 적을 강하게 내려친다.' },
    { id: 'w_spin', name: '회전베기', jobs: ['warrior', 'guardian', 'berserker'], lv: 5, mp: 10, cd: 4000, kind: 'aoeSelf', r: 1.6, mul: 1.7, fx: 'spin', col: '#ffffff', desc: '주변 모든 적을 벤다. (광역)' },
    { id: 'w_roar', name: '기합', jobs: ['warrior', 'guardian', 'berserker'], lv: 10, mp: 14, cd: 25000, kind: 'buff', buff: { atk: 0.3 }, dur: 20000, fx: 'buff', col: '#ff6a3d', desc: '20초간 공격력 +30%' },
    { id: 'g_wall', name: '철벽', jobs: ['guardian'], lv: 15, mp: 20, cd: 30000, kind: 'buff', buff: { def: 0.9 }, dur: 15000, fx: 'buff', col: '#7fb2ff', desc: '15초간 방어력 +90%' },
    { id: 'g_taunt', name: '도발의 함성', jobs: ['guardian'], lv: 18, mp: 18, cd: 8000, kind: 'taunt', r: 4, mul: 1.3, fx: 'ring', col: '#ff4d4d', desc: '주변 적을 끌어모으며 피해. (광역)' },
    { id: 'g_quake', name: '대지분쇄', jobs: ['guardian'], lv: 24, mp: 30, cd: 9000, kind: 'aoeSelf', r: 2.6, mul: 3.0, fx: 'quake', col: '#c9a26b', desc: '땅을 내리찍어 넓은 범위 피해. (광역)' },
    { id: 'b_rage', name: '광폭화', jobs: ['berserker'], lv: 15, mp: 20, cd: 30000, kind: 'buff', buff: { atk: 0.6, def: -0.2 }, dur: 15000, fx: 'buff', col: '#ff2a2a', desc: '15초간 공격력 +60%, 방어력 -20%' },
    { id: 'b_combo', name: '혈풍연참', jobs: ['berserker'], lv: 18, mp: 18, cd: 3500, kind: 'melee', mul: 4.8, fx: 'slash3', col: '#ff3b3b', desc: '눈에 보이지 않는 연속 베기.' },
    { id: 'b_storm', name: '폭풍검무', jobs: ['berserker'], lv: 24, mp: 34, cd: 9000, kind: 'aoeSelf', r: 3, mul: 3.8, fx: 'spin', col: '#ff5555', desc: '칼바람으로 주변을 휩쓴다. (광역)' },
    // 마법사
    { id: 'm_fire', name: '화염구', jobs: ['mage', 'elementalist', 'summoner'], lv: 1, mp: 5, cd: 900, kind: 'proj', range: 7, mul: 2.4, fx: 'fireball', col: '#ff7a1a', desc: '불덩이를 날린다.' },
    { id: 'm_frost', name: '얼음폭풍', jobs: ['mage', 'elementalist', 'summoner'], lv: 5, mp: 16, cd: 4000, kind: 'aoeTarget', range: 7, r: 2, mul: 1.9, slow: 1, fx: 'ice', col: '#8fe3ff', desc: '대상 주변에 얼음 폭풍. (광역, 둔화)' },
    { id: 'm_chain', name: '연쇄번개', jobs: ['mage', 'elementalist', 'summoner'], lv: 10, mp: 20, cd: 5000, kind: 'multi', range: 7, n: 4, mul: 2.2, fx: 'bolt', col: '#fff36b', desc: '최대 4마리에게 번개가 튄다.' },
    { id: 'e_meteor', name: '메테오', jobs: ['elementalist'], lv: 15, mp: 42, cd: 10000, kind: 'aoeTarget', range: 8, r: 3, mul: 5.2, fx: 'meteor', col: '#ff3d00', desc: '거대한 운석을 떨어뜨린다. (광역)' },
    { id: 'e_bliz', name: '블리자드', jobs: ['elementalist'], lv: 18, mp: 34, cd: 7000, kind: 'aoeTarget', range: 8, r: 4, mul: 3.1, slow: 1, fx: 'ice', col: '#bdf1ff', desc: '넓은 범위에 눈보라. (광역, 둔화)' },
    { id: 'e_hell', name: '지옥불', jobs: ['elementalist'], lv: 24, mp: 40, cd: 9000, kind: 'aoeSelf', r: 3.5, mul: 4.3, fx: 'flame', col: '#ff5a00', desc: '자신 주변을 불바다로 만든다. (광역)' },
    { id: 's_wolf', name: '늑대 소환', jobs: ['summoner'], lv: 15, mp: 30, cd: 12000, kind: 'summon', summon: 'sWolf', count: 2, dur: 60000, fx: 'summon', col: '#b47cff', desc: '늑대 2마리를 60초간 소환.' },
    { id: 's_golem', name: '바위골렘 소환', jobs: ['summoner'], lv: 18, mp: 40, cd: 20000, kind: 'summon', summon: 'sGolem', count: 1, dur: 90000, fx: 'summon', col: '#b47cff', desc: '단단한 골렘을 90초간 소환. (적을 끌어들임)' },
    { id: 's_spirit', name: '화염정령 소환', jobs: ['summoner'], lv: 24, mp: 45, cd: 20000, kind: 'summon', summon: 'sSpirit', count: 2, dur: 60000, fx: 'summon', col: '#b47cff', desc: '원거리 화염정령 2기를 60초간 소환.' },
    // 치유사
    { id: 'h_shot', name: '저격', jobs: ['healer', 'ranger', 'priest'], lv: 1, mp: 4, cd: 900, kind: 'proj', range: 8, mul: 2.2, fx: 'arrow', col: '#e8e0c0', desc: '정확하게 조준해 쏜다.' },
    { id: 'h_heal', name: '치유의 빛', jobs: ['healer', 'ranger', 'priest'], lv: 3, mp: 14, cd: 3000, kind: 'heal', r: 5, mul: 2.0, fx: 'heal', col: '#7dff9a', desc: '주변 모든 아군(나 포함)을 치유한다.' },
    { id: 'h_multi', name: '다중사격', jobs: ['healer', 'ranger', 'priest'], lv: 8, mp: 14, cd: 4000, kind: 'multi', range: 8, n: 3, mul: 2.0, fx: 'arrow', col: '#e8e0c0', desc: '최대 3마리에게 동시에 화살.' },
    { id: 'r_rain', name: '화살비', jobs: ['ranger'], lv: 15, mp: 30, cd: 8000, kind: 'aoeTarget', range: 9, r: 3, mul: 3.4, fx: 'rain', col: '#f0e6b0', desc: '화살을 비처럼 쏟아붓는다. (광역)' },
    { id: 'r_pierce', name: '관통사격', jobs: ['ranger'], lv: 18, mp: 24, cd: 5000, kind: 'line', range: 9, mul: 4.4, fx: 'pierce', col: '#fff8c8', desc: '일직선의 모든 적을 관통한다.' },
    { id: 'r_aid', name: '응급치료', jobs: ['ranger'], lv: 21, mp: 20, cd: 6000, kind: 'heal', r: 4, mul: 1.6, fx: 'heal', col: '#7dff9a', desc: '주변 아군을 약간 치유.' },
    { id: 'p_great', name: '대치유', jobs: ['priest'], lv: 15, mp: 30, cd: 4000, kind: 'heal', r: 8, mul: 3.6, fx: 'bigheal', col: '#9dffb6', desc: '넓은 범위의 아군을 크게 치유.' },
    { id: 'p_bless', name: '수호의 축복', jobs: ['priest'], lv: 18, mp: 32, cd: 25000, kind: 'partyBuff', r: 7, buff: { def: 0.5, atk: 0.15 }, dur: 30000, fx: 'bless', col: '#ffe98a', desc: '주변 아군 30초간 방어 +50%, 공격 +15%' },
    { id: 'p_holy', name: '성광', jobs: ['priest'], lv: 22, mp: 30, cd: 7000, kind: 'aoeSelf', r: 3, mul: 2.6, healToo: 1.2, fx: 'holy', col: '#fff6b0', desc: '성스러운 빛으로 적을 태우고 아군을 치유. (광역)' },
  ];
  D.SKILL = {}; D.SKILLS.forEach(s => D.SKILL[s.id] = s);
  D.skillsFor = job => D.SKILLS.filter(s => s.jobs.includes(job));

  // 소환수
  D.SUMMONS = {
    sWolf: { name: '영혼늑대', kind: 'quad', c: ['#9a7cff', '#d9ccff', '#ffffff'], size: 0.8, hp: 1.2, atk: 0.55, range: 1 },
    sGolem: { name: '바위골렘', kind: 'golem', c: ['#8a8170', '#b5ab95', '#ffcc33'], size: 1.1, hp: 4.0, atk: 0.5, range: 1, taunt: 1 },
    sSpirit: { name: '화염정령', kind: 'ghost', c: ['#ff7a1a', '#ffd34d', '#ffffff'], size: 0.8, hp: 0.9, atk: 0.75, range: 5 },
  };

  // ───────── 몬스터 ─────────
  // kind = 스프라이트 종류, c = 색, size = 크기, p = 선공 안함, rng = 공격 사거리, meat = 고기, mats = 재료
  const M = (name, lv, kind, c, o = {}) => Object.assign({ name, lv, kind, c, size: 1 }, o);
  D.MONS = {
    squirrel: M('다람쥐', 1, 'rodent', ['#9a5a2c', '#e0b080', '#2b1a10'], { size: 0.6, p: 1, mats: ['솜'] }),
    rabbit: M('토끼', 2, 'rabbit', ['#f2efe6', '#f7b6c2', '#3a2a2a'], { size: 0.6, p: 1, meat: 1, mats: ['솜'] }),
    rat: M('들쥐', 3, 'rodent', ['#7d7a75', '#b8b2a8', '#1a1a1a'], { size: 0.6, mats: ['솜', '나무'] }),
    sheep: M('양', 4, 'sheep', ['#f4f1e8', '#3a3530', '#222'], { size: 0.85, p: 1, meat: 1, mats: ['양털', '양털', '솜'] }),
    fox: M('여우', 6, 'quad', ['#e07a2e', '#fff1dc', '#2a1a10'], { size: 0.8, meat: 1, mats: ['나무'] }),
    wolf: M('늑대', 8, 'quad', ['#6f7378', '#c9ccd0', '#111'], { size: 0.9, meat: 1, mats: ['나무'] }),
    boar: M('멧돼지', 10, 'boar', ['#5c3f2a', '#a77b56', '#f5f0e0'], { size: 1.0, meat: 1, mats: ['나무', '돌'] }),
    treant: M('나무정령', 12, 'golem', ['#4d6b2e', '#7a5a33', '#c8ff5a'], { size: 1.0, mats: ['나무', '나무', '나무'] }),
    bear: M('곰', 13, 'bear', ['#4a2f1d', '#8a6040', '#111'], { size: 1.2, meat: 1, mats: ['양털', '나무'] }),
    scorpion: M('전갈', 14, 'scorpion', ['#b8862e', '#6b4a14', '#ff3b3b'], { size: 0.9, mats: ['돌'] }),
    lizard: M('사막도마뱀', 16, 'lizard', ['#c8a050', '#8a6a2a', '#ffef7a'], { size: 0.9, meat: 1, mats: ['돌', '솜'] }),
    sandGolem: M('모래골렘', 18, 'golem', ['#d6b878', '#a68a4e', '#ffe08a'], { size: 1.2, mats: ['돌', '돌'] }),
    toad: M('독두꺼비', 19, 'toad', ['#4e7d3a', '#a6d36b', '#ffef3b'], { size: 0.9, meat: 1, mats: ['솜'] }),
    snowWolf: M('설원늑대', 20, 'quad', ['#e8eef5', '#9fb3c8', '#1a2a3a'], { size: 1.0, meat: 1, mats: ['양털'] }),
    swampSlime: M('늪슬라임', 21, 'slime', ['#5a7a3a', '#9ccf5a', '#1a2a10'], { size: 0.9, mats: ['솜', '돌'] }),
    iceSlime: M('얼음슬라임', 22, 'slime', ['#7fd3ff', '#e0f8ff', '#1a3a5a'], { size: 0.9, mats: ['돌'] }),
    lizardman: M('리자드맨', 24, 'humanoid', ['#3f7a4a', '#8ad38a', '#c0c0c0'], { size: 1.0, weapon: 'spear', mats: ['나무', '돌'] }),
    yeti: M('설인', 25, 'yeti', ['#f2f6fa', '#9ab', '#5ac8ff'], { size: 1.3, meat: 1, mats: ['양털', '양털'] }),
    // 박쥐동굴
    bat: M('박쥐', 8, 'bat', ['#3a2d4a', '#7a5a9a', '#ff3b3b'], { size: 0.7, mats: ['횃불'] }),
    caveSpider: M('동굴거미', 11, 'spider', ['#2a2a2a', '#6a4a8a', '#ff4040'], { size: 0.8, mats: ['솜', '횃불'] }),
    snake: M('독뱀', 13, 'snake', ['#3c8a3c', '#b8e070', '#ff3030'], { size: 0.8, mats: ['돌'] }),
    vampBat: M('흡혈박쥐', 16, 'bat', ['#5a1020', '#a02040', '#ffd000'], { size: 0.95, mats: ['횃불', '돌'] }),
    // 해골굴
    skeleton: M('해골병사', 17, 'skeleton', ['#e8e2cc', '#a39a80', '#ff3b3b'], { weapon: 'sword', mats: ['돌', '횃불'] }),
    skelArcher: M('해골궁수', 19, 'skeleton', ['#ddd6bf', '#8d846c', '#3bff7a'], { weapon: 'bow', rng: 5, mats: ['나무', '횃불'] }),
    ghoul: M('구울', 22, 'zombie', ['#6a7a5a', '#3a4a30', '#ffef3b'], { size: 1.05, mats: ['솜', '돌'] }),
    skelKnight: M('해골기사', 26, 'skeleton', ['#c9c2ad', '#5a5a6a', '#ff2020'], { size: 1.15, weapon: 'axe', shield: 1, mats: ['돌', '횃불'] }),
    // 망령광산
    zombie: M('좀비', 24, 'zombie', ['#6b8a5a', '#4a3a6a', '#ff3b3b'], { mats: ['솜', '횃불'] }),
    minerZombie: M('광부좀비', 27, 'zombie', ['#7a8a5a', '#8a6a3a', '#ffd000'], { helmet: 1, mats: ['돌', '돌', '횃불'] }),
    wraith: M('망령', 30, 'ghost', ['#9fb8d8', '#e8f2ff', '#3bffef'], { size: 1.0, mats: ['횃불'] }),
    rotGolem: M('썩은골렘', 34, 'golem', ['#5a6a3a', '#3a3a2a', '#b0ff3b'], { size: 1.35, mats: ['돌', '돌'] }),
    // 도깨비굴
    dokkaebi: M('도깨비', 31, 'ogre', ['#3a6ad8', '#f0d040', '#ffffff'], { weapon: 'club', mats: ['나무', '돌'] }),
    oneEye: M('외눈도깨비', 34, 'ogre', ['#2a9a5a', '#e0a020', '#ff3030'], { size: 1.15, oneEye: 1, weapon: 'club', mats: ['나무', '횃불'] }),
    gumiho: M('구미호', 37, 'quad', ['#f6f2ea', '#ff9ac8', '#ff3b8a'], { size: 1.0, tails: 9, mats: ['양털', '솜'] }),
    fireDokkaebi: M('불도깨비', 41, 'ogre', ['#d83a2a', '#ffb000', '#ffef7a'], { size: 1.2, weapon: 'club', fire: 1, mats: ['횃불', '돌'] }),
    // 흑요성
    darkKnight: M('흑기사', 38, 'knight', ['#2a2a35', '#6a6a80', '#ff2020'], { size: 1.1, weapon: 'sword', shield: 1, mats: ['돌', '횃불'] }),
    gargoyle: M('가고일', 41, 'gargoyle', ['#6a6a70', '#3a3a40', '#ff5020'], { size: 1.05, mats: ['돌', '돌'] }),
    lich: M('리치', 44, 'mage', ['#3a1a5a', '#e8e2cc', '#3bff7a'], { size: 1.05, rng: 5, mats: ['횃불', '솜'] }),
    darkMage: M('암흑마법사', 46, 'mage', ['#1a1a2a', '#c8a0ff', '#a040ff'], { rng: 5, mats: ['횃불', '양털'] }),
    deathKnight: M('죽음의기사', 48, 'knight', ['#1a1018', '#5a2030', '#ff1010'], { size: 1.2, weapon: 'axe', mats: ['돌', '횃불'] }),
    // 마왕성 / 화산
    imp: M('임프', 45, 'demon', ['#c02a2a', '#ff8a3a', '#ffef3b'], { size: 0.8, mats: ['횃불'] }),
    fireSlime: M('화염슬라임', 42, 'slime', ['#ff5a1a', '#ffd000', '#401000'], { size: 0.9, mats: ['횃불', '돌'] }),
    demon: M('악마', 47, 'demon', ['#7a1020', '#2a0a10', '#ffd000'], { size: 1.15, mats: ['횃불', '돌'] }),
    hellhound: M('지옥견', 49, 'quad', ['#2a1010', '#ff4a10', '#ffef3b'], { size: 1.0, fire: 1, meat: 1, mats: ['횃불'] }),
    wyvern: M('와이번', 51, 'dragon', ['#3a6a4a', '#a0d080', '#ffef3b'], { size: 1.2, mats: ['돌', '양털'] }),
    demonGeneral: M('마족장군', 53, 'knight', ['#5a0a1a', '#c0a040', '#ff3030'], { size: 1.3, weapon: 'axe', horns: 1, mats: ['돌', '횃불'] }),
    ancientDragon: M('고룡', 55, 'dragon', ['#5a2a6a', '#c080ff', '#ffef3b'], { size: 1.45, mats: ['돌', '돌'] }),
  };
  // 보스 (눈에 띄는 디자인: 크기 2배 이상 + 오라 + 왕관)
  const B = (name, lv, kind, c, o = {}) => M(name, lv, kind, c, Object.assign({ boss: 1, size: 2.2 }, o));
  Object.assign(D.MONS, {
    bearKing: B('거대곰왕', 22, 'bear', ['#2a1408', '#c08040', '#ffd000'], { aura: '#ffb000', meat: 1 }),
    scorpionKing: B('황금전갈왕', 28, 'scorpion', ['#ffc830', '#8a5a00', '#ff2020'], { aura: '#ffd84a' }),
    yetiKing: B('설인왕', 34, 'yeti', ['#ffffff', '#7aa8d8', '#00e5ff'], { aura: '#7af0ff' }),
    spiderQueen: B('거미여왕', 22, 'spider', ['#3a0a3a', '#ff2aa0', '#ffef3b'], { aura: '#ff2aa0' }),
    skelKing: B('해골대왕', 32, 'skeleton', ['#fff6d8', '#d4a020', '#ff1010'], { aura: '#ffd000', weapon: 'axe', shield: 1, crown: 1 }),
    corpseLord: B('시체군주', 40, 'zombie', ['#4a6a3a', '#3a1a5a', '#b0ff3b'], { aura: '#7aff3b', crown: 1 }),
    dokkaebiKing: B('도깨비대왕', 46, 'ogre', ['#d02020', '#ffd000', '#ffffff'], { aura: '#ff5a1a', weapon: 'club', crown: 1 }),
    blackCommander: B('흑기사단장', 54, 'knight', ['#0a0a12', '#d4a020', '#ff1010'], { aura: '#ff1a3a', weapon: 'sword', shield: 1, horns: 1 }),
    demonLord: B('마왕 무저갱', 62, 'demon', ['#3a001a', '#ff2050', '#ffd000'], { aura: '#ff0040', size: 2.8, crown: 1 }),
  });

  // 몬스터 스탯 계산
  D.monStats = (m, night, mutant) => {
    const l = m.lv;
    let hp = Math.floor(22 + Math.pow(l, 1.62) * 11);
    let atk = Math.floor(5 + l * 3.1);
    let def = Math.floor(l * 1.45);
    let exp = Math.floor(8 + Math.pow(l, 1.65) * 3.2);
    if (m.boss) { hp *= 30; atk *= 1.7; def *= 1.4; exp *= 25; }
    if (night) { hp *= 1.15; atk *= 1.15; }
    if (mutant) { hp *= 2.2; atk *= 1.45; def *= 1.3; exp *= 3; }
    return { hp: Math.floor(hp), atk: Math.floor(atk), def: Math.floor(def), exp: Math.floor(exp), coin: Math.floor(6 + l * 4.5) };
  };

  // ───────── 아이템 ─────────
  D.SLOTS = ['helmet', 'armor', 'gloves', 'boots', 'weapon', 'shield'];
  D.SLOT_NAME = { helmet: '투구', armor: '갑옷', gloves: '장갑', boots: '신발', weapon: '무기', shield: '방패' };
  D.TIER_PREFIX = ['낡은', '청동', '무쇠', '강철', '은빛', '흑철', '청옥', '적염', '용린', '천공'];
  D.TIER_COLOR = ['#8a7a66', '#b87333', '#7d8590', '#aab4c0', '#e6eef5', '#3a3a48', '#2fb9a8', '#d8402a', '#7a3ad8', '#ffd84a'];
  D.tierOf = lvl => Math.min(9, Math.floor((lvl - 1) / 5));
  // 직업별 장비 이름
  D.GEAR = {
    warrior: { helmet: '투구', armor: '판금갑옷', gloves: '건틀릿', boots: '철각반', shield: '방패' },
    mage: { helmet: '마법모자', armor: '마법로브', gloves: '비단장갑', boots: '마법신발' },
    healer: { helmet: '두건', armor: '경갑', gloves: '사수장갑', boots: '가죽장화' },
  };
  D.WEAPONS = {
    sword: { name: '검', job: 'warrior', spd: 1.0 }, axe: { name: '도끼', job: 'warrior', spd: 0.85, m: 1.15 }, spear: { name: '창', job: 'warrior', spd: 0.95, m: 1.07 },
    staff: { name: '지팡이', job: 'mage', m: 1.1 }, wand: { name: '마법봉', job: 'mage', m: 0.95, mp: 1 },
    bow: { name: '활', job: 'healer' }, crossbow: { name: '석궁', job: 'healer', m: 1.12 },
  };
  D.RARITY = [{ n: '일반', c: '#e6e6e6' }, { n: '고급', c: '#5ad1ff' }, { n: '희귀', c: '#c77dff' }, { n: '전설', c: '#ffb020' }];
  D.OPT_NAME = { atk: '공격력', def: '방어력', hp: '체력', mp: '마나', crit: '치명타%', luck: '행운%' };
  D.SLOT_DEF_MUL = { helmet: 0.5, armor: 1, gloves: 0.35, boots: 0.4, shield: 0.85 };

  // 재료
  D.MATS = {
    '철광석': { c: '#8a8f99', desc: '대장간 강화 재료 (장비 1~15등급)' },
    '은광석': { c: '#e0e6ee', desc: '대장간 강화 재료 (장비 16~30등급)' },
    '마력석': { c: '#8a5cff', desc: '대장간 강화 재료 (장비 31~45등급)' },
    '용의비늘': { c: '#ff5a3a', desc: '대장간 강화 재료 (장비 46~50등급)' },
    '나무': { c: '#8a5a2a', desc: '집짓기 재료' }, '돌': { c: '#9a9a9a', desc: '집짓기 재료' },
    '양털': { c: '#f4f0e6', desc: '집짓기 재료' }, '솜': { c: '#ffffff', desc: '집짓기 재료' },
    '횃불': { c: '#ffb020', desc: '집짓기 재료 / 텐트 조명' }, '고기': { c: '#c0504a', desc: '모닥불에서 구워 먹을 수 있다' },
  };
  // 몬스터별 강화재료
  D.oreFor = lv => lv <= 20 ? '철광석' : lv <= 36 ? '은광석' : '마력석';
  // 보스 전용 특별 아이템 (협력한 모두에게 각자 직업에 맞게 지급)
  D.BOSS_LOOT = {
    bearKing: { set: '곰왕의', slots: ['gloves', 'boots'], opt: { hp: 1.5, atk: 1 }, desc: '체력이 크게 오르는 곰왕 장비' },
    scorpionKing: { set: '황금전갈의', slots: ['weapon', 'helmet'], opt: { crit: 1.5, luck: 1 }, desc: '치명타·행운 특화 황금 장비' },
    yetiKing: { set: '설인왕의', slots: ['armor', 'helmet'], opt: { def: 1.6, hp: 1 }, desc: '얼음처럼 단단한 방어 장비' },
    spiderQueen: { set: '거미여왕의', slots: ['gloves', 'armor'], opt: { crit: 1.3, mp: 1 }, desc: '독거미 실로 짠 장비' },
    skelKing: { set: '해골대왕의', slots: ['weapon', 'shield', 'helmet'], opt: { atk: 1.5, def: 1 }, desc: '망자의 힘이 깃든 장비' },
    corpseLord: { set: '시체군주의', slots: ['armor', 'boots'], opt: { hp: 1.6, def: 1 }, desc: '죽지 않는 자의 장비' },
    dokkaebiKing: { set: '도깨비방망이', slots: ['weapon', 'gloves'], opt: { luck: 2, atk: 1.2 }, desc: '행운(드랍률·코인)이 폭증하는 도깨비 장비' },
    blackCommander: { set: '흑기사단장의', slots: ['weapon', 'armor', 'shield'], opt: { atk: 1.6, def: 1.3 }, desc: '흑요석으로 벼린 최상급 장비' },
    demonLord: { set: '마왕 무저갱의', slots: ['weapon', 'armor', 'helmet', 'gloves', 'boots'], opt: { atk: 2, def: 1.5, crit: 1 }, desc: '전설 중의 전설, 마왕의 장비' },
  };
  D.upgradeMat = lvl => lvl <= 15 ? '철광석' : lvl <= 30 ? '은광석' : lvl <= 45 ? '마력석' : '용의비늘';
  D.UPG_RATE = [100, 95, 88, 78, 66, 55, 45, 35, 25, 15];
  D.upgradeCost = (it) => ({ mat: D.upgradeMat(it.lvl), n: it.plus + 2, coin: Math.floor(it.lvl * 40 * (it.plus + 1) + 100) });

  // 소모품
  D.CONSUMES = {
    hp1: { name: '빨간 물약', col: '#e8303a', hp: 90, price: 30, desc: '체력 90 회복' },
    hp2: { name: '진한 빨간 물약', col: '#a80018', hp: 380, price: 140, desc: '체력 380 회복' },
    mp1: { name: '파란 물약', col: '#2f6bff', mp: 70, price: 40, desc: '마나 70 회복' },
    mp2: { name: '진한 파란 물약', col: '#0a2aa8', mp: 280, price: 160, desc: '마나 280 회복' },
    buffAtk: { name: '보라 물약', col: '#a040ff', buff: { atk: 0.3 }, dur: 90000, price: 350, desc: '90초간 전투능력(공격력) +30%' },
    buffDef: { name: '노란 물약', col: '#ffd020', buff: { def: 0.45 }, dur: 90000, price: 350, desc: '90초간 방어력 +45% (체력이 적게 닳음)' },
    recall: { name: '귀환 주문서', col: '#e8d8a0', recall: 1, price: 120, desc: '가장 가까운 마을로 귀환' },
    meatCooked: { name: '구운 고기', col: '#a0582a', hp: 220, price: 0, desc: '체력 220 회복' },
    stew: { name: '고기 스튜', col: '#c08a40', hp: 500, mp: 300, price: 0, desc: '체력 500, 마나 300 회복' },
    feast: { name: '모험가의 만찬', col: '#ffcf6a', hp: 800, mp: 500, buff: { atk: 0.15, def: 0.15 }, dur: 180000, price: 0, desc: '대량 회복 + 3분간 공격·방어 +15%' },
  };
  D.SHOP_CONSUMES = ['hp1', 'hp2', 'mp1', 'mp2', 'buffAtk', 'buffDef', 'recall'];
  D.SHOP_GEAR_LEVELS = [5, 12, 20, 28];
  D.gearPrice = lvl => Math.floor(lvl * lvl * 18 + 150);

  // 요리
  D.RECIPES = {
    meatCooked: { name: '구운 고기', need: { '고기': 1 }, at: 'campfire' },
    stew: { name: '고기 스튜', need: { '고기': 2, '나무': 1 }, at: 'stove' },
    feast: { name: '모험가의 만찬', need: { '고기': 4, '솜': 2, '나무': 2 }, at: 'stove' },
  };

  // 탈것 (아주 비쌈)
  D.MOUNTS = {
    horse: { name: '갈색 말', price: 30000, spd: 1.5, c: ['#7a4a22', '#2a1a0a'], kind: 'horse' },
    camel: { name: '사막 낙타', price: 70000, spd: 1.65, c: ['#d0a860', '#8a6a3a'], kind: 'camel' },
    ostrich: { name: '질주 타조', price: 120000, spd: 1.85, c: ['#2a2a2a', '#f0e8d8'], kind: 'ostrich' },
    whiteHorse: { name: '천리 백마', price: 250000, spd: 2.1, c: ['#f4f4f0', '#c8c8d8'], kind: 'horse' },
  };

  // 집짓기
  D.TENT_COST = { '나무': 10, '양털': 6, '솜': 4 };
  D.TENT_W = 9; D.TENT_H = 7;
  D.FURNITURE = {
    bed: { name: '침대', need: { '나무': 6, '양털': 4, '솜': 4 }, desc: '누워서 쉬면 체력·마나가 빠르게 회복' },
    chest: { name: '보관상자', need: { '나무': 8, '돌': 2 }, desc: '아이템 24칸 보관' },
    torch: { name: '횃불', need: { '횃불': 1 }, desc: '어둠을 밝힌다' },
    campfire: { name: '모닥불', need: { '나무': 4, '돌': 4 }, desc: '불빛 + 고기 굽기' },
    stove: { name: '조리대', need: { '나무': 5, '돌': 3 }, desc: '스튜·만찬 요리' },
    table: { name: '탁자', need: { '나무': 4 }, desc: '장식' },
    rug: { name: '양털 깔개', need: { '양털': 4 }, desc: '장식' },
    plant: { name: '화분', need: { '돌': 2, '솜': 1 }, desc: '장식' },
    chair: { name: '의자', need: { '나무': 2 }, desc: '장식' },
    shelf: { name: '책장', need: { '나무': 6 }, desc: '장식' },
    lantern: { name: '등불', need: { '횃불': 1, '돌': 1 }, desc: '밝은 조명' },
    window: { name: '창문', need: { '나무': 2, '돌': 1 }, wall: 1, house: 1, desc: '벽에 설치 (집 전용)' },
    door: { name: '문', need: { '나무': 4 }, wall: 1, house: 1, desc: '벽에 설치해 출입구 추가 (집 전용)' },
    painting: { name: '그림', need: { '나무': 2, '양털': 1 }, wall: 1, house: 1, desc: '벽 장식 (집 전용)' },
  };
  D.HOUSE_COST = { '나무': 24, '돌': 16, '양털': 4 };
  D.WALK_FURN = new Set(['rug', 'door']);

  // 타일
  D.T = { GRASS: 0, FLOWER: 1, TREE: 2, WATER: 3, SAND: 4, SNOW: 5, ROAD: 6, STONE: 7, WALL: 8, SWAMP: 9, ROCK: 10, CAVE: 11, CAVEWALL: 12, CASTLE: 13, CASTLEWALL: 14, FOREST: 15, LAVA: 16, BRIDGE: 17, HOUSE: 18, CACTUS: 19, PINE: 20, CARPET: 21, DOWN: 22, UP: 23, CAVEDOOR: 24, GATE: 25, ASH: 26, DEADTREE: 27, FENCE: 28, ROOF: 29 };
  D.TENT_OVER = new Set([1, 2, 10, 19, 20, 27]); // 텐트로 덮을 수 있는 지형(나무·바위 등)
  D.BLOCK = new Set([2, 3, 8, 10, 12, 14, 16, 18, 19, 20, 27, 28, 29]);

  G.GD = D;
  if (typeof module !== 'undefined') module.exports = D;
})(typeof window !== 'undefined' ? window : globalThis);
