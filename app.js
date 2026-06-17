let userCredits = 100;
let selectedCount = 1;
let selectedSize = '1:1';
let selectedEnhanceScale = '2x';
let selectedPkgPrice = 28;
let selectedPkgCredits = 500;
let trainImages = [];
let pageHistory = [];
let advancedSettings = { negativePrompt: '', steps: 20, seed: -1 };

const pageTitles = {
  home: '首页', text2img: '文生图', img2img: '图生图',
  train: '模型训练', enhance: '画质提升', gallery: '风格广场',
  history: '历史记录', mine: '我的'
};

const navPages = ['home', 'text2img', 'train', 'img2img', 'mine'];

// ===== 页面切换 =====
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.getElementById('topbarTitle').textContent = pageTitles[name] || name;

  const isNav = navPages.includes(name);
  document.getElementById('backBtn').style.display = isNav ? 'none' : 'block';
  if (!isNav) pageHistory.push(name);

  document.querySelectorAll('.bnav-item').forEach((el, i) => {
    el.classList.toggle('active', navPages[i] === name);
  });

  if (name === 'history') loadHistory();
  if (name === 'mine') updateMineStats();
  window.scrollTo(0, 0);
}

function switchNav(el, name) { showPage(name); }

function goBack() {
  if (pageHistory.length > 0) {
    pageHistory.pop();
    const prev = pageHistory.length > 0 ? pageHistory[pageHistory.length - 1] : 'home';
    if (!navPages.includes(prev)) pageHistory.pop();
    showPage(prev || 'home');
  } else {
    showPage('home');
  }
}

// ===== 首页 =====
const galleryData = [
  { seed: 'w1', label: '水墨荷花', category: '国画', prompt: '荷花池，水墨国画风格，意境清幽' },
  { seed: 'w2', label: '印象油画', category: '油画', prompt: '田野风光，印象派油画，莫奈风格' },
  { seed: 'w3', label: '山水写意', category: '国画', prompt: '山水画，中国传统国画，泼墨写意' },
  { seed: 'w4', label: '版画艺术', category: '版画', prompt: '城市建筑，黑白版画风格，线条有力' },
  { seed: 'w5', label: '工笔花鸟', category: '国画', prompt: '工笔花鸟，精细国画，色彩典雅' },
  { seed: 'w6', label: '赛博朋克', category: '综合创意', prompt: '赛博朋克城市，霓虹灯光，未来感' },
  { seed: 'w7', label: '水彩风景', category: '水彩粉画', prompt: '欧洲小镇，水彩画风格，清新淡雅' },
  { seed: 'w8', label: '浮世绘', category: '版画', prompt: '日式浮世绘，富士山，樱花' },
];

function switchTab(el) {
  el.closest('.style-tabs').querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const cat = el.textContent.trim();
  renderHomeGallery(cat === '推荐' ? null : cat);
}

function renderHomeGallery(category) {
  const items = category ? galleryData.filter(d => d.category === category) : galleryData;
  const wf = document.getElementById('homeWaterfall');
  const cols = wf.querySelectorAll('.wf-col');
  cols[0].innerHTML = '';
  cols[1].innerHTML = '';

  items.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'wf-item';
    div.onclick = () => quickCreate(item.prompt);
    div.innerHTML = `<img src="https://picsum.photos/seed/${item.seed}/300/400" alt="" loading="lazy">
      <div class="wf-label">${item.label}</div>`;
    cols[i % 2 === 0 ? 0 : 1].appendChild(div);
  });
}

function quickCreate(prompt) {
  showPage('text2img');
  document.getElementById('t2i-prompt').value = prompt;
  showToast('已填入描述，点击生成');
}

// ===== 文生图 =====
function toggleStyleCard(el) {
  const isActive = el.classList.contains('active');
  const activeCount = document.querySelectorAll('.style-card-s.active').length;
  if (!isActive && activeCount >= 5) { showToast('最多选择5个风格'); return; }
  el.classList.toggle('active');
}

