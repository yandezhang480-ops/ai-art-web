let userCredits = 100;
let selectedRechargePrice = 28;
let selectedRechargeCredits = 500;

// 页面切换
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const map = { home: 0, text2img: 1, img2img: 2, enhance: 3, gallery: 4 };
  const links = document.querySelectorAll('.nav-link');
  if (links[map[name]]) links[map[name]].classList.add('active');
  window.scrollTo(0, 0);
}

// 风格选择
function selectStyle(el) {
  el.closest('.style-select').querySelectorAll('.style-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

// 风格广场套用
function useStyle(styleName) {
  showPage('text2img');
  document.getElementById('t2i-prompt').value = styleName + '，';
  showToast('已套用风格：' + styleName);
}

// 图片预览
function previewImage(input) {
  if (!input.files[0]) return;
  const preview = document.getElementById('uploadPreview');
  const placeholder = document.getElementById('uploadPlaceholder');
  preview.src = URL.createObjectURL(input.files[0]);
  preview.style.display = 'block';
  placeholder.style.display = 'none';
}

function previewEnhance(input) {
  if (!input.files[0]) return;
  const preview = document.getElementById('enhancePreview');
  const placeholder = document.getElementById('enhancePlaceholder');
  preview.src = URL.createObjectURL(input.files[0]);
  preview.style.display = 'block';
  placeholder.style.display = 'none';
}

// 文生图生成
async function generateText2Img() {
  const prompt = document.getElementById('t2i-prompt').value.trim();
  if (!prompt) { showToast('请输入画面描述'); return; }

  const count = parseInt(document.getElementById('t2i-count').value);
  const cost = count === 1 ? 10 : count === 2 ? 18 : 32;

  if (userCredits < cost) {
    showToast('积分不足，请先充值');
    showRecharge();
    return;
  }

  const btn = document.getElementById('t2i-btn-text');
  const resultArea = document.getElementById('t2i-result');

  btn.textContent = '生成中...';
  document.querySelector('#page-text2img .btn-generate').disabled = true;

  resultArea.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <div class="loading-text">AI 正在创作中...</div>
      <div class="loading-progress" id="progressText">预计需要 10-30 秒</div>
    </div>`;

  // 模拟进度
  const steps = ['分析描述中...', '生成构图...', '渲染细节...', '优化画质...', '即将完成...'];
  let step = 0;
  const interval = setInterval(() => {
    if (step < steps.length) {
      document.getElementById('progressText').textContent = steps[step++];
    }
  }, 1800);

  try {
    const style = document.querySelector('#page-text2img .style-option.selected')?.dataset?.style || '';
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, style, type: 'text2img' }),
    });
    clearInterval(interval);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '生成失败');

    userCredits -= cost;
    updateCredits();
    showResults(resultArea, [data.url], 1);
  } catch (err) {
    clearInterval(interval);
    resultArea.innerHTML = `<div class="result-placeholder"><div class="placeholder-icon">❌</div><p>${err.message}</p></div>`;
  }

  btn.textContent = '🎨 开始生成';
  document.querySelector('#page-text2img .btn-generate').disabled = false;
  showToast(`生成成功！消耗 ${cost} 积分`);
}

// 图生图生成
async function generateImg2Img() {
  const input = document.getElementById('imgInput');
  if (!input.files[0]) { showToast('请先上传参考图片'); return; }

  const cost = 12;
  if (userCredits < cost) { showToast('积分不足，请先充值'); showRecharge(); return; }

  const btn = document.getElementById('i2i-btn-text');
  const resultArea = document.getElementById('i2i-result');

  btn.textContent = '转换中...';
  document.querySelector('#page-img2img .btn-generate').disabled = true;

  resultArea.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <div class="loading-text">AI 正在转换风格...</div>
      <div class="loading-progress">预计需要 15-40 秒</div>
    </div>`;

  try {
    const prompt = document.getElementById('i2i-prompt').value.trim() || '风格转换';
    const style = document.querySelector('#page-img2img .style-option.selected')?.dataset?.style || '';
    const file = document.getElementById('imgInput').files[0];
    const imageBase64 = await toBase64(file);
    const response = await fetch('/api/img2img', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, prompt, style }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '转换失败');

    userCredits -= cost;
    updateCredits();
    showResults(resultArea, [data.url], 1);
    showToast(`转换成功！消耗 ${cost} 积分`);
  } catch (err) {
    resultArea.innerHTML = `<div class="result-placeholder"><div class="placeholder-icon">❌</div><p>${err.message}</p></div>`;
  }

  btn.textContent = '🎨 开始转换';
  document.querySelector('#page-img2img .btn-generate').disabled = false;
}

// 画质提升
async function generateEnhance() {
  const input = document.getElementById('enhanceInput');
  if (!input.files[0]) { showToast('请先上传图片'); return; }

  const cost = 8;
  if (userCredits < cost) { showToast('积分不足，请先充值'); showRecharge(); return; }

  const resultArea = document.getElementById('enhance-result');

  resultArea.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <div class="loading-text">AI 正在提升画质...</div>
      <div class="loading-progress">预计需要 10-20 秒</div>
    </div>`;

  await sleep(Math.random() * 1500 + 2000);

  userCredits -= cost;
  updateCredits();

  const preview = document.getElementById('enhancePreview').src;
  showResults(resultArea, [preview], 1);

  showToast(`提升完成！消耗 ${cost} 积分`);
}

// 展示结果图片
function showResults(container, imgs, count) {
  container.innerHTML = `<div class="result-images count-${count}">
    ${imgs.map((src, i) => `
      <div class="result-img-wrap">
        <img src="${src}" alt="生成结果 ${i+1}">
        <div class="result-img-actions">
          <button class="img-action-btn" onclick="downloadImg('${src}', ${i})">下载</button>
          <button class="img-action-btn" onclick="shareImg(${i})">分享</button>
        </div>
      </div>`).join('')}
  </div>`;
}

// 下载图片
function downloadImg(src, index) {
  const a = document.createElement('a');
  a.href = src;
  a.download = `ai-art-${Date.now()}-${index + 1}.jpg`;
  a.target = '_blank';
  a.click();
  showToast('开始下载');
}

function shareImg(index) {
  showToast('分享功能开发中');
}

// 充值弹窗
function showRecharge() {
  document.getElementById('modalCredits').textContent = userCredits;
  document.getElementById('rechargeModal').classList.add('show');
}

function hideRecharge() {
  document.getElementById('rechargeModal').classList.remove('show');
}

function selectRecharge(el, price, credits) {
  document.querySelectorAll('.recharge-item').forEach(i => i.classList.remove('selected'));
  el.classList.add('selected');
  selectedRechargePrice = price;
  selectedRechargeCredits = credits;
  document.getElementById('payBtn').textContent = `立即支付 ¥${price}`;
}

function mockPay() {
  showToast('支付功能接入中，敬请期待');
}

// 更新积分显示
function updateCredits() {
  document.getElementById('userCredits').textContent = userCredits;
  document.getElementById('modalCredits').textContent = userCredits;
}

// 首页风格筛选（示意）
function filterGallery(style) {
  showToast('筛选：' + style);
}

// Toast
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
