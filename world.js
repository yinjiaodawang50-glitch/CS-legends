// ══════════════════════════════════════════════════════
//  world.js — 工具函数、SponsorManager、World 对象
// ══════════════════════════════════════════════════════
const rnd =(a,b)=>Math.floor(Math.random()*(b-a+1))+a;

// ─── 7D 雷达图 ────────────────────────────────────────
// axes: firepower, entrying, trading, opening, clutching, sniping, utility
// size: pass canvas.width (square). mini=true → skip labels
function drawPlayerRadar(canvas, player, mini) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const h = (player && player.hltv) ? player.hltv : null;
  if (!h) return;

  const KEYS   = ['firepower','entrying','trading','opening','clutching','sniping','utility'];
  const LABELS = ['Firepower','Entrying','Trading','Opening','Clutching','Sniping','Utility'];
  const N   = KEYS.length;
  const cx  = W / 2, cy = H / 2;
  const R   = mini ? W * 0.40 : W * 0.36;       // 稍微缩小，给 sub_pot 虚线圈留空间
  const labelR = R + (mini ? 0 : 20);

  // sub_pot：各属性独立潜力上限（兼容旧无 sub_pot 数据）
  const subPot = player.sub_pot || null;

  const angle = i => (Math.PI * 2 * i / N) - Math.PI / 2;

  // ── 1. 背景参考环 ──────────────────────────────────
  [25, 50, 75, 100].forEach(pct => {
    const r = R * pct / 100;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const a = angle(i); const x = cx + r * Math.cos(a); const y = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = mini ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.11)';
    ctx.lineWidth = 0.7;
    ctx.stroke();
  });

  // ── 2. 轴线 ────────────────────────────────────────
  if (!mini) {
    for (let i = 0; i < N; i++) {
      const a = angle(i);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
  }

  // ── 3. sub_pot 虚线圈（各属性独立上限）─────────────
  if (subPot && !mini) {
    // 以各 sub_pot/100 为半径，绘制每条轴上的标记点，再连成虚线多边形
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = 'rgba(232,168,56,0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    KEYS.forEach((k, i) => {
      const sp = Math.min(99, subPot[k] || 99);
      const a  = angle(i);
      const r  = R * sp / 100;
      const x  = cx + r * Math.cos(a);
      const y  = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  } else if (subPot && mini) {
    // mini 模式：简单虚线圈
    ctx.save();
    ctx.setLineDash([2, 2]);
    ctx.strokeStyle = 'rgba(232,168,56,0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    KEYS.forEach((k, i) => {
      const sp = Math.min(99, subPot[k] || 99);
      const a  = angle(i);
      const r  = R * sp / 100;
      i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
              : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    });
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  // ── 4. 实际数据多边形 ──────────────────────────────
  const vals = KEYS.map(k => Math.min(100, Math.max(0, h[k] || 0)));
  ctx.beginPath();
  vals.forEach((v, i) => {
    const a = angle(i); const r = R * v / 100;
    i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
            : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  });
  ctx.closePath();
  ctx.fillStyle   = mini ? 'rgba(232,168,56,0.28)' : 'rgba(232,168,56,0.20)';
  ctx.fill();
  ctx.strokeStyle = '#e8a838';
  ctx.lineWidth   = mini ? 1.5 : 2;
  ctx.stroke();

  // ── 5. 数值点 ──────────────────────────────────────
  if (!mini) {
    vals.forEach((v, i) => {
      const a = angle(i); const r = R * v / 100;
      ctx.beginPath();
      ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 3, 0, Math.PI * 2);
      ctx.fillStyle = '#e8a838';
      ctx.fill();
    });
  }

  // ── 6. 标签 + 数值/上限 ───────────────────────────
  if (!mini) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    LABELS.forEach((lbl, i) => {
      const a   = angle(i);
      const lx  = cx + (labelR + 6) * Math.cos(a);
      const ly  = cy + (labelR + 6) * Math.sin(a);
      // 属性名
      ctx.font      = '9.5px Consolas, monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      ctx.fillText(lbl, lx, ly - 5);
      // 数值/上限（如有 sub_pot）
      const key = KEYS[i];
      const v   = Math.round(h[key] || 0);
      const sp  = subPot ? (subPot[key] || 99) : 99;
      ctx.font      = '9px Consolas, monospace';
      ctx.fillStyle = v >= sp * 0.95 ? 'var(--gold)' : v >= sp * 0.8 ? '#86efac' : '#e8a838';
      ctx.fillText(`${v}/${sp}`, lx, ly + 7);
    });
  }
}

const pick=arr=>arr[Math.floor(Math.random()*arr.length)];
const fmtD=d=>d.toISOString().split('T')[0];


// 教练周薪计算（分级公式，与mkCoach一致）
function calcCoachSalary(tactics){
  if(!tactics) return 50;
  if(tactics<=50) return Math.floor(30+(tactics-32)*9);
  if(tactics<=62) return Math.floor(200+Math.pow(tactics-50,2)*5);
  if(tactics<=72) return Math.floor(800+Math.pow(tactics-62,2)*17);
  return Math.floor(2500+Math.pow(tactics-72,2)*80);
}
// ─── MapUtils ────────────────────────────────────────
const MapUtils={
  poolForYear(y){
    const keys=Object.keys(ERA_MAPS).map(Number).sort((a,b)=>a-b);
    let pool=ERA_MAPS[2000];
    for(const k of keys){if(y>=k)pool=ERA_MAPS[k];}
    return pool;
  },
  display(m){return MAP_DISPLAY[m]||m;},
  genPlayerMaps(birthYear){
    const pool=this.poolForYear(birthYear||2000);
    const n=rnd(2,3);
    return [...pool].sort(()=>Math.random()-.5).slice(0,n).map(m=>({map:m,str:rnd(65,95)}));
  },
  teamMapStr(roster,coach,map){
    let score=50;
    (roster||[]).forEach(p=>{const m=(p.maps||[]).find(x=>x.map===map);if(m)score+=m.str*.25;});
    if(coach){const cm=(coach.maps||[]).find(x=>x.map===map);if(cm)score+=cm.str*.4;}
    return Math.min(99,score);
  },
  teamPoolRatings(roster,coach,year){
    return this.poolForYear(year).map(m=>({map:m,str:this.teamMapStr(roster,coach,m)}));
  }
};

