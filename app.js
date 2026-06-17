/* ============================================================
   丹青坊 DanQing · AI 国画创作与学习
   ============================================================ */

// ===== 状态 =====
let credits = 100;
let cnt = 1, ratio = '3:4', enhanceScale = '2x';
let pkgPrice = 28, pkgCredits = 500;
let trainImgs = [], trainType = '写意';
let nav = [];

// ===== SVG 艺术图库（内嵌，永不加载失败）=====
const ART = {
  // —— 中国画 ——
  gongbi: `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="130" fill="#f3ecd8"/><path d="M0 95 Q30 88 55 96 Q80 104 100 96" stroke="#6b5a3a" stroke-width="1.5" fill="none"/><path d="M55 96 Q60 70 58 45 Q57 30 62 18" stroke="#5a4a2e" stroke-width="2" fill="none"/><circle cx="40" cy="58" r="11" fill="#d96a78"/><circle cx="40" cy="58" r="6" fill="#e88c97"/><circle cx="40" cy="58" r="2.5" fill="#b34050"/><circle cx="62" cy="78" r="8" fill="#e0a0ac"/><circle cx="62" cy="78" r="4" fill="#eebfc8"/><ellipse cx="30" cy="72" rx="9" ry="4" fill="#5a7a45" transform="rotate(-25 30 72)"/><ellipse cx="52" cy="86" rx="8" ry="3.5" fill="#6a8a52" transform="rotate(20 52 86)"/><path d="M68 40 Q78 36 82 44 Q80 52 70 50 Q66 44 68 40Z" fill="#3a3a32"/><circle cx="72" cy="43" r="1.5" fill="#1a1a14"/><path d="M75 47 Q82 50 86 56" stroke="#2a2a22" stroke-width="1" fill="none"/><rect x="80" y="10" width="12" height="12" rx="1.5" fill="#b23a2c"/><text x="86" y="19" text-anchor="middle" font-size="7" fill="#f3ecd8" font-family="serif">丹</text></svg>`,

  shanshui: `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="130" fill="#ece4d2"/><path d="M0 70 Q15 35 35 50 Q45 25 58 42 Q72 20 88 45 Q95 52 100 48 L100 130 L0 130Z" fill="#9aa39a" opacity="0.45"/><path d="M0 88 Q20 60 40 72 Q52 50 66 66 Q82 52 100 70 L100 130 L0 130Z" fill="#5c6960" opacity="0.7"/><path d="M0 105 Q25 85 48 98 Q66 84 100 100 L100 130 L0 130Z" fill="#2f3a34"/><rect x="0" y="84" width="100" height="7" fill="#ece4d2" opacity="0.55"/><rect x="0" y="92" width="62" height="5" fill="#ece4d2" opacity="0.4"/><line x1="22" y1="100" x2="22" y2="112" stroke="#1a201c" stroke-width="1.2"/><path d="M17 100 Q22 90 27 100Z" fill="#1a201c"/><line x1="34" y1="98" x2="34" y2="110" stroke="#1a201c" stroke-width="1.2"/><path d="M29 98 Q34 88 39 98Z" fill="#1a201c"/><circle cx="74" cy="28" r="9" fill="#d98a6a" opacity="0.6"/><rect x="82" y="10" width="11" height="11" rx="1.5" fill="#b23a2c"/></svg>`,

  lotus: `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="130" fill="#eef0e6"/><ellipse cx="35" cy="92" rx="30" ry="11" fill="#4a7a5a" opacity="0.35"/><ellipse cx="68" cy="104" rx="26" ry="9" fill="#3a6a4a" opacity="0.4"/><path d="M50 88 Q50 60 50 40" stroke="#5a7a4a" stroke-width="2" fill="none"/><path d="M50 42 Q40 30 38 18 Q48 24 50 38" fill="#e88ca0"/><path d="M50 42 Q60 30 62 18 Q52 24 50 38" fill="#e07c92"/><path d="M50 40 Q44 26 40 12 Q50 20 51 36" fill="#f0a6b6"/><path d="M50 40 Q56 26 60 12 Q50 20 49 36" fill="#f0a6b6"/><circle cx="50" cy="34" r="4" fill="#f0d860"/><path d="M74 80 Q74 56 74 38" stroke="#5a7a4a" stroke-width="1.5" fill="none"/><path d="M74 40 Q68 30 66 22 Q74 26 75 38" fill="#f0b0bc" opacity="0.85"/><path d="M74 40 Q80 30 82 22 Q74 26 73 38" fill="#f0b0bc" opacity="0.85"/><circle cx="74" cy="36" r="2.5" fill="#e8d060"/><rect x="82" y="11" width="11" height="11" rx="1.5" fill="#b23a2c"/></svg>`,

  shinv: `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="130" fill="#f2ead6"/><ellipse cx="50" cy="118" rx="36" ry="22" fill="#9a3a4a" opacity="0.5"/><path d="M30 118 Q34 80 42 64 Q50 56 58 64 Q66 80 70 118Z" fill="#b85565"/><path d="M36 118 Q40 86 46 72 Q50 68 54 72 Q60 86 64 118Z" fill="#d4828e"/><circle cx="50" cy="46" r="13" fill="#e8c8a0"/><path d="M37 42 Q36 24 50 22 Q64 24 63 42 Q60 30 50 30 Q40 30 37 42Z" fill="#2a221a"/><path d="M44 30 Q50 26 56 30" stroke="#1a140e" stroke-width="1" fill="none"/><circle cx="44" cy="46" r="1.5" fill="#2a1a12"/><circle cx="56" cy="46" r="1.5" fill="#2a1a12"/><path d="M46 54 Q50 56 54 54" stroke="#b25060" stroke-width="1.2" fill="none"/><circle cx="42" cy="18" r="3" fill="#d4a040"/><circle cx="58" cy="18" r="3" fill="#d4a040"/><path d="M62 70 Q78 76 80 96" stroke="#b85565" stroke-width="3" fill="none"/><rect x="82" y="11" width="11" height="11" rx="1.5" fill="#b23a2c"/></svg>`,

  zhu: `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="130" fill="#ede6d4"/><rect x="44" y="14" width="6" height="104" rx="2" fill="#2f4a30"/><rect x="43" y="40" width="8" height="3" fill="#1a2a1a"/><rect x="43" y="68" width="8" height="3" fill="#1a2a1a"/><rect x="43" y="96" width="8" height="3" fill="#1a2a1a"/><path d="M48 44 Q66 38 80 44" stroke="#3a5a3a" stroke-width="2" fill="none"/><path d="M48 72 Q30 66 18 74" stroke="#3a5a3a" stroke-width="2" fill="none"/><path d="M48 30 Q64 26 74 30" stroke="#3a5a3a" stroke-width="1.6" fill="none"/><g fill="#34542f"><path d="M78 44 Q92 40 98 46 Q90 48 78 46Z"/><path d="M76 42 Q90 36 96 40 Q88 42 76 45Z"/><path d="M18 74 Q4 70 0 76 Q10 78 18 76Z"/><path d="M20 72 Q6 66 2 70 Q12 72 20 75Z"/><path d="M74 30 Q88 26 94 30 Q86 32 74 32Z"/></g><rect x="82" y="11" width="11" height="11" rx="1.5" fill="#b23a2c"/></svg>`,

  guozhan: `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="130" fill="#e8e2d2"/><g fill="#3a342c" opacity="0.9"><path d="M30 130 Q26 96 30 76 Q34 66 40 66 Q46 66 50 76 Q54 96 50 130Z"/><circle cx="40" cy="56" r="11"/><path d="M52 130 Q50 100 54 82 Q58 72 64 74 Q70 78 70 96 Q70 114 66 130Z"/><circle cx="62" cy="62" r="9"/></g><g fill="#6a5f4e" opacity="0.7"><path d="M14 130 Q12 104 16 90 Q20 82 25 84 Q30 90 28 130Z"/><circle cx="22" cy="76" r="7"/></g><path d="M36 52 Q40 48 44 52" stroke="#1a140e" stroke-width="1" fill="none"/><rect x="0" y="118" width="100" height="12" fill="#2a241c" opacity="0.5"/><rect x="82" y="11" width="11" height="11" rx="1.5" fill="#b23a2c"/></svg>`,

  ruihe: `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="130" fill="#cfe0ea"/><rect x="0" y="78" width="100" height="52" fill="#b89a6a"/><path d="M0 78 Q50 70 100 78 L100 88 Q50 80 0 88Z" fill="#a8854a"/><path d="M20 84 L26 72 L32 84Z" fill="#7a5a30"/><path d="M40 84 L48 68 L56 84Z" fill="#7a5a30"/><g><ellipse cx="32" cy="40" rx="11" ry="5" fill="#f6f0e2"/><path d="M21 40 Q14 38 10 42" stroke="#f6f0e2" stroke-width="3" fill="none"/><circle cx="42" cy="36" r="4" fill="#f6f0e2"/><circle cx="44" cy="34" r="1.5" fill="#b23a2c"/><path d="M32 45 L30 54 M34 45 L36 54" stroke="#2a2a22" stroke-width="1"/></g><g><ellipse cx="64" cy="52" rx="10" ry="4.5" fill="#f6f0e2"/><path d="M74 52 Q80 50 84 54" stroke="#f6f0e2" stroke-width="3" fill="none"/><circle cx="54" cy="48" r="3.5" fill="#f6f0e2"/><circle cx="52" cy="46" r="1.3" fill="#b23a2c"/></g><circle cx="78" cy="26" r="3" fill="#f6f0e2"/><circle cx="22" cy="22" r="2.5" fill="#f6f0e2"/><rect x="82" y="11" width="11" height="11" rx="1.5" fill="#b23a2c"/></svg>`,

  shufa: `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="130" fill="#f0e8d4"/><g stroke="#1a140e" stroke-linecap="round" fill="none"><path d="M30 24 L70 24" stroke-width="4"/><path d="M50 24 L50 64" stroke-width="4"/><path d="M30 46 Q50 42 70 46" stroke-width="3.5"/><path d="M34 64 Q30 78 22 86" stroke-width="3.5"/><path d="M66 64 Q70 80 80 88" stroke-width="3.5"/><path d="M26 100 L74 100" stroke-width="4"/><path d="M40 100 Q38 112 32 118" stroke-width="3"/><path d="M60 100 Q62 112 68 118" stroke-width="3"/></g><rect x="82" y="108" width="11" height="11" rx="1.5" fill="#b23a2c"/><rect x="8" y="10" width="11" height="11" rx="1.5" fill="#b23a2c"/></svg>`,

  // —— 世界名画 ——
  starry: `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="130" fill="#0c1840"/><path d="M0 22 Q25 8 48 22 Q72 36 100 18" stroke="#234aa0" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M0 40 Q28 24 52 40 Q76 56 100 34" stroke="#2a55b0" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M0 58 Q30 42 56 58 Q82 74 100 52" stroke="#1f4498" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M0 76 Q34 60 60 76 Q86 92 100 70" stroke="#26489c" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="74" cy="26" r="13" fill="#f0d850" opacity="0.4"/><circle cx="74" cy="26" r="8" fill="#fdf0a0"/><circle cx="22" cy="18" r="4" fill="#fdf0a0"/><circle cx="44" cy="12" r="3" fill="#fdf6c0"/><circle cx="90" cy="50" r="3" fill="#fdf0a0"/><rect x="0" y="96" width="100" height="34" fill="#0a1808"/><path d="M8 96 L20 78 L32 96Z" fill="#16301a"/><path d="M58 96 L74 72 L90 96Z" fill="#16301a"/><rect x="40" y="84" width="12" height="12" fill="#16301a"/><path d="M2 96 Q6 64 11 96Z" fill="#081408"/></svg>`,

  monet: `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="130" fill="#2a5a48"/><rect width="100" height="60" fill="#1e4838"/><g opacity="0.85"><ellipse cx="30" cy="44" rx="20" ry="8" fill="#7aa860"/><ellipse cx="70" cy="70" rx="22" ry="9" fill="#6a9852"/><ellipse cx="45" cy="96" rx="24" ry="9" fill="#5a8a48"/><ellipse cx="80" cy="40" rx="16" ry="7" fill="#82b068"/></g><g><ellipse cx="34" cy="42" rx="6" ry="3" fill="#e88ca0"/><ellipse cx="38" cy="44" rx="5" ry="2.5" fill="#f0b0bc"/><ellipse cx="66" cy="68" rx="6" ry="3" fill="#f0a0b0"/><ellipse cx="48" cy="94" rx="5" ry="2.5" fill="#e890a4"/><ellipse cx="78" cy="38" rx="5" ry="2.5" fill="#f4c0cc"/></g><g stroke="#9ac888" stroke-width="2" opacity="0.5"><path d="M10 60 Q20 62 30 60"/><path d="M55 80 Q65 82 75 80"/></g><rect x="82" y="11" width="11" height="11" rx="1.5" fill="#b23a2c"/></svg>`,

  hokusai: `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="130" fill="#dcefff"/><rect width="100" height="58" fill="#c4e2f8"/><path d="M34 78 L60 30 L86 78Z" fill="#f6f0e2"/><path d="M44 78 L60 44 L76 78Z" fill="#e6f2fc"/><path d="M52 56 L60 44 L68 56Z" fill="#fff"/><path d="M0 86 Q14 56 32 80 Q48 102 66 70 Q82 44 100 76 L100 130 L0 130Z" fill="#2266aa"/><path d="M0 96 Q16 70 36 92 Q54 110 72 80 Q88 56 100 90 L100 130 L0 130Z" fill="#1a5599"/><g fill="#fff"><path d="M14 80 Q10 66 18 64 Q22 68 20 76Z"/><path d="M48 78 Q44 62 52 60 Q56 64 54 74Z"/></g><path d="M0 86 Q8 78 18 86" stroke="#fff" stroke-width="2" fill="none"/><path d="M34 80 Q44 72 54 80" stroke="#fff" stroke-width="2" fill="none"/><path d="M56 96 Q68 92 78 96 L76 102 L58 102Z" fill="#5a3a1a"/><rect x="82" y="11" width="11" height="11" rx="1.5" fill="#b23a2c"/></svg>`,

  mona: `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="mg" cx="50%" cy="38%" r="60%"><stop offset="0%" stop-color="#8a7848"/><stop offset="70%" stop-color="#4a3a20"/><stop offset="100%" stop-color="#1a140a"/></radialGradient></defs><rect width="100" height="130" fill="url(#mg)"/><path d="M28 130 Q26 92 38 80 Q50 72 62 80 Q74 92 72 130Z" fill="#2a2014"/><path d="M40 86 Q50 80 60 86 Q58 96 50 98 Q42 96 40 86Z" fill="#6a5234"/><ellipse cx="50" cy="56" rx="17" ry="21" fill="#caa878"/><path d="M33 50 Q34 30 50 28 Q66 30 67 50 Q60 38 50 38 Q40 38 33 50Z" fill="#2a1c10"/><path d="M34 52 Q40 70 50 72 Q60 70 66 52" fill="#caa878"/><ellipse cx="43" cy="54" rx="2.5" ry="1.8" fill="#3a281a"/><ellipse cx="58" cy="54" rx="2.5" ry="1.8" fill="#3a281a"/><path d="M44 64 Q50 67 56 64" stroke="#7a5238" stroke-width="1.3" fill="none"/><path d="M40 48 Q44 46 48 48 M52 48 Q56 46 60 48" stroke="#3a281a" stroke-width="0.8" fill="none"/></svg>`,

  pearl: `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="130" fill="#0e0a06"/><path d="M24 130 Q22 88 40 78 Q50 74 60 78 Q78 88 76 130Z" fill="#1a1208"/><path d="M40 84 Q50 78 60 84 Q56 96 50 98 Q44 96 40 84Z" fill="#caa060"/><ellipse cx="50" cy="54" rx="17" ry="21" fill="#e8c8a0"/><path d="M50 30 Q70 32 70 48 Q70 40 66 50 L62 44 Q58 36 50 36Z" fill="#2a4a8a"/><path d="M50 30 Q34 34 34 52 Q40 40 50 40Z" fill="#d4b020"/><path d="M50 30 Q40 32 36 44" stroke="#b89010" stroke-width="3" fill="none"/><ellipse cx="44" cy="52" rx="2.4" ry="1.8" fill="#3a281a"/><ellipse cx="58" cy="50" rx="2.4" ry="1.8" fill="#3a281a"/><path d="M45 62 Q50 65 56 61" stroke="#a06848" stroke-width="1.3" fill="none"/><circle cx="60" cy="68" r="3.5" fill="#f0ecd8"/><circle cx="59" cy="67" r="1.3" fill="#fff"/><rect x="82" y="11" width="11" height="11" rx="1.5" fill="#b23a2c"/></svg>`,

  sunflower: `<svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="130" fill="#d4c060"/><rect y="92" width="100" height="38" fill="#b09838"/><ellipse cx="48" cy="100" rx="30" ry="16" fill="#c8a848"/><g fill="#e8b820"><circle cx="36" cy="40" r="16"/><circle cx="68" cy="34" r="13"/><circle cx="58" cy="64" r="14"/><circle cx="30" cy="70" r="11"/></g><g fill="#f0d040"><path d="M36 40 m-16 0 a16 16 0 0 1 32 0 z" opacity="0"/></g><g><circle cx="36" cy="40" r="8" fill="#7a4a18"/><circle cx="68" cy="34" r="6.5" fill="#7a4a18"/><circle cx="58" cy="64" r="7" fill="#6a3e14"/><circle cx="30" cy="70" r="5.5" fill="#7a4a18"/></g><g stroke="#d4a818" stroke-width="2"><path d="M36 24 L36 16 M52 40 L60 38 M20 40 L12 42 M36 56 L36 62"/><path d="M68 21 L68 14 M81 34 L88 33"/></g><rect x="82" y="11" width="11" height="11" rx="1.5" fill="#b23a2c"/></svg>`,
};

