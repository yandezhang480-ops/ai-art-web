// ===== 状态 =====
let userCredits = 100;
let selectedCount = 1;
let selectedSize = '1:1';
let selectedEnhanceScale = '2x';
let selectedPkgPrice = 28;
let selectedPkgCredits = 500;
let trainImages = [];
let pageHistory = [];

const navPages = ['home', 'text2img', 'train', 'img2img', 'mine'];
const pageTitles = {
  home: '墨韵AI', text2img: '文生图', img2img: '图生图',
  train: '模型训练', enhance: '画质提升', gallery: '风格广场',
  history: '历史记录', mine: '我的'
};

// ===== 页面路由 =====
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');

  const isNav = navPages.includes(name);
  const logo = document.getElementById('topbarLogo');
  const title = document.getElementById('topbarTitle');
  const back = document.getElementById('backBtn');

  if (isNav && name === 'home') {
    logo.style.display = '';
    title.style.display = 'none';
    back.style.display = 'none';
  } else {
    logo.style.display = 'none';
    title.style.display = '';
    title.textContent = pageTitles[name] || name;
    back.style.display = isNav ? 'none' : 'flex';
  }

  if (!isNav) pageHistory.push(name);

  document.querySelectorAll('.bnav-item').forEach((el, i) => {
    el.classList.toggle('active', navPages[i] === name);
  });

  if (name === 'history') loadHistory();
  if (name === 'mine') updateMineStats();
  if (name === 'gallery') renderGallery(null);
  if (name === 'home') renderHomeWaterfall(null);
  window.scrollTo(0, 0);
}

function switchNav(el, name) { showPage(name); }

function goBack() {
  pageHistory.pop();
  const prev = pageHistory.length > 0 ? pageHistory[pageHistory.length - 1] : 'home';
  showPage(prev);
}

// ===== 首页数据 =====
const homeWorks = [
  { bg: 'ink-crane',    label: '工笔花鸟',   sub: '宋代国画风',  cat: '国画',  prompt: '宋代工笔花鸟，精细笔触，牡丹凤凰，华贵典雅', h: 180 },
  { bg: 'monet-lily',   label: '睡莲意境',   sub: '印象派油画',  cat: '油画',  prompt: '印象派油画，莫奈睡莲，光影斑驳，色彩柔和', h: 150 },
  { bg: 'mountain-ink', label: '溪山行旅',   sub: '水墨山水',    cat: '国画',  prompt: '水墨山水，范宽风格，高山流水，意境深远', h: 160 },
  { bg: 'starry',       label: '星夜',       sub: '梵高风格',    cat: '油画',  prompt: '梵高星空风格，旋转笔触，浓烈色彩，表现主义', h: 200 },
  { bg: 'wave-hokusai', label: '神奈川冲浪', sub: '浮世绘版画',  cat: '版画',  prompt: '日式浮世绘，神奈川冲浪里，葛饰北斋风格', h: 130 },
  { bg: 'lady-painting',label: '捣练图',     sub: '唐代仕女',    cat: '国画',  prompt: '唐代工笔仕女图，宫廷美人，华美服饰', h: 170 },
  { bg: 'pearl-girl',   label: '珍珠耳环',   sub: '维米尔光影',  cat: '油画',  prompt: '维米尔风格，窗边光线，珍珠耳环少女，古典油画', h: 190 },
  { bg: 'sunflower',    label: '向日葵',     sub: '梵高厚涂',    cat: '油画',  prompt: '梵高向日葵，厚涂油画笔触，金黄色调，生命力', h: 145 },
  { bg: 'wave-hokusai', label: '红富士',     sub: '葛饰北斋',    cat: '版画',  prompt: '浮世绘，红富士山，晴天版画，日式风格', h: 140 },
  { bg: 'monet-lily',   label: '水彩荷花',   sub: '水彩晕染',    cat: '水彩',  prompt: '水彩荷花，晕染效果，清新淡雅，夏日意境', h: 165 },
];

function switchHomeTab(el, cat) {
  el.closest('.style-tabs').querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderHomeWaterfall(cat === '全部' ? null : cat);
}

