import React, { useState } from 'react'
import { saveHtml } from '../lib/api-client'

const HtmlSaver: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState('')
  const [saveStatus, setSaveStatus] = useState('')

  const handleSave = async () => {
    try {
      const result = await saveHtml(htmlContent)
      setSaveStatus(result.message)
    } catch (error) {
      setSaveStatus('保存 HTML 时出错: ' + (error as Error).message)
    }
  }

  return (
    <div>
      <textarea
        value={htmlContent}
        onChange={(e) => setHtmlContent(e.target.value)}
        placeholder="在此输入 HTML 内容"
      />
      <button onClick={handleSave}>保存 HTML</button>
      {saveStatus && <p>{saveStatus}</p>}
    </div>
  )
}

export default HtmlSaver
