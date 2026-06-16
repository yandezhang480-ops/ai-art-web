export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, style, type } = req.body;

  const fullPrompt = style
    ? `${prompt}，${style}风格，高质量艺术作品，细节丰富`
    : `${prompt}，高质量艺术作品`;

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-dsgeyrbsptrqzswdxpgnvnvpudmhzlrxkeepryjjdjdfvgrj`,
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell',
        prompt: fullPrompt,
        n: 1,
        image_size: '1024x1024',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || '生成失败' });
    }

    const imageUrl = data.data?.[0]?.url;
    return res.status(200).json({ url: imageUrl });

  } catch (err) {
    return res.status(500).json({ error: '服务器错误：' + err.message });
  }
}