function renderHomeWaterfall(cat) {
  const items = cat ? homeWorks.filter(w => w.cat === cat) : homeWorks;
  const col1 = document.getElementById('homeCol1');
  const col2 = document.getElementById('homeCol2');
  col1.innerHTML = '';
  col2.innerHTML = '';
  items.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'wf-item';
    div.onclick = () => applyStyleHome(item.prompt);
    div.innerHTML = `
      <div class="wf-art-bg ${item.bg}" style="height:${item.h}px"></div>
      <div class="wf-label">${item.label} · <span style="color:var(--text3)">${item.sub}</span></div>`;
    (i % 2 === 0 ? col1 : col2).appendChild(div);
  });
}

function applyStyleHome(prompt) {
  showPage('text2img');
  document.getElementById('t2i-prompt').value = prompt + '，';
  showToast('已填入描述，可继续补充后点生成');
}

// ===== 风格广场数据 =====
const galleryItems = [
  // 国画
  { name: '清明上河图', bg: 'a-qingming', cat: '国画', prompt: '清明上河图风格，宋代工笔画，热闹街市，古典建筑精细描绘' },
  { name: '溪山行旅',   bg: 'a-shanshui', cat: '国画', prompt: '范宽溪山行旅，水墨山水，高山耸立，云雾缭绕，宋代风格' },
  { name: '工笔花鸟',   bg: 'a-huaniao',  cat: '国画', prompt: '宋徽宗工笔花鸟，精细笔触，牡丹锦鸡，华丽典雅' },
  { name: '仕女写意',   bg: 'a-nv',       cat: '国画', prompt: '唐代仕女图，工笔人物，宫廷美人，华美服饰，精细描绘' },
  { name: '泼墨荷花',   bg: 'a-hehua',    cat: '国画', prompt: '水墨荷花，泼墨写意，荷叶田田，夏日意境，清新脱俗' },
  { name: '墨竹文人',   bg: 'a-zhu',      cat: '国画', prompt: '国画墨竹，文人画风格，竹节挺拔，高洁品性，写意笔法' },
  { name: '瑞鹤图',     bg: 'a-ruihe',    cat: '国画', prompt: '宋徽宗瑞鹤图，祥云缭绕，白鹤翔集，工笔精细，皇家气派' },
  // 油画
  { name: '睡莲·莫奈',  bg: 'a-monet',    cat: '油画', prompt: '莫奈睡莲，印象派油画，光影斑驳，色彩柔和，池塘倒影' },
  { name: '星夜·梵高',  bg: 'a-vangogh',  cat: '油画', prompt: '梵高星夜，旋转笔触，浓烈色彩，表现主义，夜空与村庄' },
  { name: '蒙娜丽莎',   bg: 'a-mona',     cat: '油画', prompt: '达芬奇风格，文艺复兴油画，神秘微笑，古典肖像，精细写实' },
  { name: '珍珠耳环',   bg: 'a-zhenzhu',  cat: '油画', prompt: '维米尔风格，巴洛克油画，窗边光线，珍珠耳环，神秘光影' },
  { name: '向日葵',     bg: 'a-xiangri',  cat: '油画', prompt: '梵高向日葵，厚涂油画，金黄色调，饱满生命力，强烈质感' },
  { name: '西斯廷圣母', bg: 'a-shengmu',  cat: '油画', prompt: '拉斐尔文艺复兴，圣母像，古典构图，圣洁光辉，宗教题材' },
  // 版画
  { name: '神奈川冲浪', bg: 'a-hokusai',  cat: '版画', prompt: '葛饰北斋神奈川冲浪里，浮世绘版画，巨浪壮阔，富士山背景' },
  { name: '红富士',     bg: 'a-fuji',     cat: '版画', prompt: '葛饰北斋红富士，浮世绘，晴天富士山，红色光辉，日式版画' },
  { name: '穆夏装饰',   bg: 'a-mucha',    cat: '版画', prompt: '穆夏新艺术运动，装饰海报，唯美女性，植物纹样，金色线条' },
  { name: '民国海报',   bg: 'a-minguo',   cat: '版画', prompt: '民国风格月份牌，旗袍美人，复古海报，华丽装饰，年代感' },
  { name: '浮世绘美人', bg: 'a-meiren',   cat: '版画', prompt: '歌川国芳浮世绘，美人图，细腻线条，古典服饰，日式风格' },
  // 水彩
  { name: '水彩风景',   bg: 'a-shuicai-jing', cat: '水彩', prompt: '欧洲水彩风景，帆船海港，通透淡雅，晴天阳光，温馨氛围' },
  { name: '水彩花卉',   bg: 'a-shuicai-hua',  cat: '水彩', prompt: '水彩玫瑰牡丹，柔和晕染，花瓣细腻，少女感，粉紫色调' },
  { name: '水彩人像',   bg: 'a-shuicai-ren',  cat: '水彩', prompt: '水彩人像，晕染效果，半抽象艺术风格，灵动笔触' },
  { name: '城市速写',   bg: 'a-richeng',      cat: '水彩', prompt: '水彩城市速写，欧洲建筑，线稿加晕染，旅行日记风格' },
  // 综合
  { name: '赛博朋克',   bg: 'a-saibo',    cat: '综合', prompt: '赛博朋克未来城市，霓虹灯光，雨夜反射，高楼林立，科幻感' },
  { name: '奇幻精灵',   bg: 'a-qingling', cat: '综合', prompt: '奇幻森林，精灵世界，发光蘑菇，梦幻光效，魔法氛围' },
  { name: '极简抽象',   bg: 'a-jixian',   cat: '综合', prompt: '极简主义几何抽象，莫兰迪色调，高级感，现代设计风格' },
  { name: '国潮插画',   bg: 'a-guochao',  cat: '综合', prompt: '中国风国潮插画，龙凤图腾，金红配色，传统纹样，现代感' },
  { name: '洛可可宫廷', bg: 'a-luoke',    cat: '综合', prompt: '洛可可宫廷风格，奢华装饰，粉金配色，精美花纹，法式优雅' },
  { name: '蒸汽朋克',   bg: 'a-zhengqi',  cat: '综合', prompt: '蒸汽朋克机械，齿轮管道，维多利亚工业风，铜金色调' },
];

