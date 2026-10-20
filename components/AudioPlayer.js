'use client';

import { useEffect, useState } from 'react';
import { ambientSynth, AUDIO_PRESETS } from '@/lib/audioPresets';

export default function AudioPlayer({ presetId = 'romantic-piano', autoStart = false }) {
  const [currentPreset, setCurrentPreset] = useState(presetId || 'romantic-piano');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setCurrentPreset(presetId || 'romantic-piano');
  }, [presetId]);

  useEffect(() => {
    if (autoStart && currentPreset !== 'none') {
      const handleFirstInteraction = () => {
        ambientSynth.play(currentPreset);
        setIsPlaying(true);
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
      };

      window.addEventListener('click', handleFirstInteraction, { once: true });
      window.addEventListener('touchstart', handleFirstInteraction, { once: true });

      return () => {
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
      };
    }
  }, [autoStart, currentPreset]);

  useEffect(() => {
    return () => {
      ambientSynth.stop();
    };
  }, []);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      ambientSynth.stop();
      setIsPlaying(false);
    } else {
      ambientSynth.play(currentPreset);
      setIsPlaying(true);
    }
  };

  const selectPreset = (newId) => {
    setCurrentPreset(newId);
    if (newId === 'none') {
      ambientSynth.stop();
      setIsPlaying(false);
    } else {
      ambientSynth.play(newId);
      setIsPlaying(true);
    }
  };

  const currentPresetInfo = AUDIO_PRESETS.find((p) => p.id === currentPreset) || AUDIO_PRESETS[0];

  return (
    <div
      className="audio-player-floating"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9999,
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          boxShadow: '0 12px 30px rgba(190, 24, 93, 0.15), 0 2px 8px rgba(0,0,0,0.06)',
          borderRadius: '999px',
          padding: '6px 14px 6px 8px',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <button
          type="button"
          onClick={togglePlay}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: isPlaying ? 'linear-gradient(135deg, #a64036, #a64036)' : '#f3f4f6',
            color: isPlaying ? '#ffffff' : '#4b5563',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: isPlaying ? '0 4px 12px rgba(244, 63, 94, 0.4)' : 'none',
            transition: 'transform 0.15s ease',
          }}
          aria-label={isPlaying ? 'Pause soundtrack' : 'Play soundtrack'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#be185d', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {isPlaying ? 'SOUNDTRACK' : 'MUSIC'}
            </span>
            {isPlaying && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '10px' }}>
                <span className="sound-wave-bar bar-1" />
                <span className="sound-wave-bar bar-2" />
                <span className="sound-wave-bar bar-3" />
              </div>
            )}
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937', maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentPresetInfo.name}
          </span>
        </div>

        <span style={{ fontSize: '10px', color: '#9ca3af', marginLeft: '4px' }}>
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {isExpanded && (
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            left: '0',
            width: '260px',
            background: '#ffffff',
            borderRadius: '18px',
            padding: '12px',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.14)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ padding: '4px 6px 8px', borderBottom: '1px solid #f3f4f6', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Choose Soundscape
          </div>
          {AUDIO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => selectPreset(preset.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '10px',
                border: 'none',
                background: currentPreset === preset.id ? '#fff1f2' : 'transparent',
                color: currentPreset === preset.id ? '#be185d' : '#374151',
                fontWeight: currentPreset === preset.id ? 700 : 500,
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'background 0.15s ease',
              }}
            >
              <span style={{ fontSize: '16px' }}>{preset.icon}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{preset.name}</span>
                <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 400 }}>{preset.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <style jsx global>{`
        .sound-wave-bar {
          display: inline-block;
          width: 2.5px;
          background: #f43f5e;
          border-radius: 1px;
          animation: soundWave 1.2s ease-in-out infinite alternate;
        }
        .bar-1 { height: 6px; animation-delay: 0.1s; }
        .bar-2 { height: 10px; animation-delay: 0.3s; }
        .bar-3 { height: 7px; animation-delay: 0.5s; }
        @keyframes soundWave {
          0% { height: 3px; }
          100% { height: 10px; }
        }
      `}</style>
    </div>
  );
}