function switchStyleTab(el) {
  el.closest('.style-tabs2').querySelectorAll('.stab2').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

function selectCount(el, n) {
  el.closest('.count-btns').querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  selectedCount = n;
  const costs = { 1: 80, 2: 150, 3: 210, 4: 280 };
  document.getElementById('t2i-btn-text').textContent = `AI生成（消耗${costs[n]}算力）`;
}

function selectSize(el, size) {
  el.closest('.size-btns').querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  selectedSize = size;
}

async function generateT2I() {
  const prompt = document.getElementById('t2i-prompt').value.trim();
  if (!prompt) { showToast('请输入画面描述'); return; }

  const costs = { 1: 80, 2: 150, 3: 210, 4: 280 };
  const cost = costs[selectedCount] || 80;
  if (userCredits < cost) { showToast('算力不足，请先充值'); showRecharge(); return; }

  const styles = [...document.querySelectorAll('.style-card-s.active')].map(el => el.dataset.style);
  const styleText = styles.length > 0 ? styles[0] : '';

  const btn = document.querySelector('#page-text2img .action-btn-main');
  btn.disabled = true;

  const resultBox = document.getElementById('t2i-result');
  resultBox.innerHTML = `<div class="result-empty">
    <div class="spinner" style="margin:0 auto 12px"></div>
    <p style="color:#888">AI 正在创作中，请稍候...</p>
    <p style="color:#555;font-size:12px;margin-top:6px">预计 10-30 秒</p>
  </div>`;

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, style: styleText, count: selectedCount }),
    });
    const data = await response.json();
    if (!response.ok || !data.urls?.length) throw new Error(data.error || '生成失败');

    userCredits -= cost;
    updateCredits();
    data.urls.forEach(url => saveHistory(url, '文生图', prompt));

    const countClass = `c${data.urls.length}`;
    resultBox.innerHTML = `<div class="result-images ${countClass}">
      ${data.urls.map(url => `
        <div class="ri-wrap">
          <img src="${url}" alt="生成结果" loading="lazy">
          <div class="ri-actions">
            <button class="ri-btn" onclick="downloadImg('${url}')">下载</button>
            <button class="ri-btn" onclick="saveHistory('${url}','收藏','${prompt.replace(/'/g,"\\'")}');showToast('已收藏')">收藏</button>
          </div>
        </div>`).join('')}
    </div>`;
    showToast(`生成成功！消耗 ${cost} 算力`);
  } catch (err) {
    resultBox.innerHTML = `<div class="result-empty"><div class="re-icon">❌</div><p>${err.message}</p><button class="ri-btn" style="margin-top:12px" onclick="generateT2I()">重试</button></div>`;
  }

  btn.disabled = false;
  const costs2 = { 1: 80, 2: 150, 3: 210, 4: 280 };
  document.getElementById('t2i-btn-text').textContent = `AI生成（消耗${costs2[selectedCount]}算力）`;
}

// ===== 高级设置 =====
function showAdvanced() {
  document.getElementById('advancedPanel').classList.toggle('show');
}

// ===== 图生图 =====
function previewUpload(input) {
  if (!input.files[0]) return;
  document.getElementById('uploadPH').style.display = 'none';
  const preview = document.getElementById('uploadPreview');
  preview.src = URL.createObjectURL(input.files[0]);
  preview.style.display = 'block';
}