function filterGallery(el, cat) {
  document.querySelectorAll('#galleryTabs .stab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderGallery(cat === '全部' ? null : cat);
}

function renderGallery(cat) {
  const items = cat ? galleryItems.filter(i => i.cat === cat) : galleryItems;
  document.getElementById('galleryGrid').innerHTML = items.map(item => `
    <div class="gc2" onclick="applyStyle('${item.prompt.replace(/'/g,"\\'")}','${item.cat}')">
      <div class="gc2-art ${item.bg}"></div>
      <div class="gc2-info">
        <div class="gc2-name">${item.name}</div>
        <div class="gc2-tag">${item.cat}</div>
        <button class="gc2-btn">立即使用</button>
      </div>
    </div>`).join('');
}

function applyStyle(prompt, cat) {
  showPage('text2img');
  document.getElementById('t2i-prompt').value = prompt + '，';
  showToast('已套用风格，补充细节后生成');
}

// ===== 文生图 =====
function toggleStyleCard(el) {
  const isActive = el.classList.contains('active');
  if (!isActive && document.querySelectorAll('.style-card-s.active').length >= 5) {
    showToast('最多同时选择5个风格'); return;
  }
  el.classList.toggle('active');
}

function selectCount(el, n) {
  el.closest('.count-btns').querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  selectedCount = n;
  const costs = { 1: 80, 2: 150, 3: 210, 4: 280 };
  document.getElementById('t2i-btn-text').textContent = `⚡ AI 生成（${costs[n]}算力）`;
}

function selectSize(el, size) {
  el.closest('.size-btns').querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  selectedSize = size;
}

async function generateT2I() {
  const prompt = document.getElementById('t2i-prompt').value.trim();
  if (!prompt) { showToast('请先输入画面描述'); return; }
  const costs = { 1: 80, 2: 150, 3: 210, 4: 280 };
  const cost = costs[selectedCount] || 80;
  if (userCredits < cost) { showToast('算力不足，请先充值'); showRecharge(); return; }

  const styles = [...document.querySelectorAll('.style-card-s.active')].map(el => el.dataset.style);
  const styleText = styles[0] || '';

  const btn = document.querySelector('#page-text2img .action-btn-main');
  btn.disabled = true;

  const resultBox = document.getElementById('t2i-result');
  resultBox.innerHTML = `<div class="result-empty">
    <div class="spinner" style="margin:0 auto 16px"></div>
    <p style="color:#888;font-size:14px">AI 正在创作中…</p>
    <p style="color:#555;font-size:12px;margin-top:6px">预计 10-30 秒</p>
  </div>`;

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, style: styleText, count: selectedCount }),
    });
    const data = await res.json();
    if (!res.ok || !data.urls?.length) throw new Error(data.error || '生成失败，请重试');

    userCredits -= cost;
    updateCredits();
    data.urls.forEach(url => saveHistory(url, '文生图', prompt));

    resultBox.innerHTML = `<div class="result-images c${data.urls.length}">
      ${data.urls.map(url => `
        <div class="ri-wrap">
          <img src="${url}" alt="AI生成作品" loading="lazy">
          <div class="ri-actions">
            <button class="ri-btn" onclick="downloadImg('${url}')">⬇ 下载</button>
            <button class="ri-btn" onclick="saveHistory('${url}','收藏','${prompt.replace(/'/g,"\\'")}');showToast('已收藏')">★ 收藏</button>
          </div>
        </div>`).join('')}
    </div>`;
    showToast(`🎉 生成成功！消耗 ${cost} 算力`);
  } catch (err) {
    resultBox.innerHTML = `<div class="result-empty"><div class="re-icon">⚠️</div><p style="color:#888">${err.message}</p><button class="ri-btn" style="margin-top:16px;padding:8px 20px" onclick="generateT2I()">重新生成</button></div>`;
  }
  btn.disabled = false;
  document.getElementById('t2i-btn-text').textContent = `⚡ AI 生成（${costs[selectedCount]}算力）`;
}

