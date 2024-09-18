import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';  // 修改这里

interface ShareModalProps {
  shareUrl: string;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ shareUrl, onClose }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">分享预览</h2>
        <div className="flex justify-center mb-4">
          <QRCodeSVG value={shareUrl} size={200} />  {/* 修改这里 */}
        </div>
        <div className="flex mb-4">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-grow border rounded-l px-2 py-1"
          />
          <button
            onClick={handleCopy}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded-r"
          >
            复制
          </button>
        </div>
        {copySuccess && (
          <p className="text-green-500 text-center">复制成功！</p>
        )}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
        >
          关闭
        </button>
      </div>
    </div>
  );
};

export default ShareModal;