// ══════════════════════════════════════════════════════
//  CS LEGENDS — constants.js
//  静态常量数据文件，由 index.html 通过 <script src="constants.js"> 引用
//  修改游戏数据请编辑此文件，无需触碰主逻辑
// ══════════════════════════════════════════════════════

// ─── 常量 ────────────────────────────────────────────
// --- 👑 CS 1.6 时代传奇选手库 (2000 - 2011) ---
const PLAYERS_16 = [
  // 🇸🇪 瑞典王朝 (NiP, SK, fnatic)
  { name: "HeatoN", country: "Sweden", debutYear: 2000, role: "Entry", peakRating: 98, trait: "压枪鼻祖" },
  { name: "Potti", country: "Sweden", debutYear: 2000, role: "Lurker", peakRating: 97, trait: "绝对冷静" },
  { name: "SpawN", country: "Sweden", debutYear: 2001, role: "Entry", peakRating: 96, trait: "黑甲忍者" },
  { name: "f0rest", country: "Sweden", debutYear: 2005, role: "Rifler", peakRating: 99, trait: "不老神话" },
  { name: "GeT_RiGhT", country: "Sweden", debutYear: 2007, role: "Lurker", peakRating: 98, trait: "绕后之王" },
  { name: "cArn", country: "Sweden", debutYear: 2004, role: "IGL", peakRating: 88, trait: "瑞典军师" },
  { name: "dsn", country: "Sweden", debutYear: 2004, role: "Sniper", peakRating: 92, trait: "稳健狙击" },
  { name: "zet", country: "Sweden", debutYear: 2005, role: "Entry", peakRating: 94, trait: "极致狂暴" },
  { name: "RobbaN", country: "Sweden", debutYear: 2004, role: "IGL", peakRating: 89, trait: "战术黏合剂" },
  { name: "Gux", country: "Sweden", debutYear: 2008, role: "Rifler", peakRating: 93, trait: "野兽突破" },
  // 🇵🇱 波兰黄金五人组 (Pentagram, MYM, FX)
  { name: "NEO", country: "Poland", debutYear: 2002, role: "Lurker", peakRating: 99, trait: "黑客帝国" },
  { name: "TaZ", country: "Poland", debutYear: 2002, role: "IGL", peakRating: 91, trait: "波兰老父亲" },
  { name: "LUq", country: "Poland", debutYear: 2002, role: "Sniper", peakRating: 90, trait: "暴躁狙击" },
  { name: "kuben", country: "Poland", debutYear: 2003, role: "Rifler", peakRating: 85, trait: "团队基石" },
  { name: "Loord", country: "Poland", debutYear: 2003, role: "Rifler", peakRating: 86, trait: "绿叶精神" },
  // 🇩🇰 丹麦童话 (mTw, NoA)
  { name: "ave", country: "Denmark", debutYear: 2006, role: "IGL", peakRating: 95, trait: "战术先驱" },
  { name: "sunde", country: "Denmark", debutYear: 2006, role: "Sniper", peakRating: 94, trait: "丹麦神眼" },
  { name: "zonic", country: "Denmark", debutYear: 2003, role: "Entry", peakRating: 92, trait: "冲锋主帅" },
  { name: "trace", country: "Denmark", debutYear: 2009, role: "Rifler", peakRating: 96, trait: "沉默杀手" },
  // 🇺🇸 北美荣耀 (3D, compLexity, EG)
  { name: "fRoD", country: "USA", debutYear: 2003, role: "Sniper", peakRating: 97, trait: "北美狙神" },
  { name: "Ksharp", country: "USA", debutYear: 2000, role: "Sniper", peakRating: 94, trait: "盲狙艺术" },
  { name: "n0thing", country: "USA", debutYear: 2007, role: "Lurker", peakRating: 93, trait: "穿墙神童" },
  { name: "Volcano", country: "USA", debutYear: 2001, role: "Rifler", peakRating: 89, trait: "地图理解" },
  { name: "Warden", country: "USA", debutYear: 2003, role: "IGL", peakRating: 88, trait: "北美大脑" },
  // 🇺🇦 独联体巨熊 (Na'Vi, pro100)
  { name: "markeloff", country: "Ukraine", debutYear: 2008, role: "Sniper", peakRating: 98, trait: "乌克兰死神" },
  { name: "Edward", country: "Ukraine", debutYear: 2004, role: "Entry", peakRating: 95, trait: "手枪王子" },
  { name: "Zeus", country: "Ukraine", debutYear: 2002, role: "IGL", peakRating: 90, trait: "雷神指挥" },
  { name: "starix", country: "Ukraine", debutYear: 2004, role: "Rifler", peakRating: 89, trait: "稳健防线" },
  { name: "B1ad3", country: "Ukraine", debutYear: 2005, role: "IGL", peakRating: 87, trait: "战术解剖" },
  { name: "Dosia", country: "Russia", debutYear: 2007, role: "Rifler", peakRating: 91, trait: "X神降临" },
  // 🇫🇷 法国与欧洲列强 (VG, mousesports)
  { name: "Ex6TenZ", country: "Belgium", debutYear: 2008, role: "IGL", peakRating: 93, trait: "独裁战术" },
  { name: "RpK", country: "France", debutYear: 2007, role: "Rifler", peakRating: 94, trait: "人形坦克" },
  { name: "shox", country: "France", debutYear: 2008, role: "Lurker", peakRating: 96, trait: "残局美学" },
  { name: "cyx", country: "Germany", debutYear: 2007, role: "Rifler", peakRating: 95, trait: "德国流星" },
  { name: "gob b", country: "Germany", debutYear: 2006, role: "IGL", peakRating: 92, trait: "土耳其智将" },
  // 🇧🇷 亚洲与南美猛兽 (mibr, wNv, e-STRO)
  { name: "cogu", country: "Brazil", debutYear: 2001, role: "Sniper", peakRating: 96, trait: "巴西大鸟" },
  { name: "Jungle", country: "China", debutYear: 2004, role: "Sniper", peakRating: 93, trait: "东方神狙" },
  { name: "alex", country: "China", debutYear: 2003, role: "IGL", peakRating: 90, trait: "wNv大脑" },
  { name: "Solo", country: "South Korea", debutYear: 2003, role: "Rifler", peakRating: 94, trait: "韩式自瞄" },
  { name: "elemeNt", country: "Norway", debutYear: 2002, role: "IGL", peakRating: 95, trait: "游侠指挥" }
];