// ===== 图生图 =====
function previewUpload(input) {
  if (!input.files[0]) return;
  document.getElementById('uploadPH').style.display = 'none';
  const p = document.getElementById('uploadPreview');
  p.src = URL.createObjectURL(input.files[0]);
  p.style.display = 'block';
}

async function generateI2IAll() {
  const file = document.getElementById('imgInput').files[0];
  if (!file) { showToast('请先上传参考图片'); return; }
  const cost = 60;
  if (userCredits < cost) { showToast('算力不足，请先充值'); showRecharge(); return; }

  const btn = document.querySelector('#page-img2img .action-btn-main');
  btn.disabled = true;
  document.getElementById('i2i-btn-text').textContent = '生成中，请稍候…';

  const styles = ['国画', '油画', '水彩', '版画', '动漫', '写实'];
  const prompt = document.getElementById('i2i-prompt').value.trim();
  const imageBase64 = await toBase64(file);

  styles.forEach(s => {
    document.querySelector(`#sp-${s} .sp-img`).innerHTML =
      `<div class="sp-loading"><div class="spinner" style="width:22px;height:22px;border-width:2px"></div><span>生成中</span></div>`;
  });

  const results = await Promise.allSettled(
    styles.map(style => fetch('/api/img2img', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, prompt, style }),
    }).then(r => r.json()))
  );

  userCredits -= cost;
  updateCredits();

  let ok = 0;
  results.forEach((res, i) => {
    const box = document.querySelector(`#sp-${styles[i]} .sp-img`);
    if (res.status === 'fulfilled' && res.value?.url) {
      const url = res.value.url;
      box.innerHTML = `<img src="${url}" alt="${styles[i]}" loading="lazy" onclick="downloadImg('${url}')">`;
      saveHistory(url, `图生图·${styles[i]}`, prompt);
      ok++;
    } else {
      box.innerHTML = `<div class="sp-ph" style="color:#c0392b">生成失败</div>`;
    }
  });

  btn.disabled = false;
  document.getElementById('i2i-btn-text').textContent = '🎨 一键生成全部风格（60算力）';
  showToast(`完成！成功 ${ok}/6 种风格`);
}

// ===== 画质提升 =====
function previewEnhance(input) {
  if (!input.files[0]) return;
  document.getElementById('enhancePH').style.display = 'none';
  const p = document.getElementById('enhancePreview');
  p.src = URL.createObjectURL(input.files[0]);
  p.style.display = 'block';
}

function selectEnhance(el, scale) {
  el.closest('.count-btns').querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  selectedEnhanceScale = scale;
}

