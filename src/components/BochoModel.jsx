import React, { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

export function BochoModel({ isPlaying = true, speed = 1.0, onCarRef }) {
  const group = useRef();
  // Carga del modelo optimizado de 8.84 MB con decodificador Draco local
  const { scene, animations } = useGLTF('./bocho_optimized.glb', './draco/');
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (scene) {
      // Posicion calibrada en el mundo del proyecto (-28078.79)
      scene.position.set(-28078.79, 0, 0);

      // Localizar el nodo 'cubo' para el seguimiento de la camara
      const carObj = scene.getObjectByName('cubo');
      if (carObj && onCarRef) {
        onCarRef(carObj);
      }
    }
  }, [scene, onCarRef]);

  // Manejo de la animacion del recorrido (cuboAction.001)
  useEffect(() => {
    const action = actions['cuboAction.001'] || Object.values(actions)[0];
    if (action) {
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.clampWhenFinished = false;
      action.play();
    }
  }, [actions]);

  useEffect(() => {
    const action = actions['cuboAction.001'] || Object.values(actions)[0];
    if (action) {
      action.paused = !isPlaying;
      action.timeScale = speed;
    }
  }, [isPlaying, speed, actions]);

  return <primitive ref={group} object={scene} dispose={null} />;
}

useGLTF.preload('./bocho_optimized.glb', './draco/');
