import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  Camera,
  Sun,
  Moon,
  Sunset,
  Glasses,
  ChevronDown,
  ChevronUp,
  Gauge,
  Compass,
  Crosshair
} from 'lucide-react';
import { SoundFX } from '../utils/sound.js';

export function UIOverlay({
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
  followActive,
  setFollowActive,
  followType,
  setFollowType,
  fixedView,
  setFixedView,
  lightMode,
  setLightMode,
  vrMode,
  toggleVRMode,
  onRestart,
  onRecenter
}) {
  const [menuOpen, setMenuOpen] = useState(true);

  const handleAction = (cb) => {
    SoundFX.playClick();
    if (cb) cb();
  };

  return (
    <>
      {/* Linea divisoria central en modo VR para el visor */}
      {vrMode && <div className="vr-center-divider" />}

      {/* Botones de Control Flotante en Modo VR */}
      {vrMode && (
        <div style={{ position: 'fixed', top: 16, left: 16, zIndex: 99999, display: 'flex', gap: 10 }}>
          <button
            onClick={() => handleAction(onRecenter)}
            className="glass-btn"
            style={{
              padding: '10px 16px',
              borderRadius: 30,
              background: 'rgba(15, 23, 42, 0.85)',
              borderColor: '#38bdf8',
              color: '#38bdf8',
              fontWeight: 600,
              fontSize: 12
            }}
          >
            <Crosshair size={16} />
            <span>Recentrar Vista</span>
          </button>
        </div>
      )}

      {/* HUD Superior Izquierdo: Estado y Controles rapidos (oculto en VR para evitar distraccion) */}
      {!vrMode && (
        <div style={{ position: 'fixed', top: 16, left: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="glass-panel" style={{ padding: '8px 14px', borderRadius: 12, color: '#f8fafc', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: isPlaying ? '#10b981' : '#f59e0b', boxShadow: '0 0 10px currentColor' }} />
            <span><strong>Bocho 3D</strong> • React Three Fiber</span>
          </div>
        </div>
      )}

      {/* Boton Flotante Google Cardboard (Esquina inferior izquierda) */}
      <button
        onClick={() => handleAction(toggleVRMode)}
        onMouseEnter={() => SoundFX.playHover()}
        className="glass-btn"
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          zIndex: 99999,
          padding: '12px 20px',
          borderRadius: 50,
          borderColor: vrMode ? '#ef4444' : '#38bdf8',
          background: vrMode ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 23, 42, 0.9)',
          boxShadow: vrMode ? '0 0 20px rgba(239, 68, 68, 0.5)' : '0 4px 20px rgba(0,0,0,0.5), 0 0 14px rgba(56, 189, 248, 0.35)',
          color: '#ffffff',
          fontWeight: 700
        }}
      >
        <Glasses size={22} />
        <span>{vrMode ? 'SALIR DE VR' : 'MODO VISOR VR'}</span>
      </button>

      {/* Panel de Control Principal (Flotante a la derecha - Oculto en VR para inmersion) */}
      {!vrMode && (
        <div
          className="glass-panel"
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 9999,
            borderRadius: 16,
            width: 310,
            maxHeight: 'calc(100dvh - 32px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Cabecera del Panel */}
          <div
            onClick={() => handleAction(() => setMenuOpen(!menuOpen))}
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderBottom: menuOpen ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Compass size={18} color="#38bdf8" />
              <span style={{ color: '#ffffff', fontWeight: 700, fontSize: 14 }}>Panel de Control</span>
            </div>
            {menuOpen ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
          </div>

          {/* Contenido Desplegable */}
          {menuOpen && (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* SECCION 1: SEGUIMIENTO DE CAMARA */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                  Modo Seguimiento
                </span>
                <button
                  onClick={() => handleAction(() => setFollowActive(!followActive))}
                  className={`glass-btn ${followActive ? 'active' : ''}`}
                  style={{ width: '100%', padding: '10px 14px', marginBottom: 8 }}
                >
                  <Camera size={16} />
                  <span>{followActive ? 'Seguimiento: ACTIVO' : 'Seguir Auto en Marcha'}</span>
                </button>

                {/* Tipos de seguimiento */}
                {followActive && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {[
                      { id: 'chase', label: 'Atras' },
                      { id: 'side', label: 'Lateral' },
                      { id: 'roof', label: 'Techo' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleAction(() => setFollowType(item.id))}
                        className={`glass-btn ${followType === item.id ? 'active' : ''}`}
                        style={{ padding: '6px 8px', fontSize: 12 }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SECCION 2: CONTROL DEL AUTO */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                  Recorrido del Auto
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  <button
                    onClick={() => handleAction(() => setIsPlaying(!isPlaying))}
                    className="glass-btn"
                    style={{
                      padding: '10px',
                      background: isPlaying ? 'rgba(59, 130, 246, 0.8)' : 'rgba(245, 158, 11, 0.8)',
                      borderColor: isPlaying ? '#38bdf8' : '#fbbf24'
                    }}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    <span>{isPlaying ? 'Pausar' : 'Reanudar'}</span>
                  </button>

                  <button
                    onClick={() => handleAction(onRestart)}
                    className="glass-btn"
                    style={{ padding: '10px' }}
                  >
                    <RotateCcw size={16} color="#10b981" />
                    <span>Reiniciar</span>
                  </button>
                </div>

                {/* Selector de Velocidad */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                    <Gauge size={14} />
                    <span>Velocidad:</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1.0, 2.0, 0.5].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => handleAction(() => setSpeed(spd))}
                        className={`glass-btn ${speed === spd ? 'active' : ''}`}
                        style={{ padding: '4px 8px', fontSize: 11 }}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECCION 3: PUNTOS DE VISTA FIJOS */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                  Puntos de Vista
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {[
                    { id: 'origin', label: 'Salida' },
                    { id: 'center', label: 'Glorieta' },
                    { id: 'aerial', label: 'Aerea' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setFollowActive(false);
                        handleAction(() => setFixedView(item.id));
                      }}
                      className={`glass-btn ${!followActive && fixedView === item.id ? 'active' : ''}`}
                      style={{ padding: '8px 4px', fontSize: 12 }}
                    >
                      <Eye size={14} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECCION 4: ILUMINACION */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                  Iluminacion de la Escena
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {[
                    { id: 'day', label: 'Dia', icon: Sun },
                    { id: 'sunset', label: 'Tarde', icon: Sunset },
                    { id: 'night', label: 'Noche', icon: Moon }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleAction(() => setLightMode(item.id))}
                        className={`glass-btn ${lightMode === item.id ? 'active' : ''}`}
                        style={{ padding: '8px 4px', fontSize: 12 }}
                      >
                        <Icon size={14} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
