// ══════════════════════════════════════════════════════
//  core.js — Game 对象（时间流逝、存档管理）
// ══════════════════════════════════════════════════════
const Game={
  date:new Date('2000-01-01'),money:30000,fans:10,
  teamName: '我的战队',
  initialCapital: 55000, firstMatchMonth: 0,
  facilities: { training: 1, medical: 1, media: 1, youth: 1 },
  roster:[],coach:null,trophies:[],news:[],
  chem:35,fatigue:0,training:'rest', scrimCD: 0,
  points:0, lastRank:999, rank:999,
  bankruptcyDays:0, debtTrainPenalty:0, synCache:{mult:1,msgs:[]},
  // History Tracking for Sponsors
  matchHistory: [], // { date, rating, tier }
  sTierAppearances: 0,
  majorAppearances: 0,
  eras:[
    {name:'CS 1.6 Era', winR:16,halfR:15,lossReset:true},
    {name:'CS:GO Era',  winR:16,halfR:15,lossReset:false},
    {name:'CS2 Era',    winR:13,halfR:12,lossReset:false}
  ],
  get era(){const y=this.date.getFullYear();return y>=2023?2:y>=2012?1:0;},
  get eraObj(){return this.eras[this.era];},
  get weeklySalary(){
    // Legacy getter, kept for safety but replaced by calculateOperatingCost in usage
    return this.calculateOperatingCost() / 4;
  },
  calculateOperatingCost() {
      // 1. Base Cost (俱乐部日常运营：场地租金、水电网费、基础开销)
      // 固定 $3,000/月 ≈ $750/周，小俱乐部的现实压力
      const baseCost = 3000;
      
      // 2. Salary Sum
      const salarySum = this.roster.reduce((a,b)=>a+(b.salary||Math.floor(b.rating*b.rating/10)),0) + 
                        (this.coach?(this.coach.salary||calcCoachSalary(this.coach.tactics||50)):0);
      
      // 3. Facility Cost
      let facilityCost = 0;
      if (this.facilities) {
          const { training, medical, media, youth } = this.facilities;
          // Facility Cost (Level 1=100/week, Level 10=10000/week)
          // 100 * level^2 for each facility
          facilityCost += Math.pow(training, 2) * 100;
          facilityCost += Math.pow(medical, 2) * 100;
          facilityCost += Math.pow(media, 2) * 100;
          facilityCost += Math.pow(youth, 2) * 100;
      } 
      
      // 4. Marketing Cost
      const marketingCost = this.fans * 0.05;
      
      // 5. Scaling Cost
      const scalingCost = Math.pow(this.fans / 10000, 2) * 12;
      
      // 6. Luxury Tax (高薪奢侈税，门槛提高到60000以便早期成长)
      let luxuryTax = 0;
      if (salarySum > 60000) {
          luxuryTax = (salarySum - 60000) * 1.5;
      }
      
      let total = baseCost + salarySum + facilityCost + marketingCost + scalingCost + luxuryTax;
      
      // 开局缓冲：2000年1月（等待首场比赛期间）运营成本减半
      // 首场比赛在1月24日，玩家前3周学习游戏机制，1月减半让压力更小
      if (this.date.getFullYear() === 2000 && this.date.getMonth() === 0) {
          total *= 0.5;
      }
      
      return Math.floor(total);
  },
  
  signSponsor(tierName) {
      // Wrapper for UI to call SponsorManager
      const contract = SponsorManager.sign(tierName, this);
      if(contract) {
          // Refresh if on sponsor page
          if(UI.currentPage === 'sponsors') UI.renderSponsors();
      }
  },

  setTeamName() {
    const input = document.getElementById('team-name-input');
    if(!input) return;
    const val = input.value.trim();
    if(!val) return UI.toast('战队名不能为空！');
    if(val.length > 20) return UI.toast('战队名最多20字！');
    this.teamName = val;
    UI.toast(`✅ 战队名已更新为：${val}`);
    UI.refresh();
    SaveManager.save();
  },
  pushNews(msg){
    this.news.unshift({date:fmtD(this.date),msg});
    if(this.news.length>20)this.news.pop();
    const el=document.getElementById('news-ticker');
    if(el)el.innerHTML=this.news.map(n=>`<div style="margin-bottom:4px;border-bottom:1px dashed var(--border);padding-bottom:2px"><span style="color:var(--dim)">${n.date}</span><br><span style="color:#eee">${n.msg}</span></div>`).join('');
  },
  init(){
    this.evalQueue = [];
    // 先设置日期，再初始化世界（时代判断依赖日期）
    this.date=new Date('2000-01-01');
    World.init(2000);
    if(SaveManager.hasSave()&&SaveManager.load()){
      Cal.genYear(this.date.getFullYear());
      if(this.news&&this.news.length){
        const el=document.getElementById('news-ticker');
        if(el)el.innerHTML=this.news.map(n=>`<div style="margin-bottom:4px;border-bottom:1px dashed var(--border);padding-bottom:2px"><span style="color:var(--dim)">${n.date}</span><br><span style="color:#eee">${n.msg}</span></div>`).join('');
      }
    }else{
      ['IGL','Sniper','Entry','Rifler','Lurker'].forEach(role=>{
        // 初始阵容：强制 ai=true 跳过 RegenLegend 检测，再手动补市场属性
        const p=World.mkP(43,50,true,role,2000);
        p.teamId='PLAYER';
        p.form=0.93+Math.random()*0.10;
        p.rarity='common';
        p.isRegenLegend=false;
        // 初始阵容潜力上限提高：这些人是有梦想的年轻人，潜力应该更高
        // 重新计算潜力：rating + 15~30（年轻人的可能性），上限75
        const age = p.age || 20;
        const potBonus = age <= 20 ? rnd(15, 28) : age <= 22 ? rnd(10, 22) : rnd(8, 16);
        p.potential = Math.min(75, p.rating + potBonus);
        // potential 被覆写，必须同步重新生成 sub_pot，确保七维潜力均值 = potential
        p.sub_pot = World.generateSubPotential(p.potential, p.role);
        // 补充市场选手需要的字段
        p.evalStatus=2; // 自家队员直接可见
        if(!p.id.startsWith('p'))p.id='p'+p.id; // 统一ID前缀
        World.players.push(p);this.roster.push(p);
      });
      Cal.genYear(2000);this.money=this.initialCapital;
      this.pushNews('俱乐部成立，拉来了几个小赞助商凑了 5.5 万启动资金，兄弟们挤在网吧里备战，证明自己吧！');
      this.pushNews('📅 1月24日——<b style="color:#ffd700">新手试炼赛</b>即将开幕！这是你们第一次公开亮相，认真备战吧！');
    }
    // 免费初始化市场（不扣钱）
    Market.refresh(true);
    UI.refresh();
    World.updateRankings();
    UI.renderRankings && UI.renderRankings();
  },
  advanceDay(){
    this.date.setDate(this.date.getDate()+1);
    const y=this.date.getFullYear(),mo=this.date.getMonth(),d=this.date.getDate();
    
    // 市场每月1号自动刷新
    if (d === 1) {
        Market.refresh(true);
        this.pushNews("🔄 转会市场已更新本月最新名单！");
    }
    // 处理试训队列
    for (let i = this.evalQueue.length - 1; i >= 0; i--) {
        let task = this.evalQueue[i];
        task.daysLeft--;
        if (task.daysLeft <= 0) {
            Market.finishEval(task.id);
            this.evalQueue.splice(i, 1);
        }
    }
    if(UI.currentPage === 'market') UI.renderMarketTimer();

    // 历史天才少年登场
    this._checkDebuts(y);
    // 周薪
    if(this.date.getDay()===1){
      const weeklyCost = Math.floor(this.calculateOperatingCost() / 4);
      this.money -= weeklyCost;
      // Removed repetitive weekly toast for smoother multi-day advance
      // UI.toast(`💸 支付运营开支 $${weeklyCost.toLocaleString()}`);
      
      // 每周一更新世界排名
      World.updateRankings();
      UI.renderRankings && UI.renderRankings();

      // -- 负债系统 --
      // 允许一定程度的负债经营，但有利息和运营惩罚，不能长期依赖
      const DEBT_LIMIT = -30000; // 负债上限：-$30k

      if (this.money < 0) {
        if (this.money < DEBT_LIMIT) {
          // 超过负债上限：强制卖人
          const sorted = [...this.roster].sort((a,b) => (b.salary||0) - (a.salary||0));
          if (sorted.length > 0) {
            const target = sorted[0];
            this.sellP(target.id);
            this.pushNews('💔 负债超限！债主逼门，被迫贱卖 ' + target.name + ' 回血');
          }
        } else {
          // 负债分档惩罚
          const debt = -this.money;
          let interestRate, trainPenalty, sponsorRisk, debtLabel, debtColor;

          if (debt <= 10000) {
            interestRate = 0.05; trainPenalty = 0.10;
            sponsorRisk = false; debtLabel = '轻度'; debtColor = 'var(--gold)';
          } else if (debt <= 20000) {
            interestRate = 0.10; trainPenalty = 0.25;
            sponsorRisk = false; debtLabel = '中度'; debtColor = '#f97316';
          } else {
            interestRate = 0.15; trainPenalty = 0.40;
            sponsorRisk = true;  debtLabel = '重度'; debtColor = 'var(--loss)';
          }

          // 1. 每周利息（按负债金额比例，最低$50）
          const interest = Math.max(50, Math.floor(debt * interestRate / 4));
          this.money -= interest;
          this.debtTrainPenalty = trainPenalty;

          // 2. 赞助商压力（重度负债时）
          if (sponsorRisk && SponsorManager.activeSponsors.length > 0) {
            this.bankruptcyDays = (this.bankruptcyDays || 0) + 7;
            if (this.bankruptcyDays >= 14) {
              const sp = SponsorManager.activeSponsors[0];
              if (sp && Math.random() < 0.35) {
                SponsorManager.breach(sp, 0);
                this.pushNews('📉 重度负债持续，赞助商 ' + sp.tierName + ' 宣布撤约！');
              }
              this.bankruptcyDays = 0;
            }
          } else if (!sponsorRisk) {
            this.bankruptcyDays = 0;
          }

          // 3. 每周提示
          UI.toast('💸 [' + debtLabel + '负债 -$' + debt.toLocaleString() + '] 周利息 -$' + interest + '，训练效果 -' + Math.round(trainPenalty*100) + '%');
        }
      } else {
        this.bankruptcyDays = 0;
        this.debtTrainPenalty = 0;
      }
    }
    if(this.scrimCD > 0) this.scrimCD--; // 处理训练赛冷却

    // 训练系统重构
    const coachTactics = this.coach ? this.coach.tactics : 50;
    const hasIron = this.roster.some(p => (p.traits||[]).includes('iron'));
    
    // Facility Buffs (Nerfed: "Icing on the cake")
    const { training, medical, media } = this.facilities || { training: 1, medical: 1, media: 1 };
    // Training: +3% efficiency per level (Max +27%)
    // 负债惩罚：训练效果按负债档位降低
    const debtPenalty = this.debtTrainPenalty || 0;
    const trainBuff = (1 + (training - 1) * 0.03) * (1 - debtPenalty);
    // Medical: -2% fatigue gain per level (Max -18%)
    const fatigueFactor = Math.max(0.5, 1 - (medical - 1) * 0.02); 
    // Iron trait stacks multiplicatively
    const fatigueResist = (hasIron ? 0.5 : 1) * fatigueFactor;

    // ── Form 均值回归：每天向 1.0 靠拢5%，防止长期挂在高位 ──
    // 不主动维护：1.2 约20天自然回落到1.0；0.8 约20天回升到1.0
    this.roster.forEach(p => {
        p.form = p.form + (1.0 - p.form) * 0.05;
    });

    // Media Income (Daily trickle)
    // Level 1: $20, Level 10: $200. Tiny bonus.
    this.money += Math.floor(media * 20);

    // ── 训练核心：HLTV 属性成长引擎 ─────────────────────
    // decay 随属性接近潜力上限而大幅降低（边际效益递减）
    // 疲劳因子：疲劳越高，属性增量越小
    // ── hltvGrow: 七维独立潜力衰减引擎 ──────────────────
    const HLTV_KEYS = ['firepower','entrying','trading','opening','clutching','sniping','utility'];
    const hltvGrow = (p, key, stars) => {
        if (!p.hltv) p.hltv = World.generateHLTVProfile(p.rating, p.role);
        if (!p.sub_pot) p.sub_pot = World.generateSubPotential(p.potential || 70, p.role);
        const curr    = p.hltv[key] || 0;
        const subPot  = p.sub_pot[key] || p.potential || 70; // 兼容旧数据
        const ratio   = curr / subPot;

        // 独立衰减：越接近该属性潜力上限，增幅越小
        let decay = 1;
        if (ratio > 0.80) decay *= 0.65;
        if (ratio > 0.90) decay *= 0.35;
        if (ratio > 0.95) decay *= 0.10;

        const fatFactor = Math.max(0.2, 1 - Game.fatigue / 100);

        // ★ 普通: 0.025~0.10 | ★★ 中: 0.05~0.16 | ★★★ 主: 0.07~0.22
        // 目标：主属性达到潜力上限约需 1.5~2 赛季（~600天），弱属性更慢
        const ranges = {1:[0.025,0.10], 2:[0.05,0.16], 3:[0.07,0.22]};
        const [lo, hi] = ranges[stars] || ranges[1];
        const base = lo + Math.random() * (hi - lo);
        const gain = base * decay * fatFactor * trainBuff;

        // 七维总和硬顶：不能超 potential*7
        const totalCap = (p.potential || 70) * 7;
        const currentTotal = HLTV_KEYS.reduce((s, k) => s + (p.hltv[k] || 0), 0);
        const headroom = totalCap - currentTotal;

        const actualGain = Math.min(gain, Math.max(0, headroom));
        if (actualGain > 0.04) p.hltv[key] = Math.min(subPot, curr + actualGain);
        return { gain: actualGain, curr: p.hltv[key], cap: subPot };
    };

    // ── bigBreak: 大突破（1.5~3.0，仅练枪/Retake/天梯触发）
    const bigBreak = (p, keys) => {
        if (!p.sub_pot) p.sub_pot = World.generateSubPotential(p.potential || 70, p.role);
        const prob = 0.03 + 0.02 * Math.random(); // 3~5%
        if (Math.random() < prob) {
            const key = keys[Math.floor(Math.random() * keys.length)];
            if (!p.hltv) p.hltv = World.generateHLTVProfile(p.rating, p.role);
            const curr    = p.hltv[key] || 0;
            const subPot  = p.sub_pot[key] || p.potential || 70;
            const burst   = 1.5 + Math.random() * 1.5; // 1.5~3.0
            const newVal  = Math.min(subPot, curr + burst);
            const actual  = newVal - curr;
            if (actual > 0) p.hltv[key] = newVal;
            return { key, burst: actual, curr: newVal, cap: subPot };
        }
        return null;
    };

    // 收集本次训练的日志
    const trainLogs = [];

    switch(this.training) {
        case 'rest':
            // 零风险：疲劳-35%绝对值，全属性微回复，状态上升
            this.fatigue = Math.max(0, this.fatigue - Math.ceil(this.fatigue * 0.22 + 1));
            this.roster.forEach(p => {
                p.form = Math.min(1.15, p.form + 0.015);
                // 微量全属性恢复（低于当前值不会增长）
                ['firepower','entrying','trading','opening','clutching','sniping','utility'].forEach(k => {
                    if (p.hltv) {
                        const cap = (p.sub_pot && p.sub_pot[k]) ? p.sub_pot[k] : (p.potential || 70);
                        p.hltv[k] = Math.min(cap, (p.hltv[k]||0) + 0.08);
                    }
                });
            });
            trainLogs.push('🛌 全队休整，疲劳大幅缓解，状态小幅回升。');
            break;

        case 'fpl': {
            // 高风险高回报：均衡全属性，大突破概率最高，form波动
            this.fatigue = Math.min(100, this.fatigue + Math.ceil(4 * fatigueResist));
            const allKeys = ['firepower','entrying','trading','opening','clutching','sniping','utility'];
            const gains = [];
            this.roster.forEach(p => {
                // 均衡：每个属性 ★ 等级
                allKeys.forEach(k => hltvGrow(p, k, 1));
                // 角色倾向额外 ★★ 提升，记录日志
                const roleFocus = {IGL:'opening', Sniper:'sniping', Entry:'entrying', Lurker:'clutching', Rifler:'firepower'};
                const focusKey = roleFocus[p.role];
                if (focusKey) {
                    const r = hltvGrow(p, focusKey, 2);
                    if (r.gain > 0.05) gains.push(`${p.name} ${focusKey} +${r.gain.toFixed(2)} (to ${r.curr.toFixed(1)}/${r.cap})`);
                }
                // 大突破判定
                const bb = bigBreak(p, allKeys);
                if (bb && bb.burst > 0) trainLogs.push(`⚡ <b style="color:var(--gold)">${p.name}</b> 天梯大突破！${bb.key} +${bb.burst.toFixed(1)} (to ${bb.curr.toFixed(1)}/${bb.cap})`);
                // form：10%掉状态
                if (Math.random() < 0.15) { p.form = Math.max(0.6, p.form - 0.08); trainLogs.push(`😤 ${p.name} 遇到菜队友，状态微降。`); }
                else p.form = Math.min(1.20, p.form + 0.008);
            });
            if (gains.length > 0) {
                const top = gains.slice(0, 3).map(g => `<span style="color:var(--win)">${g}</span>`).join('，');
                trainLogs.push(`🎯 天梯：${top}，疲劳+18%。`);
            } else {
                trainLogs.push(`🎯 天梯训练完成，疲劳+18%。`);
            }
            break;
        }

        case 'utility': {
            this.fatigue = Math.min(100, this.fatigue + Math.ceil(6 * fatigueResist));
            const utilGains = [];
            this.roster.forEach(p => {
                const ru = hltvGrow(p, 'utility', 3);
                const ro = hltvGrow(p, 'opening', 3);
                hltvGrow(p, 'entrying', 1);
                if (ru.gain > 0.05) utilGains.push(`${p.name} utility +${ru.gain.toFixed(2)}(${ru.curr.toFixed(0)}/${ru.cap})`);
            });
            // 地图熟练度小提升（保留原有逻辑）
            if (Math.random() < 0.3 * trainBuff && this.roster.length > 0) {
                const rp = pick(this.roster);
                if (rp.maps && rp.maps.length > 0) { pick(rp.maps).str = Math.min(99, pick(rp.maps).str + 1); }
            }
            const utilTop = utilGains.slice(0, 2).join('，');
            trainLogs.push(`💣 道具跑图：${utilTop || 'utility+opening提升'}，疲劳+12%。`);
            break;
        }

        case 'theory':
            // 需教练：opening/clutching/trading 为主，utility 次要
            this.fatigue = Math.min(100, this.fatigue + Math.ceil(7 * fatigueResist));
            if (this.coach) {
                const avgIQ = this.roster.reduce((s,p)=>s+(p.hltv?p.hltv.utility:60),0)/Math.max(1,this.roster.length);
                const theoryEff = (this.coach.tactics*0.7 + avgIQ*0.3)*0.008*trainBuff;
                this.chem = Math.min(this.chemCap(), this.chem + theoryEff);
                this.roster.forEach(p => {
                    hltvGrow(p, 'opening',   3);
                    hltvGrow(p, 'clutching', 3);
                    hltvGrow(p, 'trading',   2);
                    hltvGrow(p, 'utility',   1);
                });
                trainLogs.push(`📺 录像复盘：opening ★★★ + clutching ★★★ + trading ★★，磨合+${theoryEff.toFixed(2)}，疲劳+8%。`);
            } else { this.training = 'rest'; }
            break;

        case 'team': {
            // 高强度：trading/clutching/utility 为主，opening 次要
            this.fatigue = Math.min(100, this.fatigue + Math.ceil(11 * fatigueResist));
            let mult = this.coach ? 1 + coachTactics / 200 : 1;
            if (this.roster.some(p=>(p.traits||[]).includes('独裁战术'))) mult *= 2.0;
            this.chem = Math.min(this.chemCap(), this.chem + mult*0.3*trainBuff);
            this.roster.forEach(p => {
                hltvGrow(p, 'trading',   3);
                hltvGrow(p, 'clutching', 2);
                hltvGrow(p, 'utility',   3);
                hltvGrow(p, 'opening',   1);
            });
            trainLogs.push(`🤝 战术合练：trading ★★★ + utility ★★★ 为主，磨合提升，疲劳+25%。`);
            break;
        }

        case 'dm': {
            // 练枪：firepower/sniping ★★★，entrying 次要，10%伤病风险
            this.fatigue = Math.min(100, this.fatigue + Math.ceil(10 * fatigueResist));
            let dmInjured = false;
            this.roster.forEach(p => {
                const rfp = hltvGrow(p, 'firepower', 3);
                const rsp = hltvGrow(p, 'sniping',   3);
                hltvGrow(p, 'entrying',  1);
                // 大突破判定（DM允许）
                const bbDm = bigBreak(p, ['firepower','sniping','entrying']);
                if (bbDm && bbDm.burst > 0) trainLogs.push(`⚡ <b style="color:var(--gold)">${p.name}</b> DM大突破！${bbDm.key} +${bbDm.burst.toFixed(1)} (${bbDm.curr.toFixed(0)}/${bbDm.cap})`);
                if (rfp.gain > 0.1) trainLogs.push(`🎯 ${p.name} firepower +${rfp.gain.toFixed(2)} → ${rfp.curr.toFixed(0)}/${rfp.cap}`);
                // 10% 伤病：form大幅下降
                if (!dmInjured && Math.random() < 0.10) {
                    p.form = Math.max(0.5, p.form - 0.20);
                    dmInjured = true;
                    trainLogs.push(`🤕 <b style="color:var(--loss)">${p.name}</b> 高强度练枪导致轻伤，状态-20%！`);
                }
            });
            trainLogs.push(`🔫 练枪 DM：firepower ★★★ + sniping ★★★，疲劳+22%。`);
            break;
        }

        case 'retake': {
            // Retake：clutching/trading ★★★，opening 次要，5%心理压力
            this.fatigue = Math.min(100, this.fatigue + Math.ceil(9 * fatigueResist));
            this.roster.forEach(p => {
                const rct = hltvGrow(p, 'clutching', 3);
                const rtr = hltvGrow(p, 'trading',   3);
                hltvGrow(p, 'opening',   1);
                // 大突破判定（Retake允许）
                const bbRt = bigBreak(p, ['clutching','trading','opening']);
                if (bbRt && bbRt.burst > 0) trainLogs.push(`⚡ <b style="color:var(--gold)">${p.name}</b> Retake大突破！${bbRt.key} +${bbRt.burst.toFixed(1)} (${bbRt.curr.toFixed(0)}/${bbRt.cap})`);
                if (rct.gain > 0.1) trainLogs.push(`💥 ${p.name} clutching +${rct.gain.toFixed(2)} → ${rct.curr.toFixed(0)}/${rct.cap}`);
                // 5% 心理压力：form微降
                if (Math.random() < 0.05) {
                    p.form = Math.max(0.65, p.form - 0.12);
                    trainLogs.push(`😰 <b style="color:var(--gold)">${p.name}</b> Retake 模拟压力过大，心理微波动。`);
                }
            });
            trainLogs.push(`💥 Retake 模拟：clutching ★★★ + trading ★★★，疲劳+20%。`);
            break;
        }

        case 'phys': {
            // 体能：form+20%上限提升，全属性小提升，clutching 次要，疲劳+5%
            this.fatigue = Math.min(100, this.fatigue + Math.ceil(5 * fatigueResist));
            this.roster.forEach(p => {
                // form 提升（上限提高到1.35）
                p.form = Math.min(1.20, p.form + 0.025);
                // 全属性微量提升
                ['firepower','entrying','trading','opening','sniping','utility'].forEach(k => hltvGrow(p, k, 1));
                hltvGrow(p, 'clutching', 1); // 次要属性同 ★ 级
                // 体能训练防伤病：form 不会因疲劳>80 而下降（本轮）
            });
            trainLogs.push(`🏃 体能训练：form提升+全属性小涨，疲劳仅+5%，降低伤病风险。`);
            break;
        }
    }

    // 高疲劳状态惩罚（体能训练本日免疫）
    if(this.fatigue > 80 && this.training !== 'phys') {
        this.roster.forEach(p => p.form = Math.max(0.72, p.form - 0.06));
    }

    // 训练日志推送（最多推1条综合 + 特殊事件）
    if (trainLogs.length > 0) {
        trainLogs.forEach(msg => this.pushNews(msg));
    }

    // 训练完成后：同步综评 = 七维 hltv 均值（让综评随成长实时更新）
    const HLTV_KEYS_SYNC = ['firepower','entrying','trading','opening','clutching','sniping','utility'];
    this.roster.forEach(p => {
        if (!p.hltv) return;
        const avg = HLTV_KEYS_SYNC.reduce((s, k) => s + (p.hltv[k] || 0), 0) / 7;
        p.rating = Math.round(avg * 10) / 10; // 保留一位小数，避免整数跳跃太频繁
    });

    // 训练完成后刷新 UI（含雷达图）
    UI.refresh();

    // 月末积分衰减 (每月末 8%)
    if (d === new Date(y, mo + 1, 0).getDate()) {
        World.applyMonthlyDecay();
        this.pushNews("📉 月度积分结算：所有战队积分衰减 8%");
    }

    // 年末
    if(mo===11&&d===31){this._yearEnd(y);return false;}
    // 随机事件
    if(Math.random()<.01)this._randomEvent();
    // 赛事检测
    const ev=Cal.today(this.date);
    if(ev){
      if(ev.isReg){
        // 玩家已报名 → 当天直接开赛
        Tour.start(ev);return true;
      }else{
        const w=pick(World.teams);
        if(w&&w.roster){w.roster.forEach(p=>{p.ys.matches+=5;p.ys.ratingSum+=(1.05+Math.random()*.2)*5;p.ys.wins++;if(ev.tier==='major')p.ys.majorWins++;});if(w.roster[0])w.roster[0].ys.mvps++;}
        UI.toast(`📰 ${w?w.name:'某队'} 夺得 ${ev.name} 冠军！`);
      }
    }
    // 提前1天提醒玩家已报名的即将开始赛事（避免被静默拖入）
    const tomorrow=new Date(this.date);tomorrow.setDate(tomorrow.getDate()+1);
    const evTomorrow=Cal.today(tomorrow);
    if(evTomorrow&&evTomorrow.isReg){
      UI.toast(`⚠️ 明天 ${evTomorrow.name} 即将开始，做好准备！`);
    }
    UI.refresh();
    return false;
  },
  advanceWeek(){
      for(let i=0; i<7; i++){
          if(this.advanceDay()) break; // Stop if event starts
      }
  },
  advanceMonth(){
      for(let i=0; i<30; i++){
          if(this.advanceDay()) break;
      }
  },
  _checkDebuts(y){
    // --- 👑 1.6 时代传奇选手登场机制 ---
    PLAYERS_16.forEach(cfg => {
      if (cfg.debutYear !== y) return;
      // 检查是否已存在
      const exists = World.players.some(p => p.isReal && p.handle === cfg.name);
      if (exists) return;

      // 生成选手
      const p = World.mkRealPlayer({
        name: cfg.name,
        role: cfg.role,
        rating: cfg.peakRating,
        age: 17, // 统一 17 岁出道
        country: cfg.country,
        rarity: 'legend'
      }, null);

      // 强制赋予专属特质
      p.traits = [cfg.trait];
      p.isLegend16 = true; // 标记为 1.6 传奇

      World.players.push(p);
      Market.pList.push(p);

      this.pushNews(`🌟 [时代降临] ${cfg.country} 的天才 ${cfg.name} 已加入转会市场，他携带了传说特质【${cfg.trait}】！`);
    });

    Object.values(HISTORICAL_DATA).forEach(era=>{
      if(!era||!era.players)return;
      Object.values(era.players).forEach(cfg=>{
        if(cfg.debutYear!==y)return;
        const exists=World.players.some(p=>p.isReal&&(p.handle===cfg.name||p.realName===cfg.realName));
        if(exists)return;
        const baseCfg={...cfg};if(cfg.debutAge)baseCfg.age=cfg.debutAge;
        const firstTeamId=cfg.firstTeamId||null;
        const teamTarget=firstTeamId?World.teams.find(t=>t.id===firstTeamId||t.name===firstTeamId)||null:null;
        const p=World.mkRealPlayer(baseCfg,teamTarget?teamTarget.id:null);
        World.players.push(p);
        if(teamTarget){p.teamId=teamTarget.id;teamTarget.roster.push(p);}
        else{Market.pList.push(p);}
        this.pushNews(`[未来之星] ${cfg.debutAge||16}岁天才 ${cfg.name} 已崭露头角！`);
      });
    });
  },
  _yearEnd(y){
    // 老将下滑（去重处理，roster 与 World.players 有重叠）
    const seen=new Set();
    [...this.roster,...World.players].forEach(p=>{
      if(seen.has(p.id))return;seen.add(p.id);
      p.age++;
      if(p.age>30){
        // 不老神话：永久免疫年龄下滑
        if((p.traits||[]).includes('sig_f0rest') || (p.traits||[]).includes('不老神话'))return;
        if(p.age<=34&&Math.random()<.15){
          const drop=rnd(1,2);p.rating=Math.max(40,p.rating-drop);p.potential=Math.max(p.rating,p.potential-1);
          // 潜力下降时同步压缩 sub_pot：每个维度按比例降低，保持均值 = potential
          if(p.sub_pot){
            const KEYS=['firepower','entrying','trading','opening','clutching','sniping','utility'];
            const oldAvg=KEYS.reduce((s,k)=>s+(p.sub_pot[k]||p.potential),0)/7;
            const scale=oldAvg>0?p.potential/oldAvg:1;
            KEYS.forEach(k=>{p.sub_pot[k]=Math.max(p.rating,Math.round((p.sub_pot[k]||p.potential)*scale));});
          }
          if(p.teamId==='PLAYER')UI.toast(`⚠ ${p.name} 年龄增长，状态下滑（-${drop}）`);
        }
        if(p.age>=35&&p.teamId==='PLAYER'){
          this.roster=this.roster.filter(x=>x.id!==p.id);p.teamId=null;
          UI.toast(`📢 ${p.name} 已年满35岁宣布退役。`);
        }
      }
    });
    if(this.coach&&this.coach.age>=40&&Math.random()<.05){UI.toast(`📢 教练 ${this.coach.name} 选择离队。`);this.coach=null;}
    if(this.coach)this.coach.age++;
    this._aiTransfer(y);
    HLTV.calc(y);
    Cal.genYear(y+1);
  },
  _aiTransfer(y){
    // 先修复任何空阵容或无效阵容的AI队伍
    this.teams.filter(t=>!t.isPlayer).forEach(t=>{
      if(!t.roster) t.roster = [];
      t.roster = t.roster.filter(p=>p&&p.id&&p.rating!=null);
      while(t.roster.length < 5) {
        const base = Math.max(45, t.rating || 55);
        const roles = ['IGL','Sniper','Entry','Lurker','Rifler'];
        const role = roles[t.roster.length % roles.length];
        const p = this.mkP(base-5, base+5, true, role, y);
        p.teamId = t.id;
        this.players.push(p);
        t.roster.push(p);
      }
      // 重算rating防止为0
      if(!t.rating || t.rating <= 0) {
        t.rating = t.roster.reduce((s,p)=>s+(p.rating||50),0) / t.roster.length;
      }
    });
    
    const weakTeams=this.teams.filter(t=>!t.isPlayer).sort((a,b)=>a.rating-b.rating).slice(0,4);
    weakTeams.forEach(t=>{
      if(!t.roster||t.roster.length===0)return;
      const canKick=t.roster.filter(p=>!(p.isReal&&p.rarity==='legend'));
      const worstP=(canKick.length>0?canKick:t.roster).reduce((a,b)=>a.rating<b.rating?a:b);
      t.roster=t.roster.filter(p=>p.id!==worstP.id);worstP.teamId=null;
      const bestFA=World.players.filter(p=>!p.teamId&&p.rating>worstP.rating+2).sort((a,b)=>b.rating-a.rating)[0];
      if(bestFA){bestFA.teamId=t.id;t.roster.push(bestFA);this.pushNews(`⚡ ${t.name} 签下 ${bestFA.name}`);}
      else{const newP=World.mkP(worstP.rating+2,worstP.rating+8,true,worstP.role,y);newP.teamId=t.id;World.players.push(newP);t.roster.push(newP);this.pushNews(`✨ ${t.name} 提拔青训 ${newP.name}`);}
    });

    // ── AI 战队 form 年度周期性波动 ──
    // 顶级战队（rating>85）整体偏高但有起伏；普通战队方差更大
    this.teams.filter(t => !t.isPlayer && t.roster).forEach(t => {
      const isTop = (t.rating || 70) > 85;
      // 队伍层面的赛季基础 form（模拟整队状态好坏）
      const teamBase = isTop
        ? 0.96 + Math.random() * 0.16   // 顶级：0.96~1.12
        : 0.88 + Math.random() * 0.22;  // 普通：0.88~1.10
      t.roster.forEach(p => {
        if (!p) return;
        const personal = teamBase + (Math.random() * 0.10 - 0.05); // 个人 ±0.05
        p.form = Math.min(1.20, Math.max(0.75, personal));
      });
    });
  },
  _randomEvent(){
    const ev=pick(RANDOM_EVENTS);
    if(ev.target==='player'&&this.roster.length){
      const p=pick(this.roster);const txt=ev.txt.replace('${p}',p.name);ev.effect(p);
      UI.showEventTicker(txt);
    }else if(ev.target==='team'&&ev.teamEffect){ev.teamEffect(this.roster);UI.showEventTicker(ev.txt);}
    else if(ev.target==='chem'){this.chem=Math.max(0,Math.min(this.chemCap(),this.chem+ev.chemEffect));UI.showEventTicker(ev.txt);}
  },
  chemCap(){
    let base = this.coach?Math.min(110,100+Math.floor(this.coach.tactics/10)):100;
    // 战术先驱：磨合上限 +20
    if(this.roster.some(p=>(p.traits||[]).includes('战术先驱')))base+=20;
    return base;
  },
  setTrain(m) {
      if (m === 'theory' && !this.coach) {
          return UI.toast('❌ 战队没有教练，无法组织全队录像复盘！');
      }
      this.training = m;
      document.querySelectorAll('.trbtn').forEach(b => b.classList.remove('on'));
      const el = document.getElementById('tr-' + m);
      if(el) el.classList.add('on');

      const d = {
          rest:   '🛌 零风险 | 疲劳-35% | 所有属性微量恢复，状态回升。',
          fpl:    '🎯 高风险高回报 | 疲劳+18% | 均衡提升全属性，3~5%概率大突破+form。',
          utility:'💣 低强度 | 疲劳+12% | utility ★★★, opening ★★★, 次要 entrying。',
          theory: '📺 需教练 | 疲劳+8% | opening ★★★, clutching ★★★, trading ★★, 次要 utility。',
          team:   '🤝 高强度 | 疲劳+25% | trading ★★★, clutching ★★, utility ★★★, 次要 opening。',
          dm:     '🔫 伤病风险10% | 疲劳+22% | firepower ★★★, sniping ★★★, 次要 entrying。',
          retake: '💥 心理压力风险5% | 疲劳+20% | clutching ★★★, trading ★★★, 次要 opening。',
          phys:   '🏃 防伤病 | 疲劳+5% | form+20%上限, 全属性小提升, 次要 clutching。',
      };
      const td = document.getElementById('tr-desc');
      if(td) td.innerText = d[m] || '';
  },
  playScrim() {
      if(this.roster.length < 5) return UI.toast('首发不足5人，无法约战！');
      if(this.scrimCD > 0) return UI.toast(`其他队伍都没空，冷却中 (${this.scrimCD}天)`);
      if(this.fatigue > 70) return UI.toast('队员太疲劳了，拒绝打训练赛！');

      // 1. 寻找陪练 (随机找一个评分相近的AI队伍)
      const myPower = this.power().eff;
      const oppPool = World.teams.filter(t => !t.isPlayer);
      const opp = oppPool.sort(() => Math.random() - 0.5)[0];

      // 2. 无头模拟器：按回合掷骰子
      let sP = 0, sAI = 0;
      const winR = this.eraObj.winR;
      let target = winR;
      while(sP < target && sAI < target) {
          if(sP === target - 1 && sAI === target - 1) target += 4; // 加时
          const pChance = myPower / (myPower + opp.rating);
          if(Math.random() < pChance * (0.8 + Math.random() * 0.4)) sP++; else sAI++;
      }

      const won = sP > sAI;
      
      // 3. 结算影响
      this.fatigue += 15; // 高疲劳
      // 训练赛涨磨合最快，有教练效果翻倍
      this.chem = Math.min(this.chemCap(), this.chem + (this.coach ? 3 : 1.5));
      this.scrimCD = 7; // <--- 7天冷却

      this.roster.forEach(p => {
          if(won) p.form = Math.min(1.15, p.form + 0.04);
          else p.form = Math.max(0.6, p.form - 0.02); // 输了微掉心态
      });

      const color = won ? '#86efac' : '#fca5a5';
      this.pushNews(`⚔️ 训练赛: 与 ${opp.name} 交手，比分 <b style="color:${color}">${sP}:${sAI}</b>。`);
      UI.refresh();
  },
  synergy(){
    if(!this.roster.length)return{mult:1,msgs:['<div class="syn" style="border-left-color:var(--dim)">暂无选手</div>']};
    const r=this.roster.map(p=>p.role);
    const igls=r.filter(x=>x==='IGL').length,snipers=r.filter(x=>x==='Sniper').length,entries=r.filter(x=>x==='Entry').length;
    const lurkers=r.filter(x=>x==='Lurker').length;
    let mult=1,msgs=[];

    // 1. 正确位置加成 (每个 +0.5%, max 2.5%)
    let correctBonus = 0;
    // 假设 roster 每个人的 role 都是正确的（因为 role 是选手属性），只要不为空就算“正确位置”？
    // 或者理解为：队伍中拥有 IGL, Sniper, Entry, Lurker, Rifler 各自至少一个？
    // 题目说：“每个正确位置的加成固定为 0.5%”。通常理解是：如果一个选手打的是他擅长的位置。
    // 在本游戏中，p.role 就是他的擅长位置。所以只要上场就是正确位置。
    // 但如果有 5 个人，那总是 +2.5%？
    // 另一种理解：队伍构筑合理性。
    // 让我们按“角色各司其职”来算。
    // 题目原文：“每个正确位置的加成固定为 0.5%”。
    // 结合上下文，可能是指：只要选手被分配到了他的主位置（这里默认为真，因为没有手动分配位置功能，除了 Role 属性）。
    // 所以默认给 2.5% 加成，除非...
    // 让我们简单点：只要有这个角色在场，就给加成。
    // 但题目又说“缺少...时，惩罚3%”。
    // 让我们假设：每个独特的角色类型存在，+0.5%。
    // IGL, Sniper, Entry, Lurker, Rifler. 如果都有，就是 5 * 0.5 = 2.5%。
    if(igls > 0) correctBonus += 0.005;
    if(snipers > 0) correctBonus += 0.005;
    if(entries > 0) correctBonus += 0.005;
    if(lurkers > 0) correctBonus += 0.005;
    if(r.filter(x=>x==='Rifler').length > 0) correctBonus += 0.005;
    
    mult += correctBonus;
    msgs.push(`<div class="syn" style="border-left-color:var(--win);color:#86efac">✅ 角色协同 (+${(correctBonus*100).toFixed(1)}%)</div>`);

    // 2. 缺失惩罚 (Missing Sniper, IGL, Entry, Lurker: -3% each)
    if(igls === 0) { mult -= 0.03; msgs.push('<div class="syn" style="border-left-color:var(--loss);color:#fca5a5">❌ 缺少指挥 (-3%)</div>'); }
    if(snipers === 0) { mult -= 0.03; msgs.push('<div class="syn" style="border-left-color:var(--loss);color:#fca5a5">❌ 缺少狙击 (-3%)</div>'); }
    if(entries === 0) { mult -= 0.03; msgs.push('<div class="syn" style="border-left-color:var(--loss);color:#fca5a5">❌ 缺少突破 (-3%)</div>'); }
    if(lurkers === 0) { mult -= 0.03; msgs.push('<div class="syn" style="border-left-color:var(--loss);color:#fca5a5">❌ 缺少自由人 (-3%)</div>'); }

    // 教练加成
    if(this.coach){mult+=.03;msgs.push(`<div class="syn" style="border-left-color:var(--blue);color:#93c5fd">🧠 教练加持 (+3%)</div>`);}
    
    this.synCache={mult,msgs};return this.synCache;
  },
  power(){
    let raw=this.roster.reduce((s,p)=>s+p.rating*p.form,0)/(this.roster.length||1);
    
    // 绝对冷静
    const hasCalm=this.roster.some(p=>(p.traits||[]).includes('绝对冷静'));
    if(this.fatigue>50)raw*=(hasCalm?0.95:0.9);
    
    // 1. 磨合度修正
    let chemFactor = 1;
    if(this.chem < 50) {
        // 惩罚区: 1 - (50 - chem) * 0.003
        chemFactor = 1 - (50 - this.chem) * 0.003;
    } else {
        // 加成区: 1 + (chem - 50) * 0.001
        // 上限 +4% (0.04), 有教练上限 +5% (0.05)
        let bonus = (this.chem - 50) * 0.001;
        const maxBonus = this.coach ? 0.05 : 0.04;
        bonus = Math.min(bonus, maxBonus);
        chemFactor = 1 + bonus;
    }

    const syn=this.synergy();
    let synMult=syn.mult;
    
    const hasTactBrain=this.roster.some(p=>(p.traits||[]).some(t=>t==='sig_karrigan'||t==='sig_gla1ve'));
    let tactMult=1;
    if(hasTactBrain){if(synMult<1)synMult=1;tactMult=1.1;}
    if(this.roster.some(p=>(p.traits||[]).includes('德国流星')))tactMult*=1.05;

    return{raw, eff: raw * synMult * chemFactor * tactMult, chemFactor};
  },
  dynamicBid(id){
    if(this.roster.length>=6) return UI.toast('阵容已满（最多6人）！请先挂牌出售选手。');
    const p=Market.pList.find(x=>x.id===id); if(!p) return;
    const base = p.price;

    // 选手吸引力分层：顶级AI只争高潜力/签名特质选手
    let attraction = 0;
    if      (p.potential >= 85 || p.isRegenLegend)                              attraction = 3;
    else if (p.potential >= 78 || (p.signatureTrait && (p.age||25) < 26))       attraction = 2;
    else if (p.potential >= 73)                                                  attraction = 1;
    // else attraction = 0

    // 竞争者数量
    let competitors = attraction >= 2 ? rnd(0, 3) : rnd(0, 1);

    // 玩家声誉压制竞争（排名靠前或粉丝多，其他队望而却步）
    if (this.rank <= 30 || this.fans >= 200000) {
      competitors = Math.max(0, Math.floor(competitors * 0.55));
    }

    // 传奇选手溢价 1.5x（和 buyP 一致）
    const isRealLegend = p.isReal && p.rarity === 'legend';
    let finalPrice = Math.floor(base * (1 + competitors * 0.18));
    if (isRealLegend) finalPrice = Math.ceil(finalPrice * 1.5);

    // 30% 概率 AI 先手报价推高价格
    let aiFirstMove = false;
    if (competitors > 0 && Math.random() < 0.30) {
      aiFirstMove = true;
      finalPrice = Math.floor(finalPrice * 1.12);
    }

    const compText = competitors === 0 ? '（无竞争）' :
                     competitors === 1 ? '（1家战队参与竞价）' :
                                         `（${competitors}家战队参与竞价）`;

    // 市场热度标签
    const heatLabel = competitors >= 2 ? '🔥 高' : competitors === 1 ? '⚡ 中' : '📈 低';

    // 展示确认框
    const aiLine   = aiFirstMove ? `
⚠️ 已有战队率先报价！价格已被推高。` : '';
    const legLine  = isRealLegend ? `
👑 传奇选手溢价 ×1.5 已计入报价。` : '';
    const repLine  = (this.rank <= 30 || this.fans >= 200000)
                      ? `
🏅 你的声誉镇场，竞争压力已减轻。` : '';

    const ok = confirm(
      `【实时动态竞价】

` +
      `${p.name}（${p.role} | 能力 ${p.rating} | 潜力 ${p.evalStatus >= 1 ? p.potential : '???'}）
` +
      `市场热度：${heatLabel}  ${compText}
` +
      `预计成交价：$${finalPrice.toLocaleString()}${aiLine}${legLine}${repLine}

` +
      `确定花费此金额签下吗？`
    );

    if (!ok) return;

    if (this.money < finalPrice) return UI.toast('资金不足！', 'loss');

    // 执行买入（复用 buyP 核心逻辑）
    this.money -= finalPrice;
    p.teamId = 'PLAYER';
    p.evalStatus = 2;            // 买入后完全可见
    this.roster.push(p);
    this.chem = Math.max(0, this.chem - 15);
    Market.pList = Market.pList.filter(x => x.id !== id);

    const compShort = competitors === 0 ? '无竞争' : `${competitors}家竞价`;
    UI.toast(`✅ 成功签下 ${p.name}！花费 $${finalPrice.toLocaleString()}`);
    this.pushNews(`💰 转会：${p.name}（${compShort}）以 $${finalPrice.toLocaleString()} 加盟`);
    UI.refresh(); Market.renderAll();
  },

  buyP(id){
    if(this.roster.length>=6)return UI.toast('阵容已满（最多6人）！请先挂牌出售选手。');
    const p=Market.pList.find(x=>x.id===id);if(!p)return;
    const isRealLegend=p.isReal&&p.rarity==='legend';
    const required=isRealLegend?Math.ceil(p.price*1.5):p.price;
    if(this.money<required)return UI.toast(isRealLegend?`传奇选手需至少 $${required.toLocaleString()}`:'资金不足！');
    this.money-=required;p.teamId='PLAYER';p.evalStatus = 2; // 购买后完全可见
    this.roster.push(p);this.chem=Math.max(0,this.chem-15);
    Market.pList=Market.pList.filter(x=>x.id!==id);
    const costText = p.price > 0 ? `$${p.price.toLocaleString()}` : 'Free';
    UI.toast(isRealLegend ? `✍ 重金签下传奇: ${p.name}` : `✍ 签下: ${p.name} (花费 ${costText})`);
    UI.refresh();Market.renderAll();
  },
  buyC(id){
    const c=Market.cList.find(x=>x.id===id);if(!c)return;
    if(this.money<c.price)return UI.toast('资金不足！');
    if(this.coach)UI.toast(`📢 已解雇原教练 ${this.coach.name}`);
    this.money-=c.price;c.teamId='PLAYER';this.coach=c;
    Market.cList=Market.cList.filter(x=>x.id!==id);
    UI.toast(`✍ 签约教练: ${c.name}（战术${c.tactics}）`);UI.refresh();Market.renderAll();
  },
  sellP(id) {
      if(this.roster.length <= 1) return UI.toast('至少保留一名选手！');
      const p = this.roster.find(x => x.id === id);
      if(!p) return;
      
      // 变现回收 60% 的市场身价
      const sellValue = Math.floor(p.price * 0.6);
      this.money += sellValue;
      p.teamId = null;
      this.roster = this.roster.filter(x => x.id !== id);
      
      this.pushNews(`🤝 转会达成！战队以 $${sellValue.toLocaleString()} 的价格出售了 ${p.name}`);
      UI.refresh();
  },
  fireC(){if(!this.coach)return;UI.toast(`解雇了教练 ${this.coach.name}`);this.coach.teamId=null;this.coach=null;UI.refresh();},
  skipToEvent(){
    // 最多推进 400 天防止死循环
    for(let i=0;i<400;i++){
      this.advanceDay();
      if(!document.getElementById('pnl-hub').classList.contains('hidden'))break;
      if(!document.getElementById('hltv-modal').classList.contains('hidden'))break;
    }
  }
};