const TRAITS_16 = {
  "压枪鼻祖": "步枪扫射转移多杀概率 +30%，近距离对枪胜率极高。",
  "绝对冷静": "不受任何队伍连败或士气低落的负面影响，发挥永远在基准线以上。",
  "黑甲忍者": "防守方或残局时，极高概率实现无伤偷背身击杀。",
  "不老神话": "能力值（Rating）不会随年龄增长而衰退，30岁后依然保持巅峰。",
  "绕后之王": "作为自由人（Lurker）时，回合中段击杀率提升 40%，破点效果极佳。",
  "黑客帝国": "1vX 残局全属性临时 +20%，身法判定极难被击中。",
  "战术先驱": "身为 IGL 时，全队磨合度（Chem）上限突破 100，达 120。",
  "北美狙神": "直面对方突破手时，拥有 80% 绝对截杀率。",
  "穿墙神童": "混烟、穿墙击杀率 +200%，无视掩体判定。",
  "乌克兰死神": "AWP 首杀率提升 50%，进攻狙极具统治力。",
  "手枪王子": "手枪局（Pistol Round）及纯 ECO 局个人战斗力暴增 50%。",
  "独裁战术": "执行特定战术训练时，全队磨合度增长速度翻倍，但不兼容其他 IGL。",
  "人形坦克": "作为突破手（Entry）时，生存率极高，对方很难打出“一击必杀”。",
  "德国流星": "全能型选手，不吃任何地图池惩罚，且自带极强的团队士气激励（R.I.P）。",
  "东方神狙": "对阵欧洲/美洲战队时，个人爆气概率增加，反应速度判定为最高档。",
  "韩式自瞄": "步枪爆头率（HS%）极高，伤害计算常驻 1.2 倍加成。"
};

const NAME_COUNTRIES=[
  {code:'UA',country:'Ukraine',first:['Oleksandr','Denis','Ihor','Andrii'],last:['Kostyliev','Shevchenko','Bondarenko','Kravchenko']},
  {code:'DK',country:'Denmark',first:['Nicolai','Peter','Lukas','Andreas'],last:['Jensen','Hansen','Nielsen','Christensen']},
  {code:'SE',country:'Sweden',first:['Christopher','Patrik','Olof','Freddy'],last:['Lindberg','Alesund','Johansson','Larsson']},
  {code:'NO',country:'Norway',first:['Ola','Jon','Lars','Kristian'],last:['Moum','Hansen','Nilsen','Larsen']},
  {code:'FR',country:'France',first:['Kenny','Mathieu','Richard','Nathan'],last:['Schrub','Herbaut','Moreau','Dubois']},
  {code:'PL',country:'Poland',first:['Jarosław','Michał','Paweł','Filip'],last:['Jarząbkowski','Nowak','Kowalski','Wiśniewski']},
  {code:'RU',country:'Russia',first:['Denis','Sergey','Ivan','Alexey'],last:['Sharipov','Kovalev','Petrov','Volkov']},
  {code:'US',country:'USA',first:['John','Jake','Ethan','Michael'],last:['Smith','Johnson','Brown','Davis']},
  {code:'BR',country:'Brazil',first:['Gabriel','Marcelo','Lucas','Yuri'],last:['Toledo','Silva','Oliveira','Souza']},
  {code:'FI',country:'Finland',first:['Aleksi','Jere','Jani','Sami'],last:['Virolainen','Laine','Virtanen','Korhonen']}
];
const HANDLE_CORES=['Sasha','ice','flame','shadow','storm','shift','nova','zero','flex','hunter','ghost','viper','aim','clutch'];
const HANDLE_SUFFIXES=['','-ic','-god','-shifter','-flex','-zero'];
const COACH_NAMES=["zonic","ave","kassad","threat","Aunkere","petr","lauNX","reatz","sdy","zehN","Robban","Snappi","MSL","stanislaw","adreN","lmbt","Xizt","SIXER","Trace","torben"];
const AI_TEAMS=["NAVI","FaZe","Vitality","G2","Spirit","MOUZ","VP","Astralis","NIP","fnatic","Liquid","Complexity","Cloud9","Heroic","ENCE","FURIA"];
// AI战队真实出道年份（用于防止时代错乱）
const AI_TEAMS_DEBUT={
  "NAVI":2009, "FaZe":2010, "Vitality":2018, "G2":2014, "Spirit":2012,
  "MOUZ":2002, "VP":2003, "Astralis":2016, "NIP":2012, "fnatic":2006,
  "Liquid":2015, "Complexity":2003, "Cloud9":2012, "Heroic":2016, "ENCE":2013, "FURIA":2017
};
const ROLES={
  Sniper:{zh:'狙击手',color:'#ef4444'},
  Entry: {zh:'突破手',color:'#f59e0b'},
  Lurker:{zh:'自由人',color:'#8b5cf6'},
  IGL:   {zh:'指挥',  color:'#06b6d4'},
  Rifler:{zh:'步枪手',color:'#6b7280'}
};
// ══════════════════════════════════════════════════════
//  三级特质库 (Trait Library v6)
// ══════════════════════════════════════════════════════

