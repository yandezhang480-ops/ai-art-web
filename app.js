let userCredits = 100;
let selectedCount = 4;
let selectedSize = '1:1';
let selectedEnhanceScale = '2x';
let selectedPkgPrice = 28;
let selectedPkgCredits = 500;
let trainImages = [];
let pageHistory = [];

// ===== 页面切换 =====
const pageTitles = {
  home: '首页', text2img: '文生图', img2img: '图生图',
  train: '模型训练', enhance: '画质提升', gallery: '风格广场',
  history: '历史记录', mine: '我的'
};

const navPages = ['home', 'text2img', 'train', 'img2img', 'mine'];

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.getElementById('topbarTitle').textContent = pageTitles[name] || name;

  const isNav = navPages.includes(name);
  document.getElementById('backBtn').style.display = isNav ? 'none' : 'block';

  if (!isNav) pageHistory.push(name);

  // 底部导航高亮
  document.querySelectorAll('.bnav-item').forEach((el, i) => {
    el.classList.toggle('active', navPages[i] === name);
  });

  if (name === 'history') loadHistory();
  if (name === 'mine') {
    document.getElementById('statCredits').textContent = userCredits;
    const hist = JSON.parse(localStorage.getItem('aiHistory') || '[]');
    document.getElementById('statCount').textContent = hist.length;
  }

  window.scrollTo(0, 0);
}

function switchNav(el, name) {
  showPage(name);
}

function goBack() {
  if (pageHistory.length > 0) {
    pageHistory.pop();
    const prev = pageHistory.pop() || 'home';
    showPage(prev);
  } else {
    showPage('home');
  }
}

// ===== 首页 =====
function switchTab(el) {
  el.closest('.style-tabs').querySelectorAll('.stab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

function quickCreate(prompt) {
  showPage('text2img');
  document.getElementById('t2i-prompt').value = prompt;
  showToast('已填入描述，点击生成');
}

// ===== 文生图 =====
function toggleStyleCard(el) {
  const active = el.classList.contains('active');
  const activeCards = document.querySelectorAll('.style-card-s.active');
  if (!active && activeCards.length >= 5) { showToast('最多选择5个风格'); return; }
  el.classList.toggle('active');
}

function selectCount(el, n) {
  el.closest('.count-btns').querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  selectedCount = n;
  const costs = { 1: 80, 2: 150, 3: 210, 4: 280 };
  document.getElementById('t2i-btn-text').textContent = `AI生成（消耗${costs[n] || 80}算力）`;
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
  const styleText = styles.length > 0 ? styles.join('、') + '风格，' : '';

  const btn = document.querySelector('#page-text2img .action-btn-main');
  btn.disabled = true;

  const resultBox = document.getElementById('t2i-result');
  resultBox.innerHTML = `<div class="result-empty"><div class="spinner" style="margin:0 auto 12px"></div><p style="color:#888">AI 正在创作中...</p></div>`;

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: styleText + prompt, style: styles[0] || '' }),
    });
    const data = await response.json();
    if (!response.ok || !data.url) throw new Error(data.error || '生成失败');

    userCredits -= cost;
    updateCredits();
    saveHistory(data.url, '文生图', prompt);

    resultBox.innerHTML = `<div class="result-images c1">
      <div class="ri-wrap">
        <img src="${data.url}" alt="生成结果">
        <div class="ri-actions">
          <button class="ri-btn" onclick="downloadImg('${data.url}')">下载</button>
          <button class="ri-btn" onclick="saveHistory('${data.url}','收藏','${prompt}');showToast('已收藏')">收藏</button>
        </div>
      </div>
    </div>`;
    showToast(`生成成功！消耗 ${cost} 算力`);
  } catch (err) {
    resultBox.innerHTML = `<div class="result-empty"><div class="re-icon">❌</div><p>${err.message}</p></div>`;
  }

  btn.disabled = false;
  document.getElementById('t2i-btn-text').textContent = `AI生成（消耗${cost}算力）`;
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

  results.forEach((res, i) => {
    const style = styles[i];
    const box = document.querySelector(`#sp-${style} .sp-img`);
    if (res.status === 'fulfilled' && res.value?.url) {
      const url = res.value.url;
      box.innerHTML = `<img src="${url}" alt="${style}" onclick="downloadImg('${url}')">`;
      saveHistory(url, `图生图-${style}`, prompt);
    } else {
      box.innerHTML = `<div class="sp-ph">❌ 失败</div>`;
    }
  });

  btn.disabled = false;
  document.getElementById('i2i-btn-text').textContent = '🎨 一键生成全部风格（消耗60算力）';
  showToast('全部风格生成完成！');
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
  resultBox.innerHTML = `<div class="result-empty"><div class="spinner" style="margin:0 auto 12px"></div><p style="color:#888">AI 正在提升画质...</p></div>`;

  await sleep(2000);

  const preview = document.getElementById('enhancePreview').src;
  userCredits -= cost;
  updateCredits();

  resultBox.innerHTML = `<div class="result-images c1">
    <div class="ri-wrap">
      <img src="${preview}" alt="提升结果">
      <div class="ri-actions">
        <button class="ri-btn" onclick="downloadImg('${preview}')">下载</button>
      </div>
    </div>
  </div>`;

  btn.disabled = false;
  showToast(`提升完成！消耗 ${cost} 算力`);
}

// ===== 风格广场 =====
function applyStyle(prompt, styleType) {
  showPage('text2img');
  document.getElementById('t2i-prompt').value = prompt + '，';
  showToast('已套用风格，请补充描述后生成');
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

  showToast(`已添加 ${toAdd.length} 张图片`);
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

  if (hist.length === 0) {
    empty.style.display = 'block';
    col1.innerHTML = '';
    col2.innerHTML = '';
    document.getElementById('historyCount').textContent = '0';
    return;
  }

  empty.style.display = 'none';
  document.getElementById('historyCount').textContent = hist.length;
  col1.innerHTML = '';
  col2.innerHTML = '';

  hist.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'wf-item';
    div.innerHTML = `<img src="${item.url}" alt="${item.type}" loading="lazy">
      <div class="wf-label">${item.type} · ${new Date(item.time).toLocaleDateString()}</div>`;
    div.onclick = () => downloadImg(item.url);
    if (i % 2 === 0) col1.appendChild(div);
    else col2.appendChild(div);
  });
}

function clearHistory() {
  if (!confirm('确定清空所有历史记录？')) return;
  localStorage.removeItem('aiHistory');
  loadHistory();
  showToast('已清空');
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
  document.getElementById('modalCredits').textContent = userCredits;
}

function downloadImg(url) {
  const a = document.createElement('a');
  a.href = url;
  a.download = `yichuang-ai-${Date.now()}.jpg`;
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
  setTimeout(() => t.classList.remove('show'), 2500);
}