// ─── World ───────────────────────────────────────────
const SponsorManager = {
    // Current Active Sponsors
    activeSponsors: [],
    // History of fulfilled sponsors
    history: [],
    
    // Check if team can sign a sponsor tier
    canSign(tierName, team) {
        const tier = CONFIG.SPONSOR_TIERS.find(t => t.name === tierName);
        if(!tier) return { ok: false, reason: 'Invalid Tier' };
        
        // 1. Check if already has sponsor of this tier
        if(this.activeSponsors.some(s => s.tierName === tierName)) {
            return { ok: false, reason: '已拥有该级别赞助商' };
        }
        
        // 2. Check Fans (use team.fans or Game.fans)
        const currentFans = (team && team.totalFans != null) ? team.totalFans : (Game.fans || 0);
        if(currentFans < tier.minFans) {
            return { ok: false, reason: `粉丝不足 (当前 ${currentFans.toLocaleString()}，需 ${tier.minFans.toLocaleString()})` };
        }
        
        // 3. Check Tier Requirement via matchHistory
        const tierValue = { 'c-tier': 1, 'b-tier': 2, 'a-tier': 3, 's-tier': 4, 'major': 5 };
        const reqVal = tierValue[tier.minTierRequirement] || 1;
        const matchHistory = (team && team.matchHistory) || Game.matchHistory || [];
        const hasPlayedRequiredTier = matchHistory.some(m => (tierValue[m.tier] || 0) >= reqVal);
        
        if(!hasPlayedRequiredTier) {
            const tierNames = {'c-tier':'C级赛事','b-tier':'B级赛事','a-tier':'A级赛事','s-tier':'S级赛事','major':'Major'};
            return { ok: false, reason: `需要先参加 ${tierNames[tier.minTierRequirement]||tier.minTierRequirement}（尚未参赛记录）` };
        }
        
        // 4. Check Performance (Last 10 matches rating)
        const recentRatings = matchHistory.slice(-10).map(m => m.rating);
        const avgRating = recentRatings.length > 0 ? recentRatings.reduce((a,b)=>a+b,0)/recentRatings.length : 1.0;
        
        if(avgRating < 0.9) {
            return { ok: false, reason: `近期表现不佳 (平均Rating ${avgRating.toFixed(2)} < 0.90)` };
        }

        return { ok: true };
    },
    
    sign(tierName, team) {
        const tier = CONFIG.SPONSOR_TIERS.find(t => t.name === tierName);
        if(!tier) return;
        
        // Calculate Value
        const recentRatings = (team.matchHistory || []).slice(-10).map(m => m.rating);
        const avgRating = recentRatings.length > 0 ? recentRatings.reduce((a,b)=>a+b,0)/recentRatings.length : 1.0;
        const performanceFactor = Math.max(0.9, Math.min(1.2, avgRating));
        
        // Exposure Factor (Mocked for now, assumes some history)
        const sTierApps = team.sTierAppearances || 0;
        const majorApps = team.majorAppearances || 0;
        const exposureFactor = 1 + (sTierApps * 0.08) + (majorApps * 0.15);
        
        const totalValue = Math.floor(tier.baseValue * performanceFactor * exposureFactor);
        const valuePerEvent = Math.floor(totalValue / tier.requiredEventCount);
        
        const contract = {
            id: 'sp_'+Date.now()+'_'+rnd(100,999),
            tierName: tier.name,
            minTierRequirement: tier.minTierRequirement,
            remainingEvents: tier.requiredEventCount,
            totalValue: totalValue,
            valuePerEvent: valuePerEvent,
            performanceRiskCounter: 0, // Track low rating streaks
            exposureMultiplier: tier.exposureMultiplier
        };
        
        this.activeSponsors.push(contract);

        // ── 签字费：合同总价的 20%，签约即到账 ──
        const signingBonus = Math.floor(totalValue * 0.20);
        Game.money += signingBonus;
        UI.toast(`✍ 已签约 ${tier.name}！签字费 +$${signingBonus.toLocaleString()} 立即到账`, 'win');
        Game.pushNews(`💼 签约 ${tier.name}：签字费 $${signingBonus.toLocaleString()} 到账，合同总价 $${totalValue.toLocaleString()}（${tier.requiredEventCount} 场履约）`);
        return contract;
    },
    
    // Check fulfillment after a match/event
    // Prompt says: "Whenever participating in eligible event"
    // Does it mean per match or per tournament? 
    // "contractedEventsCount" - usually means Tournament count in CS manager games, or Match count?
    // "Sponsor buys exposure in specified tier events". 
    // "requiredEventCount: 6" -> Likely Tournaments. 12 Tournaments is a lot for a title sponsor (1 year+).
    // If it's Matches, 12 matches is very fast (1-2 tournaments).
    // Context: "Sponsor rewards 'playing high tier events'". 
    // Let's assume **Tournament Participation**.
    
    onTournamentParticipate(team, tournamentTier) {
        if(!team.isPlayer) return;

        const tierValue = { 'c-tier': 1, 'b-tier': 2, 'a-tier': 3, 's-tier': 4, 'major': 5 };
        const eventVal = tierValue[tournamentTier] || 0;

        // 逆序遍历，避免 splice 导致索引错位
        for(let idx = this.activeSponsors.length - 1; idx >= 0; idx--) {
            const sp = this.activeSponsors[idx];
            const reqVal = tierValue[sp.minTierRequirement] || 0;

            if(eventVal >= reqVal) {
                // 履约：发放本期赞助款
                Game.money += sp.valuePerEvent;
                sp.remainingEvents--;
                UI.log(`💰 [${sp.tierName}] 赞助款到账：+$${sp.valuePerEvent.toLocaleString()}（还剩 ${sp.remainingEvents} 场）`, 'win');
                Game.pushNews(`💰 ${sp.tierName} 赞助款 +$${sp.valuePerEvent.toLocaleString()}`);

                if(sp.remainingEvents <= 0) {
                    UI.toast(`✅ [${sp.tierName}] 赞助合同履约完成！`);
                    this.history.push({ ...sp, endDate: Date.now() });
                    this.activeSponsors.splice(idx, 1);
                }
            } else {
                // 参加了比合同要求低级别的赛事
                sp.performanceRiskCounter = (sp.performanceRiskCounter || 0) + 1;
                UI.toast(`⚠️ [${sp.tierName}] 不满您参加低级别赛事（违约风险 ${sp.performanceRiskCounter}/3）`);
                if(sp.performanceRiskCounter >= 3) {
                    this.breach(sp, idx);
                }
            }
        }
    },
    
    onMatchPerformance(rating) {
        for(let idx = this.activeSponsors.length - 1; idx >= 0; idx--) {
            const sp = this.activeSponsors[idx];
            if(rating < 0.85) {
                sp.lowRatingStreak = (sp.lowRatingStreak || 0) + 1;
                if(sp.lowRatingStreak === 1)
                    UI.toast(`📉 [${sp.tierName}] 本场表现不佳（连续低分 ${sp.lowRatingStreak}/3）`);
            } else {
                if(sp.lowRatingStreak > 0)
                    UI.toast(`📈 [${sp.tierName}] 表现回暖，赞助商信心恢复`, 'win');
                sp.lowRatingStreak = 0;
            }
            if(sp.lowRatingStreak >= 3) {
                const prob = 0.15 * sp.exposureMultiplier;
                if(Math.random() < prob) {
                    this.breach(sp, idx);
                } else {
                    UI.log(`⚠ [${sp.tierName}] 最后通牒：下场必须发挥！`, 'loss');
                    sp.lowRatingStreak = 2;
                }
            }
        }
    },
    
    breach(sp, idx) {
        UI.toast(`💔 [${sp.tierName}] 赞助商因表现不佳解约！`, 'loss');
        // Penalty
        Game.fans = Math.floor(Game.fans * 0.97);
        // Reputation hit (not tracked yet)
        this.activeSponsors.splice(idx, 1);
    }
};