// A. 【常规特质】—— 路人选手20%概率获得1个
const NORMAL_TRAITS={
  // ── 进攻型 ─────────────────────
  headshot:{
    name:'爆头机器', tier:'normal', color:'#ef4444', badge:'🎯',
    desc:'步枪局（Full Buy）个人战力+6%；担任首杀角色时额外+4%',
    combatBonus(buy,isOpener){return (buy.lvl==='Full'?0.06:0)+(isOpener?0.04:0);},
  },
  aggressor:{
    name:'极限侵略', tier:'normal', color:'#dc2626', badge:'🔥',
    desc:'作为T方攻击时战力+6%；前3回合开局冲动再+4%',
    attackBonus:0.06, earlyBonus:0.04
  },
  rapidFire:{
    name:'连点大师', tier:'normal', color:'#f87171', badge:'💥',
    desc:'中期枪战（Brawl）胜率+9%；多杀概率+15%',
    brawlBonus:0.09, multiKillChance:0.15
  },
  coldBlood:{
    name:'冷血猎手', tier:'normal', color:'#60a5fa', badge:'🧊',
    desc:'每当己方队友倒下，本选手当回合战力+4%（叠加，上限+20%）',
    tradeUpBonus:0.04, tradeUpCap:0.20
  },
  // ── 防守型 ─────────────────────
  bigHeart:{
    name:'大心脏', tier:'normal', color:'#f97316', badge:'💪',
    desc:'残局1vX时Clutch成功率+25%，成功必定日志高亮',
    clutchBonus:0.25
  },
  anchor:{
    name:'中流砥柱', tier:'normal', color:'#06b6d4', badge:'⚓',
    desc:'作为CT防守方时个人战力+6%；被分配锚点阵位时额外+4%',
    ctBonus:0.06, anchorBonus:0.04
  },
  retake:{
    name:'反夺神手', tier:'normal', color:'#8b5cf6', badge:'🔄',
    desc:'下半场（>12回合）CT战力+8%；CT残局防守+6%',
    retakeBonus:0.08, lateClutchBonus:0.06
  },
  // ── 状态型 ─────────────────────
  volatile:{
    name:'神经刀', tier:'normal', color:'#a855f7', badge:'⚡',
    desc:'每回合战力随机乘0.80~1.30，极高上限与极低下限',
    volatileMin:0.80, volatileMax:1.30
  },
  streaky:{
    name:'手感派', tier:'normal', color:'#fbbf24', badge:'🎰',
    desc:'连赢2回合+4%，3连+8%，4连+15%；输回合后重置',
    streakMults:[0,0,0.04,0.08,0.15]
  },
  clutchGene:{
    name:'决赛基因', tier:'normal', color:'#10b981', badge:'🧬',
    desc:'半决赛/决赛阶段全场战力+5%；最终图加时+4%',
    finalsBonus:0.05, lastMapBonus:0.04
  },
  // ── 战术型 ─────────────────────
  leader:{
    name:'领袖', tier:'normal', color:'#eab308', badge:'📣',
    desc:'担任IGL时全队回合战力+4%；首次触发日志播报',
    roundMult(role){return role==='IGL'?0.04:0;}
  },
  utilityKing:{
    name:'工具人之神', tier:'normal', color:'#84cc16', badge:'💣',
    desc:'每回合为全队提供战术压制+2%；己方Force Buy时额外+6%',
    utilBonus:0.02, forceBonus:0.06
  },
  mapControl:{
    name:'地图宰制', tier:'normal', color:'#22d3ee', badge:'🗺',
    desc:'第12回合后战力+6%；地图熟练度高时再+4%',
    lateGameBonus:0.06, mapMasteryBonus:0.04
  },
  // ── 经济型 ─────────────────────
  ecoPunish:{
    name:'ECO克星', tier:'normal', color:'#f59e0b', badge:'💰',
    desc:'对方Eco局时个人战力+12%；Force Buy局+6%',
    vsEcoBonus:0.12, vsForceBonus:0.06
  },
  forceBuy:{
    name:'强起特攻', tier:'normal', color:'#fb923c', badge:'💸',
    desc:'己方Force Buy时战力惩罚减半（mult升至0.78）；Eco时+8%',
    forceMultOverride:0.78, ecoBonus:0.08
  },
  // ── 特殊型 ─────────────────────
  snakeEyes:{
    name:'蛇眼', tier:'normal', color:'#94a3b8', badge:'👁',
    desc:'Lurker角色时：首杀阶段额外+12%，残局胜率+15%',
    lurkFirstKill:0.12, lurkClutch:0.15
  }
};

// B. 【通用传奇特质】—— 仅 Regen Legend (0.5%) 可抽取
const GENERIC_LEGEND_TRAITS={
  legend_core:{
    name:'绝对核心', tier:'legend_generic', color:'#ffd700', badge:'💎',
    desc:'1vX残局时个人战力+20%，强制尝试Clutch；金字高亮播报',
    clutchPowerBonus:0.20
  },
  legend_winner:{
    name:'天生赢家', tier:'legend_generic', color:'#ffd700', badge:'🏆',
    desc:'半决赛/决赛阶段，赛后Rating强制≥1.10；触发时金字高亮播报',
    minRatingInFinals:1.10
  }
};

