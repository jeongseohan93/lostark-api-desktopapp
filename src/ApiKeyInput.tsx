// src/components/ApiKeyInput.tsx
import React, { useState } from 'react';

interface ApiKeyInputProps {
  onKeySaved: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onKeySaved }) => {
  const [inputKey, setInputKey] = useState('');
  const [statusMessage, setStatusMessage] = useState('API 키를 입력하고 저장하세요.');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputKey(event.target.value);
  };

  const saveApiKey = async () => {
    if (!inputKey) {
      setStatusMessage('API 키를 입력하세요.');
      return;
    }
    setStatusMessage('저장 중...');
    try {
      await window.ipcRenderer.invoke('save-api-key', inputKey);
      onKeySaved();
    } catch (error: any) {
      setStatusMessage(`저장 실패: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <h1>API 키 관리</h1>
      <p>{statusMessage}</p>
      <div className="input-container">
        <input
          type="text"
          placeholder="여기에 API 키를 입력하세요..."
          value={inputKey}
          onChange={handleInputChange}
          className="api-key-input"
        />
        <button onClick={saveApiKey}>API 키 저장</button>
      </div>
    </div>
  );
};

export default ApiKeyInput;