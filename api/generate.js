import { checkContent } from './_filter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, style, count = 1 } = req.body;
  if (!prompt) return res.status(400).json({ error: '请输入描述' });

  // 内容安全过滤：拦截色情/暴力/政治敏感内容（合规必备）
  const chk = checkContent(prompt + ' ' + (style || ''));
  if (!chk.ok) return res.status(400).json({ error: `内容含${chk.category}信息，已被拦截，请修改后重试` });

  const API_KEY = 'sk-dsgeyrbsptrqzswdxpgnvnvpudmhzlrxkeepryjjdjdfvgrj';

  const styleMap = {
    '国画': 'traditional Chinese ink painting, brush strokes, elegant, masterpiece',
    '油画': 'oil painting style, rich colors, textured canvas, impressionist',
    '水彩': 'watercolor painting, soft transparent colors, artistic',
    '版画': 'woodblock print style, bold lines, limited colors, artistic',
    '动漫': 'anime illustration, clean lines, vibrant colors, detailed',
    '写实': 'photorealistic, highly detailed, professional photography',
    '工笔人物': 'Chinese gongbi painting, meticulous brushwork, figures, classical',
    '国展人物': 'Chinese national exhibition painting style, figures, expressive',
    '国展花鸟': 'Chinese flower and bird painting, national exhibition style',
    '水墨山水': 'Chinese ink wash landscape, misty mountains, poetic',
    '写意花鸟': 'Chinese freehand flower and bird painting, expressive brushwork',
    '泼墨山水': 'Chinese splashed ink landscape, bold and free brushwork',
  };

  const stylePrompt = styleMap[style] || (style ? `${style} art style` : '');
  const fullPrompt = stylePrompt ? `${prompt}, ${stylePrompt}, high quality artwork` : `${prompt}, high quality artwork`;

  try {
    // 并行生成多张
    const requests = Array.from({ length: Math.min(count, 4) }, () =>
      fetch('https://api.siliconflow.cn/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: 'Tongyi-MAI/Z-Image-Turbo',
          prompt: fullPrompt,
          image_size: '1024x1024',
          n: 1,
        }),
      }).then(r => r.json())
    );

    const results = await Promise.allSettled(requests);
    const urls = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value?.images?.[0]?.url || r.value?.data?.[0]?.url)
      .filter(Boolean);

    if (urls.length === 0) return res.status(500).json({ error: '生成失败，请重试' });

    return res.status(200).json({ urls, url: urls[0] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
