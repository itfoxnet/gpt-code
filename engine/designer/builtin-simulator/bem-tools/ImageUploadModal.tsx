import React, { useState } from 'react';

interface ImageUploadModalProps {
  onClose: () => void;
  onUpload: (imageUrl: string) => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setError(null); // 清除之前的错误
    }
  };

  const handleUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('Upload started');
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      console.log('Sending request');
      const response = await fetch('/api/upload-pic', {
        method: 'POST',
        body: formData,
      });

      console.log('Response received', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '上传失败');
      }

      const data = await response.json();
      console.log('Upload successful', data);
      onUpload(data.imageUrl);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : '上传图片失败，请重试。');
    } finally {
      setUploading(false);
      console.log('Upload process completed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg">
        <h2 className="text-lg font-bold mb-4">上传图片</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <div className="mt-4 flex justify-end">
            <button 
              type="button"
              onClick={onClose} 
              className="mr-2 px-4 py-2 bg-gray-200 rounded" 
              disabled={uploading}
            >
              取消
            </button>
            <button 
              type="button"
              onClick={handleUpload} 
              className="px-4 py-2 bg-blue-500 text-white rounded" 
              disabled={!selectedFile || uploading}
            >
              {uploading ? '上传中...' : '上传'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImageUploadModal;