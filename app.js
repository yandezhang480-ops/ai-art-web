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
  { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Huizong_Finches_and_Bamboo.jpg/600px-Huizong_Finches_and_Bamboo.jpg', label: '工笔花鸟 · 宋徽宗', category: '国画', prompt: '工笔花鸟，精细国画，色彩典雅' },
  { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/600px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg', label: '睡莲 · 莫奈', category: '油画', prompt: '印象派油画，莫奈睡莲，光影斑驳' },
  { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Travelers_among_Mountains_and_Streams.jpg/600px-Travelers_among_Mountains_and_Streams.jpg', label: '溪山行旅 · 范宽', category: '国画', prompt: '水墨山水，中国传统国画，泼墨写意' },
  { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Great_Wave_off_Kanagawa2.jpg/600px-Great_Wave_off_Kanagawa2.jpg', label: '神奈川冲浪 · 北斋', category: '版画', prompt: '浮世绘，神奈川冲浪里，波浪壮阔' },
  { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Zhang_Xuan_-_Court_Ladies_Preparing_Newly_Woven_Silk.jpg/600px-Zhang_Xuan_-_Court_Ladies_Preparing_Newly_Woven_Silk.jpg', label: '捣练图 · 张萱', category: '国画', prompt: '工笔仕女，唐代宫廷，华美服饰' },
  { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/600px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg', label: '星夜 · 梵高', category: '油画', prompt: '梵高星空，旋转笔触，表现主义油画' },
  { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Winslow_Homer_-_The_Blue_Boat.jpg/600px-Winslow_Homer_-_The_Blue_Boat.jpg', label: '蓝船 · 霍默', category: '水彩粉画', prompt: '水彩风景，帆船，海边晴天，通透淡雅' },
  { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Red_Fuji_southern_wind_clear_morning.jpg/600px-Red_Fuji_southern_wind_clear_morning.jpg', label: '红富士 · 葛饰北斋', category: '版画', prompt: '浮世绘，富士山，红色晴天，日式版画' },
  { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/400px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg', label: '蒙娜丽莎 · 达芬奇', category: '油画', prompt: '古典写实，文艺复兴油画，神秘微笑' },
  { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/600px-Meisje_met_de_parel.jpg', label: '珍珠耳环 · 维米尔', category: '油画', prompt: '巴洛克人物，维米尔风格，窗边光线' },
  { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Huizong-Auspicious_Cranes.jpg/600px-Huizong-Auspicious_Cranes.jpg', label: '瑞鹤图 · 宋徽宗', category: '国画', prompt: '宋代工笔，瑞鹤祥云，精细典雅' },
  { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Vincent_van_Gogh_-_Sunflowers_%281888%2C_National_Gallery_London%29.jpg/600px-Vincent_van_Gogh_-_Sunflowers_%281888%2C_National_Gallery_London%29.jpg', label: '向日葵 · 梵高', category: '油画', prompt: '梵高向日葵，厚涂油画，金黄色调' },
  { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Alphonse_Mucha_-_Job_Cigarette_Papers_%281896%29.jpg/400px-Alphonse_Mucha_-_Job_Cigarette_Papers_%281896%29.jpg', label: '穆夏装饰画', category: '综合创意', prompt: '新艺术运动，穆夏风格，唯美装饰' },
  { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Kitagawa-Utamaro.jpg/400px-Kitagawa-Utamaro.jpg', label: '浮世绘美人 · 歌川', category: '版画', prompt: '浮世绘美人，歌川国芳，细腻线条' },
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
    div.innerHTML = `<img src="${item.img}" alt="${item.label}" loading="lazy">
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
  // 国画
  { prompt: '清明上河图风格，宋代工笔画，热闹街市，古典建筑', name: '清明上河图', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Along_the_River_During_the_Qingming_Festival_%28Qing_Court_Version%29.jpg/800px-Along_the_River_During_the_Qingming_Festival_%28Qing_Court_Version%29.jpg', cat: '国画' },
  { prompt: '水墨山水，泼墨写意，高山云雾，意境深远', name: '溪山行旅', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Travelers_among_Mountains_and_Streams.jpg/600px-Travelers_among_Mountains_and_Streams.jpg', cat: '国画' },
  { prompt: '工笔花鸟，宋代精细笔触，牡丹锦鸡，华丽典雅', name: '工笔花鸟', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Huizong_Finches_and_Bamboo.jpg/600px-Huizong_Finches_and_Bamboo.jpg', cat: '国画' },
  { prompt: '工笔仕女，唐代宫廷美人，华美服饰，精细描绘', name: '捣练图', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Zhang_Xuan_-_Court_Ladies_Preparing_Newly_Woven_Silk.jpg/800px-Zhang_Xuan_-_Court_Ladies_Preparing_Newly_Woven_Silk.jpg', cat: '国画' },
  { prompt: '泼墨荷花，中国水墨，荷叶田田，夏日意境', name: '写意荷花', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Qian_Xuan_-_Wang_Xizhi_Watching_Geese.jpg/600px-Qian_Xuan_-_Wang_Xizhi_Watching_Geese.jpg', cat: '国画' },
  { prompt: '宋代工笔花卉，芙蓉锦鸡，精致细腻，宋人审美', name: '芙蓉锦鸡', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Huizong-Auspicious_Cranes.jpg/800px-Huizong-Auspicious_Cranes.jpg', cat: '国画' },
  { prompt: '山水长卷，元代文人画，富春山居，烟雨江南', name: '富春山居图', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Shitao_-_Landscape_with_Waterfall.jpg/600px-Shitao_-_Landscape_with_Waterfall.jpg', cat: '国画' },
  // 油画
  { prompt: '印象派油画，莫奈睡莲，光影斑驳，色彩柔和', name: '睡莲·莫奈', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/800px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg', cat: '油画' },
  { prompt: '梵高星空风格，旋转笔触，浓烈色彩，表现主义', name: '星夜·梵高', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg', cat: '油画' },
  { prompt: '古典写实人物油画，神秘微笑，文艺复兴风格', name: '蒙娜丽莎', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/400px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg', cat: '油画' },
  { prompt: '维米尔风格古典人物，窗边光线，珍珠耳环，写实细腻', name: '珍珠耳环', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/600px-Meisje_met_de_parel.jpg', cat: '油画' },
  { prompt: '梵高向日葵，厚涂油画，金黄色调，生命力旺盛', name: '向日葵·梵高', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Vincent_van_Gogh_-_Sunflowers_%281888%2C_National_Gallery_London%29.jpg/600px-Vincent_van_Gogh_-_Sunflowers_%281888%2C_National_Gallery_London%29.jpg', cat: '油画' },
  { prompt: '拉斐尔圣母像，文艺复兴，圣洁光辉，古典构图', name: '西斯廷圣母', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Raffael_-_Sixtinische_Madonna.jpg/400px-Raffael_-_Sixtinische_Madonna.jpg', cat: '油画' },
  // 版画
  { prompt: '日式浮世绘，神奈川冲浪里，葛饰北斋风格，波浪壮阔', name: '神奈川冲浪里', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Great_Wave_off_Kanagawa2.jpg/800px-Great_Wave_off_Kanagawa2.jpg', cat: '版画' },
  { prompt: '浮世绘，富士山，葛饰北斋，晴天红色富士', name: '红富士', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Red_Fuji_southern_wind_clear_morning.jpg/800px-Red_Fuji_southern_wind_clear_morning.jpg', cat: '版画' },
  { prompt: '新艺术运动海报，穆夏风格，唯美女性，植物装饰', name: '穆夏装饰画', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Alphonse_Mucha_-_Job_Cigarette_Papers_%281896%29.jpg/400px-Alphonse_Mucha_-_Job_Cigarette_Papers_%281896%29.jpg', cat: '版画' },
  { prompt: '木刻版画，黑白线条，民间故事，朴拙有力', name: '民间木刻', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Great_Wave_off_Kanagawa2.jpg/400px-Great_Wave_off_Kanagawa2.jpg', cat: '版画' },
  { prompt: '浮世绘美人，歌川国芳，细腻线条，古典服饰', name: '浮世绘美人', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Kitagawa-Utamaro.jpg/400px-Kitagawa-Utamaro.jpg', cat: '版画' },
  // 水彩
  { prompt: '水彩风景，欧洲帆船，海边晴天，通透淡雅', name: '蓝船·霍默', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Winslow_Homer_-_The_Blue_Boat.jpg/800px-Winslow_Homer_-_The_Blue_Boat.jpg', cat: '水彩' },
  { prompt: '水彩肖像，唯美晕染，色彩柔和，艺术人像', name: '水彩人像', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Winslow_Homer_-_Sloop%2C_Nassau.jpg/600px-Winslow_Homer_-_Sloop%2C_Nassau.jpg', cat: '水彩' },
  { prompt: '水彩花卉，玫瑰牡丹，柔和晕染，花瓣细腻', name: '水彩花卉', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Winslow_Homer_-_The_Blue_Boat.jpg/400px-Winslow_Homer_-_The_Blue_Boat.jpg', cat: '水彩' },
  { prompt: '水彩城市速写，建筑线稿加晕染，旅行日记风格', name: '城市速写', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Winslow_Homer_-_Sloop%2C_Nassau.jpg/800px-Winslow_Homer_-_Sloop%2C_Nassau.jpg', cat: '水彩' },
  // 综合
  { prompt: '赛博朋克城市，霓虹灯光，雨夜反射，未来感十足', name: '赛博朋克', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/400px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg', cat: '综合' },
  { prompt: '新海诚动漫风格，唯美天空，光线通透，日系治愈', name: '新海诚风', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Huizong_Finches_and_Bamboo.jpg/400px-Huizong_Finches_and_Bamboo.jpg', cat: '综合' },
  { prompt: '极简主义几何抽象，莫兰迪色调，高级感设计', name: '极简抽象', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Alphonse_Mucha_-_Job_Cigarette_Papers_%281896%29.jpg/600px-Alphonse_Mucha_-_Job_Cigarette_Papers_%281896%29.jpg', cat: '综合' },
  { prompt: '中国风概念插画，国潮美学，龙凤图腾，金红配色', name: '国潮插画', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Huizong-Auspicious_Cranes.jpg/600px-Huizong-Auspicious_Cranes.jpg', cat: '综合' },
  { prompt: '洛可可风格，宫廷奢华，粉金配色，华丽装饰', name: '洛可可宫廷', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Raffael_-_Sixtinische_Madonna.jpg/600px-Raffael_-_Sixtinische_Madonna.jpg', cat: '综合' },
  { prompt: '蒸汽朋克机械，齿轮管道，维多利亚风格，工业美学', name: '蒸汽朋克', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/400px-Meisje_met_de_parel.jpg', cat: '综合' },
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
    <div class="gc2" onclick="applyStyle('${item.prompt}','${item.cat}')">
      <img src="${item.img}" alt="${item.name}" loading="lazy">
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