// C. 【历史专属签名特质】—— 唯一绑定特定真实选手
const SIGNATURE_TRAITS={
  sig_s1mple:{
    name:'天外飞仙', tier:'signature', color:'#ff6b35', badge:'👑',
    owner:'s1mple', ownerDisplay:'s1mple',
    desc:'【s1mple专属】落后≥4分时自动接管：战力+20%，多杀概率翻倍；首次触发金字播报',
    powerBonus:0.20, multiKillMult:2.0, gapTrigger:4
  },
  sig_zywoo:{
    name:'载物领域', tier:'signature', color:'#00d4ff', badge:'🌀',
    owner:'ZyWoO', ownerDisplay:'ZyWoO',
    desc:'【ZyWoO专属】免疫负面状态；手枪局战力不打折扣；1vX残局Clutch+55%',
    immuneNegative:true, pistolFullPower:true, clutchBonus:0.55
  },
  sig_karrigan:{
    name:'战术大脑', tier:'signature', color:'#a78bfa', badge:'🧠',
    owner:'karrigan', ownerDisplay:'karrigan',
    desc:'【karrigan专属】上场时无视Synergy惩罚（强制≥1.0），全队战力×1.1',
    ignoreSynergyPenalty:true, teamPowerMult:1.1
  },
  sig_gla1ve:{
    name:'战术大脑', tier:'signature', color:'#a78bfa', badge:'🧠',
    owner:'gla1ve', ownerDisplay:'gla1ve',
    desc:'【gla1ve专属】上场时无视Synergy惩罚（强制≥1.0），全队战力×1.1',
    ignoreSynergyPenalty:true, teamPowerMult:1.1
  },
  sig_f0rest:{
    name:'不老神话', tier:'signature', color:'#34d399', badge:'🌲',
    owner:'f0rest', ownerDisplay:'f0rest',
    desc:'【f0rest专属】30岁后能力值永久不受年龄影响，拒绝下滑',
    agelessAfter:30
  },
  // ─── 青训专属 ───────────────────────
  '青训忠魂':{
    name:'青训忠魂', tier:'normal', color:'#10b981', badge:'🌱',
    desc:'自家青训提拔的太子。工资要求降低 20%，不会因替补或连败抱怨',
    loyalty:true, salaryDisc:0.8
  },
  '天才少年':{
    name:'天才少年', tier:'normal', color:'#eab308', badge:'✨',
    desc:'青训营顶级产物。潜力上限极高，且训练成长速度翻倍',
    highPot:true, trainBonus:2.0
  }
};

// D. 【1.6 时代传奇特质】
const LEGEND_16_TRAIT_CONFIG = {
  "压枪鼻祖": { name: "压枪鼻祖", tier: "signature", color: "#ef4444", badge: "🔫", desc: TRAITS_16["压枪鼻祖"], sprayMult: 1.3 },
  "绝对冷静": { name: "绝对冷静", tier: "signature", color: "#3b82f6", badge: "🧊", desc: TRAITS_16["绝对冷静"], immuneMorale: true },
  "黑甲忍者": { name: "黑甲忍者", tier: "signature", color: "#18181c", badge: "🥷", desc: TRAITS_16["黑甲忍者"], stealthKill: true },
  "不老神话": { name: "不老神话", tier: "signature", color: "#34d399", badge: "🌲", desc: TRAITS_16["不老神话"], ageless: true },
  "绕后之王": { name: "绕后之王", tier: "signature", color: "#a855f7", badge: "👑", desc: TRAITS_16["绕后之王"], lurkBonus: 1.4 },
  "黑客帝国": { name: "黑客帝国", tier: "signature", color: "#22c55e", badge: "🕶", desc: TRAITS_16["黑客帝国"], matrixClutch: 1.2 },
  "战术先驱": { name: "战术先驱", tier: "signature", color: "#06b6d4", badge: "🧠", desc: TRAITS_16["战术先驱"], chemCapBonus: 20 },
  "北美狙神": { name: "北美狙神", tier: "signature", color: "#ef4444", badge: "🎯", desc: TRAITS_16["北美狙神"], entryStop: 0.8 },
  "穿墙神童": { name: "穿墙神童", tier: "signature", color: "#f59e0b", badge: "🧱", desc: TRAITS_16["穿墙神童"], wallbangMult: 3.0 },
  "乌克兰死神": { name: "乌克兰死神", tier: "signature", color: "#ef4444", badge: "💀", desc: TRAITS_16["乌克兰死神"], awpEntry: 1.5 },
  "手枪王子": { name: "手枪王子", tier: "signature", color: "#3b82f6", badge: "🔫", desc: TRAITS_16["手枪王子"], pistolPower: 1.5 },
  "独裁战术": { name: "独裁战术", tier: "signature", color: "#ef4444", badge: "⚖", desc: TRAITS_16["独裁战术"], chemSpeed: 2.0 },
  "人形坦克": { name: "人形坦克", tier: "signature", color: "#6b7280", badge: "🛡", desc: TRAITS_16["人形坦克"], survival: 1.5 },
  "德国流星": { name: "德国流星", tier: "signature", color: "#ffd700", badge: "🌠", desc: TRAITS_16["德国流星"], noMapPenalty: true, moraleBoost: 0.05 },
  "东方神狙": { name: "东方神狙", tier: "signature", color: "#ef4444", badge: "🐉", desc: TRAITS_16["东方神狙"], antiWest: true },
  "韩式自瞄": { name: "韩式自瞄", tier: "signature", color: "#ef4444", badge: "🎯", desc: TRAITS_16["韩式自瞄"], headshotMult: 1.2 }
};

