import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

type Data = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允许 POST 请求' })
  }

  const { data } = req.body

  if (!data) {
    return res.status(400).json({ message: '缺少 data 参数' })
  }

  try {
    const parsedData = JSON.parse(decodeURIComponent(data))
    const html = parsedData.html

    if (!html) {
      return res.status(400).json({ message: '缺少 HTML 内容' })
    }

    const saveDir = path.join(process.cwd(), 'saved_html')
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir)
    }

    const fileName = `saved_${Date.now()}.html`
    const filePath = path.join(saveDir, fileName)

    fs.writeFileSync(filePath, html)
    
    res.status(200).json({ message: `HTML 成功保存为 ${fileName}` })
  } catch (error) {
    console.error('保存 HTML 时出错:', error)
    res.status(500).json({ message: '保存 HTML 时出错' })
  }
}
