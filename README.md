# CS LEGENDS v6.0 — 项目说明书

> 每当新功能上线，本文件会同步标注"新增逻辑写在了哪个文件里"。

---

## 项目结构总览

```
cs-legends/
├── index.html       # HTML 骨架 + 脚本加载入口
├── style.css        # 全局样式
├── constants.js     # 所有静态常量数据
├── world.js         # 工具函数 / 选手生成 / 转会市场 / 存档
├── core.js          # Game 主控 / 时间推进 / 设施 / 赛程 / HLTV
├── match.js         # BP / 赛事流程 / 比赛回合引擎
└── ui.js            # 所有 DOM 渲染与页面交互
```

**加载顺序**（浏览器按此顺序执行，后者可安全引用前者的全局变量）：

```html
<link rel="stylesheet" href="style.css">
<script src="constants.js"></script>
<script src="world.js"></script>
<script src="core.js"></script>
<script src="match.js"></script>
<script src="ui.js"></script>
<script>window.onload = () => Game.init();</script>
```

---

## 各文件详细说明

### `index.html` — HTML 骨架

**职责：** 纯结构，不含任何逻辑或样式。

包含的内容：
- 页面注释头（版本说明、特质系统文档）
- 侧边栏导航（时间控制按钮、页面跳转）
- 各功能页面的 DOM 容器（`#page-home`、`#page-market`、`#page-schedule` 等）
- BP（Ban/Pick）覆盖层 `#bp-overlay`
- 生涯查看弹窗 `#career-modal`
- HLTV Top 20 弹窗 `#hltv-modal`
- 按顺序引用所有外部 CSS / JS 文件

**何时修改：** 新增 DOM 节点、新页面、新弹窗时在此文件操作。

---

### `style.css` — 全局样式

**职责：** 所有 CSS 样式，约 327 行。

包含的内容：
- CSS 变量（颜色、尺寸等，定义在 `:root`）
- 布局（侧边栏 `.sb`、主区 `.main`、双栏 `.g2`）
- 通用组件（`.panel`、`.card`、`.btn`、`.nav`、`.cev`）
- 比赛日志（`.mlog`、`.mlog-e` 及各状态色）
- BP 地图选择覆盖层
- 特质徽章三级样式（`.trait-normal`、`.trait-legend`、`.trait-sig`）
- 传奇选手卡片脉冲动画（`.regen-legend`）
- Toast 通知、事件滚动条

**何时修改：** 调整视觉样式、新增组件样式时在此文件操作。

---

### `constants.js` — 静态常量数据

**职责：** 纯数据，无任何运行时逻辑，约 563 行。游戏的所有"配置表"都在这里。

| 常量 | 说明 |
|------|------|
| `PLAYERS_16` | CS 1.6 时代 40 名传奇选手数据（出道年份、役职、峰值 Rating、特质名） |
| `TRAITS_16` | CS 1.6 时代特质描述文本字典 |
| `TEAMS_16` | CS 1.6 时代 12 支历史传奇战队数据 |
| `TEAM_TRAITS_16` | 战队底蕴特质效果描述字典（供 AI 战队使用） |
| `NORMAL_TRAITS` | A 级特质库：16 个常规特质，路人选手 20% 概率获得 |
| `GENERIC_LEGEND_TRAITS` | B 级特质库：2 个通用传奇特质，仅 Regen Legend 可抽取 |
| `SIGNATURE_TRAITS` | C 级特质库：历史专属签名特质（s1mple、ZyWoO、karrigan 等）+ 青训专属特质 |
| `LEGEND_16_TRAIT_CONFIG` | 将 1.6 时代特质名映射为完整特质对象（tier、color、badge、效果参数） |
| `ALL_TRAITS` / `TRAITS` / `LEGEND_TRAITS` | 三库合并的统一查询接口（向后兼容） |
| `NORMAL_TRAIT_KEYS` / `GENERIC_LEGEND_KEYS` | 特质键名列表，供随机抽取使用 |
| `HISTORICAL_DATA` | 三个历史时代（2000 / 2012 / 2020）的真实选手与战队快照，含 `signatureTrait` 绑定 |
| `HISTORICAL_EVENT_CONFIG` | 各时代赛历配置（CPL、ESWC、WCG、IEM 等，含月份、奖金、赛制） |
| `CONFIG` | 粉丝系统参数、赛事权重、赞助商等级表（5 级，从网吧赞助到头部冠名） |
| `NAME_COUNTRIES` | 随机选手姓名池（10 国） |
| `AI_TEAMS` / `AI_TEAMS_DEBUT` | AI 战队名单及各队真实出道年份 |
| `ROLES` | 五种职位（中文名 + 颜色） |
| `ERA_MAPS` / `MAP_DISPLAY` / `MAP_STYLES` | 各年代地图池、显示名映射、地图风格权重 |
| `RARITY` | 选手稀有度（普通 / 优秀 / 明星 / 传奇）配色 |
| `RANDOM_EVENTS` | 10 种随机赛季事件（状态波动、磨合变化） |