const World={
  players:[],teams:[],
  amateurNames: [
    "City Hunters", "Cyber Star", "LAN Killers", "Net Cafe Boys", "Midnight Aimers",
    "Pixel Warriors", "Frag Masters", "Keyboard Heroes", "Mouse Clickers", "Screen Glancers",
    "Ping Lords", "Packet Loss", "Lag Spikes", "Frame Droppers", "Disconnectors",
    "Rebooters", "System Crashers", "Blue Screen", "Fatal Errors", "Null Pointers",
    "Stack Overflow", "Memory Leaks", "Buffer Overflows", "Segmentation Faults", "Deadlocks",
    "Race Conditions", "Infinite Loops", "Compilation Errors", "Runtime Exceptions", "Syntax Errors"
  ],
  createAmateurTeam(idx) {
    const amNames = this.amateurNames;
    const baseName = amNames[idx % amNames.length];
    const suffix = Math.floor(idx / amNames.length) > 0 ? " " + (Math.floor(idx / amNames.length) + 1) : "";
    const name = baseName + suffix;
    
    // 生成业余队伍评分：基础分 55~75，模拟不同梯队的业余水平
    // 让 C-Tier 有一定梯度（弱队 55，强业余 75）
    const base = 55 + Math.floor(Math.random() * 20); 
    
    const roster = [];
    ['IGL','Sniper','Entry','Lurker','Rifler'].forEach(role=>{
        // 队员浮动 -5 ~ +5
        const p = this.mkP(base-5, base+5, true, role, 2000);
        p.teamId = name;
        this.players.push(p);
        roster.push(p);
    });
    
    // 业余队通常没有强力教练
    const coach = Math.random() < 0.3 ? this.mkCoach(false) : null;
    
    // 业余队积分：模拟他们也打了本地C-tier比赛
    // rating 55→约5pts, rating 65→约25pts, rating 75→约55pts
    const amateurStable = 0.101 * Math.pow(Math.max(0, base - 55), 1.80) / 0.08 * 0.35;
    const initPts = Math.floor(amateurStable * (0.5 + Math.random() * 0.8));
    
    return {
        id: name, 
        name, 
        rating: base, 
        roster, 
        coach, 
        isPlayer: false, 
        isReal: false, 
        isAmateur: true, 
        points: initPts, 
        lastRank: 999
    };
  },
  genRandomIdentity(){
    const cfg=pick(NAME_COUNTRIES);
    const core=pick(HANDLE_CORES),suf=pick(HANDLE_SUFFIXES),handle=core+(suf||'');
    return{first:pick(cfg.first),last:pick(cfg.last),handle,name:`${pick(cfg.first)} "${handle}" ${pick(cfg.last)}`,country:cfg.country,countryCode:cfg.code};
  },
  mkRealPlayer(cfg,teamName){
    const rating=cfg.rating,age=cfg.age||20;
    const pot=cfg.potential!=null?cfg.potential:Math.min(99,rating+5);
    const rarity=cfg.rarity||(rating>=90?'legend':rating>=80?'rare':'uncommon');
    const handle=cfg.handle||cfg.name;
    const realName=cfg.realName||null;

    // ── 特质组装：签名特质（唯一）+ HISTORICAL_DATA 预设常规特质
    const myTraits=[];
    // C. 签名特质（优先，唯一性保证）
    if(cfg.signatureTrait&&SIGNATURE_TRAITS[cfg.signatureTrait]){
      myTraits.push(cfg.signatureTrait);
    }
    // A. HISTORICAL_DATA 配置的 normalTraits（最多2个，去重）
    const presetNormals=cfg.normalTraits||[];
    for(const t of presetNormals){
      if(NORMAL_TRAITS[t]&&!myTraits.includes(t))myTraits.push(t);
      if(myTraits.filter(x=>NORMAL_TRAITS[x]).length>=2)break;
    }
    // 若 normalTraits 不足2个，按角色补足
    if(myTraits.filter(x=>NORMAL_TRAITS[x]).length<2){
      // 角色默认特质：匹配角色战斗风格（新16特质系统）
      const roleDefault={
        Sniper:'headshot',      // 步枪/狙：爆头机器
        Rifler:'rapidFire',     // 步枪：连点大师
        Entry:'aggressor',      // 突破：极限侵略
        Lurker:'snakeEyes',     // 自由人：蛇眼
        IGL:'leader'            // 指挥：领袖
      };
      const fallback=roleDefault[cfg.role]||'headshot';
      if(!myTraits.includes(fallback))myTraits.push(fallback);
      if(myTraits.filter(x=>NORMAL_TRAITS[x]).length<2){
        // 第二特质：基于角色选择互补特质
        const roleSecond={Sniper:'anchor',Rifler:'coldBlood',Entry:'bigHeart',Lurker:'bigHeart',IGL:'utilityKing'};
        const secondPref = roleSecond[cfg.role] || 'volatile';
        const extra = (!myTraits.includes(secondPref)&&NORMAL_TRAITS[secondPref]) ? secondPref : 
                      (NORMAL_TRAIT_KEYS.find(k=>!myTraits.includes(k))||'volatile');
        myTraits.push(extra);
      }
  }

  const baseRatingCost = Math.pow(Math.max(1, rating - 40), 3) * 6;
  
  // Market Perception System
  const marketBias = Math.floor((Math.random() + Math.random() + Math.random()) / 3 * 24 - 12);
  const perceivedPot = Math.min(99, Math.max(rating, pot + marketBias));
  const potentialTax = Math.pow(Math.max(1, perceivedPot - 40), 3) * 5;
  
  // Market Volatility (±15%)
  const volatility = 0.85 + Math.random() * 0.3;
  const price = Math.floor((baseRatingCost + potentialTax) * volatility);

  const currentAbilityWage = Math.pow(Math.max(1, rating - 40), 3) * 0.3;
   // 现实修正：潜力只影响已证明自己的选手（rating≥55）的薪资
   // 低评分选手潜力再高也不会拿更多薪水——市场未认可，潜力在转会费里体现
   const potGap = rating >= 55 ? Math.max(0, pot - rating) : Math.max(0, pot - Math.max(rating, 55));
   const potentialBonus = Math.pow(potGap, 2) * 5;
   let salary = Math.floor(currentAbilityWage + potentialBonus);
   // 现实修正：低评分选手薪资压缩
   if (rating < 50) salary = Math.floor(salary * 0.30);
   else if (rating < 60) salary = Math.floor(salary * 0.60);

  const p = {
      id:'real_'+cfg.name+'_'+rnd(1000,9999),
      name:handle+(realName?` (${realName})`:''),
      role:cfg.role,rating,potential:pot,age,form:0.92+Math.random()*0.12, // 真实选手初始form 0.92~1.04
      price,
      salary,
      evalStatus: (rarity==='legend') ? 2 : 0,
      teamId:teamName||null,rarity,
      traits:[...new Set(myTraits)],
      maps:MapUtils.genPlayerMaps(2000-(age-17)),
      ys:{matches:0,ratingSum:0,mvps:0,majorWins:0,wins:0},
      history:[],_ageDecayYear:null,isReal:true,
      country:cfg.country||'Unknown',countryCode:cfg.countryCode||null,
      handle,realName,
      performanceTracker: { lowRatingStreak: 0, highRatingStreak: 0 }
    };
    p.sub_pot = World.generateSubPotential(p.potential, p.role);
    p.hltv = World.generateHLTVProfile(p.rating, p.role, p.sub_pot);
    
    // Determine Origin Type
    let originType = 'pro';
    if(rating >= 95) originType = 'legendary';
    else if(rating >= 90) originType = 'star';
    else if(rating >= 80) originType = 'pro';
    else originType = 'semiPro';

    p.fans = World.generateInitialFans(originType, p);
    
    return p;
  },
  
  mkP(min, max, ai=true, role=null, year=2000) {
    const ident=this.genRandomIdentity();
    const rating=rnd(min,max);
    const age=rnd(16,25);
    let pot=Math.min(99,rating+(age<=20?rnd(4,14):age<=24?rnd(2,7):rnd(0,2)));
    // Hard cap for non-legend market players
    if(!ai && pot > 88 && Math.random() > 0.05) pot = 88;
    
    const baseRatingCost = Math.pow(Math.max(1, rating - 40), 3) * 6;
    
    // Market Perception System
    const marketBias = Math.floor((Math.random() + Math.random() + Math.random()) / 3 * 24 - 12);
    const perceivedPot = Math.min(99, Math.max(rating, pot + marketBias));
    const potentialTax = Math.pow(Math.max(1, perceivedPot - 40), 3) * 5;
    
    // Market Volatility (±15%)
    const volatility = 0.85 + Math.random() * 0.3;
    const price = Math.floor((baseRatingCost + potentialTax) * volatility);

    const currentAbilityWage = Math.pow(Math.max(1, rating - 40), 3) * 0.3;
    // 现实修正：潜力只影响已证明自己的选手（rating≥55）的薪资
    const potGap = rating >= 55 ? Math.max(0, pot - rating) : Math.max(0, pot - Math.max(rating, 55));
    const potentialBonus = Math.pow(potGap, 2) * 5;
    let salary = Math.floor(currentAbilityWage + potentialBonus);
    // 现实修正：低评分选手薪资压缩
    if (rating < 50) salary = Math.floor(salary * 0.30);
    else if (rating < 60) salary = Math.floor(salary * 0.60);

    const p = {
        id:'p'+Math.random().toString(36).substr(2,9),
        name:ident.name,
        role:role||pick(['Sniper','Rifler','Entry','Lurker','IGL']),
        rating,potential:pot,age,form:0.88+Math.random()*0.17, // AI form: 0.88~1.05，真实波动
        price,
        salary,
        evalStatus: 0,
        teamId:null,rarity:'common',
        traits:[],
        maps:MapUtils.genPlayerMaps(year-(age-17)),
        ys:{matches:0,ratingSum:0,mvps:0,majorWins:0,wins:0},
        history:[],_ageDecayYear:null,
        country:ident.country,countryCode:ident.countryCode,handle:ident.handle,
        isRegenLegend: false,
        performanceTracker: { lowRatingStreak: 0, highRatingStreak: 0 }
    };
    p.sub_pot = World.generateSubPotential(p.potential, p.role);
    p.hltv = World.generateHLTVProfile(p.rating, p.role, p.sub_pot);
    
    let originType = 'amateur';
    if(rating >= 80) originType = 'pro'; // Generated high rating player
    else if(rating >= 70) originType = 'semiPro';
    
    p.fans = World.generateInitialFans(originType, p);
    
    return p;
  },

  generateInitialFans(originType, p) {
      const cfg = CONFIG.PLAYER_INITIAL_FANS[originType] || CONFIG.PLAYER_INITIAL_FANS.amateur;
      let totalFans = 0;
      
      if (originType === 'star' || originType === 'legendary') {
          // Historical Calculation
          // Simulate historical profile if not present
          const careerTitles = originType === 'legendary' ? rnd(5, 20) : rnd(1, 5);
          const majorWins = originType === 'legendary' ? rnd(1, 4) : (Math.random() < 0.3 ? 1 : 0);
          const mvpCount = originType === 'legendary' ? rnd(2, 10) : rnd(0, 2);
          const peakRating = p.rating + rnd(0, 3);
          
          totalFans = 
              20000 * careerTitles + 
              150000 * majorWins + 
              30000 * mvpCount + 
              peakRating * 50000;
          
          // Random fluctuation
          totalFans = Math.floor(totalFans * (0.8 + Math.random() * 0.4));
      } else {
          // Distribution Logic
          if (originType === 'amateur') {
              // 80% low end
              if (Math.random() < 0.8) totalFans = rnd(cfg.min, Math.floor(cfg.max * 0.2));
              else totalFans = rnd(Math.floor(cfg.max * 0.2), cfg.max);
              
              // Low chance for > 100
              if (totalFans > 100 && Math.random() > 0.1) totalFans = rnd(0, 100);
          } else {
              // Exponential-ish distribution favoring lower end
              const range = cfg.max - cfg.min;
              const r = Math.random();
              const factor = r * r; // Quadratic bias to low end
              totalFans = cfg.min + Math.floor(range * factor);
          }
      }
      
      // Caps and constraints
      if (totalFans < 50) totalFans = 0; // No public recognition
      
      return {
          totalFans: totalFans,
          performanceFans: Math.floor(totalFans * 0.3), // Initial split
          honorFans: Math.floor(totalFans * 0.7)
      };
  },

  updatePlayerFans(p, result) {
      if (!p.fans) p.fans = { totalFans: 0, performanceFans: 0, honorFans: 0 };
      
      // Tournament Fan Gain
      const tierWeight = CONFIG.TOURNAMENT_TIER_WEIGHT[result.tier] || 0.2;
      const placementWeight = CONFIG.PLACEMENT_WEIGHT[result.placement] || 0.05;
      
      // Match Rating Impact (using average of last tournament or just passed in?)
      // Assuming p.rating2 is from last match/avg of tournament
      const rating = parseFloat(p.rating2 || 1.0);
      
      let fanGain = 
          CONFIG.BASE_TOURNAMENT_FAN_VALUE * 
          tierWeight * 
          placementWeight * 
          (1 + (rating - 1) * 0.8);
          
      // Anti-farm for low tiers
      if (result.tier === 'c-tier' || result.tier === 'b-tier') {
          fanGain *= 0.5;
      }
      
      // Anti-farm: Continuous participation check (Simplified: check history length?)
      // We don't have full history tracking for "continuous same tier". 
      // Skip for now or implement simple random dampener if frequent.
      
      // Cap Check (Monthly Cap implemented in decay/update cycle, here just raw gain)
      // Apply immediate
      p.fans.performanceFans += Math.floor(fanGain);
      
      // Honor Bonus
      if (result.isMVP) {
          p.fans.honorFans += CONFIG.HONOR_FAN_BONUS.MVP;
          UI.log(`🏆 ${p.name} 荣获 MVP，粉丝暴涨！`, 'win');
      }
      if (result.placement === 'Champion') {
          if (result.tier === 's-tier') p.fans.honorFans += CONFIG.HONOR_FAN_BONUS.S_Champion;
          if (result.tier === 'major') p.fans.honorFans += CONFIG.HONOR_FAN_BONUS.Major_Champion;
      }

      // Recalculate Total
      p.fans.totalFans = p.fans.performanceFans + p.fans.honorFans;
  },

  updateTeamFans(t, result) {
      if (!t.brandFans) t.brandFans = t.isPlayer ? Game.fans : rnd(1000, 50000); // Init if missing
      
      // Brand Growth
      let growth = 0;
      if (result.placement === 'Champion') {
          if (result.tier === 's-tier') growth = CONFIG.TEAM_BRAND_GROWTH.S_Champion;
          if (result.tier === 'major') growth = CONFIG.TEAM_BRAND_GROWTH.Major_Champion;
      } else if (result.placement === 'RunnerUp') { // "Final"
           if (result.tier === 's-tier') growth = CONFIG.TEAM_BRAND_GROWTH.S_Final;
           if (result.tier === 'major') growth = CONFIG.TEAM_BRAND_GROWTH.Major_Final;
      }
      t.brandFans += growth;
      
      // Total Fans Calculation
      let sumRootFans = 0;
      (t.roster || []).forEach(p => {
          if (!p.fans) p.fans = World.generateInitialFans('pro', p); // Fallback
          sumRootFans += Math.sqrt(p.fans.totalFans);
      });
      
      t.totalFans = Math.floor(Math.pow(sumRootFans, 1.5) + t.brandFans);
      
      // Sync Player Game Fans
      if (t.isPlayer) {
          Game.fans = t.totalFans;
      }
  },

  applyFanDecay(p) {
      if (!p.fans) return;
      // Check monthly rating average (using ys.ratingSum / ys.matches if monthly reset? No, ys is yearly)
      // Use form as proxy or last rating? 
      // User says "player.monthlyAverageRating < 0.95". 
      // We don't track monthly average explicitly. 
      // Use p.rating2 (last match) or p.form (proxy). 
      // Let's use form < 0.9 as "poor performance" proxy or just random decay for inactivity?
      // Strict interpretation: "if player.monthlyAverageRating < 0.95".
      // We will assume p.rating2 is close enough to recent performance.
      
      if (parseFloat(p.rating2 || 1.0) < 0.95) {
          const decay = Math.floor(p.fans.totalFans * 0.02);
          p.fans.performanceFans = Math.max(0, p.fans.performanceFans - decay);
          p.fans.totalFans = p.fans.performanceFans + p.fans.honorFans;
      }
  },

  applyMonthlyDecay() {
     // ... existing point decay ...
     this.teams.forEach(t => {
         if(t.points) t.points = Math.floor(t.points * 0.92);
         // Fan Decay for players
         if(t.roster) t.roster.forEach(p => this.applyFanDecay(p));
         // Update Team Total
         this.updateTeamFans(t, { tier: 'none', placement: 'none' }); // Just refresh totals
     });
     // Player team too
     Game.roster.forEach(p => this.applyFanDecay(p));
     this.updateTeamFans({ isPlayer: true, roster: Game.roster, brandFans: Game.fans }, { tier: 'none', placement: 'none' });
     
     // Points decay for Player?
     Game.points = Math.floor(Game.points * 0.92);
  },
  
  // ── 七维独立潜力生成 ────────────────────────────────
  // 规则：总和固定 = potential*7；角色倾向属性从其他属性匀出点数加权；每项随机偏差 -8~+12
  generateSubPotential(pot, role) {
    const KEYS = ['firepower','entrying','trading','opening','clutching','sniping','utility'];
    const total = pot * 7;

    // 各角色倾向加成（主要属性+5~10，从弱项扣除）
    const bonuses = {
      Sniper:  { sniping: 9, opening: 5, firepower: 2, trading: -5, entrying: -8, clutching: -3, utility: 0 },
      Entry:   { entrying: 9, firepower: 7, opening: 4, clutching: -7, sniping: -10, trading: -2, utility: -1 },
      Lurker:  { clutching: 9, trading: 5, utility: 3, entrying: -6, opening: -5, sniping: -4, firepower: -2 },
      IGL:     { utility: 9, trading: 4, clutching: 3, firepower: -6, entrying: -7, sniping: -5, opening: -2 - 0 },
      Rifler:  { firepower: 6, trading: 5, utility: 2, opening: 2, entrying: -2, sniping: -8, clutching: -5 },
    };
    const roleBonus = bonuses[role] || bonuses.Rifler;

    // 生成带随机偏差的初始值（float，用于后续精确归一化）
    let raw = {};
    KEYS.forEach(k => {
      raw[k] = pot + (roleBonus[k] || 0) + (Math.random() * 20 - 8); // -8 ~ +12 偏差
    });

    // 归一化：缩放使总和精确等于 total
    const rawSum = KEYS.reduce((s, k) => s + raw[k], 0);
    const scale = total / rawSum;
    const sub = {};
    let assigned = 0;
    KEYS.forEach((k, i) => {
      if (i === KEYS.length - 1) {
        sub[k] = Math.round(total - assigned); // 最后一项补足，确保整数总和精确
      } else {
        sub[k] = Math.round(raw[k] * scale);
        assigned += sub[k];
      }
      // 各属性独立 clamp：不低于35，不超过99
      sub[k] = Math.min(99, Math.max(35, sub[k]));
    });
    return sub; // { firepower: 75, entrying: 68, ... }
  },

  generateHLTVProfile(overall, role, subPot) {
    // 扰动函数：±6 随机波动
    // 上限 = subPot[key] * 0.88（保证生成时主属性至少留 12% 成长空间）
    // 无 subPot 时退回硬顶 99（向后兼容旧存档）
    const vary = (val, key) => {
      const hardCap = (subPot && subPot[key] != null) ? Math.floor(subPot[key] * 0.88) : 99;
      return Math.min(hardCap, Math.max(40, Math.floor(val + (Math.random() * 12 - 6))));
    };

    // 以 overall 为基准，各属性先设为中等偏低基底，再按角色大幅加权
    // 角色特化原则：主职属性 overall+(15~25)，次职 overall+(5~10)，弱项 overall-(10~20)
    let base;

    if (role === 'Sniper') {
      // 狙击手：极高sniping/opening，低entrying/trading（不需要冲点和补枪）
      base = {
        firepower:  overall + 5,
        sniping:    overall + 22,  // ★ 核心
        opening:    overall + 12,  // AWP往往能拿首杀
        clutching:  overall,
        trading:    overall - 12,  // 狙击手很少trade
        entrying:   overall - 15,  // 不冲点
        utility:    overall - 8,
      };
    } else if (role === 'Entry') {
      // 突破手：极高entrying/opening/firepower，弱clutching/sniping/utility
      base = {
        firepower:  overall + 12,  // ★ 核心
        entrying:   overall + 22,  // ★ 核心
        opening:    overall + 15,  // 抢首杀
        clutching:  overall - 15,  // 冲点人活不到残局
        sniping:    overall - 18,  // 不用awp
        trading:    overall + 5,
        utility:    overall - 8,
      };
    } else if (role === 'Lurker') {
      // 潜伏者：极高clutching，高trading，低entrying/opening
      base = {
        firepower:  overall + 5,
        clutching:  overall + 22,  // ★ 核心
        trading:    overall + 12,  // 侧翼补枪
        opening:    overall - 10,  // 不抢首杀
        entrying:   overall - 15,  // 不冲点
        sniping:    overall - 8,
        utility:    overall + 8,   // 需要信息道具
      };
    } else if (role === 'IGL') {
      // 指挥：极高utility/trading，低firepower/entrying/sniping（脑子好枪一般）
      base = {
        utility:    overall + 20,  // ★ 核心
        trading:    overall + 10,  // 战术补枪
        clutching:  overall + 8,   // 冷静
        firepower:  overall - 12,  // 枪法一般
        entrying:   overall - 15,  // 不冲点
        sniping:    overall - 12,
        opening:    overall - 5,
      };
    } else {
      // Rifler（步枪手/辅助）：均衡型，firepower/trading/utility微强
      base = {
        firepower:  overall + 10,  // ★ 核心
        trading:    overall + 12,  // ★ 核心
        utility:    overall + 8,
        opening:    overall + 5,
        clutching:  overall + 5,
        entrying:   overall - 5,
        sniping:    overall - 15,  // 不用AWP
      };
    }

    const hltv = {};
    Object.keys(base).forEach(k => { hltv[k] = vary(base[k], k); });
    return hltv;
  },

  // -- 积分生态公式 --
  // 基于幂律拟合真实HLTV排名分布
  // 稳定积分 = (C * (rating-55)^k) / 月衰减率(0.08)
  // 对应: rating95→~950pts, rating85→~575pts, rating75→~275pts, rating65→~80pts
  _calcStablePts(rating) {
    const C = 0.101, k = 1.80;
    const monthly = C * Math.pow(Math.max(0, rating - 55), k);
    return monthly / 0.08;  // 稳定均衡积分
  },
  _calcInitPts(rating, tier) {
    const stable = this._calcStablePts(rating);
    // 各类战队起始状态随机扰动（模拟处于不同赛季阶段）
    // legend: 0.80~1.15  historical: 0.75~1.10  ai: 0.65~1.0  amateur: 单独处理
    let lo, hi;
    if (tier === 'legend')     { lo = 0.80; hi = 1.15; }
    else if (tier === 'hist')  { lo = 0.75; hi = 1.10; }
    else                       { lo = 0.65; hi = 1.00; }
    return Math.floor(stable * (lo + Math.random() * (hi - lo)));
  },
init(startYear){
    this.players=[];this.teams=[];
    const y=startYear||2000;
    const eraKey=y>=2020?'era2020':(y>=2012?'era2012':'era2000');
    const eraData=HISTORICAL_DATA[eraKey];
    const usedTeams=new Set();

    // 1. 生成 1.6 传奇战队 (如果年份符合)
    if (y >= 2000 && y <= 2011) {
        TEAMS_16.forEach(t => {
            if (t.debutYear > y) return;
            if (usedTeams.has(t.name)) return;
            
            const base = t.baseRating;
            const roster = [];
            
            // 核心选手
            t.core.forEach(pName => {
                let p = this.players.find(x => x.handle === pName && x.isReal);
                if (!p) {
                    const pCfg = PLAYERS_16.find(x => x.name === pName);
                    if (pCfg && pCfg.debutYear <= y) {
                         p = this.mkRealPlayer({
                            name: pCfg.name,
                            role: pCfg.role,
                            rating: pCfg.peakRating,
                            age: 17 + (y - pCfg.debutYear),
                            country: pCfg.country,
                            rarity: 'legend'
                        }, t.name);
                        p.traits = [pCfg.trait];
                        p.isLegend16 = true;
                        this.players.push(p);
                    }
                }
                if (p) {
                    p.teamId = t.name;
                    const marketIdx = Market.pList.findIndex(x => x.id === p.id);
                    if (marketIdx >= 0) Market.pList.splice(marketIdx, 1);
                    roster.push(p);
                }
            });

            // 补全阵容
            while(roster.length < 5) {
                const p = this.mkP(base-8, base+12, true, null, y);
                p.teamId = t.name;
                this.players.push(p);
                roster.push(p);
            }

            const coach = this.mkCoach(true);
            const initPts = this._calcInitPts(base, 'legend');
            this.teams.push({id:t.name, name:t.name, rating:base, roster, coach, isPlayer:false, isReal:true, trait:t.trait, points:initPts, lastRank:999});
            usedTeams.add(t.name);
        });
    }

    // 2. 生成 HISTORICAL_DATA 中的战队
    if(eraData){
      eraData.teams.forEach(t=>{
        if(usedTeams.has(t.name)) return;
        const base=t.rating,roster=[];
        (t.players||[]).forEach(pKey=>{
          const cfg=eraData.players[pKey];if(!cfg)return;
          const p=this.mkRealPlayer(cfg,t.name);
          this.players.push(p);roster.push(p);
        });
        while(roster.length<5){
          const p=this.mkP(base-8,base+12,true,null,y);p.teamId=t.name;
          if(Math.random()<0.5){const t2=pick(NORMAL_TRAIT_KEYS);if(!p.traits.includes(t2))p.traits.push(t2);}
          this.players.push(p);roster.push(p);
        }
        const coach=this.mkCoach(true);
        const initPts = this._calcInitPts(base, 'hist');
        const newTeam = {id:t.name,name:t.name,rating:base,roster,coach,isPlayer:false, isReal:true, points:initPts, lastRank:999};
        this.updateTeamFans(newTeam, { tier: 'none', placement: 'none' }); // Init fans
        this.teams.push(newTeam);
        usedTeams.add(t.name);
      });
    }

    // 3. 补充 AI 战队 (isReal: true)，过滤未出道的战队
    const aiPool=AI_TEAMS.filter(n=>{
      if(usedTeams.has(n)) return false;
      const debut = AI_TEAMS_DEBUT[n] || 2000;
      return y >= debut;
    });
    let idx=0;
    while(idx<aiPool.length){
      const name=aiPool[idx++];
      const base=65+rnd(0,25),roster=[];
      ['IGL','Sniper','Entry','Lurker','Rifler'].forEach(role=>{
        const p=this.mkP(base-8,base+12,true,role,y);
        p.teamId=name;
        // AI选手也应该有特质，增加多样性
        if(Math.random()<0.6&&NORMAL_TRAIT_KEYS.length>0){
          const t=pick(NORMAL_TRAIT_KEYS);
          if(!p.traits.includes(t))p.traits.push(t);
        }
        if(Math.random()<0.25&&NORMAL_TRAIT_KEYS.length>1){
          const t2=pick(NORMAL_TRAIT_KEYS.filter(k=>!p.traits.includes(k)));
          if(t2)p.traits.push(t2);
        }
        this.players.push(p);roster.push(p);
      });
      const coach=this.mkCoach(true);
      const initPts = this._calcInitPts(base, 'ai');
      const newTeam = {id:name,name,rating:base,roster,coach,isPlayer:false, isReal:true, points:initPts, lastRank:999};
      this.updateTeamFans(newTeam, { tier: 'none', placement: 'none' });
      this.teams.push(newTeam);
      usedTeams.add(name);
    }

    // 4. 填充业余战队直到 100 支
    let amateurCount = 0;
    while(this.teams.length < 100) {
        const t = this.createAmateurTeam(amateurCount++);
        this.updateTeamFans(t, { tier: 'none', placement: 'none' });
        this.teams.push(t);
    }
  },
  applyMonthlyDecay() {
     this.teams.forEach(t => {
         // 先衰减
         t.points = Math.floor((t.points || 0) * 0.92);

         // ── AI月均积分补充：模拟AI战队持续参赛获得积分 ──
         // 公式：monthlyGain = 0.101 * (rating-55)^1.80
         // 这样每支队伍的积分会在其"稳定均衡值"附近波动，保持梯度
         if (!t.isPlayer) {
             const r = t.rating || 60;
             // 月均增量：高tier队参加大赛积分多，低tier队打C-tier积分少
             // 对低rating(<62)队给额外0.35系数，模拟业余队参赛机会少
             const tierFactor = r < 62 ? 0.35 : 1.0;
             const baseGain = 0.101 * Math.pow(Math.max(0, r - 55), 1.80) * tierFactor;
             // 随机波动 ±40%，模拟不同月份的成绩好坏
             const gain = baseGain * (0.60 + Math.random() * 0.80);
             t.points = Math.floor(t.points + gain);
         }

         // Fan Decay
         if(t.roster) t.roster.forEach(p => this.applyFanDecay(p));
         this.updateTeamFans(t, { tier: 'none', placement: 'none' });
     });

     // Player团队：只衰减，不补充（玩家自己去赚积分）
     Game.points = Math.floor(Game.points * 0.92);
     Game.roster.forEach(p => this.applyFanDecay(p));
     this.updateTeamFans({ isPlayer: true, roster: Game.roster, brandFans: Game.fans }, { tier: 'none', placement: 'none' });

     this.updateRankings();
  },

  addTournamentPoints(team, points) {
      if(!team) return;
      if(team.isPlayer) {
          Game.points = (Game.points || 0) + points;
          // Soft Yearly Cap: > 3200 points, excess reduced by 25%
          if(Game.points > 3200) {
              const excess = Game.points - 3200;
              Game.points = 3200 + Math.floor(excess * 0.75);
          }
      } else {
          // 修复：必须找到 World.teams 中的原始对象进行更新，而不是更新副本
          const realTeam = this.teams.find(t => t.id === team.id);
          if (realTeam) {
              realTeam.points = (realTeam.points || 0) + points;
              // Soft Yearly Cap for AI
              if(realTeam.points > 3200) {
                  const excess = realTeam.points - 3200;
                  realTeam.points = 3200 + Math.floor(excess * 0.75);
              }
          }
      }
  },

  updateRankings() {
    // 收集所有战队（包括玩家）
    const allTeams = [...this.teams, {
        id: 'PLAYER', name: Game.teamName||'我的战队', rating: Game.power().eff, 
        points: Game.points, lastRank: Game.lastRank, isPlayer: true
    }];
    
    // 按积分排序（积分相同按 Rating）
    allTeams.sort((a,b) => {
        if(b.points !== a.points) return b.points - a.points;
        return b.rating - a.rating;
    });
    
    // 更新排名
    allTeams.forEach((t, idx) => {
        const newRank = idx + 1;
        if(t.isPlayer) {
            Game.lastRank = Game.rank || 999; // 记录上周排名
            Game.rank = newRank;
        } else {
            const realTeam = this.teams.find(x => x.id === t.id);
            if(realTeam) {
                realTeam.lastRank = realTeam.rank || 999;
                realTeam.rank = newRank;
            }
        }
    });
  },
  mkP(min,max,ai=false,forceRole=null,birthYear=2000){
    // Regen Legend 仅在非AI路人选手中触发（0.5%）
    const isRegenLegend=!ai&&Math.random()<0.005;
    let rating,pot,age;
    if(isRegenLegend){rating=rnd(90,99);age=rnd(18,22);pot=99;}
    else{
        rating=Math.min(99, rnd(min,max));
        age=rnd(16,30);
        let potBonus;
        if(ai) {
            // AI Logic: Standard potential
            potBonus = age<=20?rnd(10,25):age<=25?rnd(5,12):rnd(0,3);
        } else {
            // Market/Player Logic: Nerfed potential & capped
            // Reduced bonus for random market players to make high potential harder to find
            potBonus = age<=20?rnd(4,14):age<=24?rnd(2,7):rnd(0,2);
        }
        pot = Math.min(99, rating + potBonus);
        
        // Hard cap for non-legend market players to limit "god-tier" randoms
        if(!ai && !isRegenLegend && pot > 88 && Math.random() > 0.05) {
            pot = 88;
        }
    }
    let rarity='common';
    if(isRegenLegend)rarity='legend';
    else if(rating>=85)rarity='rare';
    else if(rating>=75)rarity='uncommon';

    // ── 特质分配（三级）
    const myTraits=[];
    if(ai){
      // AI 队员也有概率获得特质（比玩家低，约 10%~15%）
      if(Math.random()<0.12){
          myTraits.push(pick(NORMAL_TRAIT_KEYS));
      }
      // 极小概率双特质 (2%)
      if(myTraits.length > 0 && Math.random()<0.02){
          const pool=NORMAL_TRAIT_KEYS.filter(k=>!myTraits.includes(k));
          if(pool.length) myTraits.push(pick(pool));
      }
    }else if(isRegenLegend){
      // B. 通用传奇特质：1个传奇 + 2个常规（去重）
      myTraits.push(pick(GENERIC_LEGEND_KEYS));
      const pool=NORMAL_TRAIT_KEYS.filter(k=>!myTraits.includes(k));
      myTraits.push(pick(pool));
      const pool2=NORMAL_TRAIT_KEYS.filter(k=>!myTraits.includes(k));
      if(pool2.length)myTraits.push(pick(pool2));
    }else if(Math.random()<0.20){
      // A. 普通路人：20%概率获得1个常规特质
      myTraits.push(pick(NORMAL_TRAIT_KEYS));
    }

    const ident=this.genRandomIdentity();

    const baseRatingCost = Math.pow(Math.max(1, rating - 40), 3) * 6;
    const potentialTax = Math.pow(Math.max(1, pot - 40), 3) * 5;
    const price = Math.floor(baseRatingCost + potentialTax + rnd(0, 5000));

    const currentAbilityWage = Math.pow(Math.max(1, rating - 40), 3) * 0.3;
    // 现实修正：潜力只影响已证明自己的选手（rating≥55）的薪资
    const potGap = rating >= 55 ? Math.max(0, pot - rating) : Math.max(0, pot - Math.max(rating, 55));
    const potentialBonus = Math.pow(potGap, 2) * 5;
    let salary = Math.floor(currentAbilityWage + potentialBonus);
    // 现实修正：低评分选手（网吧/半职业）薪资大幅压缩
    // rating < 50: 薪资减少70%（每周只要几十块，靠梦想驱动）
    // rating 50-60: 薪资减少40%（半职业，有部分收入）
    // rating > 60: 不受影响（职业选手）
    if (rating < 50) salary = Math.floor(salary * 0.30);
    else if (rating < 60) salary = Math.floor(salary * 0.60);

    if(isRegenLegend) salary = Math.floor(salary * 1.5);

    const obj={
      id:(ai?'ai_':'p_')+rnd(10000,99999),
      name:ident.name,role:forceRole||pick(Object.keys(ROLES)),
      rating,potential:pot,age,form:1.0,
      price,
      salary,
      evalStatus: (isRegenLegend || rarity==='legend') ? 2 : 0,
      teamId:null,rarity,traits:[...new Set(myTraits)],
      maps:MapUtils.genPlayerMaps(birthYear),
      ys:{matches:0,ratingSum:0,mvps:0,majorWins:0,wins:0},
      history:[],_ageDecayYear:null,
      country:ident.country,countryCode:ident.countryCode,handle:ident.handle,
      isRegenLegend, // 标记，用于UI金色边框
      performanceTracker: { lowRatingStreak: 0, highRatingStreak: 0 }
    };
    obj.sub_pot = World.generateSubPotential(obj.potential, obj.role);
    obj.hltv = this.generateHLTVProfile(obj.rating, obj.role, obj.sub_pot);
    return obj;
  },
  mkCoach(ai=false){
    // AI教练：固定中高档
    if(ai){
      const tactics=rnd(50,85),yr=rnd(1995,2010);
      return{
        id:'ac_'+rnd(10000,99999),
        name:pick(COACH_NAMES),
        tactics,age:rnd(28,50),maps:MapUtils.genPlayerMaps(yr),
        price: Math.floor(Math.pow(Math.max(1,tactics-40),2.2)*12+rnd(0,3000)),
        salary: Math.floor(Math.pow(Math.max(1,tactics-40),2)*6),
        teamId:null,isAI:true
      };
    }
    // 市场教练：根据玩家排名分档，早期只出现C级弱教练
    const rank=(typeof Game!=='undefined'?Game.rank:null)||999;
    // rank>150(网吧C-tier): tactics 32-50  grade C
    // rank 80-150(B-tier):  tactics 45-62  grade B
    // rank 30-80(A-tier):   tactics 58-72  grade A
    // rank<30(Major级):     tactics 68-82  grade S
    let tacMin,tacMax,grade,gradeColor;
    if(rank>150){tacMin=32;tacMax=50;grade='C 级';gradeColor='#9ca3af';}
    else if(rank>80){tacMin=45;tacMax=62;grade='B 级';gradeColor='#10b981';}
    else if(rank>30){tacMin=58;tacMax=72;grade='A 级';gradeColor='var(--blue)';}
    else{tacMin=68;tacMax=82;grade='S 级';gradeColor='var(--gold)';}

    const tactics=rnd(tacMin,tacMax);
    const yr=rnd(1995,2010);

    // 签约费分段：C级$500-$6k，B级$8k-$35k，A级$40k-$120k，S级$100k-$280k
    let price;
    if(tactics<=50) price=Math.floor(500+(tactics-32)*300+rnd(0,1000));
    else if(tactics<=62) price=Math.floor(8000+Math.pow(tactics-50,2)*200+rnd(0,3000));
    else if(tactics<=72) price=Math.floor(40000+Math.pow(tactics-62,2)*800+rnd(0,8000));
    else price=Math.floor(100000+Math.pow(tactics-72,2.2)*3000+rnd(0,20000));

    // 周薪分段：C级$30-200，B级$200-800，A级$800-2500，S级$2500-6000
    let salary;
    if(tactics<=50) salary=Math.floor(30+(tactics-32)*9+rnd(0,30));
    else if(tactics<=62) salary=Math.floor(200+Math.pow(tactics-50,2)*5+rnd(0,50));
    else if(tactics<=72) salary=Math.floor(800+Math.pow(tactics-62,2)*17+rnd(0,100));
    else salary=Math.floor(2500+Math.pow(tactics-72,2)*80+rnd(0,300));

    return{
      id:'c_'+rnd(10000,99999),
      name:pick(COACH_NAMES)+'-'+rnd(1,9),
      tactics,age:rnd(28,50),maps:MapUtils.genPlayerMaps(yr),
      price,salary,grade,gradeColor,
      teamId:null,isAI:false
    };
  }
};

