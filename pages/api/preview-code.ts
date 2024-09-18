import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只允许 POST 请求' })
  }

  const { data } = req.body

  if (!data) {
    return res.status(400).json({ message: '缺少 data 参数' })
  }

  try {
    const { html, css_external, js_external } = JSON.parse(data)

    const previewHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code Preview</title>
        ${css_external ? `<link rel="stylesheet" href="${css_external}">` : ''}
        ${js_external ? `<script src="${js_external}"></script>` : ''}
        <style>
          body { margin: 0; padding: 20px; }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `

    const previewDir = path.join(process.cwd(), 'public', 'previews')
    if (!fs.existsSync(previewDir)) {
      fs.mkdirSync(previewDir, { recursive: true })
    }

    const fileName = `preview_${Date.now()}.html`
    const filePath = path.join(previewDir, fileName)

    fs.writeFileSync(filePath, previewHtml)
    
    res.redirect(302, `/preview?fileName=${fileName}`);
  } catch (error) {
    console.error('创建预览时出错:', error)
    res.status(500).json({ message: '创建预览时出错' })
  }
}