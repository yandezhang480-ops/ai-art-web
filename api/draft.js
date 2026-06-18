// 画稿生成：把一张作品拆解成 线描稿 / 黑白灰稿 / 色彩稿
// 用于学习大师与优秀作品的创作思路
import { checkContent } from './_filter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64, mode } = req.body;
  if (!imageBase64) return res.status(400).json({ error: '请上传图片' });

  // 备注：画稿基于用户上传图片，视觉模型描述后再生成；
  //       若后续开放文字输入，需在此调用 checkContent 过滤违规内容。

  const API_KEY = process.env.SILICONFLOW_KEY || 'sk-dsgeyrbsptrqzswdxpgnvnvpudmhzlrxkeepryjjdjdfvgrj';

  // 三种稿件的生成提示
  const modeMap = {
    line: {
      cn: '线描稿',
      prompt: 'clean line art drawing, black ink outline only on white paper, no shading no color, Chinese 白描 baimiao line drawing style, contour lines, sketch, precise linework'
    },
    value: {
      cn: '黑白灰稿',
      prompt: 'black white and grey value study, grayscale tonal study, monochrome, light and shadow blocks, no color, ink wash gradation, study of values and composition'
    },
    color: {
      cn: '色彩稿',
      prompt: 'color study draft, color composition sketch, blocks of color, color relationship study, loose painterly color rough, harmonious palette'
    },
  };

  const cfg = modeMap[mode] || modeMap.line;

  try {
    // 第一步：视觉模型分析画面内容与构图
    const visionRes = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: 'Qwen/Qwen3-VL-8B-Instruct',
        messages: [{ role: 'user', content: [
          { type: 'image_url', image_url: { url: imageBase64 } },
          { type: 'text', text: 'Describe the subject, composition and main shapes of this artwork in detailed English, under 70 words. Focus on what is depicted and the layout.' }
        ]}],
        max_tokens: 150,
      }),
    });
    const visionData = await visionRes.json();
    const desc = visionData.choices?.[0]?.message?.content || 'an artistic composition';

    // 第二步：按稿件类型重新生成
    const prompt = `${desc}, ${cfg.prompt}, high quality, clear, detailed`;
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
    if (!url) return res.status(500).json({ error: '生成失败，请重试' });

    return res.status(200).json({ url, mode: cfg.cn });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