// 统一查询接口（向后兼容 TRAITS / LEGEND_TRAITS 引用）
const ALL_TRAITS={...NORMAL_TRAITS,...GENERIC_LEGEND_TRAITS,...SIGNATURE_TRAITS,...LEGEND_16_TRAIT_CONFIG};
const TRAITS=ALL_TRAITS;
const LEGEND_TRAITS=ALL_TRAITS;

// 常量键列表
const NORMAL_TRAIT_KEYS=Object.keys(NORMAL_TRAITS);       // ['headshot','bigHeart','volatile','leader']
const GENERIC_LEGEND_KEYS=Object.keys(GENERIC_LEGEND_TRAITS); // ['legend_core','legend_winner']

// 特质层级判断
const traitTier=k=>{if(SIGNATURE_TRAITS[k])return'signature';if(GENERIC_LEGEND_TRAITS[k])return'legend_generic';return'normal';};
const isSignatureTrait=k=>!!SIGNATURE_TRAITS[k];
const isAnyLegendTrait=k=>!!GENERIC_LEGEND_TRAITS[k]||!!SIGNATURE_TRAITS[k];

// 特质徽章渲染（分级配色+动画）
const renderTraitBadge=(key,withTooltip=true)=>{
  const T=ALL_TRAITS[key];if(!T)return'';
  const tier=T.tier||'normal';
  let cls,style;
  if(tier==='signature'){
    cls='trait-sig';
    style=`background:linear-gradient(135deg,${T.color}33,${T.color}66);border:1px solid ${T.color};color:${T.color};`;
  }else if(tier==='legend_generic'){
    cls='trait-legend';
    style=`background:rgba(255,215,0,0.15);border:1px solid #ffd700;color:#ffd700;`;
  }else{
    cls='trait-normal';
    style=`background:${T.color}22;border:1px solid ${T.color}66;color:${T.color};`;
  }
  const tip=withTooltip?` title="${T.name}：${T.desc}"`:'';
  return`<span class="${cls}" style="${style}"${tip}>${T.badge||''} ${T.name}</span>`;
};
const RARITY={
  common:  {name:'普通',color:'#fff',   border:'1px solid var(--border)'},
  uncommon:{name:'优秀',color:'#86efac',border:'1px solid #86efac'},
  rare:    {name:'明星',color:'#a855f7',border:'1px solid #a855f7'},
  legend:  {name:'传奇',color:'#ffd700',border:'2px solid #ffd700',shadow:'0 0 10px rgba(255,215,0,0.3)'}
};
const ERA_MAPS={
  2000:['Dust2','Inferno','Nuke','Train','Tuscan','Mirage_16','Aztec'],
  2012:['Dust2','Inferno','Nuke','Train','Mirage','Overpass','Cache'],
  2017:['Dust2','Inferno','Nuke','Train','Mirage','Overpass','Cobblestone'],
  2019:['Dust2','Inferno','Nuke','Train','Mirage','Overpass','Vertigo'],
  2021:['Dust2','Inferno','Nuke','Ancient','Mirage','Overpass','Vertigo'],
  2023:['Dust2','Inferno','Nuke','Ancient','Mirage','Anubis','Vertigo']
};
const MAP_DISPLAY={Mirage_16:'Mirage',Dust2:'Dust2',Inferno:'Inferno',Nuke:'Nuke',Train:'Train',Tuscan:'Tuscan',Aztec:'Aztec',Mirage:'Mirage',Overpass:'Overpass',Cache:'Cache',Cobblestone:'Cobble.',Vertigo:'Vertigo',Ancient:'Ancient',Anubis:'Anubis'};

// --- 🗺️ 地图风格权重配置 (Map Weights) ---
// 未列出的属性默认为 1.0。
// > 1.0 代表该图需要更高此属性才能发挥；< 1.0 代表该属性在此图作用被削弱
const MAP_STYLES = {
  // tactics: { rush, slow, aggro, retake } >1 优势, <1 劣势
  // 核心属性权重控制在 1.05~1.12；战术权重上限控制在 1.18
  'Inferno': { firepower: 0.95, utility: 1.10, trading: 1.05, tactics: { rush: 0.90, slow: 1.15, aggro: 1.0, retake: 0.88 } },
  'Dust2': { firepower: 1.10, sniping: 1.12, tactics: { rush: 1.10, slow: 0.94, aggro: 1.10, retake: 0.96 } },
  'Mirage': { trading: 1.05, tactics: { rush: 1.0, slow: 1.10, aggro: 1.0, retake: 1.0 } },
  'Nuke': { utility: 1.06, tactics: { rush: 1.08, slow: 0.96, aggro: 1.12, retake: 1.15 } },
  'Overpass': { utility: 1.08, tactics: { rush: 0.94, slow: 1.08, aggro: 1.10, retake: 1.08 } },
  'Vertigo': { utility: 1.10, tactics: { rush: 1.15, slow: 0.94, aggro: 1.12, retake: 0.90 } },
  'Ancient': { firepower: 1.06, tactics: { rush: 1.04, slow: 1.0, aggro: 1.08, retake: 1.04 } },
  'Anubis': { firepower: 1.06, tactics: { rush: 1.10, slow: 0.96, aggro: 1.0, retake: 1.08 } },
  // Fallback for others
  'Train': { sniping: 1.06, utility: 1.03, entrying: 0.97, tactics: { rush: 1.0, slow: 1.0, aggro: 1.0, retake: 1.0 } },
  'Aztec': { sniping: 1.08, firepower: 1.00, entrying: 0.95, tactics: { rush: 1.0, slow: 1.0, aggro: 1.0, retake: 1.0 } },
  'Cache': { firepower: 1.06, clutching: 1.03, utility: 0.97, tactics: { rush: 1.0, slow: 1.0, aggro: 1.0, retake: 1.0 } },
  'Tuscan': { firepower: 1.03, entrying: 1.03, utility: 1.00, tactics: { rush: 1.0, slow: 1.0, aggro: 1.0, retake: 1.0 } },
  'Cobblestone': { entrying: 1.06, sniping: 1.03, utility: 0.97, tactics: { rush: 1.0, slow: 1.0, aggro: 1.0, retake: 1.0 } },
  'Mirage_16': { sniping: 1.03, trading: 1.03, firepower: 1.03, tactics: { rush: 1.0, slow: 1.0, aggro: 1.0, retake: 1.0 } }
};