// ─── Market ──────────────────────────────────────────
const Market={
  pList:[],cList:[],currentTab:'players',
  refresh(free=false){
    if(!free&&Game.money<200)return UI.toast('资金不足！刷新需要 $200');
    if(!free)Game.money-=200;
    this.pList=[];this.cList=[];

    // 根据玩家世界排名和粉丝数计算市场质量
    // 排名越高(数值越小)、粉丝越多 → 吸引更高质量选手
    const rank = Game.rank || 200;
    const fans = Game.fans || 0;

    // 排名加成：排名1→+15，排名100→+0，排名200→-5（线性插值）
    const rankBonus = Math.round(Math.max(-5, Math.min(15, (100 - rank) * 0.15)));
    // 粉丝加成：每10万粉丝+1，上限+8
    const fansBonus = Math.min(8, Math.floor(fans / 100000));
    // 基础质量（比原来的公式更平滑）
    const baseQ = 52 + rankBonus + fansBonus;

    // 生成6名选手，质量区间 baseQ-5 ~ baseQ+12
    for(let i=0;i<6;i++){
      const p=World.mkP(baseQ-5, baseQ+12);
      World.players.push(p);
      this.pList.push(p);
    }
    // 生成3名教练（教练质量也略受排名影响）
    for(let i=0;i<3;i++){const c=World.mkCoach();this.cList.push(c);}
    this.renderAll();if(!free)UI.refresh();
  },
  showTab(t){
    this.currentTab=t;
    document.getElementById('tab-players').classList.toggle('on',t==='players');
    document.getElementById('tab-coaches').classList.toggle('on',t==='coaches');
    document.getElementById('market-players').classList.toggle('hidden',t!=='players');
    document.getElementById('market-coaches').classList.toggle('hidden',t!=='coaches');
  },
  startEval(id) {
      if (Game.money < 1500) return UI.toast('资金不足！安排试训评估需要 $1,500');
      if (Game.evalQueue.some(x => x.id === id)) return UI.toast('该选手正在试训中！');
      
      Game.money -= 1500;
      Game.evalQueue.push({ id, daysLeft: 3 }); // 3天试训
      UI.toast(`📊 已安排试训，预计 3 天后出具报告。`);
      UI.refresh(); this.renderAll();
  },
  
  finishEval(id) {
      const p = [...this.pList, ...World.players].find(x => x.id === id);
      if (!p) return;
      p.evalStatus = 1; // 1=范围可见
      
      const mkRange = (val) => {
          const min = Math.max(1, val + rnd(-4, 0));
          const max = Math.min(99, min + rnd(5, 8));
          return `${min}~${max}`;
      };
      p.evalRanges = {
          potential: mkRange(p.potential),
          firepower: mkRange(p.hltv.firepower),
          entrying: mkRange(p.hltv.entrying),
          trading: mkRange(p.hltv.trading),
          opening: mkRange(p.hltv.opening),
          clutching: mkRange(p.hltv.clutching),
          sniping: mkRange(p.hltv.sniping),
          utility: mkRange(p.hltv.utility)
      };
      Game.pushNews(`📋 ${p.name} 的试训报告已送达！`);
      if(UI.currentPage === 'market') this.renderAll();
  },
  
  // 获取基于 Rating 的纯理论指导价（忽略潜力影响）
  getGuidePriceRange(rating) {
      // 假设潜力最低为 Rating (无潜力)，最高为 Rating+20 (常规高潜)
      // 这只是给玩家看的“烟雾弹”
      const base = Math.pow(Math.max(1, rating - 40), 3) * 6;
      
      // 下限：完全没潜力的价格
      const minP = Math.floor(base + Math.pow(Math.max(1, rating - 40), 3) * 5 * 0.8);
      
      // 上限：默认是个天才的价格
      const maxP = Math.floor(base + Math.pow(Math.max(1, Math.min(99, rating + 20) - 40), 3) * 5 * 1.2);
      
      return `$${(minP/1000).toFixed(0)}k ~ $${(maxP/1000).toFixed(0)}k`;
  },

  renderAll(){this.renderPlayers();this.renderCoaches();},
  renderPlayers(){
    const yr=Game.date.getFullYear();
    const el=document.getElementById('market-players');if(!el)return;
    el.innerHTML=this.pList.map(p=>{
      const pool=MapUtils.poolForYear(yr);
      const myMaps=(p.maps||[]).filter(m=>pool.includes(m.map));
      const traitBadges=(p.traits||[]).map(t=>renderTraitBadge(t)).join('');
      const rar=RARITY[p.rarity||'common'];
      
      // 迷雾逻辑
      const isLegend = p.evalStatus === 2;
      const isEvaled = p.evalStatus === 1;
      const isEvaling = Game.evalQueue.some(x => x.id === p.id);
      const legendNotice = isLegend ? `<div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);background:var(--gold);color:#000;font-size:9px;font-weight:900;padding:2px 8px;border-radius:10px;box-shadow:0 0 10px rgba(232,168,56,0.6)">✨ 时代巨星</div>` : '';
      
      // 潜力显示
      let potDisplay = `<b style="color:var(--dim)">???</b>`;
      if (isLegend) potDisplay = `<b style="color:${p.potential>=85?'var(--gold)':p.potential>=75?'var(--win)':'var(--dim)'}">${p.potential}</b>`;
      else if (isEvaled) potDisplay = `<b style="color:var(--blue)">${p.evalRanges.potential}</b>`;

      // ── 声誉市场：价格模糊化 ──────────────────────────────
      // 根据选手吸引力预估竞争强度，给出市场热度和报价区间
      // 不暴露精确底价，让玩家凭经验和信息差做决策
      const _attr = (p.potential>=85||p.isRegenLegend) ? 2 :
                    (p.potential>=73) ? 1 : 0;
      const heatLabel = _attr >= 2 ? '🔥 高' : _attr === 1 ? '⚡ 中' : '📈 低';
      const heatColor = _attr >= 2 ? 'var(--loss)' : _attr === 1 ? 'var(--gold)' : 'var(--win)';
      // 区间：底价 75%（乐观无竞争）~ 顶价 135%（3家竞价+AI先手）
      const lo = Math.floor(p.price * 0.75);
      const hi = Math.floor(p.price * 1.35);
      const rangeStr = `$${(lo/1000).toFixed(0)}k ~ $${(hi/1000).toFixed(0)}k`;

      let priceDisplay;
      if (isLegend) {
        // 传奇/完全可见：展示热度 + 区间（仍不显示精确底价）
        priceDisplay = `<span style="font-size:11px"><b style="color:${heatColor}">${heatLabel}</b> <span style="color:var(--dim)">${rangeStr}</span></span>`;
      } else if (isEvaled) {
        // 试训后：提供更精确的区间（±15%）
        const loE = Math.floor(p.price * 0.88);
        const hiE = Math.floor(p.price * 1.22);
        priceDisplay = `<span style="font-size:11px"><b style="color:${heatColor}">${heatLabel}</b> <span style="color:var(--blue)">$${(loE/1000).toFixed(0)}k~$${(hiE/1000).toFixed(0)}k</span></span>`;
      } else {
        // 未试训：宽泛区间（基于Rating的引导价）
        priceDisplay = `<span style="font-size:11px"><b style="color:${heatColor}">${heatLabel}</b> <span style="color:var(--dim)">${this.getGuidePriceRange(p.rating)}</span></span>`;
      }

      // ── 按钮：全部指向 dynamicBid（竞价入口）────────────
      let btnHtml = '';
      if (isLegend || isEvaled) {
          // 已掌握充分信息，直接竞价
          btnHtml = `<button class="btn full" onclick="event.stopPropagation();Game.dynamicBid('${p.id}')">⚡ 参与竞价</button>`;
      } else if (isEvaling) {
          const days = Game.evalQueue.find(x => x.id === p.id).daysLeft;
          btnHtml = `<button class="btn dark full" disabled>试训中 (${days}天)</button>`;
      } else {
          btnHtml = `<div style="display:flex;gap:4px;margin-top:8px">
              <button class="btn dark" style="flex:1;padding:6px;font-size:11px" onclick="event.stopPropagation();Market.startEval('${p.id}')">📊 试训($1.5k)</button>
              <button class="btn danger" style="flex:1;padding:6px;font-size:11px" onclick="event.stopPropagation();Game.dynamicBid('${p.id}')">🎲 盲竞价</button>
          </div>`;
      }

      return `<div class="card ${p.isRegenLegend?'regen-legend':''}" onclick="UI.showPlayer('${p.id}')" style="border:${rar.border};${rar.shadow?`box-shadow:${rar.shadow}`:''};position:relative;margin-top:10px">
          ${legendNotice}
          <span class="rbadge" style="background:${ROLES[p.role].color}">${ROLES[p.role].zh}</span>
          <div class="cname" style="${p.rarity==='legend'?'color:#ffd700;font-weight:700':''}">${p.name} <span style="font-size:10px;color:var(--dim)">(${p.age}岁)</span></div>
          <div style="margin:4px 0 6px;min-height:18px">${traitBadges}</div>
          <div class="cstat"><span>能力值</span><b>${p.rating}</b></div>
          <div class="cstat"><span>潜力</span>${potDisplay}</div>
          <div class="cstat"><span>市场热度/报价</span>${priceDisplay}</div>
          <div class="mapbars">${myMaps.slice(0,2).map(m=>`<div class="mapbar-row"><span class="mapbar-name">${MapUtils.display(m.map)}</span><div class="mapbar-bg"><div class="mapbar-fill" style="width:${m.str}%;background:var(--win)"></div></div><span style="font-size:10px;color:var(--dim)">${m.str}</span></div>`).join('')}</div>
          ${btnHtml}
      </div>`;
    }).join('');
  },
  renderCoaches(){
    const el=document.getElementById('market-coaches');if(!el)return;
    el.innerHTML=this.cList.map(c=>{
      const gc=c.gradeColor||'var(--blue)';
      const gl=c.grade||'—';
      const canAfford=Game.money>=c.price;
      return`
      <div class="card coach-card" style="border-color:${gc}22">
        <span class="rbadge" style="background:${gc};color:#000">教练</span>
        <div style="position:absolute;top:10px;right:52px;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;background:${gc}22;border:1px solid ${gc};color:${gc}">${gl}</div>
        <div class="cname">${c.name} <span style="font-size:10px;color:var(--dim)">(${c.age}岁)</span></div>
        <div class="cstat"><span>战术水平</span><b style="color:${gc}">${c.tactics}</b></div>
        <div class="cstat"><span>BP精准度</span><b>${Math.round(40+c.tactics*.5)}%</b></div>
        <div class="cstat"><span>签约费</span><b style="color:${canAfford?'#86efac':'var(--loss)'}">$${c.price.toLocaleString()}</b></div>
        <div class="cstat"><span>周薪</span><b style="color:var(--loss)">$${(c.salary||0).toLocaleString()}/周</b></div>
        <div class="mapbars">${(c.maps||[]).slice(0,2).map(m=>`<div class="mapbar-row"><span class="mapbar-name">${MapUtils.display(m.map)}</span><div class="mapbar-bg"><div class="mapbar-fill" style="width:${m.str}%;background:${gc}"></div></div><span style="font-size:10px;color:var(--dim)">${m.str}</span></div>`).join('')}</div>
        <button class="btn full" onclick="Game.buyC('${c.id}')" ${canAfford?'':'disabled style="opacity:.4"'}>签约教练</button>
      </div>`;
    }).join('');
  }
};