// 导航图标
const ICON = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/></svg>`,
  create: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/><path d="M14 5l3 3"/></svg>`,
  lib: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5h6v14H4zM14 5h6v14h-6z"/><path d="M7 9h0M17 9h0"/></svg>`,
  draft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>`,
  mine: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>`,
};

const navPages = ['home', 'create', 'library', 'draft', 'mine'];
const titles = { home:'丹青坊', create:'创作', library:'画库', draft:'画稿', mine:'我的', enhance:'画质提升', history:'我的作品' };

// ===== 路由 =====
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  const isNav = navPages.includes(name);
  const brand = document.getElementById('brand');
  const title = document.getElementById('tbTitle');
  const back = document.getElementById('backBtn');
  if (isNav && name === 'home') {
    brand.style.display = 'flex'; title.style.display = 'none'; back.style.display = 'none';
  } else {
    brand.style.display = 'none'; title.style.display = 'block';
    title.textContent = titles[name] || name;
    back.style.display = isNav ? 'none' : 'flex';
  }
  if (!isNav) nav.push(name);
  document.querySelectorAll('.bnav').forEach((el, i) => el.classList.toggle('active', navPages[i] === name));
  if (name === 'history') loadHistory();
  if (name === 'mine') updateMine();
  window.scrollTo(0, 0);
}
function switchNav(n) { showPage(n); }
function goBack() { nav.pop(); showPage(nav.length ? nav[nav.length-1] : 'home'); }