// ─── Facilities ──────────────────────────────────────
const Facilities = {
    // Configuration
    config: {
        training: { name: '训练基地', desc: '提升训练效果(+3%/级)，增加选手成长概率' },
        medical: { name: '医疗中心', desc: '降低疲劳积累(-2%/级)，加快体能恢复' },
        media: { name: '媒体工作室', desc: '增加每日额外收入(+$20/级)，提升粉丝增长' },
        youth: { name: '青训营', desc: '解锁更高潜力的年轻选手，增加特质概率' }
    },
    
    upgrade(type) {
        if (!Game.facilities) Game.facilities = { training: 1, medical: 1, media: 1, youth: 1 };
        const lv = Game.facilities[type];
        if (lv >= 10) return UI.toast('已达到最高等级！');
        
        // Cost: Lv1→2: $8k, Lv2→3: $12k, 以此类推，后期指数增长
        // 公式：8000 * 1.6^(lv-1)
        const cost = Math.floor(8000 * Math.pow(1.6, lv - 1));
        
        if (Game.money < cost) return UI.toast(`资金不足！升级需要 $${cost.toLocaleString()}`);
        
        Game.money -= cost;
        Game.facilities[type]++;
        UI.toast(`✅ ${this.config[type].name} 升级至 Lv.${Game.facilities[type]}！`);
        this.render();
        UI.refresh();
    },
    
    promoteYouth() {
        if (!Game.facilities) Game.facilities = { training: 1, medical: 1, media: 1, youth: 1 };
        const lv = Game.facilities.youth;
        // Cost to promote: 5000
        const cost = 5000;
        if (Game.money < cost) return UI.toast(`资金不足！提拔青训需要 $${cost.toLocaleString()}`);
        
        // 检查阵容空位
        if (Game.roster.length >= 6) return UI.toast('阵容已满，请先清理空位！');

        Game.money -= cost;
        
        // Generate Player based on Youth Level
        // Base Rating: 40 + (lv * 3) + rand(-5, 10) -> Max ~80
        const minR = 40 + lv * 3;
        const maxR = minR + 10;
        // Use current year
        const yr = Game.date.getFullYear();
        const p = World.mkP(minR, maxR, false, undefined, yr);
        
        // Apply "Homegrown" traits
        const traits = p.traits || [];
        // Loyalty: 20% + 2% per level
        if (Math.random() < 0.2 + lv * 0.02) {
            traits.push('青训忠魂'); 
        }
        // Prodigy: 5% + 1% per level
        if (Math.random() < 0.05 + lv * 0.01) {
            traits.push('天才少年'); 
        }
        p.traits = [...new Set(traits)];
        p.isYouth = true; // Mark as homegrown
        
        Game.roster.push(p);
        p.teamId = 'PLAYER';
        UI.toast(`✨ 提拔了青训选手 ${p.name}`);
        
        this.render();
        UI.refresh();
    },

    render() {
        const el = document.getElementById('facilities-list');
        if (!el) return;
        
        if (!Game.facilities) Game.facilities = { training: 1, medical: 1, media: 1, youth: 1 };
        
        let html = '';
        // 遍历配置生成升级卡片
        for (const [key, cfg] of Object.entries(this.config)) {
            const lv = Game.facilities[key];
            const cost = Math.floor(20000 * Math.pow(1.5, lv - 1));
            const nextCost = lv >= 10 ? '-' : `$${cost.toLocaleString()}`;
            const btnClass = (lv < 10 && Game.money >= cost) ? '' : 'disabled';
            const btnText = lv >= 10 ? '已满级' : `升级 (${nextCost})`;
            const btnAction = lv < 10 ? `onclick="Facilities.upgrade('${key}')"` : '';
            
            // Maintenance Cost
            const maint = Math.pow(lv, 2) * 300;

            html += `
            <div class="card" style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;padding:12px">
                <div style="flex:1">
                    <div style="font-weight:bold;font-size:14px;display:flex;align-items:center;gap:8px">
                        ${cfg.name} <span style="background:var(--blue);padding:2px 6px;border-radius:4px;font-size:10px;color:#fff">Lv.${lv}</span>
                    </div>
                    <div style="font-size:11px;color:var(--dim);margin-top:4px">${cfg.desc}</div>
                    <div style="font-size:11px;color:#fca5a5;margin-top:4px">
                        维护费: $${maint.toLocaleString()}/周
                    </div>
                </div>
                <div style="margin-left:12px">
                    <button class="btn ${btnClass}" ${btnAction} style="min-width:80px;font-size:11px">${btnText}</button>
                </div>
            </div>`;
        }
        
        // Youth Promotion Section
        const youthLv = Game.facilities.youth;
        const promCost = 5000;
        const promClass = Game.money >= promCost ? 'full' : 'full disabled';
        
        html += `
        <div class="card" style="margin-top:20px;border:1px dashed var(--blue);padding:15px">
            <div style="font-weight:bold;margin-bottom:8px;color:var(--blue)">🔮 青训选拔中心</div>
            <div style="font-size:12px;color:var(--dim);margin-bottom:12px;line-height:1.5">
                消耗 $5,000 从青训营中提拔一名年轻选手。<br>
                当前青训等级 Lv.${youthLv}，等级越高，出现高潜力、特殊特质选手的概率越高。
            </div>
            <button class="btn ${promClass}" onclick="Facilities.promoteYouth()">立即提拔新人 ($5,000)</button>
        </div>
        `;
        
        el.innerHTML = html;
    }
};