// ─── SaveManager ─────────────────────────────────────
const SaveManager={
  key: 'cs_legends_save',
  // 当前存档结构版本号 —— 每次改变存档结构时递增
  CURRENT_VER: 7,
  // 历史旧 key（用于自动清理，防止 localStorage 堆积）
  LEGACY_KEYS: [
    'cs_legends_save_v1','cs_legends_save_v2','cs_legends_save_v3',
    'cs_legends_save_v4','cs_legends_save_v5','cs_legends_save_v6'
  ],

  // ── 清理所有旧 key ────────────────────────────────────
  cleanLegacy(){
    this.LEGACY_KEYS.forEach(k => {
      if(localStorage.getItem(k)) localStorage.removeItem(k);
    });
  },

  save(){
    try{
      const teamsMeta=(World.teams||[]).map(t=>({
        id:t.id, points:t.points||0, rank:t.rank||999, lastRank:t.lastRank||999,
        totalFans:t.totalFans||0, brandFans:t.brandFans||0
      }));
      const data={
        _ver: this.CURRENT_VER,          // 版本标记
        date:Game.date.toISOString(),
        money:Game.money,
        fans:Game.fans,
        teamName:Game.teamName||'我的战队',
        roster:Game.roster,
        coach:Game.coach,
        trophies:Game.trophies||[],
        news:Game.news||[],
        bankruptcyDays:Game.bankruptcyDays||0,
        debtTrainPenalty:Game.debtTrainPenalty||0,
        gamePoints:Game.points||0,
        gameRank:Game.rank||999,
        gameLastRank:Game.lastRank||999,
        matchHistory:Game.matchHistory||[],
        sTierAppearances:Game.sTierAppearances||0,
        majorAppearances:Game.majorAppearances||0,
        facilities:Game.facilities||{training:1,medical:1,media:1,youth:1},
        teamsMeta,
        // 赞助商状态
        activeSponsors: SponsorManager.activeSponsors||[],
        sponsorHistory: SponsorManager.history||[],
      };
      localStorage.setItem(this.key,JSON.stringify(data));
    }catch(e){console.error('Save failed:',e);UI.toast('❌ 保存失败');}
  },

  // ── 迁移旧版存档字段 ─────────────────────────────────
  _migrate(data){
    const ver = data._ver || 0;
    // v0-v6 → v7: 赞助商字段可能缺失
    if(ver < 7){
      if(!data.activeSponsors) data.activeSponsors = [];
      if(!data.sponsorHistory)  data.sponsorHistory  = [];
      if(!data.facilities) data.facilities = {training:1,medical:1,media:1,youth:1};
      if(!data.matchHistory) data.matchHistory = [];
      if(!data.teamsMeta) data.teamsMeta = [];
      // 老版 news 可能是字符串数组
      if(Array.isArray(data.news) && data.news.length > 0 && typeof data.news[0]==='string'){
        data.news = data.news.map(m=>({date:'????-??-??',msg:m}));
      }
    }
    data._ver = this.CURRENT_VER;
    return data;
  },

  // ── 检验关键字段完整性 ────────────────────────────────
  _validate(data){
    if(!data.date || isNaN(new Date(data.date))) return '存档日期损坏';
    if(typeof data.money !== 'number')            return '资金数据损坏';
    if(!Array.isArray(data.roster))               return '阵容数据损坏';
    if(data.roster.length > 0){
      const p = data.roster[0];
      if(!p.id || !p.rating || !p.role)           return '选手数据结构损坏';
    }
    return null; // OK
  },

  load(){
    // 先尝试当前 key，再尝试旧 key（自动迁移）
    let json = localStorage.getItem(this.key);
    if(!json){
      // 尝试读旧版 key 并迁移
      for(const oldKey of [...this.LEGACY_KEYS].reverse()){
        json = localStorage.getItem(oldKey);
        if(json){ console.log('[SaveManager] 发现旧版存档，从', oldKey, '迁移'); break; }
      }
    }
    if(!json) return false;

    try{
      let data = JSON.parse(json);

      // 迁移字段
      data = this._migrate(data);

      // 完整性校验
      const err = this._validate(data);
      if(err){
        console.error('[SaveManager] 存档校验失败:', err);
        // 弹出确认框，让用户决定是否清档
        if(confirm(`⚠️ 存档数据异常（${err}），可能与游戏版本不兼容。
点"确定"自动清档重置，点"取消"保留旧档（可能导致异常）。`)){
          this.reset(); return false;
        }
        // 用户选择保留，继续尝试加载（风险自负）
      }

      // ── 恢复游戏状态 ─────────────────────────────────
      Game.date=new Date(data.date); Game.money=data.money; Game.fans=data.fans;
      if(data.teamName) Game.teamName=data.teamName;
      Game.trophies=data.trophies||[]; Game.news=data.news||[];
      Game.bankruptcyDays=data.bankruptcyDays||0;
      Game.debtTrainPenalty=data.debtTrainPenalty||0;
      Game.points=data.gamePoints||Game.points;
      Game.rank=data.gameRank||Game.rank;
      Game.lastRank=data.gameLastRank||Game.lastRank;
      Game.matchHistory=data.matchHistory||[];
      Game.sTierAppearances=data.sTierAppearances||0;
      Game.majorAppearances=data.majorAppearances||0;
      Game.facilities=data.facilities||{training:1,medical:1,media:1,youth:1};
      Game.roster=data.roster||[];

      // ── 选手字段补全 ──────────────────────────────────
      Game.roster.forEach(p=>{
        if(!World.players.find(x=>x.id===p.id)) World.players.push(p);
        if(p.salary===undefined) p.salary=Math.floor(p.rating*p.rating/10);
        if(!p.traits)  p.traits=[];
        if(!p.maps)    p.maps=[];
        if(!p.form)    p.form=1.0;
        if(!p.ys)      p.ys={matches:0,ratingSum:0,mvps:0,majorWins:0,wins:0};
        else{
          // ys 子字段补全
          p.ys.matches   = p.ys.matches   ?? 0;
          p.ys.ratingSum = p.ys.ratingSum ?? 0;
          p.ys.mvps      = p.ys.mvps      ?? 0;
          p.ys.majorWins = p.ys.majorWins ?? 0;
          p.ys.wins      = p.ys.wins      ?? 0;
        }
        if(!p.sub_pot) p.sub_pot = World.generateSubPotential(p.potential || 70, p.role);
        if(!p.hltv) p.hltv = World.generateHLTVProfile(p.rating, p.role, p.sub_pot);
        if(!p.evalStatus && p.evalStatus!==0) p.evalStatus=2;
      });

      // ── World 全局选手/战队迁移 ───────────────────────
      World.players.forEach(p=>{
        if(!p.sub_pot) p.sub_pot = World.generateSubPotential(p.potential || 70, p.role);
        if(!p.hltv) p.hltv = World.generateHLTVProfile(p.rating, p.role, p.sub_pot);
        if(!p.fans) p.fans = World.generateInitialFans(p.rating>=90?'star':p.rating>=80?'pro':'amateur', p);
        if(!p.ys)   p.ys={matches:0,ratingSum:0,mvps:0,majorWins:0,wins:0};
      });
      World.teams.forEach(t=>{
        if(!t.totalFans) World.updateTeamFans(t, {tier:'none',placement:'none'});
        if(!t.points && t.points!==0) t.points=0;
      });

      // ── AI 战队积分恢复 ───────────────────────────────
      if(data.teamsMeta && Array.isArray(data.teamsMeta)){
        data.teamsMeta.forEach(meta=>{
          const t=World.teams.find(x=>x.id===meta.id);
          if(t){
            t.points   = meta.points   ?? t.points;
            t.rank     = meta.rank     ?? t.rank;
            t.lastRank = meta.lastRank ?? t.lastRank;
            t.totalFans= meta.totalFans?? t.totalFans;
            t.brandFans= meta.brandFans?? t.brandFans;
          }
        });
      }

      // ── 粉丝同步 ─────────────────────────────────────
      const oldFans = Game.fans;
      World.updateTeamFans({isPlayer:true,roster:Game.roster,brandFans:Math.max(1000,oldFans)},{tier:'none',placement:'none'});

      // ── 教练补全 ──────────────────────────────────────
      Game.coach=data.coach||null;
      if(Game.coach){
        if(Game.coach.salary===undefined) Game.coach.salary=calcCoachSalary(Game.coach.tactics||50);
        if(!Game.coach.maps) Game.coach.maps=[];
      }

      // ── 赞助商恢复 ────────────────────────────────────
      SponsorManager.activeSponsors = (data.activeSponsors||[]).filter(s=>s&&s.tierName&&s.remainingEvents>0);
      SponsorManager.history        = data.sponsorHistory||[];

      // 写回当前 key（从旧 key 迁移时保存到新 key）
      this.save();
      // 清理旧 key
      this.cleanLegacy();

      UI.toast('📂 存档已读取');
      return true;
}catch(e){
      console.error('[SaveManager] 加载失败:', e);
      if(confirm(`❌ 存档解析失败（可能是版本不兼容）。\n点"确定"清档重置，点"取消"忽略错误继续。`)){
        this.reset(); return false;
      }
      return false;
    }
  },

  hasSave(){
    if(localStorage.getItem(this.key)) return true;
    // 检查旧 key
    return this.LEGACY_KEYS.some(k=>localStorage.getItem(k));
  },

  // ── 彻底清档 ─────────────────────────────────────────
  reset(){
    localStorage.removeItem(this.key);
    this.cleanLegacy();
    location.reload();
  }
};