// ===== 创作页 Tab =====
function createTab(el, t) {
  document.querySelectorAll('#page-create .seg').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  ['t2i','i2i','train'].forEach(x => document.getElementById('ct-'+x).style.display = x===t?'block':'none');
}

// ===== 画库页 Tab =====
function libTab(el, t) {
  document.querySelectorAll('#page-library .seg').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  renderLib(t, '全部');
  // 切换子分类
  const chips = { guozhan:['全部','人物','花鸟','山水','书法'], masters:['全部','宋元','明清','近现代'], world:['全部','文艺复兴','印象派','后印象','浮世绘'] };
  const row = document.getElementById('libChips');
  row.innerHTML = chips[t].map((c,i)=>`<span class="chip ${i===0?'active':''}" onclick="libChip(this,'${t}','${c}')">${c}</span>`).join('');
}
function libChip(el, t, c) {
  el.closest('.chip-row').querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
  el.classList.add('active');
  renderLib(t, c);
}

// 画库数据
const LIB = {
  guozhan: [
    { name:'簪花仕女', artist:'国展 · 工笔人物', art:'shinv', cat:'人物', prompt:'工笔仕女，国展风格，唐代簪花仕女，精细描绘，富丽典雅' },
    { name:'盛世繁花', artist:'国展 · 工笔花鸟', art:'gongbi', cat:'花鸟', prompt:'工笔花鸟，国展获奖风格，繁花似锦，鸟雀灵动，精工细作' },
    { name:'万壑松风', artist:'国展 · 写意山水', art:'shanshui', cat:'山水', prompt:'写意山水，国展风格，崇山峻岭，松风流云，雄浑大气' },
    { name:'劳动者', artist:'国展 · 水墨人物', art:'guozhan', cat:'人物', prompt:'国展水墨人物，现实主义，劳动者群像，笔墨厚重，时代气息' },
    { name:'墨竹清风', artist:'国展 · 写意花鸟', art:'zhu', cat:'花鸟', prompt:'写意墨竹，国展风格，竹影婆娑，清风高节，水墨淋漓' },
    { name:'临池学书', artist:'国展 · 书法', art:'shufa', cat:'书法', prompt:'书法作品，国展行楷，笔力遒劲，章法严谨' },
    { name:'荷塘清趣', artist:'国展 · 没骨花鸟', art:'lotus', cat:'花鸟', prompt:'没骨荷花，国展风格，荷塘清趣，色彩雅致' },
    { name:'瑞鹤呈祥', artist:'国展 · 工笔花鸟', art:'ruihe', cat:'花鸟', prompt:'工笔仙鹤，国展风格，瑞鹤呈祥，祥云缭绕，工整富丽' },
  ],
  masters: [
    { name:'溪山行旅图', artist:'范宽 · 北宋', art:'shanshui', cat:'宋元', prompt:'范宽溪山行旅图，北宋全景山水，高远构图，雄强浑厚' },
    { name:'瑞鹤图', artist:'赵佶 · 北宋', art:'ruihe', cat:'宋元', prompt:'宋徽宗瑞鹤图，工笔重彩，群鹤翔空，皇家气象' },
    { name:'墨葡萄', artist:'徐渭 · 明', art:'lotus', cat:'明清', prompt:'徐渭大写意，水墨淋漓，狂放洒脱，文人意趣' },
    { name:'墨竹图', artist:'郑板桥 · 清', art:'zhu', cat:'明清', prompt:'郑板桥墨竹，瘦劲挺拔，清瘦有节，书画一体' },
    { name:'虾趣', artist:'齐白石 · 近现代', art:'lotus', cat:'近现代', prompt:'齐白石写意，水墨虾趣，简练生动，妙趣横生' },
    { name:'奔马图', artist:'徐悲鸿 · 近现代', art:'guozhan', cat:'近现代', prompt:'徐悲鸿奔马，中西结合，笔墨酣畅，骨骼雄健' },
    { name:'簪花仕女图', artist:'周昉 · 唐', art:'shinv', cat:'宋元', prompt:'周昉簪花仕女图，唐代工笔人物，丰腴华贵，线条圆润' },
    { name:'行书帖', artist:'王羲之 · 东晋', art:'shufa', cat:'明清', prompt:'王羲之行书，飘逸俊秀，遒媚劲健，天下行书' },
  ],
  world: [
    { name:'蒙娜丽莎', artist:'达·芬奇 · 文艺复兴', art:'mona', cat:'文艺复兴', prompt:'达芬奇蒙娜丽莎，文艺复兴肖像，神秘微笑，晕涂技法' },
    { name:'戴珍珠耳环的少女', artist:'维米尔 · 巴洛克', art:'pearl', cat:'文艺复兴', prompt:'维米尔戴珍珠耳环少女，黄金分割光影，神秘回眸' },
    { name:'星月夜', artist:'梵·高 · 后印象', art:'starry', cat:'后印象', prompt:'梵高星月夜，旋转笔触，浓烈深蓝，表现主义' },
    { name:'向日葵', artist:'梵·高 · 后印象', art:'sunflower', cat:'后印象', prompt:'梵高向日葵，厚涂笔触，灿烂明黄，生命礼赞' },
    { name:'睡莲', artist:'莫奈 · 印象派', art:'monet', cat:'印象派', prompt:'莫奈睡莲，印象派光色，朦胧水波，柔和笔触' },
    { name:'神奈川冲浪里', artist:'葛饰北斋 · 浮世绘', art:'hokusai', cat:'浮世绘', prompt:'葛饰北斋神奈川冲浪里，浮世绘版画，巨浪富士' },
  ],
};