async function generateI2IAll() {
  const file = document.getElementById('imgInput').files[0];
  if (!file) { showToast('请先上传参考图片'); return; }

  const cost = 60;
  if (userCredits < cost) { showToast('算力不足，请先充值'); showRecharge(); return; }

  const btn = document.querySelector('#page-img2img .action-btn-main');
  btn.disabled = true;
  document.getElementById('i2i-btn-text').textContent = '生成中，请稍候...';

  const styles = ['国画', '油画', '水彩', '版画', '动漫', '写实'];
  const prompt = document.getElementById('i2i-prompt').value.trim();
  const imageBase64 = await toBase64(file);

  styles.forEach(s => {
    document.querySelector(`#sp-${s} .sp-img`).innerHTML =
      `<div class="sp-loading"><div class="spinner" style="width:24px;height:24px;border-width:2px"></div><span>生成中</span></div>`;
  });

  const results = await Promise.allSettled(
    styles.map(style =>
      fetch('/api/img2img', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, prompt, style }),
      }).then(r => r.json())
    )
  );

  userCredits -= cost;
  updateCredits();

  let successCount = 0;
  results.forEach((res, i) => {
    const style = styles[i];
    const box = document.querySelector(`#sp-${style} .sp-img`);
    if (res.status === 'fulfilled' && res.value?.url) {
      const url = res.value.url;
      box.innerHTML = `<img src="${url}" alt="${style}" loading="lazy" onclick="downloadImg('${url}')">`;
      saveHistory(url, `图生图-${style}`, prompt);
      successCount++;
    } else {
      box.innerHTML = `<div class="sp-ph">❌ 失败</div>`;
    }
  });

  btn.disabled = false;
  document.getElementById('i2i-btn-text').textContent = '🎨 一键生成全部风格（消耗60算力）';
  showToast(`完成！成功生成 ${successCount}/6 种风格`);
}

// ===== 画质提升 =====
function previewEnhance(input) {
  if (!input.files[0]) return;
  document.getElementById('enhancePH').style.display = 'none';
  const preview = document.getElementById('enhancePreview');
  preview.src = URL.createObjectURL(input.files[0]);
  preview.style.display = 'block';
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
  resultBox.innerHTML = `<div class="result-empty">
    <div class="spinner" style="margin:0 auto 12px"></div>
    <p style="color:#888">AI 正在提升画质...</p>
  </div>`;

  try {
    const imageBase64 = await toBase64(file);
    const response = await fetch('/api/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, scale: selectedEnhanceScale }),
    });
    const data = await response.json();
    if (!response.ok || !data.url) throw new Error(data.error || '提升失败');

    userCredits -= cost;
    updateCredits();
    saveHistory(data.url, '画质提升', '');

    resultBox.innerHTML = `<div class="result-images c1">
      <div class="ri-wrap">
        <img src="${data.url}" alt="提升结果" loading="lazy">
        <div class="ri-actions">
          <button class="ri-btn" onclick="downloadImg('${data.url}')">下载</button>
        </div>
      </div>
    </div>`;
    showToast(`提升完成！消耗 ${cost} 算力`);
  } catch (err) {
    resultBox.innerHTML = `<div class="result-empty"><div class="re-icon">❌</div><p>${err.message}</p></div>`;
  }

  btn.disabled = false;
}

// ===== 风格广场筛选 =====
const galleryItems = [
  { prompt: '清明上河图风格，宋代工笔画', style: '国画', name: '清明上河图风格', seed: 'g1', cat: '国画' },
  { prompt: '印象派油画，莫奈光影风格', style: '油画', name: '印象派油画', seed: 'g2', cat: '油画' },
  { prompt: '日式浮世绘，线条细腻', style: '版画', name: '日式浮世绘', seed: 'g3', cat: '版画' },
  { prompt: '水墨山水，泼墨写意', style: '国画', name: '水墨山水', seed: 'g4', cat: '国画' },
  { prompt: '欧洲水彩，通透淡雅', style: '水彩', name: '欧洲水彩', seed: 'g5', cat: '水彩' },
  { prompt: '赛博朋克，霓虹未来城市', style: '综合', name: '赛博朋克', seed: 'g6', cat: '综合' },
  { prompt: '工笔人物，精细写实', style: '国画', name: '工笔人物', seed: 'g7', cat: '国画' },
  { prompt: '抽象油画，色彩浓烈', style: '油画', name: '抽象油画', seed: 'g8', cat: '油画' },
];

