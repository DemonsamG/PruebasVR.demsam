import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const _zee = new THREE.Vector3(0, 0, 1);
const _euler = new THREE.Euler();
const _q0 = new THREE.Quaternion();
const _q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -PI/2 en eje X

export function VRDeviceOrientation({ onRecenterRef, carObj, followActive }) {
  const { camera } = useThree();
  const orientationData = useRef(null);
  const screenAngle = useRef(0);
  const alphaOffset = useRef(0);
  const hasCalibrated = useRef(false);

  // Funcion para recentrar la vista hacia el frente del escenario o del auto
  const recenter = () => {
    if (!orientationData.current) return;
    const curAlpha = THREE.MathUtils.degToRad(orientationData.current.alpha || 0);

    let targetYaw = 0;
    if (followActive && carObj) {
      targetYaw = -Math.PI / 2; // Hacia el frente de marcha (+X)
    } else {
      _euler.setFromQuaternion(camera.quaternion, 'YXZ');
      targetYaw = _euler.y;
    }

    alphaOffset.current = targetYaw - curAlpha;
  };

  useEffect(() => {
    if (onRecenterRef) {
      onRecenterRef.current = recenter;
    }
  });

  useEffect(() => {
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
      // Verificar si hay datos validos del sensor
      if (event.beta !== null && event.gamma !== null) {
        orientationData.current = event;

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

    const handleTapToRecenter = (e) => {
      if (e.target && e.target.closest && e.target.closest('button')) return;
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
  }, []);

  useFrame(() => {
    if (!orientationData.current) return;

    const dev = orientationData.current;
    const alpha = dev.alpha ? THREE.MathUtils.degToRad(dev.alpha) + alphaOffset.current : 0;
    const beta = dev.beta ? THREE.MathUtils.degToRad(dev.beta) : 0;
    const gamma = dev.gamma ? THREE.MathUtils.degToRad(dev.gamma) : 0;
    const orient = THREE.MathUtils.degToRad(screenAngle.current);

    _euler.set(beta, alpha, -gamma, 'YXZ');
    camera.quaternion.setFromEuler(_euler);
    camera.quaternion.multiply(_q1);
    camera.quaternion.multiply(_q0.setFromAxisAngle(_zee, -orient));
  });

  return null;
}
