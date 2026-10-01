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
  const onWebXRTriggerRef = useRef(null);

  const handleRestart = useCallback(() => {
    if (!followActive) {
      setFixedView('origin');
    }
  }, [followActive]);

  const toggleVRMode = useCallback(async () => {
    // 1. Si el gestor oficial WebXR esta listo, lanzar la sesion nativa
    if (onWebXRTriggerRef.current) {
      onWebXRTriggerRef.current();
      return;
    }

    // 2. Solicitar permisos de giroscopio en iOS si aplica
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        await DeviceOrientationEvent.requestPermission();
      } catch (err) {
        console.warn('Permisos de sensor:', err);
      }
    }

    // 3. Modo visor manual de respaldo
    setVrMode((prev) => {
      const next = !prev;
      if (next) {
        const el = document.documentElement;
        const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
        if (rfs) {
          Promise.resolve(rfs.call(el))
            .then(() => {
              if (window.screen?.orientation && window.screen.orientation.lock) {
                return window.screen.orientation.lock('landscape').catch(() => {});
              }
            })
            .catch(() => {});
        }
      } else {
        const efs = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (efs && (document.fullscreenElement || document.webkitFullscreenElement)) {
          efs.call(document);
        }
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
        setVrMode={setVrMode}
        carObj={carObj}
        setCarObj={setCarObj}
        onRecenterRef={onRecenterRef}
        onWebXRTriggerRef={onWebXRTriggerRef}
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
