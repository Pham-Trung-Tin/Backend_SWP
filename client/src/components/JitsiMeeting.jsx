import React, { useEffect, useRef } from 'react';

const JitsiMeeting = ({ roomName, style = {}, onLeave }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    // Cleanup: leave call by removing iframe src
    return () => {
      if (iframeRef.current) {
        iframeRef.current.src = '';
      }
    };
  }, []);

  if (!roomName) return null;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        background: '#000',
        zIndex: 9999,
        ...style,
      }}
    >
      <iframe
        ref={iframeRef}
        src={`https://meet.jit.si/${roomName}`}
        allow="camera; microphone; fullscreen; display-capture"
        style={{
          width: '100%',
          height: '100%',
          border: 0,
        }}
        title="Jitsi Meeting"
        allowFullScreen
      />
      {onLeave && (
        <button
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 10000,
            padding: '10px 20px',
            background: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 16,
            cursor: 'pointer',
          }}
          onClick={onLeave}
        >
          Rời khỏi cuộc gọi
        </button>
      )}
    </div>
  );
};

export default JitsiMeeting;
