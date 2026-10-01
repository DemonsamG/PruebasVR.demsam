import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function FollowCamera({
  carObj,
  followActive,
  followType, // 'chase' | 'side' | 'roof'
  fixedView, // 'origin' | 'center' | 'aerial' | null
  orbitControlsRef,
  vrMode = false
}) {
  const { camera } = useThree();
  const tempVec = useRef(new THREE.Vector3());
  const targetCamPos = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());

  // Manejo de vistas fijas cuando no esta en seguimiento ni en VR
  useEffect(() => {
    if (followActive || !fixedView || vrMode) return;

    if (fixedView === 'origin') {
      camera.position.set(-445, 4.5, 32);
      camera.lookAt(-470, 4.5, 32);
      if (orbitControlsRef?.current) {
        orbitControlsRef.current.target.set(-470, 4.5, 32);
        orbitControlsRef.current.update();
      }
    } else if (fixedView === 'center') {
      camera.position.set(0, 4, 38);
      camera.lookAt(0, 3, 0);
      if (orbitControlsRef?.current) {
        orbitControlsRef.current.target.set(0, 3, 0);
        orbitControlsRef.current.update();
      }
    } else if (fixedView === 'aerial') {
      camera.position.set(0, 60, 120);
      camera.lookAt(0, 0, 0);
      if (orbitControlsRef?.current) {
        orbitControlsRef.current.target.set(0, 0, 0);
        orbitControlsRef.current.update();
      }
    }
  }, [fixedView, followActive, vrMode, camera, orbitControlsRef]);

  // Actualizacion frame a frame del modo seguimiento
  useFrame((state, delta) => {
    if (!followActive || !carObj) return;

    carObj.getWorldPosition(tempVec.current);
    const carPos = tempVec.current;
    const carCenterZ = carPos.z - 13.2;

    if (followType === 'chase') {
      // Detras de la defensa trasera del Bocho
      targetCamPos.current.set(carPos.x - 52, 9.5, carCenterZ);
      lookTarget.current.set(carPos.x, 5.0, carCenterZ);
    } else if (followType === 'side') {
      // Vista lateral en acera
      targetCamPos.current.set(carPos.x - 16, 5.5, carCenterZ + 25);
      lookTarget.current.set(carPos.x - 16, 4.5, carCenterZ);
    } else {
      // Vista techo / cofre
      targetCamPos.current.set(carPos.x - 12, 8.5, carCenterZ);
      lookTarget.current.set(carPos.x + 30, 4.0, carCenterZ);
    }

    // Interpolacion fluida de la posicion
    const factor = Math.min(1.0, delta * 12);
    camera.position.lerp(targetCamPos.current, factor);

    // En modo VR, el giroscopio orienta la cabeza libremente. NO forzar lookAt
    if (!vrMode) {
      camera.lookAt(lookTarget.current);

      if (orbitControlsRef?.current) {
        orbitControlsRef.current.target.lerp(lookTarget.current, factor);
        orbitControlsRef.current.update();
      }
    }
  });

  return null;
}
