// src/App.tsx
import { useState, useEffect } from 'react';
import Dashboard from '../Dashboard';
import ApiKeyInput from '../ApiKeyInput';
import './style/App.css'

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isKeySaved, setIsKeySaved] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      try {
        const result = await window.ipcRenderer.invoke('check-api-key');
        setIsKeySaved(result);
      } catch (error) {
        console.error("API 키 확인 중 에러 발생", error);
        setIsKeySaved(false);
      } finally {
        setIsLoading(false);
      }
    };

    const handleApiKeyDeleted = () => {
      setIsKeySaved(false);
    };

    checkKey();
    window.ipcRenderer.on('api-key-deleted-event', handleApiKeyDeleted);

    return () => {
      window.ipcRenderer.removeAllListeners('api-key-deleted-event');
    };
  }, []);

  if (isLoading) {
    return <div className="container"><h1>로딩 중...</h1></div>;
  }

  return isKeySaved 
    ? <Dashboard /> 
    : <ApiKeyInput onKeySaved={() => setIsKeySaved(true)} />;
};

export default App;