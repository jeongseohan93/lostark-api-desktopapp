// src/settings.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const Settings = () => {
  const handleClose = () => {
    window.ipcRenderer.invoke('close-settings-window');
  };

  const handleDeleteApiKey = async () => {
    try {
      await window.ipcRenderer.invoke('delete-api-key');
      alert('API 키가 삭제되었습니다.');
      window.ipcRenderer.send('notify-api-key-deleted');
      handleClose();
    } catch (error: any) {
      alert(`삭제 실패: ${error.message}`);
    }
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h1>설정</h1>
      <button onClick={handleDeleteApiKey}>API 키 삭제</button>
      <hr style={{ margin: '20px 0' }} />
      <button onClick={handleClose}>닫기</button>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Settings />
  </React.StrictMode>,
);