function renderLib(t, cat) {
  const items = cat==='全部' ? LIB[t] : LIB[t].filter(i=>i.cat===cat);
  document.getElementById('libGrid').innerHTML = items.map(it => {
    const p = it.prompt.replace(/'/g,"\\'");
    return `
    <div class="lib-card" onclick="viewLib('${it.name}','${it.artist}','${it.art}','${p}')">
      <div class="lib-thumb">${ART[it.art]}</div>
      <div class="lib-info">
        <div class="lib-name">${it.name}</div>
        <div class="lib-artist">${it.artist}</div>
        <div class="lib-acts">
          <button class="lib-btn" onclick="event.stopPropagation();viewLib('${it.name}','${it.artist}','${it.art}','${p}')">查看</button>
          <button class="lib-btn primary" onclick="event.stopPropagation();useLib('${p}')">临摹创作</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
let viewPrompt = '';
function viewLib(name, artist, art, prompt) {
  document.getElementById('viewArt').innerHTML = ART[art] || '';
  document.getElementById('viewName').textContent = name;
  document.getElementById('viewArtist').textContent = artist;
  viewPrompt = prompt || '';
  document.getElementById('viewModal').classList.add('show');
}
function closeView() { document.getElementById('viewModal').classList.remove('show'); }
function useFromView() { closeView(); if (viewPrompt) useLib(viewPrompt); }
function useLib(prompt) {
  showPage('create');
  document.querySelectorAll('#page-create .seg')[0].classList.add('active');
  createTab(document.querySelectorAll('#page-create .seg')[0], 't2i');
  document.getElementById('t2i-prompt').value = prompt + '，';
  showToast('已套用，补充细节后生成');
}

// ===== 首页 =====
const HOME_WORKS = [
  { art:'gongbi', name:'盛世繁花', sub:'工笔花鸟', cat:'国画', h:200 },
  { art:'starry', name:'星月夜', sub:'梵高·油画', cat:'油画', h:230 },
  { art:'shanshui', name:'万壑松风', sub:'写意山水', cat:'国画', h:210 },
  { art:'monet', name:'睡莲', sub:'莫奈·印象派', cat:'油画', h:190 },
  { art:'hokusai', name:'神奈川冲浪', sub:'浮世绘版画', cat:'版画', h:200 },
  { art:'shinv', name:'簪花仕女', sub:'工笔人物', cat:'国画', h:230 },
  { art:'pearl', name:'珍珠耳环少女', sub:'维米尔·油画', cat:'油画', h:210 },
  { art:'lotus', name:'荷塘清趣', sub:'没骨花鸟', cat:'国画', h:195 },
  { art:'sunflower', name:'向日葵', sub:'梵高·油画', cat:'油画', h:185 },
  { art:'ruihe', name:'瑞鹤呈祥', sub:'工笔花鸟', cat:'国画', h:215 },
];
function homeTab(el, cat) {
  el.closest('.chip-row').querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  renderHome(cat==='全部'?null:cat);
}
function renderHome(cat) {
  const items = cat ? HOME_WORKS.filter(w=>w.cat===cat) : HOME_WORKS;
  const c1 = document.getElementById('homeCol1'), c2 = document.getElementById('homeCol2');
  c1.innerHTML = ''; c2.innerHTML = '';
  items.forEach((it, i) => {
    const div = document.createElement('div');
    div.className = 'wf-item';
    div.onclick = () => quickUse(it);
    div.innerHTML = `<div class="wf-thumb" style="height:${it.h}px">${ART[it.art]}</div>
      <div class="wf-cap">${it.name} <span class="dot">· ${it.sub}</span></div>`;
    (i%2===0?c1:c2).appendChild(div);
  });
}
function quickUse(it) {
  const m = { '盛世繁花':'工笔花鸟，繁花似锦，精工细作','星月夜':'梵高星月夜风格，旋转笔触','万壑松风':'写意山水，崇山峻岭，雄浑大气','睡莲':'莫奈睡莲，印象派光色','神奈川冲浪':'浮世绘，神奈川冲浪里','簪花仕女':'工笔仕女，唐代簪花，富丽典雅','珍珠耳环少女':'维米尔风格，神秘光影','荷塘清趣':'没骨荷花，荷塘清趣','向日葵':'梵高向日葵，厚涂笔触','瑞鹤呈祥':'工笔仙鹤，瑞鹤呈祥' };
  showPage('create');
  document.getElementById('t2i-prompt').value = (m[it.name]||it.name) + '，';
  showToast('已填入描述，可继续创作');
}

// ===== 文生图 =====
function toggleStyle(el) {
  if (!el.classList.contains('active') && document.querySelectorAll('#ct-t2i .scard.active').length>=5) { showToast('最多选5个风格'); return; }
  el.classList.toggle('active');
}
function selCnt(el, n) {
  el.closest('.opt-btns').querySelectorAll('.opt-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active'); cnt = n;
  const c = {1:80,2:150,3:210,4:280};
  document.getElementById('t2iBtnText').textContent = `生成 · 耗${c[n]}算力`;
}
function selRatio(el, r) {
  el.closest('.opt-btns').querySelectorAll('.opt-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active'); ratio = r;
}
async function genT2I() {
  const prompt = document.getElementById('t2i-prompt').value.trim();
  if (!prompt) { showToast('请输入画面描述'); return; }
  const c = {1:80,2:150,3:210,4:280}; const cost = c[cnt];
  if (credits < cost) { showToast('算力不足'); showRecharge(); return; }
  const styles = [...document.querySelectorAll('#ct-t2i .scard.active')].map(e=>e.dataset.style);
  const btn = document.getElementById('t2iBtn'); btn.disabled = true;
  const box = document.getElementById('t2i-result');
  box.innerHTML = `<div class="result-empty"><div class="spinner" style="margin:0 auto 14px"></div><p>运笔挥毫中…</p><p style="font-size:12px;margin-top:6px;color:#9a8e78">约 10-30 秒</p></div>`;
  try {
    const r = await fetch('/api/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt, style: styles[0]||'', count: cnt }) });
    const d = await r.json();
    if (!r.ok || !d.urls?.length) throw new Error(d.error||'生成失败');
    credits -= cost; updateCredits();
    d.urls.forEach(u => saveHist(u,'文生图',prompt));
    box.innerHTML = `<div class="r-imgs c${d.urls.length}">${d.urls.map(u=>`<div class="r-wrap"><img src="${u}" loading="lazy"><div class="r-acts"><button class="r-btn" onclick="dl('${u}')">下载</button><button class="r-btn" onclick="saveHist('${u}','收藏','${prompt.replace(/'/g,"\\'")}');showToast('已收藏')">收藏</button></div></div>`).join('')}</div>`;
    showToast(`生成成功 · 耗${cost}算力`);
  } catch(e) {
    box.innerHTML = `<div class="result-empty"><p>${e.message}</p><button class="r-btn" style="margin-top:14px;padding:8px 20px;background:#b23a2c;border-color:#b23a2c" onclick="genT2I()">重试</button></div>`;
  }
  btn.disabled = false;
}

// ===== 图生图 =====
function previewI2I(input) {
  if (!input.files[0]) return;
  document.getElementById('i2iPH').style.display='none';
  const p = document.getElementById('i2iPreview'); p.src = URL.createObjectURL(input.files[0]); p.style.display='block';
}
async function genI2I() {
  const f = document.getElementById('i2iInput').files[0];
  if (!f) { showToast('请先上传参考图'); return; }
  const cost = 60;
  if (credits < cost) { showToast('算力不足'); showRecharge(); return; }
  const btn = document.getElementById('i2iBtn'); btn.disabled = true;
  document.getElementById('i2iBtnText').textContent = '生成中…';
  const styles = ['国画','油画','水彩','版画','动漫','写实'];
  const prompt = document.getElementById('i2i-prompt').value.trim();
  const b64 = await toB64(f);
  styles.forEach(s => document.querySelector(`#sp-${s} .sp-img`).innerHTML = `<div class="sp-load"><div class="spinner" style="width:20px;height:20px;border-width:2px"></div><span>生成中</span></div>`);
  const res = await Promise.allSettled(styles.map(style => fetch('/api/img2img',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageBase64:b64,prompt,style})}).then(r=>r.json())));
  credits -= cost; updateCredits();
  let ok=0;
  res.forEach((rr,i)=>{ const box=document.querySelector(`#sp-${styles[i]} .sp-img`); if(rr.status==='fulfilled'&&rr.value?.url){const u=rr.value.url;box.innerHTML=`<img src="${u}" loading="lazy" onclick="dl('${u}')">`;saveHist(u,`图生图·${styles[i]}`,prompt);ok++;}else{box.innerHTML=`<div class="sp-ph" style="color:#b23a2c">失败</div>`;} });
  btn.disabled=false; document.getElementById('i2iBtnText').textContent='一键生成六种风格 · 耗60算力';
  showToast(`完成 ${ok}/6 种风格`);
}

