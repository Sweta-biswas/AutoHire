import React, { useEffect } from 'react';
import { Image, message } from 'antd';
import { Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Trash2 } from 'lucide-react';

const ImageUpload = ({ 
  photo, 
  onPhotoChange, 
  onPhotoRemove,
  previewOpen,
  previewImage,
  setPreviewOpen,
  setPreviewImage,
  fileList,
  setFileList 
}) => {
  // Set the initial fileList if photo exists
  useEffect(() => {
    if (photo) {
      setFileList([
        {
          uid: '-1', // unique identifier for the image
          name: 'photo.jpg',
          status: 'done',
          url: photo, // The image URL passed via the photo prop
        }
      ]);
    }
  }, [photo, setFileList]);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleUploadChange = async ({ file, fileList: newFileList }) => {
    const updatedFileList = newFileList.map(f => {
      if (f.uid === file.uid) {
        return { ...f, status: 'done' };
      }
      return f;
    });
    setFileList(updatedFileList);
  
    if (file.originFileObj) {
      try {
        const formData = new FormData();
        formData.append('image', file.originFileObj);
  
        const response = await fetch(
          `https://api.imgbb.com/1/upload?key=${process.env.REACT_APP_IMGBB_API_KEY}`, // Use the key from .env
          {
            method: 'POST',
            body: formData,
          }
        );
  
        const result = await response.json();
  
        if (result.success) {
          const imgbbUrl = result.data.url;
          onPhotoChange(imgbbUrl); // Set the ImgBB URL as photo
        } else {
          message.error('Failed to upload image to ImgBB');
        }
      } catch (error) {
        message.error('Error uploading image to ImgBB');
      }
    }
  };

  const customRequest = async ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const uploadButton = (
    <button className="w-full h-full flex flex-col items-center justify-center" type="button">
      <PlusOutlined />
      <div className="mt-2">Upload</div>
    </button>
  );

  return (
    <>
      <div className="flex justify-center mb-4">
        <div className="relative">
          <Upload
            customRequest={customRequest}
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            onChange={handleUploadChange}
            maxCount={1}
            accept="image/*"
            showUploadList={{
              showPreviewIcon: true,
              showRemoveIcon: false,
            }}
          >
            {fileList.length >= 1 ? null : uploadButton}
          </Upload>
          {photo && (
            <div className="absolute -right-2 -bottom-2 flex space-x-1">
              <button
                className="p-1.5 bg-white rounded-full shadow hover:bg-gray-50"
                onClick={onPhotoRemove}
              >
                <Trash2 className="w-4 h-4 text-red-700" />
              </button>
            </div>
          )}
        </div>
      </div>

      {previewImage && (
        <Image
          style={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
    </>
  );
};

// Helper function for converting file to base64
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export default ImageUpload;
