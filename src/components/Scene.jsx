import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, PerspectiveCamera } from '@react-three/drei';
import { BochoModel } from './BochoModel.jsx';
import { FollowCamera } from './FollowCamera.jsx';
import { StereoVRManager } from './StereoVRManager.jsx';

export function Scene({
  isPlaying,
  speed,
  followActive,
  followType,
  fixedView,
  lightMode,
  vrMode,
  carObj,
  setCarObj
}) {
  const orbitRef = useRef();

  // Configuracion de iluminacion segun el modo de luz
  const lightSettings = {
    day: {
      sky: { sunPosition: [100, 20, 100], turbidity: 8, rayleigh: 6 },
      sun: { color: '#ffffff', intensity: 1.5, position: [100, 200, 100] },
      ambient: { color: '#ffffff', intensity: 0.8 },
      bg: '#60a5fa'
    },
    sunset: {
      sky: { sunPosition: [100, 2, 100], turbidity: 10, rayleigh: 3 },
      sun: { color: '#ffedd5', intensity: 1.1, position: [80, 50, 80] },
      ambient: { color: '#fdba74', intensity: 0.6 },
      bg: '#fb923c'
    },
    night: {
      sky: { sunPosition: [0, -10, 0], turbidity: 2, rayleigh: 0.5 },
      sun: { color: '#60a5fa', intensity: 0.3, position: [50, 100, 50] },
      ambient: { color: '#3b82f6', intensity: 0.3 },
      bg: '#090d16'
    }
  }[lightMode];

  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
    >
      <PerspectiveCamera makeDefault position={[-445, 4.5, 32]} fov={80} near={0.1} far={50000} />

      {/* Cielo e Iluminacion Dinamica */}
      <Sky
        distance={45000}
        sunPosition={lightSettings.sky.sunPosition}
        turbidity={lightSettings.sky.turbidity}
        rayleigh={lightSettings.sky.rayleigh}
      />
      <ambientLight color={lightSettings.ambient.color} intensity={lightSettings.ambient.intensity} />
      <directionalLight
        position={lightSettings.sun.position}
        color={lightSettings.sun.color}
        intensity={lightSettings.sun.intensity}
        castShadow={false}
      />
      <hemisphereLight groundColor="#334155" color="#94a3b8" intensity={0.6} />

      {/* Modelo 3D del Bocho y Entorno */}
      <BochoModel isPlaying={isPlaying} speed={speed} onCarRef={setCarObj} />

      {/* Control de Camara y Seguimiento */}
      <FollowCamera
        carObj={carObj}
        followActive={followActive}
        followType={followType}
        fixedView={fixedView}
        orbitControlsRef={orbitRef}
      />

      {/* Controles orbitales cuando el seguimiento no esta activo */}
      <OrbitControls
        ref={orbitRef}
        enabled={!followActive}
        enableDamping
        dampingFactor={0.05}
        maxDistance={5000}
        minDistance={1}
      />

      {/* Gestor Estereoscopico VR (Cardboard / Homido SBS) */}
      <StereoVRManager enabled={vrMode} eyeSep={0.064} />
    </Canvas>
  );
}