// ===== 训练 =====
function selTrainType(el, t) {
  el.closest('.train-types').querySelectorAll('.ttype').forEach(x=>x.classList.remove('active'));
  el.classList.add('active'); trainType = t;
}
function addTrain(input) {
  const files = Array.from(input.files).slice(0, 100-trainImgs.length);
  trainImgs.push(...files);
  document.getElementById('trainCount').textContent = `（${trainImgs.length}/100）`;
  const grid = document.getElementById('trainGrid');
  files.forEach(f=>{ const img=document.createElement('img'); img.className='train-thumb'; img.src=URL.createObjectURL(f); grid.insertBefore(img, grid.firstChild); });
  showToast(`已添加${files.length}张，共${trainImgs.length}张`);
}
function startTrain() {
  if (trainImgs.length<10) { showToast('请至少上传10张图片'); return; }
  if (credits<3000) { showToast('算力不足3000'); showRecharge(); return; }
  showToast(`「${trainType}」模型训练排队中，完成后通知您`);
}

// ===== 画稿 =====
function previewDraft(input) {
  if (!input.files[0]) return;
  document.getElementById('draftPH').style.display='none';
  const p=document.getElementById('draftPreview'); p.src=URL.createObjectURL(input.files[0]); p.style.display='block';
}
async function genDrafts() {
  const f = document.getElementById('draftInput').files[0];
  if (!f) { showToast('请先上传一幅作品'); return; }
  const cost = 90;
  if (credits<cost) { showToast('算力不足'); showRecharge(); return; }
  const btn = document.getElementById('draftBtn'); btn.disabled=true;
  const b64 = await toB64(f);
  const modes = [['line','线描稿'],['value','黑白灰稿'],['color','色彩稿']];
  modes.forEach(m=>document.getElementById('draft-'+m[0]).innerHTML=`<div class="spinner" style="width:22px;height:22px;border-width:2px"></div>`);
  const res = await Promise.allSettled(modes.map(m=>fetch('/api/draft',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageBase64:b64,mode:m[0]})}).then(r=>r.json())));
  credits-=cost; updateCredits();
  let ok=0;
  res.forEach((rr,i)=>{ const box=document.getElementById('draft-'+modes[i][0]); if(rr.status==='fulfilled'&&rr.value?.url){const u=rr.value.url;box.innerHTML=`<img src="${u}" onclick="dl('${u}')">`;saveHist(u,modes[i][1],'');ok++;}else{box.innerHTML=`<span class="sp-ph" style="color:#b23a2c">失败</span>`;} });
  btn.disabled=false;
  showToast(`画稿拆解完成 ${ok}/3`);
}