// --- 🛡️ CS 1.6 时代传奇战队库 (2000 - 2011) ---
const TEAMS_16 = [
    // 👑 瑞典双王与宇宙队
    { name: "Ninjas in Pyjamas", country: "Sweden", debutYear: 2000, core:["HeatoN", "Potti"], trait: "信仰图腾", baseRating: 88 },
    { name: "SK Gaming", country: "Sweden", debutYear: 2003, core:["SpawN", "HeatoN", "Potti", "elemeNt"], trait: "豪门血统", baseRating: 92 },
    { name: "fnatic", country: "Sweden", debutYear: 2006, core:["cArn", "dsn", "f0rest", "GeT_RiGhT", "Gux"], trait: "瑞典狂鲨", baseRating: 95 },

    // 🦅 北美复兴双雄
    { name: "Team 3D", country: "USA", debutYear: 2002, core: ["Ksharp", "Volcano"], trait: "北美荣光", baseRating: 85 },
    { name: "compLexity", country: "USA", debutYear: 2004, core: ["fRoD", "Warden"], trait: "激情怒吼", baseRating: 89 },

    // 🚜 东欧铁骑与巨熊
    { name: "Golden Five", country: "Poland", debutYear: 2004, core:["NEO", "TaZ", "LUq", "kuben", "Loord"], trait: "兄弟CS", baseRating: 90 },
    { name: "Natus Vincere", country: "Ukraine", debutYear: 2010, core: ["Zeus", "Edward", "markeloff", "starix"], trait: "天生赢家", baseRating: 96 },

    // 🧠 欧洲战术大师
    { name: "mTw", country: "Denmark", debutYear: 2008, core:["ave", "sunde", "zonic", "trace"], trait: "道具艺术", baseRating: 93 },
    { name: "VeryGames", country: "France", debutYear: 2008, core:["Ex6TenZ", "shox", "RpK"], trait: "法式宫斗", baseRating: 91 },
    { name: "mousesports", country: "Germany", debutYear: 2007, core:["gob b", "cyx"], trait: "德国战车", baseRating: 88 },

    // 🐉 亚洲与南美猛兽
    { name: "wNv Teamwork", country: "China", debutYear: 2005, core: ["alex", "Jungle"], trait: "东方长城", baseRating: 87 },
    { name: "mibr", country: "Brazil", debutYear: 2006, core: ["cogu"], trait: "桑巴律动", baseRating: 86 }
];

// --- 🛡️ 战队底蕴特质效果库 (AI 队伍专属 Buff) ---
const TEAM_TRAITS_16 = {
    "信仰图腾": "队伍基础士气永远保持在 80% 以上，极难被经济局打崩。",
    "豪门血统": "拥有极强的资金吸引力，当核心选手被挖走时，总能迅速从自由市场买入最高评分的替补。",
    "瑞典狂鲨": "在半场落后时，下半场全员 Rating 临时 +5，极易实现惊天翻盘。",
    "北美荣光": "全队在手枪局（Pistol Round）的胜率强行提升 20%。",
    "激情怒吼": "每次完成残局（Clutch）或 ECO 翻盘后，连续 3 个回合全队战斗力激增。",
    "兄弟CS": "队伍无需教练即可达到 100% 的最高磨合度（Chem），且免疫任何内讧事件。",
    "天生赢家": "在 Major 级别的淘汰赛中，全队进入“绝对专注”状态，不再出现低级失误。",
    "道具艺术": "作为防守方（CT）时，回合前期（默认前 30 秒）对方突破成功率下降 30%。",
    "法式宫斗": "上限极高（全员状态好时神挡杀神），但每年有 20% 概率触发内讧，随机解雇队内一名核心。",
    "德国战车": "ECO 局和长枪局的战术执行力完全一致，不吃任何经济劣势带来的面板惩罚。",
    "东方长城": "在自己选择的强图（Pick Map）上，防守方胜率极高。",
    "桑巴律动": "顺风局无敌。如果开局连拿 3 分，当场比赛剩余时间全员压枪命中率提升 15%。"
};

