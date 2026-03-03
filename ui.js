// ══════════════════════════════════════════════════════
//  ui.js — UI 显示和 DOM 操作
// ══════════════════════════════════════════════════════
const UI={
  page(id){
    document.querySelectorAll('.main>div').forEach(p=>p.classList.add('hidden'));
    const pg=document.getElementById('page-'+id);if(pg)pg.classList.remove('hidden');
    document.querySelectorAll('.nav').forEach(b=>b.classList.remove('on'));
    const navMap={home:0,rankings:1,schedule:2,market:3,match:4,hall:5};
    if(navMap[id]!=null){const navBtns=document.querySelectorAll('.nav');if(navBtns[navMap[id]])navBtns[navMap[id]].classList.add('on');}
    this.currentPage=id;
    if(id==='home')this.renderHome();
    if(id==='market'){this.renderMarketTimer();Market.renderAll();}
    if(id==='schedule')this.renderCal();
    if(id==='hall')this.renderHall();
    if(id==='rankings')this.renderRankings();
    if(id==='sponsors')this.renderSponsors();
    if(id==='facilities')Facilities.render();
    // 手机端：切换页面后同步底部导航高亮 & 关闭抽屉
    this.mobNav(id);
    this.closeSidebar();
  },

  toggleSidebar(){
    const sb=document.getElementById('sidebar');
    const ov=document.getElementById('sb-overlay');
    if(!sb)return;
    const open=sb.classList.toggle('open');
    if(ov){ov.classList.toggle('open',open);}
  },

  closeSidebar(){
    const sb=document.getElementById('sidebar');
    const ov=document.getElementById('sb-overlay');
    if(sb)sb.classList.remove('open');
    if(ov)ov.classList.remove('open');
  },

  mobNav(id){
    // 映射页面id到底部导航按钮id
    const map={home:'mbn-home',schedule:'mbn-schedule',market:'mbn-market',match:'mbn-match'};
    document.querySelectorAll('.mbn-btn').forEach(b=>b.classList.remove('on'));
    const target=map[id];
    if(target){const el=document.getElementById(target);if(el)el.classList.add('on');}
    // 同步手机顶栏日期
    const mobDate=document.getElementById('mob-date');
    if(mobDate&&Game.date)mobDate.innerText=Game.date.toLocaleDateString('zh-CN');
  },
  
  renderHome(){
    const panel = document.getElementById('home-next-match-panel');
    const content = document.getElementById('home-next-match-content');
    
    // Time Controls Widget
    let timeCtrl = document.getElementById('home-time-ctrl');
    if(!timeCtrl) {
        timeCtrl = document.createElement('div');
        timeCtrl.id = 'home-time-ctrl';
        timeCtrl.className = 'panel';
        timeCtrl.style.marginBottom = '16px';
        timeCtrl.style.padding = '12px';
        // Insert before next match panel or at top
        const parent = document.querySelector('#page-home > div');
        if(parent) parent.insertBefore(timeCtrl, parent.firstChild);
    }
    
    timeCtrl.innerHTML = `
        <div class="panel-title">📅 时间管理 <span style="font-weight:400;color:var(--dim);font-size:12px;margin-left:8px">${Game.date.toLocaleDateString()}</span></div>
        <div style="display:flex;gap:8px">
            <button class="btn" style="flex:1;background:var(--panel2);border:1px solid var(--border);color:#fff" onclick="Game.advanceDay()">推进 1 天</button>
            <button class="btn" style="flex:1;background:var(--panel2);border:1px solid var(--border);color:#fff" onclick="Game.advanceWeek()">推进 1 周</button>
            <button class="btn" style="flex:1;background:var(--panel2);border:1px solid var(--border);color:#fff" onclick="Game.advanceMonth()">推进 1 月</button>
        </div>
    `;

    if(!panel || !content) return;
    
    // Find next event
    const today = Game.date;
    const upcoming = Cal.evs.filter(e => e.date >= today).sort((a,b)=>a.date-b.date);
    
    if(upcoming.length === 0){
      panel.style.display = 'none';
      return;
    }
    
    const ev = upcoming[0];
    const diffTime = ev.date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    let timeText = diffDays <= 0 ? '<span style="color:var(--win);font-weight:700">今天开赛！</span>' : 
                   diffDays === 1 ? '<span style="color:var(--gold)">明天</span>' : 
                   `${diffDays} 天后`;
    
    // Check eligibility
    const rank = Game.rank || 999;
    const diff = (ev.date.getMonth()%3===0)?'easy':((ev.date.getMonth()%3===1)?'mid':'hard');
    let elig = true; let reason = '';
    
    if(ev.minRank && rank > ev.minRank){
        elig = false;
        reason = `需世界排名 Top ${ev.minRank} (当前: ${rank})`;
    }

    panel.style.display = 'block';
    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div style="font-weight:700;color:#fff;font-size:15px">${ev.name}</div>
        <div style="font-size:10px;background:var(--panel2);padding:2px 6px;border-radius:4px;border:1px solid var(--border);color:${ev.tier==='major'?'var(--mvp)':ev.tier==='a-tier'?'var(--blue)':'var(--dim)'}">${ev.tier==='major'?'Major':ev.tier==='a-tier'?'A-Tier':(diff==='hard'?'C-Hard':diff==='mid'?'C-Mid':'C-Easy')}</div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>${timeText}</div>
        <div style="font-family:Consolas;color:var(--dim)">$${ev.prize.toLocaleString()}</div>
      </div>
      ${!elig ? `<div style="font-size:11px;color:var(--loss);margin-bottom:4px">❌ 未达标: ${reason}</div>` : ''}
      <button class="btn full" onclick="UI.page('schedule')" style="margin-top:5px;background:var(--panel2);border:1px solid var(--border);color:var(--dim)">前往日历报名 ➔</button>
    `;
  },

  renderHall(){
    const t=Game.trophies||[];
    const el=document.getElementById('trophy-case');if(!el)return;
    if(!t.length){el.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--dim)">暂无荣誉，请努力夺冠！</div>';return;}
    el.innerHTML=t.map(x=>`<div class="card" style="text-align:center;border-color:var(--gold-dim)">
      <div style="font-size:32px;margin-bottom:10px">🏆</div>
      <div style="color:var(--gold);font-weight:700;font-size:15px;margin-bottom:4px">${x.event}</div>
      <div style="color:var(--dim);font-size:12px">${x.date?new Date(x.date).getFullYear():'Unknown'}</div>
      <div style="color:#86efac;font-size:13px;margin-top:6px">奖金 $${(x.prize||0).toLocaleString()}</div>
    </div>`).join('');
  },

  renderSponsors(){
    const activeEl=document.getElementById('active-sponsors');
    const availEl=document.getElementById('available-sponsors');
    if(!activeEl||!availEl)return;
    const act=SponsorManager.activeSponsors||[];
    if(!act.length){
      activeEl.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--dim)">暂无赞助合同</div>';
    }else{
      activeEl.innerHTML=act.map(sp=>{
        const valPer=sp.valuePerEvent||0;
        const total=sp.totalValue||0;
        const remain=sp.remainingEvents||0;
        const req=sp.minTierRequirement||'a-tier';
        return `<div class="card" style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700;color:#fff;font-size:15px">${sp.tierName}</div>
            <div style="font-size:12px;color:var(--dim)">最低赛事要求：${req.toUpperCase()}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:13px;color:#86efac">每次曝光 $${valPer.toLocaleString()}</div>
            <div style="font-size:12px;color:var(--dim)">剩余 ${remain} 场 | 总额 $${total.toLocaleString()}</div>
          </div>
        </div>`;
      }).join('');
    }
    const tiers=CONFIG.SPONSOR_TIERS||[];
    availEl.innerHTML=tiers.map(t=>{
      const chk=SponsorManager.canSign(t.name,Game);
      const ok=chk&&chk.ok;
      const reason=chk&&chk.reason?chk.reason:'';
      const lock=`需粉丝 ≥ ${t.minFans.toLocaleString()}，赛事 ≥ ${t.minTierRequirement.toUpperCase()}`;
      // Fix: 未达标时按钮置灰、禁用点击、显示锁定图标
      const btn=ok
          ? `<button class="btn full" onclick="Game.signSponsor('${t.name}')" style="margin-top:8px">签约</button>`
          : `<button class="btn full" disabled style="margin-top:8px;opacity:0.5;background:var(--panel2);border-color:var(--border);cursor:not-allowed">🔒 未解锁</button>`;
      
      const style=ok?``
                    :`opacity:.7;background:var(--panel2);border-color:var(--border)`;
      return `<div class="card" style="${style}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <div style="font-weight:700;color:#fff;font-size:15px">${t.name}</div>
          <div style="font-size:11px;background:var(--panel2);padding:2px 6px;border-radius:4px;border:1px solid var(--border);color:var(--dim)">${t.minTierRequirement.toUpperCase()}</div>
        </div>
        <div style="font-size:12px;color:var(--dim)">解锁条件：${lock}</div>
        ${!ok?`<div style="font-size:12px;color:var(--loss);margin-top:4px">未达标：${reason||'请提升粉丝与赛事级别'}</div>`:''}
        <div style="font-size:12px;color:#86efac;margin-top:6px">合同基础总额约 $${t.baseValue.toLocaleString()} / ${t.requiredEventCount} 场</div>
        ${btn}
      </div>`;
    }).join('');
  },

  showPlayer(id){
    const p=World.players.find(x=>x.id===id);if(!p)return;
    const careerName=document.getElementById('career-name');
    if(careerName)careerName.innerHTML=`${p.name} <span style="font-size:14px;color:var(--dim)">生涯数据</span>`;

    const statsEl=document.getElementById('career-stats');
    if(statsEl){
      const isMyTeam=p.teamId==='PLAYER'||(Game.roster&&Game.roster.some(r=>r.id===p.id));
      const isLegend = p.evalStatus === 2;
      const isEvaled = p.evalStatus === 1;

      if(isMyTeam || isLegend || isEvaled){
        if(!p.hltv)p.hltv=World.generateHLTVProfile(p.rating,p.role);
        const h=p.hltv;
        const labels={firepower:'Firepower',entrying:'Entrying',trading:'Trading',opening:'Opening',clutching:'Clutching',sniping:'Sniping',utility:'Utility'};
        statsEl.classList.remove('hidden');
        // 确保 sub_pot 存在
        if (!p.sub_pot) p.sub_pot = World.generateSubPotential(p.potential || 70, p.role);
        statsEl.innerHTML = Object.keys(labels).map(k => {
            let displayVal = '???';
            let color = 'var(--dim)';
            let capLine = '';
            if (isMyTeam || isLegend) {
                const v   = Math.round(h[k] || 0);
                const sp  = p.sub_pot ? (p.sub_pot[k] || 99) : 99;
                const pct = sp > 0 ? v / sp : 0;
                displayVal = v;
                color = pct >= 0.95 ? 'var(--gold)' : pct >= 0.8 ? 'var(--win)' : v < 60 ? 'var(--loss)' : '#fff';
                // 显示进度条 /cap
                capLine = `<div style="font-size:9px;color:var(--dim);margin-top:1px">${v}/<span style="color:rgba(232,168,56,0.7)">${sp}</span></div>`;
            } else if (isEvaled && p.evalRanges) {
                displayVal = p.evalRanges[k];
                color = 'var(--blue)';
            }
            return `<div style="text-align:center"><div style="font-size:10px;color:var(--dim)">${labels[k]}</div><div style="font-weight:700;color:${color}">${displayVal}</div>${capLine}</div>`;
        }).join('');

        // ── 7D Radar（仅完整数据可见时渲染）────────────
        const radarWrap = document.getElementById('career-radar-wrap');
        const radarCanvas = document.getElementById('career-radar');
        if(radarWrap && radarCanvas && (isMyTeam || isLegend)){
          radarWrap.classList.remove('hidden');
          // 等 DOM 可见后再绘制
          requestAnimationFrame(() => drawPlayerRadar(radarCanvas, p, false));
        } else if(radarWrap){
          radarWrap.classList.add('hidden');
        }
      }else{
        statsEl.classList.add('hidden');
        const radarWrap = document.getElementById('career-radar-wrap');
        if(radarWrap) radarWrap.classList.add('hidden');
      }
    }

    const protoEl=document.getElementById('career-proto');
    if(protoEl){
      if(p.isReal&&(p.realName||p.handle||p.country)){
        protoEl.classList.remove('hidden');
        protoEl.innerHTML=`<div style="font-size:11px;color:var(--gold);margin-bottom:6px">📜 历史原型</div>
          该选手对应现实中的 <b style="color:#fff">${p.handle||p.name}</b>（${p.realName||'—'}），${p.country||'—'}籍。`;
      }else{protoEl.classList.add('hidden');}
    }
    const tbody=document.getElementById('career-table');
    if(tbody){
      // 只展示最近8条历史，避免超长列表
      const histRows=(p.history||[]).slice(-8);
      const rows=histRows.map(c=>{
        const r=parseFloat(c.rating);
        return `<tr>
        <td>${c.year}</td>
        <td style="color:${c.team===(Game.teamName||'我的战队')?'var(--win)':'#fff'}">${c.team}</td>
        <td style="${r>=1.15?'color:var(--win)':r<0.9?'color:var(--loss)':''}">${c.rating}</td>
        <td style="${c.mvps>0?'color:var(--mvp)':''}">${c.mvps||'-'}</td>
      </tr>`;}).join('');
      const curM=Math.max(1,p.ys.matches);const curR=curM<5?0:p.ys.ratingSum/curM;
      tbody.innerHTML=rows+`<tr style="background:rgba(255,255,255,0.05)">
        <td>${Game.date.getFullYear()} (进行中)</td>
        <td style="color:${p.teamId==='PLAYER'?'var(--win)':'#fff'}">${p.teamId==='PLAYER'?(Game.teamName||'我的战队'):(p.teamId||'FA')}</td>
        <td>${curR>0?curR.toFixed(2):'-'}</td><td>${p.ys.mvps||'-'}</td>
      </tr>`;
    }
    const modal=document.getElementById('career-modal');if(modal)modal.classList.remove('hidden');
  },

  refresh(){
    const setText=(id,v)=>{const el=document.getElementById(id);if(el)el.innerText=v;};
    const setHTML=(id,v)=>{const el=document.getElementById(id);if(el)el.innerHTML=v;};
    setText('ui-date',fmtD(Game.date));
    setText('ui-era',Game.eras[Game.era].name);
    setText('ui-money','$'+Game.money.toLocaleString());
    setText('ui-salary','-$'+Game.weeklySalary.toLocaleString());
    setText('ui-fans',Game.fans.toLocaleString());
    setText('ui-season',Game.date.getFullYear());
    // 同步战队名输入框
    const tnInput = document.getElementById('team-name-input');
    if(tnInput && document.activeElement !== tnInput) tnInput.value = Game.teamName || '我的战队';
    // 同步手机顶栏日期
    setText('mob-date',Game.date.toLocaleDateString('zh-CN'));
    const pw=Game.power(); // 这里会更新 synCache
    
    // 战斗力颜色反馈
    const rawEl = document.getElementById('ui-raw');
    const effEl = document.getElementById('ui-eff');
    const chemEl = document.getElementById('ui-chem');
    
    if(rawEl) rawEl.innerText = pw.raw.toFixed(1);
    
    if(effEl) {
        effEl.innerText = pw.eff.toFixed(1);
        if(Game.chem < 50) {
            effEl.style.color = 'var(--loss)';
            effEl.innerHTML += ' <span style="font-size:10px;color:var(--loss)">配合不佳</span>';
        } else {
            effEl.style.color = 'var(--win)';
        }
    }
    
    if(chemEl) {
        chemEl.innerText = Game.chem.toFixed(0) + '%';
        chemEl.style.color = Game.chem < 50 ? 'var(--loss)' : 'var(--blue)';
    }

    setText('ui-chem-max',Game.chemCap()+'%');
    setText('ui-fatigue',Game.fatigue+'%');
    setHTML('ui-syn',Game.synCache.msgs.join(''));

    // ── Hero Bar ──────────────────────────────────────
    const heroEff     = document.getElementById('hero-eff');
    const heroChem    = document.getElementById('hero-chem');
    const heroFatigue = document.getElementById('hero-fatigue');
    const heroName    = document.getElementById('hero-teamname');
    if(heroName)    heroName.innerText = Game.teamName || '我的战队';
    if(heroEff)     heroEff.innerText  = pw.eff.toFixed(1);
    if(heroChem)    heroChem.innerText = Game.chem.toFixed(0) + '%';
    if(heroFatigue) heroFatigue.innerText = Game.fatigue + '%';

    this.renderRoster();this.renderCoach();this.renderMapPool();this.renderHome();
  },

  renderMarketTimer() {
      const el = document.getElementById('market-timer');
      if (!el) return;
      const today = Game.date;
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const diffDays = Math.ceil((nextMonth - today) / (1000 * 60 * 60 * 24));
      el.innerText = `${diffDays} 天后更新`;
  },

  renderRoster(){
    const yr=Game.date.getFullYear(),pool=MapUtils.poolForYear(yr);
    const el=document.getElementById('roster-container');if(!el)return;
    el.innerHTML=Game.roster.map(p=>{
      const myMaps=(p.maps||[]).filter(m=>pool.includes(m.map));
      const ageWarn=p.age>=32?`<div class="age-warn">⚠ ${p.age}岁，注意老化</div>`:'';
      const traitBadges=(p.traits||[]).map(t=>renderTraitBadge(t)).join('');
      const rar=RARITY[p.rarity||'common'];
      const legendClass=p.isRegenLegend?'regen-legend':'';
      const nameStyle=p.rarity==='legend'||p.isRegenLegend?'color:#ffd700;font-weight:700':'';
      const hasHltv=!!(p.hltv);
      // 小雷达：仅有hltv数据时才渲染，用 data-pid 属性在innerHTML写完后批量绘制
      const miniRadar=hasHltv
        ?`<div class="mini-radar-wrap"><canvas class="mini-radar-canvas" data-pid="${p.id}" width="54" height="54" style="border-radius:4px"></canvas></div>`
        :'';
      return`<div class="card ${legendClass}" onclick="UI.showPlayer('${p.id}')" style="cursor:pointer;border:${rar.border};${rar.shadow?`box-shadow:${rar.shadow}`:''}">
        <span class="rbadge" style="background:${ROLES[p.role].color}">${ROLES[p.role].zh}</span>
        <div class="cname" style="${nameStyle}">${p.name} <span style="font-size:10px;color:var(--dim)">(${p.age}岁)</span></div>
        <div style="margin:4px 0 6px;min-height:18px">${traitBadges}</div>
        <div class="cstat"><span>能力</span><b>${p.rating}</b></div>
        <div class="cstat"><span>潜力</span><b style="color:${p.potential>=85?'var(--gold)':p.potential>=75?'var(--win)':'var(--dim)'}">${p.potential}</b></div>
        <div class="cstat"><span>状态</span><b>${((p.form||1)*100).toFixed(0)}%</b></div>
        ${ageWarn}
        <div class="mapbars">${myMaps.slice(0,3).map(m=>`<div class="mapbar-row"><span class="mapbar-name">${MapUtils.display(m.map)}</span><div class="mapbar-bg"><div class="mapbar-fill" style="width:${m.str}%;background:var(--win)"></div></div><span style="font-size:9px;color:var(--dim)">${m.str}</span></div>`).join('')}
        ${myMaps.length===0?'<div style="font-size:10px;color:var(--dim)">当前图池无擅长图</div>':''}</div>
        ${miniRadar}
        <button class="btn danger full" onclick="event.stopPropagation();Game.sellP('${p.id}')">挂牌出售 ($${Math.floor(p.price * 0.6).toLocaleString()})</button>
      </div>`;
    }).join('');
    // 批量绘制小雷达（innerHTML写完后DOM已就绪）
    el.querySelectorAll('canvas.mini-radar-canvas').forEach(cv=>{
      const pid=cv.dataset.pid;
      const player=Game.roster.find(x=>x.id===pid);
      if(player) drawPlayerRadar(cv,player,true);
    });
  },

  renderCoach(){
    const c=Game.coach;
    const el=document.getElementById('coach-container');if(!el)return;
    if(!c){
      el.innerHTML=`<div style="text-align:center;padding:20px;color:var(--dim);font-size:12px;background:var(--panel2);border:1px dashed var(--border);border-radius:7px">暂无教练<br><span style="font-size:11px">前往转会市场签约教练<br><span style="color:#86efac">💡 开局可签 C 级教练（$500 起）</span></span></div>`;
      return;
    }
    const gc=c.gradeColor||'var(--blue)';
    const gl=c.grade||(c.tactics>=68?'S 级':c.tactics>=58?'A 级':c.tactics>=45?'B 级':'C 级');
    el.innerHTML=`<div class="card coach-card" style="border-color:${gc}33">
      <span class="rbadge" style="background:${gc};color:#000">教练</span>
      <div style="position:absolute;top:10px;right:52px;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;background:${gc}22;border:1px solid ${gc};color:${gc}">${gl}</div>
      <div class="cname">${c.name} <span style="font-size:10px;color:var(--dim)">(${c.age}岁)</span></div>
      <div class="cstat"><span>战术水平</span><b style="color:${gc}">${c.tactics}</b></div>
      <div class="cstat"><span>磨合上限</span><b>${Game.chemCap()}%</b></div>
      <div class="cstat"><span>BP精准度</span><b>${Math.round(40+c.tactics*.5)}%</b></div>
      <div class="cstat"><span>周薪</span><b style="color:var(--loss)">$${(c.salary||0).toLocaleString()}/周</b></div>
      <div class="mapbars">${(c.maps||[]).slice(0,2).map(m=>`<div class="mapbar-row"><span class="mapbar-name">${MapUtils.display(m.map)}</span><div class="mapbar-bg"><div class="mapbar-fill" style="width:${m.str}%;background:${gc}"></div></div><span style="font-size:9px;color:var(--dim)">${m.str}</span></div>`).join('')}</div>
      <button class="btn danger full" onclick="Game.fireC()">解雇教练</button>
    </div>`;
  },

  renderMapPool(){
    const yr=Game.date.getFullYear();
    const ratings=MapUtils.teamPoolRatings(Game.roster,Game.coach,yr);
    const el=document.getElementById('ui-mappool');if(!el)return;
    el.innerHTML=ratings.map(({map,str})=>{
      const cls=str>=70?'str-high':str>=55?'str-mid':'str-low';
      const col=str>=70?'var(--map-str)':str>=55?'var(--map-mid)':'var(--map-weak)';
      return`<div class="mapchip ${cls}">
        <div style="font-weight:700;font-size:12px">${MapUtils.display(map)}</div>
        <div class="maptag" style="color:${col}">${str.toFixed(0)} ${str>=70?'强势':''}</div>
        <div class="str-bar" style="width:${str}%;background:${col}"></div>
      </div>`;
    }).join('');
  },

  renderCal(){
    const evs=Cal.evs.filter(e=>e.date>=Game.date).slice(0,12);
    const boTag=(tier,phase)=>{const f=Cal.tierFormats[tier];const bo=phase==='final'?f.finalBo:phase==='ko'?f.knockoutBo:f.groupBo;const cls=bo===1?'bo-bo1':bo===3?'bo-bo3':'bo-bo5';return`<span class="bo-tag ${cls}">${Cal.boLabel(bo)}</span>`;};
    const el=document.getElementById('cal-container');if(!el)return;
    el.innerHTML=evs.length?evs.map(e=>`<div class="cev ${e.tier==='major'?'major':e.tier==='a-tier'?'atier':e.tier==='b-tier'?'btier':'ctier'}">
      <div class="cev-date">${fmtD(e.date).substring(5)}</div>
      <div class="cev-body">
        <div class="cev-name" style="color:${e.tier==='major'?'var(--mvp)':e.tier==='b-tier'?'#10b981':'#fff'}">${e.name}
          ${boTag(e.tier,'group')} → ${boTag(e.tier,'ko')}${(e.tier==='major'||e.tier==='b-tier')?` → ${boTag(e.tier,'final')}`:''}        </div>
        <div class="cev-sub">准入: ${e.minRank>=999?'<b style="color:#10b981">无排名限制</b>':`世界排名前 ${e.minRank}`} | 奖金: $${e.prize.toLocaleString()} | 队伍: ${e.teams}${e.tier==='c-tier'?` | <span style="color:var(--dim)">积分按对手强度计算</span>`:''}${e.difficulty?` | 难度: ${e.difficulty==='debut'?'<b style="color:#ffd700">★ 首战</b>':e.difficulty==='open'?'<b style="color:#10b981">公开赛</b>':e.difficulty==='easy'?'入门':e.difficulty==='mid'?'进阶':'精英'}`:''}</div>
      </div>
      <div>${e.isReg?'<button class="btn dark" disabled>已报名</button>':`<button class="btn" onclick="Cal.register('${e.id}')">报名</button>`}</div>
    </div>`).join(''):'<div style="color:var(--dim);padding:20px;text-align:center">本年赛事已结束，推进到下一年吧</div>';
  },

  renderRankings(){
    const tbody=document.getElementById('rank-list');if(!tbody)return;
    const all=[...World.teams.map(t=>t),{id:'PLAYER',name:Game.teamName||'我的战队',rating:Game.power().eff,points:Game.points,lastRank:Game.lastRank,isPlayer:true,isReal:true}];
    all.sort((a,b)=>{if((b.points||0)!==(a.points||0))return(b.points||0)-(a.points||0);return(b.rating||0)-(a.rating||0);});
    const top=all.slice(0,100);
    tbody.innerHTML=top.map((t,idx)=>{
      const rank=idx+1;
      const prev=t.isPlayer?Game.lastRank:(t.lastRank||999);
      let delta='—',color='var(--dim)';
      if(prev&&prev!==999&&prev!==rank){
        const d=prev-rank;
        delta=(d>0?`↑${d}`:`↓${Math.abs(d)}`);
        color=d>0?'var(--win)':'var(--loss)';
      }
      return `<tr>
        <td style="text-align:center">${rank}</td>
        <td style="text-align:left">${teamNameWithStar(t)}</td>
        <td style="text-align:center">${(t.points||0).toLocaleString()}</td>
        <td style="text-align:center;color:${color}">${delta}</td>
      </tr>`;
    }).join('');
  },

  showHub(){
    this.page('match');
    ['pnl-empty','pnl-awards'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.add('hidden');});
    const pnlHub=document.getElementById('pnl-hub');if(pnlHub)pnlHub.classList.remove('hidden');
    const pnlLive=document.getElementById('pnl-live');if(pnlLive)pnlLive.classList.add('hidden');
    const ev=Tour.ev;if(!ev)return;
    const hubName=document.getElementById('hub-name');if(hubName)hubName.innerText=ev.name;
    const hubDesc=document.getElementById('hub-desc');
    if(hubDesc)hubDesc.innerText=`🏆 奖金: $${ev.prize.toLocaleString()} | 队伍: ${ev.teams} | 格式: 小组${Cal.boLabel(ev.fmt.groupBo)} → 淘汰${Cal.boLabel(ev.fmt.knockoutBo)}${ev.tier==='major'?' → 决赛'+Cal.boLabel(ev.fmt.finalBo):''}`;
    this.renderBracket();this._updateHub();
  },

  _updateHub(){
    const pnl=document.getElementById('pnl-next');if(!pnl)return;
    if(Tour.phase!=='hub'||Tour.playerRound<0||Tour.playerRound>=Tour.rounds.length){pnl.classList.add('hidden');return;}
    const round=Tour.rounds[Tour.playerRound];
    const idx=Tour.playerMatchIdx;
    if(idx<0||idx>=round.length){pnl.classList.add('hidden');return;}
    const m=round[idx];
    if(!m||m.winner){pnl.classList.add('hidden');return;}
    const opp=m.t1.isPlayer?m.t2:m.t1;
    if(!opp){pnl.classList.add('hidden');return;}
    const hubOpp=document.getElementById('hub-opp');if(hubOpp)hubOpp.innerHTML=teamNameWithStar(opp);
    const bo=Tour.currentBo();
    
    // 赛制规则提示
    let ruleText = `赛制: ${Cal.boLabel(bo)}`;
    if(Tour.bracketType === 'DE') {
        ruleText += ` | <span style="color:${Tour.playerLives>1?'var(--win)':'var(--loss)'}">双败制 (剩余命: ${Tour.playerLives})</span>`;
    } else if(Tour.bracketType === 'GSE') {
        ruleText += ` | <span style="color:var(--blue)">小组+单败</span>`;
    } else {
        ruleText += ` | 单败淘汰`;
    }
    
    const hubFormat=document.getElementById('hub-format');
    if(hubFormat) hubFormat.innerHTML=`${ruleText} | 当前阶段: 第${Tour.playerRound+1}轮`;
    
    this._renderIntel(opp);
    pnl.classList.remove('hidden');
  },

  _renderIntel(opp){
    const yr=Game.date.getFullYear();
    const oppRatings=MapUtils.teamPoolRatings(opp.roster||[],opp.coach||null,yr);
    const myRatings=MapUtils.teamPoolRatings(Game.roster,Game.coach,yr);
    const sorted=[...oppRatings].sort((a,b)=>b.str-a.str);
    const top3=sorted.slice(0,3),bot2=sorted.slice(-2);
    const html=`
      <div class="intel-row"><span style="color:var(--dim)">对手强图</span><span>${top3.map(x=>`<span style="color:var(--loss);font-weight:700">${MapUtils.display(x.map)}</span>`).join(' ')}</span></div>
      <div class="intel-row"><span style="color:var(--dim)">对手弱图</span><span>${bot2.map(x=>`<span style="color:var(--win);font-weight:700">${MapUtils.display(x.map)}</span>`).join(' ')}</span></div>
      <div class="intel-row"><span style="color:var(--dim)">我方强图</span><span>${[...myRatings].sort((a,b)=>b.str-a.str).slice(0,3).map(x=>`<span style="color:var(--win);font-weight:700">${MapUtils.display(x.map)}</span>`).join(' ')}</span></div>
      <div class="intel-row"><span style="color:var(--dim)">对手战力</span><b style="color:var(--fg)">${((opp.roster||[]).reduce((s,p)=>s+(p.rating||60)*(p.form||1),0)/Math.max(1,(opp.roster||[]).length)).toFixed(1)}</b></div>
      <div class="intel-row"><span style="color:var(--dim)">对手状态</span><b style="color:var(--fg)">${((opp.roster||[]).reduce((s,p)=>s+(p.form||1),0)/Math.max(1,(opp.roster||[]).length)*100).toFixed(0)}%</b></div>
      ${opp.coach?`<div class="intel-row"><span style="color:var(--dim)">对手教练</span><b style="color:var(--blue)">${opp.coach.name}（战术${opp.coach.tactics}）</b></div>`:''}`;
    const ic=document.getElementById('intel-content');if(ic)ic.innerHTML=html;
  },

  renderBracket(){
    const c=document.getElementById('bracket');if(!c)return;c.innerHTML='';
    Tour.rounds.forEach(round=>{
      const col=document.createElement('div');col.className='bcol';
      round.forEach(m=>{
        const isP=m.t1?.isPlayer||m.t2?.isPlayer;
        const s1=m.winner&&m.t1?` <span class="bscore" style="color:${m.winner===m.t1?'var(--win)':'var(--loss)'}">✓</span>`:'';
        const s2=m.winner&&m.t2?` <span class="bscore" style="color:${m.winner===m.t2?'var(--win)':'var(--loss)'}">✓</span>`:'';
        if (m.isBye) {
          // 轮空场：只显示晋级方，不显示 VS 和对手
          col.innerHTML+=`<div class="bnode ${isP?'pnode':''}">
            <div class="bteam ${m.t1?.isPlayer?'isp':''} won">${m.t1?teamNameWithStar(m.t1):''}${s1}</div>
            <div style="font-size:9px;color:var(--dim2);text-align:center;padding:2px 0">轮空</div>
            <div class="bteam" style="color:var(--dim2);font-style:italic">—</div>
          </div>`;
        } else {
          col.innerHTML+=`<div class="bnode ${isP?'pnode':''}">
            <div class="bteam ${m.t1?.isPlayer?'isp':''} ${m.winner===m.t1?'won':''}">${m.t1?teamNameWithStar(m.t1):'等待'}${s1}</div>
            <div style="font-size:9px;color:var(--dim2);text-align:center;padding:2px 0">VS</div>
            <div class="bteam ${m.t2?.isPlayer?'isp':''} ${m.winner===m.t2?'won':''}">${m.t2?teamNameWithStar(m.t2):'等待'}${s2}</div>
          </div>`;
        }
      });
      c.appendChild(col);
    });
  },

  showLive(){
    const pnlHub=document.getElementById('pnl-hub');if(pnlHub)pnlHub.classList.add('hidden');
    const pnlLive=document.getElementById('pnl-live');if(pnlLive)pnlLive.classList.remove('hidden');
    const postStats=document.getElementById('post-stats');if(postStats)postStats.classList.add('hidden');
    const liveCtrl=document.getElementById('live-ctrl');if(liveCtrl)liveCtrl.classList.remove('hidden');
    this.updateScore();
  },

  updateScore(){
    const s=Match.s;if(!s)return;
    const scoreA=document.getElementById('score-a');if(scoreA)scoreA.innerText=s.sA;
    const scoreB=document.getElementById('score-b');if(scoreB)scoreB.innerText=s.sB;
    const sideA=s.ctIsA?{t:'CT',c:'bct'}:{t:'T',c:'bt'};
    const sideB=s.ctIsA?{t:'T',c:'bt'}:{t:'CT',c:'bct'};
    const badgeA=document.getElementById('badge-a');if(badgeA){badgeA.className=sideA.c;badgeA.innerText=sideA.t;}
    const badgeB=document.getElementById('badge-b');if(badgeB){badgeB.className=sideB.c;badgeB.innerText=sideB.t;}
    // 4. 战术控制面板
    const side = s.ctIsA ? 'CT' : 'T';
    const isPause = Match.tactics.timeouts < 4; // 简单判断是否用过暂停
    const toColor = Match.tactics.timeouts > 0 ? '#fff' : 'var(--dim)';
    
    const ctrl = document.getElementById('live-ctrl');
    if(ctrl) {
        ctrl.innerHTML = `
        <div class="panel-title" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <span>🧠 战术指挥板 <span style="font-size:11px;color:var(--dim);font-weight:400">第 ${s.round+1} 回合 (${side})</span></span>
            <button class="btn" style="padding:2px 8px;font-size:11px;background:var(--panel2);border:1px solid var(--border);color:${toColor}" 
                onclick="Match.callTimeout()" ${Match.tactics.timeouts <= 0 ? 'disabled' : ''}>
                ⏸ 叫暂停 (${Match.tactics.timeouts})
            </button>
        </div>
        
        <div style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap">
            <!-- 经济策略 -->
            <div style="flex:1">
                <div style="font-size:11px;color:var(--dim);margin-bottom:4px">💰 经济决策</div>
                <div class="btn-group" style="display:flex;gap:4px">
                    <button class="trbtn ${Match.tactics.econ==='auto'?'on':''}" style="flex:1;font-size:10px;padding:4px" onclick="Match.setEcon('auto')">Auto</button>
                    <button class="trbtn ${Match.tactics.econ==='force'?'on':''}" style="flex:1;font-size:10px;padding:4px" onclick="Match.setEcon('force')">Force</button>
                    <button class="trbtn ${Match.tactics.econ==='eco'?'on':''}" style="flex:1;font-size:10px;padding:4px" onclick="Match.setEcon('eco')">Eco</button>
                </div>
            </div>
            
            <!-- 战术阵型 -->
            <div style="flex:1.2">
                <div style="font-size:11px;color:var(--dim);margin-bottom:4px">⚔️ 战术阵型 (${side})</div>
                <div class="btn-group" style="display:flex;gap:4px">
                    <button class="trbtn ${Match.tactics.stance==='default'?'on':''}" style="flex:1;font-size:10px;padding:4px" onclick="Match.setStance('default')">默认</button>
                    ${side==='T' 
                        ? `<button class="trbtn ${Match.tactics.stance==='rush'?'on':''}" style="flex:1;font-size:10px;padding:4px" onclick="Match.setStance('rush')">爆弹</button>
                           <button class="trbtn ${Match.tactics.stance==='slow'?'on':''}" style="flex:1;font-size:10px;padding:4px" onclick="Match.setStance('slow')">慢摸</button>`
                        : `<button class="trbtn ${Match.tactics.stance==='aggro'?'on':''}" style="flex:1;font-size:10px;padding:4px" onclick="Match.setStance('aggro')">前压</button>
                           <button class="trbtn ${Match.tactics.stance==='retake'?'on':''}" style="flex:1;font-size:10px;padding:4px" onclick="Match.setStance('retake')">回防</button>`
                    }
                </div>
            </div>
        </div>
        
        <div style="display:flex;gap:8px">
            <button class="btn full" onclick="Match.round()" style="flex:2;background:var(--win);border:none;color:#000;font-weight:700">▶ 执行战术</button>
            <button class="btn full" onclick="Match.auto()" style="flex:1;background:var(--panel2);border:1px solid var(--border);color:var(--dim)">⏩ 快速模拟</button>
        </div>
        `;
    }
  },

  log(msg,type,style=''){
    const l=document.getElementById('matchlog');if(!l)return;
    const d=document.createElement('div');d.className=`mlog-e ${type}`;
    if(style)d.style=style;d.innerHTML=msg;l.appendChild(d);l.scrollTop=l.scrollHeight;
  },

  renderPostStats(s){
    const el=document.getElementById('post-stats');if(!el)return;
    el.classList.remove('hidden');
    const row=p=>{
      const isMvp=p===s.mvp,isEvp=(s.evps||[]).includes(p);
      const b=isMvp?`<span class="bmvp">MVP</span>`:isEvp?`<span class="bevp">EVP</span>`:'';
      const cl=p.rating2>=1.15?'g':p.rating2<.9?'r':'';
      return`<tr><td>${p.name}${b}</td><td>${p.kills}-${p.deaths}</td><td>${p.assists}</td><td>${p.adr}</td><td>${p.kast}%</td><td>${p.impact}</td><td class="${cl}">${p.rating2}</td></tr>`;
    };
    const hd=`<tr><th>Player</th><th>K-D</th><th>A</th><th>ADR</th><th>KAST</th><th>Imp.</th><th>Rating</th></tr>`;
    const tblA=document.getElementById('tbl-a');if(tblA)tblA.innerHTML=hd+(s.tA||[]).map(row).join('');
    const tblB=document.getElementById('tbl-b');if(tblB)tblB.innerHTML=hd+(s.tB||[]).map(row).join('');
    const tblBHdr=document.getElementById('tbl-b-hdr');if(tblBHdr)tblBHdr.innerHTML=`🔫 ${teamNameWithStar(s.opp)}`;
    const bo=Tour.currentBo(),need=Math.ceil(bo/2);
    const awards=document.getElementById('match-awards');
    if(awards)awards.innerHTML=`<div><span style="color:var(--mvp);font-weight:700">⭐ Match MVP:</span> <b style="color:#fff;font-size:15px">${s.mvp?s.mvp.name:'—'}</b> <span style="font-size:11px;color:var(--dim);margin-left:8px">${s.mvp?`Rating:${s.mvp.rating2} ADR:${s.mvp.adr} Impact:${s.mvp.impact}`:''}</span></div>
      <div style="margin-top:6px;font-size:11px;color:var(--dim)">系列赛: 我方 <b style="color:var(--win)">${Tour.seriesWinsP}</b> - <b style="color:var(--loss)">${Tour.seriesWinsAI}</b> 对方 | 还需 <b style="color:var(--gold)">${Math.max(0,need-Math.max(Tour.seriesWinsP,Tour.seriesWinsAI))}</b> 胜结束</div>`;
    setTimeout(()=>{const live=document.getElementById('pnl-live');if(live)live.scrollTo({top:1000,behavior:'smooth'});},100);
  },

  renderAwards(mvp,evps,champ,rank,prize){
    ['pnl-hub','pnl-live'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.add('hidden');});
    const pnlAwards=document.getElementById('pnl-awards');if(pnlAwards)pnlAwards.classList.remove('hidden');
    const awardsSub=document.getElementById('awards-sub');
    if(awardsSub)awardsSub.innerHTML=`
      <div style="display:inline-block;padding:9px 18px;background:rgba(34,197,94,.08);border-radius:6px;color:#86efac;margin-right:12px;border:1px solid rgba(34,197,94,.2)">👑 冠军: <b style="color:#fff;font-size:17px">${teamNameWithStar(champ)}</b></div>
      <div style="display:inline-block;padding:9px 18px;background:var(--panel2);border-radius:6px;color:var(--dim);border:1px solid var(--border)">名次: <b style="color:var(--gold);font-size:15px">${rank}</b> | 奖金: <b style="color:#86efac;font-size:15px">$${prize.toLocaleString()}</b></div>`;
    const awardsMvp=document.getElementById('awards-mvp');
    if(awardsMvp)awardsMvp.innerHTML=mvp?`<div class="arow mvp-row">
      <div>
        <div style="font-size:11px;color:var(--mvp);font-weight:700;margin-bottom:3px">🏅 赛事 MVP</div>
        <div style="font-size:20px;font-weight:800;color:#fff">⭐ ${mvp.player.name} <span style="font-size:11px;color:var(--dim);font-weight:400">[${mvp.team.name}]</span></div>
      </div>
      <div style="text-align:right;font-size:12px;color:var(--dim);line-height:1.8">
        <div>综合得分 <b style="color:var(--mvp)">${mvp.avgScore.toFixed(2)}</b></div>
        <div>最高Rating <b style="color:#fff">${typeof mvp.topRating==='number'?mvp.topRating.toFixed(2):mvp.topRating}</b></div>
      </div>
    </div>`:'<div style="color:var(--dim);padding:12px">暂无MVP数据</div>';
    const awardsEvp=document.getElementById('awards-evp');
    if(awardsEvp)awardsEvp.innerHTML=(evps||[]).map(e=>`<div class="arow evp-row">
      <div style="font-size:14px;font-weight:700;color:#eee">🎖 ${e.player.name} <span style="font-size:10px;color:var(--dim)">[${e.team.name}]</span></div>
      <div style="font-size:11px;color:var(--dim)">得分 <b style="color:var(--evp)">${e.avgScore.toFixed(2)}</b> | 场次 ${e.played}</div>
    </div>`).join('');
  },

  signSponsor(tierName) {
      // Wrapper for UI to call SponsorManager
      const contract = SponsorManager.sign(tierName, Game);
      if(contract) {
          // Refresh if on sponsor page
          if(UI.currentPage === 'sponsors') UI.renderSponsors();
      }
  },

  showEventTicker(msg){
    let t=document.querySelector('.event-ticker');
    if(t){clearTimeout(t._timer);t.remove();}
    t=document.createElement('div');t.className='event-ticker';t.innerText='📰 '+msg;
    document.body.appendChild(t);t._timer=setTimeout(()=>t.remove(),5000);
  },

  toast(msg){
    let t=document.querySelector('.toast');if(t)t.remove();
    t=document.createElement('div');t.className='toast';t.innerText=msg;
    document.body.appendChild(t);setTimeout(()=>t.remove(),3500);
  }
};
