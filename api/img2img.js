export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, prompt, style } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: '请上传图片' });
  }

  const fullPrompt = style
    ? `${prompt || '风格转换'}，转换为${style}风格，保留原图构图和主体内容，高质量艺术作品`
    : `${prompt || '风格转换'}，高质量艺术作品`;

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-dsgeyrbsptrqzswdxpgnvnvpudmhzlrxkeepryjjdjdfvgrj`,
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen-Image-Edit',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageBase64 },
              },
              {
                type: 'text',
                text: fullPrompt,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || '转换失败' });
    }

    // 返回生成的图片 URL（在 content 里）
    const content = data.choices?.[0]?.message?.content;
    const urlMatch = content?.match(/https?:\/\/\S+\.(?:png|jpg|jpeg|webp)/i);
    const imageUrl = urlMatch ? urlMatch[0] : null;

    if (!imageUrl) {
      return res.status(500).json({ error: '未能获取图片结果' });
    }

    return res.status(200).json({ url: imageUrl });

  } catch (err) {
    return res.status(500).json({ error: '服务器错误：' + err.message });
  }
}