**辅助函数（也在此文件末尾）：**
- `traitTier(key)` — 判断特质所属层级
- `isSignatureTrait(key)` / `isAnyLegendTrait(key)` — 特质类型判断
- `renderTraitBadge(key, withTooltip)` — 生成带动画的特质徽章 HTML
- `REAL_TEAM_IDS` / `isRealTeam(name)` — 判断是否为真实历史战队
- `teamNameWithStar(teamOrName)` — 真实战队名后附加金星标记

**何时修改：** 调整游戏平衡数值、新增特质、新增历史选手/战队、修改赞助商梯度时在此文件操作。

---

### `world.js` — 工具函数 / 选手生成 / 排名 / 转会市场 / 存档

**职责：** 游戏世界的"数据层"，约 1579 行。

#### 全局工具函数
| 函数 | 说明 |
|------|------|
| `rnd(a, b)` | 返回 [a, b] 区间的随机整数 |
| `pick(arr)` | 从数组中随机取一个元素 |
| `fmtD(date)` | Date 对象格式化为 `YYYY-MM-DD` 字符串 |
| `calcCoachSalary(tactics)` | 按战术值计算教练周薪（分段幂次公式） |
| `drawPlayerRadar(canvas, player, mini)` | 在 `<canvas>` 上绘制选手 7D 雷达图（支持 sub_pot 虚线潜力圈） |

#### `MapUtils` 对象
- `poolForYear(y)` — 按年份返回当时有效地图池
- `display(m)` — 地图内部名 → 显示名
- `genPlayerMaps(birthYear)` — 为新选手随机生成 2–3 张强图
- `teamMapStr(roster, coach, map)` — 计算全队对某张图的综合强度
- `teamPoolRatings(roster, coach, year)` — 返回全队地图池评分列表

#### `SponsorManager` 对象
- `canSign(tierName, team)` — 检查战队是否满足签约条件（粉丝、赛事级别、近期 Rating）
- `sign(tierName, team)` — 签约并发放签字费（合同总价 20%）
- `onTournamentParticipate(team, tier)` — 赛后触发履约结算或违约风险计数
- `breach(sp, idx)` — 违约处理（扣钱、移除合同、推送新闻）
- `onMonthlyCheck(team)` — 每月随机触发曝光奖励

#### `World` 对象
选手与 AI 战队的"世界状态"。

**选手生成：**
- `createAmateurTeam(idx)` — 创建业余 AI 战队（含阵容、教练）
- `genRandomIdentity()` — 生成随机国籍 + 网名
- `mkRealPlayer(cfg, teamName)` — 按 `HISTORICAL_DATA` 配置生成真实历史选手（自动装备签名/常规特质）
- `mkP(min, max, ai, role, year)` — 生成随机 AI 选手（无特质）
- `World.mkP(...)` — 生成玩家可签约选手（有 20% 常规特质概率，0.5% Regen Legend 概率）

