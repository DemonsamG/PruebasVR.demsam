import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

export function StereoVRManager({ eyeSep = 0.064 }) {
  const { gl } = useThree();

  const stereoCam = useMemo(() => {
    const s = new THREE.StereoCamera();
    s.aspect = 0.5; // Cada ojo ocupa la mitad horizontal
    s.eyeSep = eyeSep;

    // CRUCIAL: Desactivar auto-actualizaciones para que WebGLRenderer no resetee a (0,0,0)
    s.cameraL.matrixAutoUpdate = false;
    s.cameraR.matrixAutoUpdate = false;
    s.cameraL.matrixWorldAutoUpdate = false;
    s.cameraR.matrixWorldAutoUpdate = false;

    return s;
  }, [eyeSep]);

  const sizeVec = useRef(new THREE.Vector2());

  // Bucle de renderizado prioritario (priority 1) exclusivo para el modo estereoscopico
  useFrame(({ scene, camera }) => {
    gl.getSize(sizeVec.current);
    const w = sizeVec.current.x;
    const h = sizeVec.current.y;
    if (w <= 0 || h <= 0) return;

    // Sincronizar planos de corte con la camara principal (50,000 para no cortar la escena lejana)
    stereoCam.cameraL.near = camera.near || 0.1;
    stereoCam.cameraL.far = camera.far || 50000;
    stereoCam.cameraR.near = camera.near || 0.1;
    stereoCam.cameraR.far = camera.far || 50000;
    stereoCam.aspect = 0.5;
    stereoCam.eyeSep = eyeSep;

    // Actualizar la camara base y proyectar los dos ojos
    camera.updateMatrixWorld();
    stereoCam.update(camera);

    // CRUCIAL: Mantener matrixWorldAutoUpdate desactivado y calcular manualmente la matriz inversa
    stereoCam.cameraL.matrixWorldAutoUpdate = false;
    stereoCam.cameraR.matrixWorldAutoUpdate = false;
    stereoCam.cameraL.matrixWorldInverse.copy(stereoCam.cameraL.matrixWorld).invert();
    stereoCam.cameraR.matrixWorldInverse.copy(stereoCam.cameraR.matrixWorld).invert();

    const halfW = Math.floor(w / 2);

    gl.autoClear = false;
    gl.clear();

    // 1. OJO IZQUIERDO (Mitad izquierda de la pantalla)
    gl.setViewport(0, 0, halfW, h);
    gl.setScissor(0, 0, halfW, h);
    gl.setScissorTest(true);
    gl.render(scene, stereoCam.cameraL);

    // 2. OJO DERECHO (Mitad derecha de la pantalla)
    gl.setViewport(halfW, 0, w - halfW, h);
    gl.setScissor(halfW, 0, w - halfW, h);
    gl.setScissorTest(true);
    gl.render(scene, stereoCam.cameraR);

    // Restaurar estado limpio para el renderer
    gl.setScissorTest(false);
    gl.setViewport(0, 0, w, h);
    gl.autoClear = true;
  }, 1);

  return null;
}