async function generateEnhance() {
  const file = document.getElementById('enhanceInput').files[0];
  if (!file) { showToast('请先上传图片'); return; }
  const cost = 30;
  if (userCredits < cost) { showToast('算力不足，请先充值'); showRecharge(); return; }

  const btn = document.querySelector('#page-enhance .action-btn-main');
  btn.disabled = true;
  const resultBox = document.getElementById('enhance-result');
  resultBox.innerHTML = `<div class="result-empty"><div class="spinner" style="margin:0 auto 16px"></div><p style="color:#888">AI 正在提升画质…</p></div>`;

  try {
    const imageBase64 = await toBase64(file);
    const res = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, scale: selectedEnhanceScale }),
    });
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.error || '提升失败');

    userCredits -= cost;
    updateCredits();
    saveHistory(data.url, '画质提升', '');

    resultBox.innerHTML = `<div class="result-images c1">
      <div class="ri-wrap">
        <img src="${data.url}" alt="提升结果" loading="lazy">
        <div class="ri-actions">
          <button class="ri-btn" onclick="downloadImg('${data.url}')">⬇ 下载</button>
        </div>
      </div>
    </div>`;
    showToast(`✨ 提升完成！消耗 ${cost} 算力`);
  } catch (err) {
    resultBox.innerHTML = `<div class="result-empty"><div class="re-icon">⚠️</div><p style="color:#888">${err.message}</p></div>`;
  }
  btn.disabled = false;
}

// ===== 模型训练 =====
function addTrainImages(input) {
  const files = Array.from(input.files);
  const toAdd = files.slice(0, 100 - trainImages.length);
  trainImages.push(...toAdd);
  document.getElementById('trainCount').textContent = `（${trainImages.length}/100）`;
  const grid = document.getElementById('trainGrid');
  toAdd.forEach(f => {
    const img = document.createElement('img');
    img.className = 'train-thumb';
    img.src = URL.createObjectURL(f);
    grid.insertBefore(img, grid.firstChild);
  });
  showToast(`已添加 ${toAdd.length} 张，共 ${trainImages.length} 张`);
}

function startTraining() {
  if (trainImages.length < 10) { showToast('请至少上传10张图片'); return; }
  if (userCredits < 3000) { showToast('算力不足3000，请先充值'); showRecharge(); return; }
  showToast('训练功能开发中，敬请期待');
}

function showModelPicker() { showToast('模型选择功能开发中'); }

// ===== 历史记录 =====
function saveHistory(url, type, prompt) {
  const hist = JSON.parse(localStorage.getItem('aiHistory') || '[]');
  hist.unshift({ url, type, prompt: prompt || '', time: Date.now() });
  if (hist.length > 200) hist.pop();
  localStorage.setItem('aiHistory', JSON.stringify(hist));
}

function loadHistory() {
  const hist = JSON.parse(localStorage.getItem('aiHistory') || '[]');
  document.getElementById('historyCount').textContent = hist.length;
  const col1 = document.getElementById('histCol1');
  const col2 = document.getElementById('histCol2');
  const empty = document.getElementById('historyEmpty');
  col1.innerHTML = '';
  col2.innerHTML = '';

  if (!hist.length) { empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  hist.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'wf-item';
    div.innerHTML = `<img src="${item.url}" alt="${item.type}" loading="lazy" style="width:100%;display:block">
      <div class="wf-label">${item.type} · ${new Date(item.time).toLocaleDateString()}</div>`;
    div.onclick = () => downloadImg(item.url);
    (i % 2 === 0 ? col1 : col2).appendChild(div);
  });
}

function clearHistory() {
  if (!confirm('确定清空全部历史记录？')) return;
  localStorage.removeItem('aiHistory');
  loadHistory();
  showToast('已清空');
}

// ===== 我的 =====
function updateMineStats() {
  document.getElementById('statCredits').textContent = userCredits;
  const hist = JSON.parse(localStorage.getItem('aiHistory') || '[]');
  document.getElementById('statCount').textContent = hist.length;
}

// ===== 充值 =====
function showRecharge() {
  document.getElementById('modalCredits').textContent = userCredits;
  document.getElementById('rechargeModal').classList.add('show');
}
function hideRecharge() {
  document.getElementById('rechargeModal').classList.remove('show');
}
function selectPkg(el, price, credits) {
  document.querySelectorAll('.rg-item').forEach(i => i.classList.remove('selected'));
  el.classList.add('selected');
  selectedPkgPrice = price;
  selectedPkgCredits = credits;
  document.getElementById('payBtn').textContent = `立即支付 ¥${price}`;
}
function mockPay() { showToast('支付功能接入中，敬请期待'); }

// ===== 工具 =====
function updateCredits() {
  document.getElementById('userCredits').textContent = userCredits;
  const mc = document.getElementById('modalCredits');
  if (mc) mc.textContent = userCredits;
}

function downloadImg(url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = `moyun-${Date.now()}.jpg`;
  a.target = '_blank';
  a.click();
  showToast('开始下载');
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2800);
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  renderHomeWaterfall(null);
  renderGallery(null);
});
