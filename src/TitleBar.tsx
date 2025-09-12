// src/components/TitleBar.tsx

import { useState } from 'react'
import { FiMinus, FiSquare, FiX } from 'react-icons/fi'

const TitleBar = () => {
  const [hovered, setHovered] = useState<string | null>(null)

  const handleMinimize = () => window.ipcRenderer.send('minimize-window')
  const handleMaximize = () => window.ipcRenderer.send('maximize-window')
  const handleClose = () => window.ipcRenderer.send('close-window')

  const barStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    // --- 타이틀 바 높이 증가 ---
    height: '40px',
    backgroundColor: '#1e1e1e',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 5px',
    boxSizing: 'border-box',
    WebkitAppRegion: 'drag',
    zIndex: 999,
  }

  const titleStyle: React.CSSProperties = {
    color: '#ccc',
    fontSize: '14px',
    fontWeight: 'bold',
  }

  const controlsStyle: React.CSSProperties = {
    display: 'flex',
    height: '100%',
  }

  const btnStyle: React.CSSProperties = {
    // --- 버튼/아이콘 크기 증가 ---
    width: '60px',
    fontSize: '20px',
    height: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    WebkitAppRegion: 'no-drag',
    transition: 'background-color 0.2s ease',
  }

  return (
    <div style={barStyle}>
      <div style={titleStyle}>LostarkAPI</div>
      <div style={controlsStyle}>
        <button
          style={{
            ...btnStyle,
            backgroundColor: hovered === 'minimize' ? '#333' : 'transparent',
          }}
          onClick={handleMinimize}
          onMouseEnter={() => setHovered('minimize')}
          onMouseLeave={() => setHovered(null)}
        >
          <FiMinus />
        </button>
        <button
          style={{
            ...btnStyle,
            backgroundColor: hovered === 'maximize' ? '#333' : 'transparent',
          }}
          onClick={handleMaximize}
          onMouseEnter={() => setHovered('maximize')}
          onMouseLeave={() => setHovered(null)}
        >
          <FiSquare />
        </button>
        <button
          style={{
            ...btnStyle,
            backgroundColor: hovered === 'close' ? '#e81123' : 'transparent',
          }}
          onClick={handleClose}
          onMouseEnter={() => setHovered('close')}
          onMouseLeave={() => setHovered(null)}
        >
          <FiX />
        </button>
      </div>
    </div>
  )
}

export default TitleBar