import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

export function StereoVRManager({ enabled, eyeSep = 0.064 }) {
  const { gl } = useThree();
  const stereoCam = useMemo(() => {
    const s = new THREE.StereoCamera();
    s.aspect = 0.5; // Factor 0.5: cada ojo ocupa la mitad exacta del ancho de pantalla
    s.eyeSep = eyeSep;
    s.cameraL.matrixAutoUpdate = false;
    s.cameraR.matrixAutoUpdate = false;
    return s;
  }, [eyeSep]);

  const sizeVec = useRef(new THREE.Vector2());

  // Prioridad 1 para tomar el control del renderizado dual en VR
  useFrame(({ scene, camera }) => {
    if (!enabled) return;

    // Coordenadas logicas exactas (evita bug de DPR en pantallas Retina / AMOLED)
    gl.getSize(sizeVec.current);
    const w = sizeVec.current.x;
    const h = sizeVec.current.y;
    if (w <= 0 || h <= 0) return;

    stereoCam.cameraL.near = camera.near || 0.1;
    stereoCam.cameraL.far = camera.far || 50000;
    stereoCam.cameraR.near = camera.near || 0.1;
    stereoCam.cameraR.far = camera.far || 50000;
    stereoCam.aspect = 0.5;
    stereoCam.eyeSep = eyeSep;

    camera.updateMatrixWorld();
    stereoCam.update(camera);

    // CRUCIAL: Actualizar las matrices inversas de vista para ambos ojos
    stereoCam.cameraL.matrixWorldInverse.copy(stereoCam.cameraL.matrixWorld).invert();
    stereoCam.cameraR.matrixWorldInverse.copy(stereoCam.cameraR.matrixWorld).invert();

    const halfW = Math.floor(w / 2);

    gl.autoClear = false;
    gl.clear();

    // 1. OJO IZQUIERDO
    gl.setViewport(0, 0, halfW, h);
    gl.setScissor(0, 0, halfW, h);
    gl.setScissorTest(true);
    gl.render(scene, stereoCam.cameraL);

    // 2. OJO DERECHO
    gl.setViewport(halfW, 0, w - halfW, h);
    gl.setScissor(halfW, 0, w - halfW, h);
    gl.setScissorTest(true);
    gl.render(scene, stereoCam.cameraR);

    // Restaurar estado limpio para el pipeline de Three.js
    gl.setScissorTest(false);
    gl.setViewport(0, 0, w, h);
    gl.autoClear = true;
  }, enabled ? 1 : 0);

  return null;
}