**粉丝系统：**
- `generateInitialFans(originType, p)` — 按选手来源（业余/职业/真实）初始化粉丝数
- `updatePlayerFans(p, result)` — 赛后更新选手粉丝
- `updateTeamFans(t, result)` — 赛后更新战队品牌粉丝
- `applyFanDecay(p)` — 单个选手粉丝自然衰减
- `applyMonthlyDecay()` — 每月全局粉丝衰减

**属性生成：**
- `generateSubPotential(pot, role)` — 生成 7 维子潜力上限（按职位分布）
- `generateHLTVProfile(overall, role)` — 生成 7 维当前属性（firepower / entrying / trading / opening / clutching / sniping / utility）

**排名系统（内嵌于 World）：**
- `_calcStablePts(rating)` — 计算稳定积分基础值
- `_calcInitPts(rating, tier)` — 赛事初始积分
- `addTournamentPoints(team, points)` — 赛后给战队加分
- `updateRankings()` — 按积分重排世界排名，触发 UI 刷新

**初始化：**
- `init(year)` — 按年份初始化世界（生成 AI 战队、注入历史真实选手）

#### `Market` 对象
- `refresh(free)` — 刷新转会市场列表（消耗金钱或免费）
- `showTab(t)` — 切换"选手 / 教练"标签
- `startEval(id)` / `finishEval(id)` — 开始/完成选手评估（解锁详细属性）
- `getGuidePriceRange(rating)` — 按 Rating 返回参考报价区间
- `renderPlayers()` / `renderCoaches()` — 渲染市场列表 DOM

#### `SaveManager` 对象
- `save()` — 序列化游戏状态到 `localStorage`（版本号 v7）
- `load()` — 反序列化并执行数据迁移
- `_migrate(data)` — 处理旧版存档格式升级
- `_validate(data)` — 校验存档完整性
- `hasSave()` — 检测是否存在存档
- `reset()` — 清除存档并刷新页面
- `cleanLegacy()` — 清理旧版本遗留的 localStorage key

**何时修改：** 新增选手属性字段、调整粉丝公式、修改市场逻辑、调整存档结构时在此文件操作。

---

### `core.js` — Game 主控 / 时间推进 / 设施 / 赛程 / HLTV

**职责：** 游戏的"控制层"，约 1319 行。

#### `Game` 对象
游戏的核心单例，持有玩家战队的所有状态。

**状态属性：**
- `date` — 当前游戏日期（从 2000-01-01 开始）
- `money` — 资金
- `fans` — 战队总粉丝
- `teamName` — 战队名
- `roster` — 当前阵容（5人）
- `coach` — 教练
- `facilities` — 四项设施等级（training / medical / media / youth）
- `trophies` / `news` — 荣誉室 / 新闻列表

**Getter：**
- `era` — 当前时代编号（0=1.6 时代 / 1=早期CS:GO / 2=现代CS:GO）
- `eraObj` — 当前时代配置对象
- `weeklySalary` — 每周薪资支出（= 月运营成本 / 4）

