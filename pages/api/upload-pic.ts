import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Fields, Files } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允许 POST 请求' });
  }

  const form = new IncomingForm({
    uploadDir: path.join(process.cwd(), 'public', 'upload-pic'),
    keepExtensions: true,
  });

  try {
    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = Array.isArray(files.image) ? files.image[0] : files.image;
    if (!file) {
      return res.status(400).json({ message: '没有找到上传的图片' });
    }

    const originalExt = path.extname(file.originalFilename || '').toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (!allowedExtensions.includes(originalExt)) {
      return res.status(400).json({ message: '不支持的文件类型' });
    }

    const now = new Date();
    const fileName = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}${originalExt}`;
    const newPath = path.join(process.cwd(), 'public', 'upload-pic', fileName);

    // 压缩并保存图片
    await sharp(file.filepath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(newPath);

    // 删除原始上传文件
    await fs.unlink(file.filepath);

    const imageUrl = `/upload-pic/${fileName}`;
    // 获取当前主机和协议
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const fullImageUrl = `${protocol}://${host}${imageUrl}`;
    res.status(200).json({ imageUrl: fullImageUrl });
  } catch (error) {
    console.error('处理上传时出错:', error);
    res.status(500).json({ message: '上传图片失败' });
  }
}