// ===== 画质提升 =====
function previewEnh(input) { if(!input.files[0])return; document.getElementById('enhPH').style.display='none'; const p=document.getElementById('enhPreview'); p.src=URL.createObjectURL(input.files[0]); p.style.display='block'; }
function selEnh(el, s) { el.closest('.opt-btns').querySelectorAll('.opt-btn').forEach(b=>b.classList.remove('active')); el.classList.add('active'); enhanceScale=s; }
async function genEnh() {
  const f=document.getElementById('enhInput').files[0];
  if(!f){showToast('请先上传图片');return;}
  const cost=30; if(credits<cost){showToast('算力不足');showRecharge();return;}
  const btn=document.getElementById('enhBtn'); btn.disabled=true;
  const box=document.getElementById('enh-result');
  box.innerHTML=`<div class="result-empty"><div class="spinner" style="margin:0 auto 14px"></div><p>提升画质中…</p></div>`;
  try {
    const b64=await toB64(f);
    const r=await fetch('/api/enhance',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageBase64:b64,scale:enhanceScale})});
    const d=await r.json(); if(!r.ok||!d.url)throw new Error(d.error||'提升失败');
    credits-=cost; updateCredits(); saveHist(d.url,'画质提升','');
    box.innerHTML=`<div class="r-imgs c1"><div class="r-wrap"><img src="${d.url}"><div class="r-acts"><button class="r-btn" onclick="dl('${d.url}')">下载</button></div></div></div>`;
    showToast(`提升完成 · 耗${cost}算力`);
  } catch(e){ box.innerHTML=`<div class="result-empty"><p>${e.message}</p></div>`; }
  btn.disabled=false;
}