**核心方法：**
| 方法 | 说明 |
|------|------|
| `init()` | 游戏启动入口，加载存档或全新初始化 |
| `advanceDay()` | 推进一天（触发赛事、发工资、随机事件） |
| `advanceWeek()` | 推进一周（连续调用 7 次 `advanceDay`） |
| `advanceMonth()` | 推进一月（调用至月末） |
| `calculateOperatingCost()` | 计算月度运营成本（薪资 + 设施 + 豪华税 + 粉丝规模成本） |
| `_checkDebuts(y)` | 检查该年是否有传奇选手出道，触发登场事件 |
| `_yearEnd(y)` | 年末结算（HLTV 排名、选手成长/衰退、AI 阵容更新） |
| `_aiTransfer(y)` | 年末 AI 战队转会逻辑 |
| `_randomEvent()` | 触发随机赛季事件（状态波动、磨合变化） |
| `chemCap()` | 计算当前阵容化学值上限（受教练战术值影响） |
| `setTrain(m)` | 对指定选手执行本周训练（成长判定，受设施加成） |
| `playScrim()` | 打一场热身赛（磨合度 + 小额训练收益） |
| `synergy()` | 计算阵容协同系数（影响比赛战力） |
| `power()` | 计算玩家战队当前综合战力 |
| `dynamicBid(id)` | 对转会市场选手动态出价（受竞争者影响） |
| `buyP(id)` / `buyC(id)` | 签约选手 / 教练 |
| `sellP(id)` / `fireC()` | 出售选手 / 解雇教练 |
| `skipToEvent()` | 快进到下一场赛事 |
| `pushNews(msg)` | 向新闻列表推送一条消息 |
| `setTeamName()` | 从输入框读取并更新战队名 |
| `signSponsor(tierName)` | 签约赞助商（转调 SponsorManager） |
| `genYear(y)` | 委托 `Cal` 生成当年赛历 |

#### `Facilities` 对象
- `config` — 四项设施的名称与描述
- `render()` — 渲染设施升级页面
- `upgrade(type)` — 升级指定设施（扣钱、持久化）
- `getEffect(type, level)` — 返回设施在当前等级的效果数值

#### `Cal` 对象
赛程日历，管理全年赛事。

- `genYear(y)` — 按年份生成全年赛历（调用 `HISTORICAL_EVENT_CONFIG` 或现代赛事模板）
- `add(y, mo, d, name, tier, ...)` — 向日历添加一场赛事
- `getParticipants(ev)` — 生成赛事参赛名单（含玩家战队 + AI 战队，按排名过滤）
- `today(dt)` — 返回当天是否有赛事
- `register(id)` — 玩家报名参加赛事
- `boLabel(bo)` — `1/3/5 → "BO1"/"BO3"/"BO5"`
- `calc(y)` — 年末赛历数据清理

#### `HLTV` 对象
- `calc(y)` — 年末计算 HLTV Top 20（按积分排序），渲染弹窗，重置年度数据

**何时修改：** 调整时间推进节奏、修改成本公式、新增设施类型、调整赛程生成规则、修改 HLTV 评分公式时在此文件操作。

---

### `match.js` — BP / 赛事流程 / 比赛回合引擎

**职责：** 游戏的"战斗层"，约 1833 行。这是逻辑最复杂的文件。

#### `BP` 对象
地图 Ban/Pick 流程。

- `start()` — 初始化 BP（读取当前赛事对手、BO 格式、双方地图强度）
- `_availMaps()` — 返回当前可选地图列表
- `_checkAutoStep()` — 检查是否轮到 AI 操作并自动推进
- `_aiStep()` — AI 执行 Ban/Pick（优先 Ban 对方强图，Pick 己方强图）
- `playerClick(map)` — 玩家点击地图（执行 Ban 或 Pick）
- `_finish()` — BP 结束，生成系列赛地图列表，启动 Tour
- `render()` — 渲染 BP 覆盖层（地图格、进度条、双方 Pick 槽）

#### `Tour` 对象
赛事流程管理（括号赛制、轮次推进、奖金分配）。

- `start(ev)` — 开始一场赛事（生成参赛名单、赛程括号）
- `syncRound()` — 同步当前轮次信息到 UI
- `currentBo()` — 返回当前轮次的 BO 格式
- `_initT(p, team)` — 初始化选手回合统计数据
- `_simAI()` — 模拟 AI vs AI 比赛（自动推进所有非玩家对决）
- `_advWin(winner)` — 玩家赢得系列赛后的处理（下一轮 / 捧杯）
- `_advLoss(aiWinner)` — 玩家输掉系列赛后的处理
- `_finalize(champ)` — 赛事收尾（奖金、积分、荣誉、粉丝、赞助商履约）
- `_calculateStandings(champ)` — 计算所有战队的最终名次
- `recordStats(arr, isFinal)` — 记录选手赛事统计（Rating、MVP 候选等）
- `quit()` — 退出当前赛事

