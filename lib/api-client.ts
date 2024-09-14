import { SaveHtmlData, SaveHtmlResponse } from '../types/api'

export async function saveHtml(htmlContent: string): Promise<SaveHtmlResponse> {
  const data: SaveHtmlData = {
    html: htmlContent,
    editors: "100",
    layout: "left",
    css_external: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css",
    js_external: "https://cdn.tailwindcss.com"
  }

  const response = await fetch('/api/save-html', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: JSON.stringify(data) }),
  })

  if (!response.ok) {
    throw new Error('保存 HTML 失败')
  }

  return response.json()
}