function filterGallery(el, cat) {
  el.closest('.style-tabs').querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  renderGallery(cat === '全部' ? null : cat);
}

function renderGallery(cat) {
  const items = cat ? galleryItems.filter(i => i.cat === cat) : galleryItems;
  const grid = document.querySelector('.gallery-grid2');
  grid.innerHTML = items.map(item => `
    <div class="gc2" onclick="applyStyle('${item.prompt}','${item.style}')">
      <img src="https://picsum.photos/seed/${item.seed}/300/200" alt="" loading="lazy">
      <div class="gc2-info">
        <div class="gc2-name">${item.name}</div>
        <div class="gc2-tag">${item.cat}</div>
        <button class="gc2-btn">立即使用</button>
      </div>
    </div>`).join('');
}

function applyStyle(prompt, style) {
  showPage('text2img');
  document.getElementById('t2i-prompt').value = prompt + '，';
  showToast('已套用风格，补充描述后点生成');
}

// ===== 模型训练 =====
function addTrainImages(input) {
  const files = Array.from(input.files);
  const remaining = 100 - trainImages.length;
  const toAdd = files.slice(0, remaining);
  trainImages.push(...toAdd);
  document.getElementById('trainCount').textContent = `${trainImages.length}/100`;

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
  const cost = 3000;
  if (userCredits < cost) { showToast('算力不足，需要3000算力'); showRecharge(); return; }
  showToast('训练功能开发中，敬请期待');
}

function showModelPicker() {
  showToast('模型选择功能开发中');
}

// ===== 历史记录 =====
function saveHistory(url, type, prompt) {
  const hist = JSON.parse(localStorage.getItem('aiHistory') || '[]');
  hist.unshift({ url, type, prompt: prompt || '', time: Date.now() });
  if (hist.length > 100) hist.pop();
  localStorage.setItem('aiHistory', JSON.stringify(hist));
}

function loadHistory() {
  const hist = JSON.parse(localStorage.getItem('aiHistory') || '[]');
  const empty = document.getElementById('historyEmpty');
  const col1 = document.getElementById('histCol1');
  const col2 = document.getElementById('histCol2');

  document.getElementById('historyCount').textContent = hist.length;

  if (hist.length === 0) {
    empty.style.display = 'block';
    col1.innerHTML = '';
    col2.innerHTML = '';
    return;
  }

  empty.style.display = 'none';
  col1.innerHTML = '';
  col2.innerHTML = '';

  hist.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'wf-item';
    div.innerHTML = `<img src="${item.url}" alt="${item.type}" loading="lazy">
      <div class="wf-label">${item.type} · ${new Date(item.time).toLocaleDateString()}</div>`;
    div.onclick = () => downloadImg(item.url);
    (i % 2 === 0 ? col1 : col2).appendChild(div);
  });
}

function clearHistory() {
  if (!confirm('确定清空所有历史记录？')) return;
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

function mockPay() {
  showToast('支付功能接入中，敬请期待');
}

// ===== 工具函数 =====
function updateCredits() {
  document.getElementById('userCredits').textContent = userCredits;
  if (document.getElementById('modalCredits')) {
    document.getElementById('modalCredits').textContent = userCredits;
  }
}

function downloadImg(url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = `yichuang-${Date.now()}.jpg`;
  a.target = '_blank';
  a.click();
  showToast('开始下载');
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  renderHomeGallery(null);
  renderGallery(null);

  // 风格广场标签点击
  document.querySelectorAll('#page-gallery .stab').forEach(el => {
    el.onclick = () => filterGallery(el, el.textContent.trim());
  });

  // 首页标签点击
  document.querySelectorAll('#page-home .stab').forEach(el => {
    el.onclick = () => switchTab(el);
  });

  // style-tabs2 点击
  document.querySelectorAll('.stab2').forEach(el => {
    el.onclick = () => switchStyleTab(el);
  });
});
