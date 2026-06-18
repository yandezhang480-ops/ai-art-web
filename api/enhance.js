export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64, scale } = req.body;
  if (!imageBase64) return res.status(400).json({ error: '请上传图片' });

  // 备注：画质提升仅对用户上传图片重绘，无文字输入；
  //       内容安全主要由文生图/图生图入口的 checkContent 把关。

  const API_KEY = 'sk-dsgeyrbsptrqzswdxpgnvnvpudmhzlrxkeepryjjdjdfvgrj';

  try {
    // 用视觉模型描述图片，再用超高清提示词重生成
    const visionRes = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: 'Qwen/Qwen3-VL-8B-Instruct',
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: imageBase64 } },
          { type: 'text', text: 'Describe this image in detail in English, including style, colors, composition, subjects. Under 80 words.' }
        ]}],
        max_tokens: 150,
      }),
    });

    const visionData = await visionRes.json();
    const desc = visionData.choices?.[0]?.message?.content || 'high quality artwork';

    const scaleText = scale === '4x' ? 'ultra high resolution 4K, extreme detail, sharp focus' : 'high resolution 2K, detailed, sharp';
    const prompt = `${desc}, ${scaleText}, enhanced quality, professional, masterpiece`;

    const genRes = await fetch('https://api.siliconflow.cn/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: 'Tongyi-MAI/Z-Image-Turbo',
        prompt,
        image_size: '1024x1024',
        n: 1,
      }),
    });

    const genData = await genRes.json();
    const url = genData.images?.[0]?.url || genData.data?.[0]?.url;
    if (!url) return res.status(500).json({ error: '提升失败' });

    return res.status(200).json({ url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