// ─── Calendar ────────────────────────────────────────
const Cal={
  evs:[],
  tierFormats:{
    'major': {groupBo:1,knockoutBo:3,finalBo:5,teams:16},
    'a-tier':{groupBo:1,knockoutBo:3,finalBo:3,teams:16},
    'b-tier':{groupBo:1,knockoutBo:1,finalBo:3,teams:12},
    'c-tier':{groupBo:1,knockoutBo:1,finalBo:1,teams:8}
  },
  genYear(y){
    this.evs=[];
    let cfg = [];

    // 1. 根据年份选择历史配置
    if(y >= 2000 && y <= 2002) cfg = HISTORICAL_EVENT_CONFIG.era_early;
    else if(y >= 2003 && y <= 2005) cfg = HISTORICAL_EVENT_CONFIG.era_golden;
    else if(y >= 2006 && y <= 2008) cfg = HISTORICAL_EVENT_CONFIG.era_peak;
    else if(y >= 2009 && y <= 2012) cfg = HISTORICAL_EVENT_CONFIG.era_late;
    else {
        cfg = [
            { month: 2, name: 'IEM Katowice', tier: 'major', bracket: 'GSE', prize: 1000000, teams: 24 },
            { month: 5, name: 'PGL Major', tier: 'major', bracket: 'GSE', prize: 1250000, teams: 24 },
            { month: 7, name: 'IEM Cologne', tier: 'a-tier', bracket: 'GSE', prize: 1000000, teams: 24 },
            { month: 11, name: 'BLAST World Final', tier: 'major', bracket: 'SE', prize: 1000000, teams: 8 }
        ];
    }

    // 辅助：找一个月内不冲突的日期（同层级错开5天）
    const pickDay = (mo, tier) => {
        const used = this.evs.filter(e => e.date.getMonth() === mo && e.tier === tier)
                              .map(e => e.date.getDate());
        let d = (tier === 'major' || tier === 'a-tier') ? rnd(8,16)
              : (tier === 'b-tier') ? rnd(5,12)
              : rnd(3,22);
        // 同层级同月避免同天
        while(used.includes(d)) d = (d % 28) + 1;
        return d;
    };

    // 2. 生成核心赛事（major/a-tier）
    cfg.forEach(e => {
        if(e.type === 'random_a') {
            for(let i=0; i<e.count; i++) {
                const name = pick(e.pool);
                // 随机选月，只避免同层级同月重复
                let m = rnd(1, 11);
                const attempts = 20;
                for(let a=0;a<attempts;a++){
                    if(!this.evs.some(ev=>ev.date.getMonth()===m&&ev.tier==='a-tier')) break;
                    m=(m+1)%12;
                }
                this.add(y, m, pickDay(m,'a-tier'), name, 'a-tier', 'SE', 50000, 16, null);
            }
        } else {
            const mo = e.month - 1;
            this.add(y, mo, pickDay(mo, e.tier), e.name, e.tier, e.bracket, e.prize, e.teams, null);
        }
    });

    // 3. B-Tier 赛事：每季度两场（开放资格赛 + 邀请赛），不同层级不互斥
    // open = 无排名门槛（任何人可参加），invited = 需要一定排名
    const bTierSchedule = [
        { m:1,  open:['B-Tier 一月公开赛','ESL 新春开放赛'],    invited:['ESEA 一月职业赛','CCT 冬季邀请赛'] },
        { m:4,  open:['B-Tier 春季公开赛','CCT 春季开放赛'],    invited:['ESEA 锦标赛',     'CCT 区域职业赛'] },
        { m:7,  open:['B-Tier 夏季公开赛','ESL 暑期开放赛'],    invited:['ESL Pro 资格赛',  'CCT 夏季赛']    },
        { m:9,  open:['B-Tier 秋季公开赛','ESL 秋季开放赛'],    invited:['ESEA 秋季赛',     'CCT 秋季区域赛']},
    ];
    bTierSchedule.forEach(({m, open, invited}) => {
        // 开放资格赛（无排名门槛，8支队伍，奖金较低）
        if(!this.evs.some(e=>e.date.getMonth()===m&&e.tier==='b-tier'&&e.difficulty==='open')) {
            const d = pickDay(m, 'b-tier');
            const ev = {
                id:'t'+rnd(1000,9999), date:new Date(y,m,d),
                name:pick(open), tier:'b-tier', bracket:'SE', prize:25000, teams:8,
                minRank:999,   // 无门槛，任何人可参加
                basePoints:120, difficulty:'open', isReg:false,
                fmt: this.tierFormats['b-tier']
            };
            this.evs.push(ev);
        }
        // 邀请赛（需要排名前120，16支队，奖金更高）
        if(!this.evs.some(e=>e.date.getMonth()===m&&e.tier==='b-tier'&&e.difficulty==='mid')) {
            const d2 = pickDay(m, 'b-tier');
            const prize2 = pick([40000,50000,60000,80000]);
            const ev2 = {
                id:'t'+rnd(1000,9999), date:new Date(y,m,d2),
                name:pick(invited), tier:'b-tier', bracket:'SE', prize:prize2, teams:12,
                minRank:120,   // 打几场C-tier后可达到
                basePoints:200, difficulty:'mid', isReg:false,
                fmt: this.tierFormats['b-tier']
            };
            this.evs.push(ev2);
        }
    });

    // 4. C-Tier 网吧赛：每月都有，与其他层级可重叠
    for(let m=0; m<12; m++) {
        if (y === 2000 && m === 0) {
            this.add(y, 0, 24, '新手试炼赛', 'c-tier', 'SE', 8000, 8, 'debut');
            continue;
        }
        if (y === 2000 && m === 1) continue; // 2月空出缓冲期

        // 每月一场C-tier（不管有没有B/A/Major，不同层级不互斥）
        if(!this.evs.some(e=>e.date.getMonth()===m&&e.tier==='c-tier')) {
            const diff = (m%3===0)?'easy':((m%3===1)?'mid':'hard');
            const cName = diff==='easy'?`网吧联赛 #${m+1}`:diff==='mid'?`CCT 晋级赛 #${m+1}`:`CCT 精英赛 #${m+1}`;
            const cPrize = diff==='easy'?8000:diff==='mid'?12000:18000;
            this.add(y, m, pickDay(m,'c-tier'), cName, 'c-tier', 'SE', cPrize, 8, diff);
        }
    }

    UI.renderCal();
  },
  add(y,mo,d,name,tier,bracket='SE',prize=50000,teams=16,difficulty=null){
    const tf=this.tierFormats[tier];
    let minRank = 999;
    if(tier === 'major') minRank = teams + 8; // Major前N名+替补
    else if(tier === 'a-tier') minRank = 40;
    else if(tier === 'b-tier') minRank = 120; // B-tier 邀请赛需排名前120
    else {
        if(difficulty==='hard') minRank = 120;
        else if(difficulty==='mid') minRank = 150;
        else minRank = 200;
    }
    
    // 赛事积分总池 (Base Points)
    // Major: 1200, A-Tier: 600, B-Tier: 200, C-Tier: 60
    const basePoints = tier === 'major' ? 1200 : 
                       tier === 'a-tier' ? 600 :
                       tier === 'b-tier' ? 200 : 60;

    this.evs.push({
        id:'t'+rnd(1000,9999),
        date:new Date(y,mo,d),
        name,tier,
        bracket,
        teams,prize,minRank,basePoints,
        difficulty,
        isReg:false,fmt:tf
    });
  },
  getParticipants(ev) {
    const tier = ev.tier;
    const count = ev.teams;
    const difficulty = ev.difficulty || null;
    // 过滤掉 rating 异常（<=0 或 NaN）的队伍，防止 0 分队伍混入赛场
    const allTeams = [...World.teams]
      .filter(t => t.rating > 0 && !isNaN(t.rating) && t.roster && t.roster.length >= 5)
      .sort((a,b)=>b.rating-a.rating);

    // 获取玩家当前战力，用于校准对手强度
    const playerPow = Game.power().eff;

    if(tier==='major'){
      // Major：固定从排行前20抽，不做校准（顶级赛事就该是硬仗）
      const pool = allTeams.slice(0, 20);
      if(pool.length < count-1) return allTeams.sort(()=>Math.random()-.5).slice(0, count-1);
      return pool.sort(()=>Math.random()-.5).slice(0, count-1);

    } else if(tier==='a-tier'){
      // A-Tier：以玩家战力为中心，±15 范围内的队伍优先入池
      // 确保不全是碾压或被碾压的对手
      const inRange = allTeams.filter(t => Math.abs(t.rating - playerPow) <= 15);
      const nearby  = allTeams.filter(t => Math.abs(t.rating - playerPow) <= 25);
      let pool = inRange.length >= count-1 ? inRange : (nearby.length >= count-1 ? nearby : allTeams.slice(20, 60));
      if(pool.length < count-1) pool = allTeams;
      return pool.sort(()=>Math.random()-.5).slice(0, count-1);

    } else if(tier==='b-tier'){
      // B-Tier：中等强度，包含历史真实战队（偶尔会参加b-tier）
      // 对手战力区间：玩家 -15 ~ +20（可能遇到比自己强的对手），无 rating 硬上限
      const bPool = allTeams.filter(t => !t.isPlayer);
      const bInRange = bPool.filter(t => t.rating >= playerPow - 15 && t.rating <= playerPow + 20);
      let pool = bInRange.length >= count-1 ? bInRange : bPool.filter(t => Math.abs(t.rating - playerPow) <= 28);
      if(pool.length < count-1) pool = bPool;
      // 依然不够：生成临时对手补全
      if(pool.length < count-1) {
        const need = (count-1) - pool.length;
        for(let i=0;i<need;i++){
          const r = Math.round(Math.min(84, Math.max(55, playerPow + rnd(-8,8))));
          const roster = [];
          ['IGL','Sniper','Entry','Lurker','Rifler'].forEach(role => {
            const p = World.mkP(r-5, r+5, true, role, Game.date ? Game.date.getFullYear() : 2000);
            p.teamId = 'btemp_'+i;
            roster.push(p);
          });
          pool.push({
            id:'b_temp_'+i, name:`半职业战队 #${i+1}`,
            rating:r, roster, coach:null,
            isPlayer:false, isReal:false, points:0
          });
        }
      }
      return pool.sort(()=>Math.random()-.5).slice(0, count-1);

    } else {
      // ── debut：首战保护，对手 rating 硬锁在 38~50，确保玩家有机会打进决赛 ──
      if(difficulty === 'debut'){
        const debutOpps = [];
        for(let i=0;i<count-1;i++){
          const r = rnd(38,50);
          // 生成真实阵容，避免比赛时 roster 为空崩溃
          const roster = [];
          ['IGL','Sniper','Entry','Lurker','Rifler'].forEach(role => {
            const p = World.mkP(r-5, r+5, true, role, Game.date ? Game.date.getFullYear() : 2000);
            p.teamId = 'debut_opp_'+i;
            roster.push(p);
          });
          debutOpps.push({
            id:'debut_opp_'+i, name:'网吧战队 #'+(i+1),
            rating:r, roster, coach:null,
            isPlayer:false, isReal:false, isAmateur:true, points:0
          });
        }
        return debutOpps;
      }

      // easy → 对手比玩家弱 5~10；mid → 接近；hard → 强 5~10
      let offset;
      if(difficulty === 'easy') offset = -8;
      else if(difficulty === 'hard') offset = 8;
      else offset = 0;
      
      const center = playerPow + offset;
      
      // C-Tier 候选池：按难度严格分层，避免顶级真实强队混入新手赛
      // easy: rating < 72（纯网吧/业余级别），mid: < 78，hard: < 82
      const ratingCap = difficulty === 'easy' ? 72 : difficulty === 'mid' ? 78 : 82;
      let candidatePool = allTeams.filter(t => !t.isPlayer && t.rating <= ratingCap);
      
      let pool = candidatePool.filter(t => Math.abs(t.rating - center) <= 12);
      if(pool.length < count-1) pool = candidatePool.filter(t => Math.abs(t.rating - center) <= 20);
      if(pool.length < count-1) pool = candidatePool;
      
      // 如果备选池仍然不足，动态生成临时业余队补全（保证赛事正常举行）
      if(pool.length < count-1) {
        const tempOpps = [];
        const need = (count-1) - pool.length;
        for(let i=0;i<need;i++){
          const r = Math.round(Math.min(ratingCap, Math.max(40, center - 5 + rnd(-5,5))));
          const roster = [];
          ['IGL','Sniper','Entry','Lurker','Rifler'].forEach(role => {
            const p = World.mkP(r-5, r+5, true, role, Game.date ? Game.date.getFullYear() : 2000);
            p.teamId = 'temp_'+i;
            roster.push(p);
          });
          tempOpps.push({
            id:'temp_opp_'+i, name:`路人战队 #${i+1}`,
            rating:r, roster, coach:null,
            isPlayer:false, isReal:false, isAmateur:true, points:0
          });
        }
        pool = [...pool, ...tempOpps];
      }

      return pool.sort(()=>Math.random()-.5).slice(0, count-1);
    }
  },
  today(dt){const s=fmtD(dt);return this.evs.find(e=>fmtD(e.date)===s)||null;},
  register(id){
    const ev=this.evs.find(e=>e.id===id);if(!ev)return;
    
    if(ev.minRank && ev.minRank < 999) {
        const myRank = Game.rank || 999;
        if(myRank > ev.minRank) return UI.toast(`排名不足！需前 ${ev.minRank} 名 (当前: ${myRank})`);
    }

    if(Game.roster.length<5)return UI.toast('阵容不满5人！');
    ev.isReg=true;UI.toast(`✅ 报名: ${ev.name}`);UI.renderCal();
  },
  boLabel(bo){return bo===1?'BO1':bo===3?'BO3':'BO5';}
};

