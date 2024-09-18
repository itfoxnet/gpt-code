import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const PreviewPage: React.FC = () => {
  const router = useRouter();
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    const { fileName } = router.query;
    if (fileName && typeof fileName === 'string') {
      setIframeUrl(`/api/read-html?fileName=${encodeURIComponent(fileName)}`);
    }
  }, [router.query]);

  if (!iframeUrl) {
    return <div className="p-4">加载中...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">HTML 预览</h1>
      <iframe
        src={iframeUrl}
        className="w-full h-screen border-2 border-gray-300 rounded"
        title="HTML Preview"
      />
    </div>
  );
};

export default PreviewPage;