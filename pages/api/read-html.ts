import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { fileName } = req.query

  if (!fileName || typeof fileName !== 'string') {
    return res.status(400).json({ message: '缺少文件名参数' })
  }

  const filePath = path.join(process.cwd(), 'public/previews', fileName)

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: filePath+'文件不存在' })
  }

  const htmlContent = fs.readFileSync(filePath, 'utf-8')

  res.setHeader('Content-Type', 'text/html')
  res.status(200).send(htmlContent)
}