// --- 📅 历史核心赛事配置 ---
const HISTORICAL_EVENT_CONFIG = {
    // 2000-2002: CPL 双败时代
    era_early: [
        { month: 6, name: 'CPL Summer', tier: 'major', bracket: 'DE', prize: 150000, teams: 32 },
        { month: 11, name: 'CPL Winter', tier: 'major', bracket: 'DE', prize: 150000, teams: 32 }
    ],
    // 2003-2005: WCG/ESWC 三足鼎立
    era_golden: [
        { month: 6, name: 'CPL Summer', tier: 'major', bracket: 'DE', prize: 200000, teams: 32 },
        { month: 7, name: 'ESWC', tier: 'major', bracket: 'GSE', prize: 150000, teams: 32 }, // Groups + Single Elim
        { month: 10, name: 'WCG', tier: 'major', bracket: 'GSE', prize: 250000, teams: 32 },
        { month: 12, name: 'CPL Winter', tier: 'major', bracket: 'DE', prize: 200000, teams: 32 }
    ],
    // 2006-2008: 1.6 巅峰混战
    era_peak: [
        { month: 2, name: 'IEM World Championship', tier: 'major', bracket: 'GSE', prize: 250000, teams: 24 },
        { month: 6, name: 'ESWC', tier: 'major', bracket: 'GSE', prize: 200000, teams: 32 },
        { month: 10, name: 'WCG', tier: 'major', bracket: 'GSE', prize: 300000, teams: 32 },
        // A-Tier 随机插入
        { type: 'random_a', pool: ['KODE5', 'WEM', 'DreamHack'], count: 2 }
    ],
    // 2009-2012: IEM 崛起
    era_late: [
        { month: 2, name: 'IEM World Championship', tier: 'major', bracket: 'GSE', prize: 300000, teams: 24 },
        { month: 7, name: 'GameGune', tier: 'a-tier', bracket: 'DE', prize: 80000, teams: 16 },
        { month: 10, name: 'WCG', tier: 'major', bracket: 'GSE', prize: 250000, teams: 32 },
        { month: 11, name: 'DreamHack Winter', tier: 'major', bracket: 'SE', prize: 150000, teams: 16 }
    ]
};

const HISTORICAL_DATA={
  era2000:{
    teams:[
      {name:'Ninjas in Pyjamas',rating:90,players:['HeatoN','Potti']},
      {name:'SK Gaming',rating:88,players:['SpawN']},
      {name:'Team 3D',  rating:86,players:['Ksharp']},
      {name:'mTw',      rating:85,players:['elemeNt']}
    ],
    players:{
      HeatoN: {name:'HeatoN', role:'Entry', rating:92,age:20,country:'Sweden',countryCode:'SE',realName:'Emil Christensen',
                normalTraits:['headshot','bigHeart']},
      Potti:  {name:'Potti',  role:'Rifler',rating:90,age:21,country:'Sweden',countryCode:'SE',realName:'Tommy Ingemarsson',
                normalTraits:['headshot','volatile']},
      SpawN:  {name:'SpawN',  role:'Rifler',rating:89,age:19,country:'Sweden',countryCode:'SE',realName:'Abdisamad Mohamed',
                normalTraits:['bigHeart','headshot']},
      elemeNt:{name:'elemeNt',role:'IGL',   rating:88,age:20,country:'Norway',countryCode:'NO',realName:'Ola Moum',
                normalTraits:['leader','bigHeart']},
      Ksharp: {name:'Ksharp', role:'Sniper',rating:87,age:22,country:'USA',   countryCode:'US',realName:'Kyle Miller',
                normalTraits:['headshot','volatile']}
    }
  },
  era2012:{
    teams:[
      {name:'Virtus.pro',rating:88,players:['pashaBiceps']},
      {name:'Fnatic',    rating:90,players:['JW']},
      {name:'Titan',     rating:89,players:['KennyS']},
      {name:'LDLC',      rating:87,players:[]},
      {name:'NIP',       rating:93,players:['GeT_RiGhT','f0rest']}
    ],
    players:{
      GeT_RiGhT:  {name:'GeT_RiGhT',  role:'Lurker',rating:95,age:22,country:'Sweden',countryCode:'SE',realName:'Christopher Alesund',
                    normalTraits:['bigHeart','headshot']},
      f0rest:     {name:'f0rest',      role:'Rifler',rating:93,age:24,country:'Sweden',countryCode:'SE',realName:'Patrik Lindberg',
                    signatureTrait:'sig_f0rest', normalTraits:['headshot','bigHeart']},
      JW:         {name:'JW',          role:'Sniper',rating:90,age:20,country:'Sweden',countryCode:'SE',realName:'Jesper Wecksell',
                    normalTraits:['volatile','headshot']},
      KennyS:     {name:'KennyS',      role:'Sniper',rating:94,age:18,country:'France',countryCode:'FR',realName:'Kenny Schrub',
                    normalTraits:['headshot','bigHeart']},
      pashaBiceps:{name:'pashaBiceps', role:'Rifler',rating:90,age:24,country:'Poland',countryCode:'PL',realName:'Jarosław Jarząbkowski',
                    normalTraits:['bigHeart','volatile']}
    }
  },
  era2020:{
    teams:[
      {name:'NAVI',    rating:95,players:['s1mple']},
      {name:'Vitality',rating:94,players:['ZywOo']},
      {name:'G2',      rating:92,players:['NiKo']},
      {name:'Astralis',rating:90,players:['dev1ce']}
    ],
    players:{
      s1mple:{name:'s1mple',role:'Sniper',rating:97,age:23,country:'Ukraine',countryCode:'UA',realName:'Oleksandr Kostyliev',
               debutYear:2014,debutAge:16,firstTeamId:'NAVI',
               signatureTrait:'sig_s1mple', normalTraits:['bigHeart','headshot']},
      ZywOo: {name:'ZyWoO', role:'Sniper',rating:96,age:20,country:'France', countryCode:'FR',realName:'Mathieu Herbaut',
               debutYear:2018,debutAge:17,firstTeamId:'Vitality',
               signatureTrait:'sig_zywoo',  normalTraits:['headshot','bigHeart']},
      NiKo:  {name:'NiKo',  role:'Rifler',rating:94,age:23,country:'Bosnia & Herzegovina',countryCode:'BA',realName:'Nikola Kovač',
               debutYear:2013,debutAge:16,firstTeamId:'G2',
               normalTraits:['headshot','volatile']},
      dev1ce:{name:'dev1ce',role:'Sniper',rating:93,age:24,country:'Denmark',countryCode:'DK',realName:'Nicolai Reedtz',
               debutYear:2012,debutAge:17,firstTeamId:'Astralis',
               normalTraits:['bigHeart','headshot']},
      donk:  {name:'donk',  role:'Rifler',rating:95,age:19,country:'Russia', countryCode:'RU',realName:'Danil Kryshkovets',
               debutYear:2023,debutAge:16,firstTeamId:'Spirit',
               normalTraits:['volatile','headshot']}
    }
  }
};
const REAL_TEAM_IDS=(()=>{
  const s=new Set();
  Object.values(HISTORICAL_DATA).forEach(e=>{if(e&&e.teams)e.teams.forEach(t=>s.add(t.name));});
  TEAMS_16.forEach(t=>s.add(t.name));
  ['NAVI','FaZe','Vitality','G2','NIP','Ninjas in Pyjamas','fnatic','Astralis','Virtus.pro','Fnatic','Spirit'].forEach(n=>s.add(n));
  return s;
})();
const isRealTeam=n=>n&&REAL_TEAM_IDS.has(n);
const teamNameWithStar = (teamOrName) => {
    if (!teamOrName) return '';
    if (typeof teamOrName === 'object') {
        return teamOrName.isReal ? teamOrName.name + ' <span style="color:#ffd700" title="真实战队">⭐</span>' : teamOrName.name;
    }
    return isRealTeam(teamOrName) ? teamOrName + ' <span style="color:#ffd700" title="真实战队">⭐</span>' : teamOrName;
};
const RANDOM_EVENTS=[
  {txt:'${p} 参加了网络直播，睡眠不足。',      effect:p=>{p.form=Math.max(.7,p.form-.06)},target:'player'},
  {txt:'${p} 在个人直播中状态极佳，手感火热！', effect:p=>{p.form=Math.min(1.2,p.form+.06)},target:'player'},
  {txt:'${p} 因轻伤休息了几天。',               effect:p=>{p.form=Math.max(.75,p.form-.05)},target:'player'},
  {txt:'俱乐部收到赞助商鼓励，全队士气提振！',  effect:null,target:'team',teamEffect:r=>{r.forEach(p=>p.form=Math.min(1.15,p.form+.04))}},
  {txt:'备战期间训练设施故障，影响本周训练。',  effect:null,target:'team',teamEffect:r=>{r.forEach(p=>p.form=Math.max(.8,p.form-.04))}},
  {txt:'${p} 参加了慈善赛事，经验丰富心态稳定。',effect:p=>{p.form=Math.min(1.18,p.form+.04)},target:'player'},
  {txt:'近期联队合作频繁，磨合度微升。',         effect:null,target:'chem',chemEffect:3},
  {txt:'内部意见分歧，磨合度略有下降。',         effect:null,target:'chem',chemEffect:-4},
  {txt:'${p} 手腕有些不适，状态受轻微影响。',   effect:p=>{p.form=Math.max(.78,p.form-.05)},target:'player'},
  {txt:'${p} 最近私下苦练，状态悄悄上涨。',      effect:p=>{p.form=Math.min(1.2,p.form+.05)},target:'player'},
];

