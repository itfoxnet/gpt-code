import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import QRCode from 'qrcode.react';
import ShareModal from '../components/ShareModal';

const PreviewPage: React.FC = () => {
  const router = useRouter();
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const { fileName } = router.query;
    if (fileName && typeof fileName === 'string') {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      setIframeUrl(`${baseUrl}/api/read-html?fileName=${encodeURIComponent(fileName)}`);
    }
  }, [router.query]);

  if (!iframeUrl) {
    return <div className="p-4">加载中...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">HTML 预览</h1>
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          分享
        </button>
      </div>
      <iframe
        src={iframeUrl}
        className="w-full h-screen border-2 border-gray-300 rounded"
        title="HTML Preview"
      />
      {isShareModalOpen && (
        <ShareModal
          shareUrl={iframeUrl}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PreviewPage;