import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

export function WebXRManager({ onSessionChange, onTriggerRef }) {
  const { gl } = useThree();

  useEffect(() => {
    // 1. Habilitar el motor WebXR en Three.js
    gl.xr.enabled = true;

    // 2. Crear y estilizar el boton nativo oficial de WebXR
    const button = VRButton.createButton(gl);
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '999999';
    button.style.borderRadius = '50px';
    button.style.padding = '12px 20px';
    button.style.background = 'rgba(15, 23, 42, 0.9)';
    button.style.border = '2px solid #38bdf8';
    button.style.color = '#38bdf8';
    button.style.fontWeight = '700';
    button.style.boxShadow = '0 0 16px rgba(56, 189, 248, 0.45)';
    button.style.fontSize = '13px';
    button.style.letterSpacing = '1px';
    button.style.textTransform = 'uppercase';

    document.body.appendChild(button);

    // 3. Vincular ref para que cualquier otro boton pueda disparar el clic nativo
    if (onTriggerRef) {
      onTriggerRef.current = () => {
        button.click();
      };
    }

    // 4. Escuchar eventos de inicio y fin de sesion VR
    const onStart = () => {
      console.log('Sesion WebXR iniciada');
      if (onSessionChange) onSessionChange(true);
    };
    const onEnd = () => {
      console.log('Sesion WebXR finalizada');
      if (onSessionChange) onSessionChange(false);
    };

    gl.xr.addEventListener('sessionstart', onStart);
    gl.xr.addEventListener('sessionend', onEnd);

    return () => {
      gl.xr.removeEventListener('sessionstart', onStart);
      gl.xr.removeEventListener('sessionend', onEnd);
      if (button.parentNode) {
        button.parentNode.removeChild(button);
      }
    };
  }, [gl, onSessionChange, onTriggerRef]);

  return null;
}