const CONFIG = {
    PLAYER_INITIAL_FANS: {
        amateur: { min: 0, max: 300 },
        semiPro: { min: 200, max: 2000 },
        pro: { min: 1000, max: 10000 },
        star: { min: 30000, max: 300000 },
        legendary: { min: 500000, max: 5000000 }
    },
    TOURNAMENT_TIER_WEIGHT: {
        'c-tier': 0.2,
        'b-tier': 0.5,
        'a-tier': 1.0,
        's-tier': 2.0,
        'major': 4.0
    },
    PLACEMENT_WEIGHT: {
        Champion: 1.0,
        RunnerUp: 0.7,
        Top4: 0.4,
        Top8: 0.2,
        GroupExit: 0.05
    },
    BASE_TOURNAMENT_FAN_VALUE: 600,
    HONOR_FAN_BONUS: {
        S_Champion: 20000,
        Major_Champion: 100000,
        MVP: 30000
    },
    TEAM_BRAND_GROWTH: {
        S_Champion: 30000,
        Major_Champion: 150000,
        S_Final: 15000,
        Major_Final: 60000
    },
    SPONSOR_TIERS: [
      // Tier 0: 网吧联赛周边赞助，C-tier 就能拿到，小额但帮助起步
      { name: "网吧设备赞助 (Gear Starter)", minFans: 500, minTierRequirement: "c-tier", requiredEventCount: 4, baseValue: 20000, exposureMultiplier: 0.5 },
      // Tier 1: 区域外设厂商，需打进 B-tier 才能获得
      { name: "外设品牌赞助 (Peripheral)", minFans: 5000, minTierRequirement: "b-tier", requiredEventCount: 6, baseValue: 80000, exposureMultiplier: 0.8 },
      // Tier 2: 稳定 A-tier 的队伍，获得能量饮料/硬件大厂赞助
      { name: "硬件/饮料品牌 (Hardware/Drink)", minFans: 30000, minTierRequirement: "a-tier", requiredEventCount: 8, baseValue: 250000, exposureMultiplier: 1.0 },
      // Tier 3: 世界前十常客，进入 Major 视野
      { name: "国际一线品牌 (Global Brand)", minFans: 150000, minTierRequirement: "major", requiredEventCount: 10, baseValue: 800000, exposureMultiplier: 1.2 },
      // Tier 4: 世界顶尖豪门
      { name: "头部冠名赞助 (Title Sponsor)", minFans: 600000, minTierRequirement: "major", requiredEventCount: 12, baseValue: 2200000, exposureMultiplier: 1.5 }
    ]
};