#### `Match` 对象
单张地图的回合制比赛引擎，这是整个游戏最核心的计算模块。

**战术状态管理：**
- `setEcon(mode)` — 设置经济策略（auto / force / eco）
- `setStance(mode)` — 设置战术阵型（default / rush / slow / aggro / retake）
- `callTimeout()` — 使用暂停（每场 1 次）

**比赛流程：**
- `beginSeries()` — 开始系列赛（从第一张图启动）
- `_startMap(mapIdx)` — 初始化单张地图比赛状态（阵营、资金、回合计数）
- `round()` — 执行一个回合（完整战术判定 → 结算 → 更新状态）
- `auto()` — 自动模拟剩余所有回合（快进模式）
- `_updateSeriesBar()` — 更新系列赛进度条

**战斗计算（核心算法）：**
- `buyStatus(money, pistol, ot, isPlayerTeam)` — 判断本回合经济状态（Full / Force / Eco / Pistol）
- `_simulateRoundFlow(...)` — 模拟一个回合的战斗过程（含地图风格加权、战术加成、特质触发、Clutch 判定）
- `_micro(players, alive, buy, round, score, isCT, map)` — 微观战斗：逐选手计算战力，触发爆头机器 / 大心脏 / 绝对核心 / 载物领域等特质效果
- `calcTraitMult(p, ctx)` — 汇总单个选手的所有特质加成系数
- `_kill(killer, victim, type, ...)` — 记录一次击杀（更新 ADR、KAST、Impact）
- `_pickPlayerByRole(team, roles)` — 按职位优先级选出 Clutch 选手

**赛后结算：**
- `end()` — 地图结束（Rating 计算、MVP/EVP 评选、天生赢家特质触发、粉丝更新、系列赛推进）
- `renderPostStats(s)` — 渲染赛后数据面板（双方计分板）
- `renderAwards(mvp, evps, champ, rank, prize)` — 渲染赛事颁奖页面

**UI 辅助：**
- `log(msg, type, style)` — 向比赛日志追加一条记录
- `renderTactics(s)` — 渲染战术指挥板（经济决策 + 阵型选择 + 执行按钮）

**何时修改：** 调整战斗公式、新增特质效果、修改赛制逻辑（BO格式、半场交换）、调整经济系统、新增战术选项时在此文件操作。

---

### `ui.js` — 所有 DOM 渲染与页面交互

**职责：** 纯展示层，约 653 行。所有对 `document` 的操作都应在这里。

#### `UI` 对象

**页面路由：**
- `page(id)` — 切换主页面（隐藏其他页，触发对应 `render*` 方法）
- `refresh()` — 刷新当前页面内容（侧边栏状态、当前页重渲染）
- `currentPage` — 记录当前页面 ID

**移动端适配：**
- `toggleSidebar()` / `closeSidebar()` — 侧边栏开关
- `mobNav(id)` — 移动端底部导航跳转

**各页面渲染：**
| 方法 | 对应页面 |
|------|------|
| `renderHome()` | 主页（战队概览、时间控制、赛程预告） |
| `renderRankings()` | 世界排名 |
| `renderCal()` | 赛程日历 |
| `renderHall()` | 荣誉室 |
| `renderSponsors()` | 赞助商管理 |

**选手 / 教练详情：**
- `showPlayer(id)` — 弹出选手生涯弹窗（含 7D 雷达图、历年数据表）
- `showCareer(id)` — 显示教练生涯数据

**转会市场：**
- `renderMarketTimer()` — 渲染市场刷新倒计时

