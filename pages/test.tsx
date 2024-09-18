import React, { useState } from 'react';
import { saveHtml } from '../lib/api-client';
import { useRouter } from 'next/router';

const TestPage: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [fileName, setFileName] = useState('');
  const router = useRouter();

  const handleSave = async () => {
    try {
      const result = await saveHtml(htmlContent);
      setSaveStatus(result.message);
      setFileName(result.fileName);
    } catch (error) {
      setSaveStatus('保存 HTML 时出错: ' + (error as Error).message);
    }
  };

  const handlePreview = () => {
    if (!fileName) {
      setSaveStatus('请先保存 HTML');
      return;
    }
    window.open(`/preview?fileName=${encodeURIComponent(fileName)}`, '_blank');
  };

  return (
    <div className="p-4">
      <textarea
        className="w-full h-40 p-2 border rounded"
        value={htmlContent}
        onChange={(e) => setHtmlContent(e.target.value)}
        placeholder="在此输入 HTML 内容"
      />
      <div className="mt-4 space-x-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSave}
        >
          保存 HTML
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={handlePreview}
        >
          预览 HTML
        </button>
      </div>
      {saveStatus && <p className="mt-4 text-sm text-gray-600">{saveStatus}</p>}
      {fileName && <p className="mt-2 text-sm text-gray-600">文件名: {fileName}</p>}
    </div>
  );
};

export default TestPage;