// ─── HLTV ────────────────────────────────────────────
const HLTV={
  calc(y){
    World.players.forEach(p=>{
      const m=Math.max(1,p.ys.matches);const avg=m<5?.5:p.ys.ratingSum/m;
      p._sc=avg*60+p.ys.mvps*15+p.ys.majorWins*10+p.ys.wins*5;
      if(p.ys.matches>0){if(!p.history)p.history=[];p.history.push({year:y,team:p.teamId==='PLAYER'?(Game.teamName||'我的战队'):(p.teamId||'FA'),rating:avg.toFixed(2),mvps:p.ys.mvps});}
    });
    const top=[...World.players].sort((a,b)=>b._sc-a._sc).slice(0,20);
    const el=document.getElementById('hltv-year');if(el)el.innerText=`Player of the Year ${y}`;
    const list=document.getElementById('hltv-list');
    if(list)list.innerHTML=top.map((p,i)=>{
      const avg=p.ys.matches>0?(p.ys.ratingSum/p.ys.matches).toFixed(2):'0.00';
      const team=p.teamId==='PLAYER'?(Game.teamName||'YOUR TEAM'):(p.teamId||'FA');
      return`<div class="hrow ${i<3?'top3':''}">
        <div class="hrank">#${i+1}</div>
        <div style="font-size:16px;font-weight:700;color:#fff;flex:1;margin-left:14px">${p.name} <span style="font-size:11px;color:var(--dim)">[${team}]</span></div>
        <div style="display:flex;gap:18px;font-size:12px;color:var(--dim);text-align:right">
          <div style="width:70px">Matches<br><b style="color:var(--fg)">${p.ys.matches}</b></div>
          <div style="width:90px">Rating 2.0<br><b style="color:#fff">${avg}</b></div>
          <div style="width:60px">MVPs<br><b style="color:var(--mvp)">${p.ys.mvps}</b></div>
        </div>
      </div>`;
    }).join('');
    const modal=document.getElementById('hltv-modal');if(modal)modal.classList.remove('hidden');
    World.players.forEach(p=>p.ys={matches:0,ratingSum:0,mvps:0,majorWins:0,wins:0});
  }
};