**通用 UI 工具：**
- `showEventTicker(msg)` — 屏幕底部滚动事件提示条（5秒后消失）
- `toast(msg)` — 右下角 Toast 通知（3.5秒后消失）
- `signSponsor(tierName)` — 赞助商签约按钮的 UI 入口（转调 `Game.signSponsor`）

**何时修改：** 新增页面、调整展示逻辑、新增弹窗、修改数据呈现格式时在此文件操作。

---

## 新功能开发指引

> 增加新功能时，请按以下对照表判断代码写在哪里，并在本 README 中同步更新对应章节。

| 功能类型 | 目标文件 |
|------|------|
| 新增数值配置 / 平衡调整 | `constants.js` |
| 新增选手属性或特质 | `constants.js` + `world.js`（生成逻辑） |
| 新增赞助商等级 | `constants.js`（CONFIG.SPONSOR_TIERS） |
| 新增转会市场功能 | `world.js`（Market 对象） |
| 修改存档结构 | `world.js`（SaveManager，记得升级版本号） |
| 新增设施类型 | `core.js`（Facilities 对象） |
| 修改时间推进 / 赛季节奏 | `core.js`（Game.advanceDay / advanceMonth） |
| 新增赛事类型 / 修改赛历 | `core.js`（Cal 对象） + `constants.js`（HISTORICAL_EVENT_CONFIG） |
| 新增战术选项 | `match.js`（Match 战术管理方法） |
| 调整比赛战斗公式 | `match.js`（`_micro` / `calcTraitMult` / `_simulateRoundFlow`） |
| 新增特质效果实现 | `match.js`（`calcTraitMult` + `_micro`） |
| 新增赛后结算逻辑 | `match.js`（`Match.end` / `Tour._finalize`） |
| 新增页面 / DOM 节点 | `index.html` + `ui.js` |
| 新增样式 / 动画 | `style.css` |

---

## 版本历史

| 版本 | 主要变更 |
|------|------|
| v6.0 | 三级特质库架构（常规 / 传奇 / 签名）；HISTORICAL_DATA 深度绑定签名特质；mkRealPlayer 重构；战术指挥板 |
| v5.0 | 七维属性雷达图（sub_pot 潜力圈）；粉丝系统；赞助商系统；设施系统 |
| 当前 | 项目拆分为 7 文件（style.css / constants.js / world.js / core.js / match.js / ui.js） |
| 修复 | **[world.js]** 修复七维属性（hltv）可能超出对应 sub_pot 上限的 bug。根本原因有二：① `mkRealPlayer` 从未生成 `sub_pot`，导致真实历史选手没有任何维度约束；② `generateHLTVProfile` 生成初始属性时对每个维度统一 clamp 到 `[40, 99]`，完全不知道 `sub_pot` 的存在。修复方案：`generateHLTVProfile` 新增可选第三参数 `subPot`，`vary()` 内部改为对每个 key 取 `min(subPot[key], 99)` 作为上限；所有调用点（`mkRealPlayer`、`World.mkP`、`Market.mkP`、`SaveManager` 懒初始化）均改为先生成 `sub_pot` 再传入 `generateHLTVProfile`。 |
| 修复 | **[core.js]** 修复综评潜力（`potential`）与七维潜力（`sub_pot`）均值不一致的问题。根本原因：`Game.init()` 在调用 `World.mkP()` 得到选手后，会用一套独立的 `potBonus` 公式覆写 `p.potential`，但 `sub_pot` 已经在 `mkP()` 内部按旧的 `potential` 生成好了，覆写后两者脱节（例如显示潜力=58，但七维均值=49）。修复：覆写 `p.potential` 后立即重新生成 `p.sub_pot`。同步修复年末老化逻辑：`potential` 每次降 1 后，按等比例缩放所有 `sub_pot` 维度，保证均值始终等于 `potential`。 |
