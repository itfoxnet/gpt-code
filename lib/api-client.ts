import { SaveHtmlData, SaveHtmlResponse } from '../types/api'

export async function saveHtml(htmlContent: string): Promise<{ message: string, fileName: string }> {
  const response = await fetch('/api/save-html', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `data=${encodeURIComponent(JSON.stringify({ html: htmlContent }))}`,
  });

  if (!response.ok) {
    throw new Error('保存 HTML 失败');
  }

  return response.json();
}
