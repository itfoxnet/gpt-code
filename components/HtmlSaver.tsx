import React, { useState, useRef } from 'react'
import { saveHtml } from '../lib/api-client'

const HtmlSaver: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleSave = async () => {
    try {
      const result = await saveHtml(htmlContent)
      setSaveStatus(result.message)
    } catch (error) {
      setSaveStatus('保存 HTML 时出错: ' + (error as Error).message)
    }
  }

  const handleRead = async () => {
    try {
      const response = await fetch('/api/read-html');
      const htmlContent = await response.text();
      if (iframeRef.current) {
        iframeRef.current.srcdoc = htmlContent;
      }
      setSaveStatus('成功读取并预览保存的 HTML');
    } catch (error) {
      setSaveStatus('读取保存的 HTML 时出错');
    }
  }

  return (
    <div className="space-y-4">
      <textarea
        className="w-full h-40 p-2 border rounded"
        value={htmlContent}
        onChange={(e) => setHtmlContent(e.target.value)}
        placeholder="在此输入 HTML 内容"
      />
      <div className="space-x-4">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSave}
        >
          保存 HTML
        </button>
        <button 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={handleRead}
        >
          预览保存的 HTML
        </button>
      </div>
      {saveStatus && <p className="text-sm text-gray-600">{saveStatus}</p>}
      <div>
        <h3 className="text-lg font-semibold mb-2">HTML 预览：</h3>
        <iframe
          ref={iframeRef}
          className="w-full h-96 border rounded"
          title="HTML 预览"
        />
      </div>
    </div>
  )
}

export default HtmlSaver