// ===== 历史 =====
function saveHist(url,type,prompt) { const h=JSON.parse(localStorage.getItem('dqHist')||'[]'); h.unshift({url,type,prompt:prompt||'',time:Date.now()}); if(h.length>200)h.pop(); localStorage.setItem('dqHist',JSON.stringify(h)); }
function loadHistory() {
  const h=JSON.parse(localStorage.getItem('dqHist')||'[]');
  document.getElementById('histCount').textContent=h.length;
  const c1=document.getElementById('histC1'),c2=document.getElementById('histC2'),e=document.getElementById('histEmpty');
  c1.innerHTML='';c2.innerHTML='';
  if(!h.length){e.style.display='block';return;} e.style.display='none';
  h.forEach((it,i)=>{ const d=document.createElement('div'); d.className='wf-item'; d.onclick=()=>dl(it.url); d.innerHTML=`<div class="wf-thumb"><img src="${it.url}" loading="lazy"></div><div class="wf-cap">${it.type} <span class="dot">· ${new Date(it.time).toLocaleDateString()}</span></div>`; (i%2===0?c1:c2).appendChild(d); });
}
function clearHist() { if(!confirm('确定清空全部作品记录？'))return; localStorage.removeItem('dqHist'); loadHistory(); showToast('已清空'); }

