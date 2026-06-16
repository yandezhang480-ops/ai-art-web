export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, prompt, style } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: '请上传图片' });
  }

  const API_KEY = 'sk-dsgeyrbsptrqzswdxpgnvnvpudmhzlrxkeepryjjdjdfvgrj';

  try {
    // 第一步：用视觉模型分析图片内容
    const visionRes = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen3-VL-8B-Instruct',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageBase64 } },
            { type: 'text', text: '用英文简洁描述这张图片的主要内容、构图和色彩，50字以内' }
          ]
        }],
        max_tokens: 200,
      }),
    });

    const visionData = await visionRes.json();
    const imageDesc = visionData.choices?.[0]?.message?.content || 'artistic scene';

    // 第二步：根据描述+风格生成新图
    const styleMap = {
      '国画': 'traditional Chinese ink painting style, brush strokes, elegant',
      '油画': 'oil painting style, rich colors, texture',
      '水彩': 'watercolor painting style, soft colors, transparent',
      '版画': 'woodblock print style, bold lines, limited colors',
      '动漫': 'anime illustration style, clean lines, vibrant',
      '写实': 'photorealistic style, detailed, high quality',
    };

    const stylePrompt = styleMap[style] || `${style} art style`;
    const userPrompt = prompt ? `${prompt}, ` : '';
    const finalPrompt = `${userPrompt}${imageDesc}, ${stylePrompt}, high quality artwork`;

    const genRes = await fetch('https://api.siliconflow.cn/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'Tongyi-MAI/Z-Image-Turbo',
        prompt: finalPrompt,
        image_size: '1024x1024',
        n: 1,
      }),
    });

    const genData = await genRes.json();
    if (!genRes.ok) {
      return res.status(500).json({ error: genData.error?.message || '生成失败' });
    }

    const imageUrl = genData.images?.[0]?.url || genData.data?.[0]?.url;
    return res.status(200).json({ url: imageUrl });

  } catch (err) {
    return res.status(500).json({ error: '服务器错误：' + err.message });
  }
}
