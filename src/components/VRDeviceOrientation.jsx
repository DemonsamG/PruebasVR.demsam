import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const _zee = new THREE.Vector3(0, 0, 1);
const _euler = new THREE.Euler();
const _q0 = new THREE.Quaternion();
const _q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -PI/2 alrededor del eje X

export function VRDeviceOrientation({ enabled, onRecenterRef, carObj, followActive }) {
  const { camera } = useThree();
  const orientationData = useRef(null);
  const screenAngle = useRef(0);
  const alphaOffset = useRef(0);
  const hasCalibrated = useRef(false);
  const tempTarget = useRef(new THREE.Vector3());

  // Funcion de recentrado para alinear el frente fisico con el auto/escena
  const recenter = () => {
    if (!orientationData.current) return;
    const curAlpha = THREE.MathUtils.degToRad(orientationData.current.alpha || 0);

    // Calcular el yaw deseado hacia el auto o la direccion frontal
    let targetYaw = 0;
    if (followActive && carObj) {
      carObj.getWorldPosition(tempTarget.current);
      // En modo persecucion, el frente esta en direccion +X (angulo -PI/2)
      targetYaw = -Math.PI / 2;
    } else {
      // Tomar el yaw actual de la camara
      _euler.setFromQuaternion(camera.quaternion, 'YXZ');
      targetYaw = _euler.y;
    }

    // Offset calibrado
    alphaOffset.current = targetYaw - curAlpha;
  };

  useEffect(() => {
    if (onRecenterRef) {
      onRecenterRef.current = recenter;
    }
  });

  useEffect(() => {
    if (!enabled) {
      hasCalibrated.current = false;
      orientationData.current = null;
      return;
    }

    const updateScreenAngle = () => {
      if (window.screen?.orientation && typeof window.screen.orientation.angle === 'number') {
        screenAngle.current = window.screen.orientation.angle;
      } else if (typeof window.orientation === 'number') {
        screenAngle.current = window.orientation;
      } else {
        screenAngle.current = 0;
      }
    };

    const handleOrientation = (event) => {
      // Validar que el dispositivo realmente transmita valores de giroscopio
      if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
        orientationData.current = event;

        // Calibrar automaticamente la primera vez que se reciben datos
        if (!hasCalibrated.current) {
          recenter();
          hasCalibrated.current = true;
        }
      }
    };

    updateScreenAngle();
    window.addEventListener('orientationchange', updateScreenAngle);
    window.addEventListener('resize', updateScreenAngle);
    window.addEventListener('deviceorientation', handleOrientation, true);
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);

    // En visores Cardboard, el boton capacitivo toca la pantalla; usarlo para recentrar
    const handleTapToRecenter = (e) => {
      // Ignorar si el clic fue en un boton de la interfaz
      if (e.target.closest('button')) return;
      recenter();
    };
    window.addEventListener('pointerdown', handleTapToRecenter);

    return () => {
      window.removeEventListener('orientationchange', updateScreenAngle);
      window.removeEventListener('resize', updateScreenAngle);
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      window.removeEventListener('pointerdown', handleTapToRecenter);
      orientationData.current = null;
    };
  }, [enabled]);

  // Actualizacion de la rotacion de la camara en cada frame con el giroscopio
  useFrame(() => {
    if (!enabled || !orientationData.current) return;

    const dev = orientationData.current;
    const alpha = dev.alpha ? THREE.MathUtils.degToRad(dev.alpha) + alphaOffset.current : 0;
    const beta = dev.beta ? THREE.MathUtils.degToRad(dev.beta) : 0;
    const gamma = dev.gamma ? THREE.MathUtils.degToRad(dev.gamma) : 0;
    const orient = THREE.MathUtils.degToRad(screenAngle.current);

    // Algoritmo matematico de orientacion espacial (Euler Z-X-Y a Camara Y-X-Z)
    _euler.set(beta, alpha, -gamma, 'YXZ');
    camera.quaternion.setFromEuler(_euler);
    camera.quaternion.multiply(_q1);
    camera.quaternion.multiply(_q0.setFromAxisAngle(_zee, -orient));
  });

  return null;
}