// ===== 我的 =====
function updateMine() { document.getElementById('statCredits').textContent=credits; const h=JSON.parse(localStorage.getItem('dqHist')||'[]'); document.getElementById('statWorks').textContent=h.length; }

// ===== 充值 =====
function showRecharge(){ document.getElementById('modalCredits').textContent=credits; document.getElementById('rechargeModal').classList.add('show'); }
function hideRecharge(){ document.getElementById('rechargeModal').classList.remove('show'); }
function selPkg(el,p,c){ document.querySelectorAll('.rg').forEach(i=>i.classList.remove('selected')); el.classList.add('selected'); pkgPrice=p;pkgCredits=c; document.getElementById('payBtn').textContent=`立即支付 ¥${p}`; }
function mockPay(){ showToast('支付接入中，敬请期待'); }

// ===== 工具 =====
function updateCredits(){ document.getElementById('userCredits').textContent=credits; const m=document.getElementById('modalCredits'); if(m)m.textContent=credits; }
function dl(url){ const a=document.createElement('a'); a.href=url; a.download=`danqing-${Date.now()}.jpg`; a.target='_blank'; a.click(); showToast('开始下载'); }
function toB64(file){ return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);}); }
function showToast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2800); }

// 横向风格画廊数据
const ART_SCROLL = [
  { art:'gongbi', name:'工笔花鸟', sub:'精勾细染', prompt:'工笔花鸟，繁花似锦，精工细作，富丽典雅' },
  { art:'shanshui', name:'写意山水', sub:'气势雄浑', prompt:'写意山水，崇山峻岭，松风流云，雄浑大气' },
  { art:'shinv', name:'工笔仕女', sub:'富丽典雅', prompt:'工笔仕女，唐代簪花，线条圆润，富丽典雅' },
  { art:'starry', name:'梵高油画', sub:'表现主义', prompt:'梵高星月夜风格，旋转笔触，浓烈深蓝' },
  { art:'hokusai', name:'浮世绘', sub:'东瀛版画', prompt:'浮世绘，神奈川冲浪里，葛饰北斋风格' },
  { art:'monet', name:'印象睡莲', sub:'光色朦胧', prompt:'莫奈睡莲，印象派光色，柔和笔触' },
  { art:'zhu', name:'墨竹文人', sub:'清瘦有节', prompt:'写意墨竹，竹影婆娑，清风高节，水墨淋漓' },
];

// 风格卡缩略图（创作页）
const STYLE_THUMBS = ['shinv','gongbi','shanshui','lotus','zhu','guozhan','ruihe','shufa'];

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  // 导航图标
  document.querySelectorAll('.bnav').forEach(el => { el.querySelector('.bnav-svg').innerHTML = ICON[el.dataset.icon]; });
  // 横向风格画廊
  document.getElementById('artScroll').innerHTML = ART_SCROLL.map(a => `
    <div class="art-card" onclick="useLib('${a.prompt.replace(/'/g,"\\'")}')">
      <div class="art-thumb">${ART[a.art]}</div>
      <div class="art-meta"><div class="art-name">${a.name}</div><div class="art-sub">${a.sub}</div></div>
    </div>`).join('');
  // 创作页风格卡缩略图
  STYLE_THUMBS.forEach((k,i) => { const el = document.getElementById('st'+(i+1)); if(el) el.innerHTML = ART[k]; });
  renderHome(null);
  renderLib('guozhan','全部');
});
