import React, { useState, useCallback, useRef } from 'react';
import { Scene } from './components/Scene.jsx';
import { UIOverlay } from './components/UIOverlay.jsx';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [followActive, setFollowActive] = useState(false);
  const [followType, setFollowType] = useState('chase'); // 'chase' | 'side' | 'roof'
  const [fixedView, setFixedView] = useState('origin'); // 'origin' | 'center' | 'aerial'
  const [lightMode, setLightMode] = useState('day'); // 'day' | 'sunset' | 'night'
  const [vrMode, setVrMode] = useState(false);
  const [carObj, setCarObj] = useState(null);
  const onRecenterRef = useRef(null);

  const handleRestart = useCallback(() => {
    if (!followActive) {
      setFixedView('origin');
    }
  }, [followActive]);

  const toggleVRMode = useCallback(() => {
    // Permisos de sensores en iOS Safari (debe ejecutarse inmediatamente en el gesto del usuario)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((res) => {
          console.log('Permiso de orientacion:', res);
        })
        .catch((err) => {
          console.error('Error solicitando permisos de orientacion:', err);
        });
    }

    setVrMode((prev) => {
      const next = !prev;
      if (next) {
        // Pantalla completa
        try {
          const el = document.documentElement;
          const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
          if (rfs) rfs.call(el);
        } catch (e) {}

        // Intentar bloquear en horizontal en telefonos
        try {
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {});
          }
        } catch (e) {}
      } else {
        try {
          const efs = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
          if (efs && (document.fullscreenElement || document.webkitFullscreenElement)) {
            efs.call(document);
          }
        } catch (e) {}
      }
      return next;
    });
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Lienzo 3D con React Three Fiber */}
      <Scene
        isPlaying={isPlaying}
        speed={speed}
        followActive={followActive}
        followType={followType}
        fixedView={fixedView}
        lightMode={lightMode}
        vrMode={vrMode}
        carObj={carObj}
        setCarObj={setCarObj}
        onRecenterRef={onRecenterRef}
      />

      {/* Interfaz de Usuario Moderna y Controles Espaciales */}
      <UIOverlay
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        speed={speed}
        setSpeed={setSpeed}
        followActive={followActive}
        setFollowActive={setFollowActive}
        followType={followType}
        setFollowType={setFollowType}
        fixedView={fixedView}
        setFixedView={setFixedView}
        lightMode={lightMode}
        setLightMode={setLightMode}
        vrMode={vrMode}
        toggleVRMode={toggleVRMode}
        onRestart={handleRestart}
        onRecenter={() => onRecenterRef.current?.()}
      />
    </div>
  );
}
