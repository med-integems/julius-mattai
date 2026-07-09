"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SynthPlayer.module.css";

// Notes of Happy Birthday (pitch & duration multiplier)
const MELODY = [
  { note: "C4", freq: 261.63, dur: 0.75 },
  { note: "C4", freq: 261.63, dur: 0.25 },
  { note: "D4", freq: 293.66, dur: 1.0 },
  { note: "C4", freq: 261.63, dur: 1.0 },
  { note: "F4", freq: 349.23, dur: 1.0 },
  { note: "E4", freq: 329.63, dur: 2.0 },
  
  { note: "C4", freq: 261.63, dur: 0.75 },
  { note: "C4", freq: 261.63, dur: 0.25 },
  { note: "D4", freq: 293.66, dur: 1.0 },
  { note: "C4", freq: 261.63, dur: 1.0 },
  { note: "G4", freq: 392.00, dur: 1.0 },
  { note: "F4", freq: 349.23, dur: 2.0 },
  
  { note: "C4", freq: 261.63, dur: 0.75 },
  { note: "C4", freq: 261.63, dur: 0.25 },
  { note: "C5", freq: 523.25, dur: 1.0 },
  { note: "A4", freq: 440.00, dur: 1.0 },
  { note: "F4", freq: 349.23, dur: 1.0 },
  { note: "E4", freq: 329.63, dur: 1.0 },
  { note: "D4", freq: 293.66, dur: 2.0 },
  
  { note: "Bb4", freq: 466.16, dur: 0.75 },
  { note: "Bb4", freq: 466.16, dur: 0.25 },
  { note: "A4", freq: 440.00, dur: 1.0 },
  { note: "F4", freq: 349.23, dur: 1.0 },
  { note: "G4", freq: 392.00, dur: 1.0 },
  { note: "F4", freq: 349.23, dur: 2.0 }
];

export default function SynthPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [useSynth, setUseSynth] = useState(false);
  const [trackError, setTrackError] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  
  const synthTimeouts = useRef<NodeJS.Timeout[]>([]);
  const currentNoteIndex = useRef(0);
  const activeOscillators = useRef<OscillatorNode[]>([]);

  // Initialize Audio Context and Analyser
  const initAudio = () => {
    if (audioContextRef.current) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    
    analyser.connect(ctx.destination);
    
    audioContextRef.current = ctx;
    analyserRef.current = analyser;

    // Connect standard MP3 HTML5 audio node if exists
    if (audioElRef.current) {
      try {
        const source = ctx.createMediaElementSource(audioElRef.current);
        source.connect(analyser);
        sourceNodeRef.current = source;
      } catch (err) {
        console.warn("Could not bind HTML5 audio node directly:", err);
      }
    }
  };

  // Web Audio Synth Player
  const playSynthNote = (index: number) => {
    if (!audioContextRef.current || !analyserRef.current || !isPlaying) return;
    
    const ctx = audioContextRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const item = MELODY[index];
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const delayNode = ctx.createDelay();
    const feedbackNode = ctx.createGain();

    // Sound styling (futuristic chip synth)
    osc.type = "triangle";
    osc.frequency.setValueAtTime(item.freq, ctx.currentTime);

    // Dynamic gain envelope to avoid click sounds
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + item.dur * 0.4 - 0.02);

    // Sci-fi delay/echo effect
    delayNode.delayTime.setValueAtTime(0.12, ctx.currentTime);
    feedbackNode.gain.setValueAtTime(0.25, ctx.currentTime);

    osc.connect(gainNode);
    gainNode.connect(analyserRef.current);

    // Setup delay loop
    gainNode.connect(delayNode);
    delayNode.connect(feedbackNode);
    feedbackNode.connect(delayNode);
    delayNode.connect(analyserRef.current);

    osc.start();
    osc.stop(ctx.currentTime + item.dur * 0.4);

    activeOscillators.current.push(osc);
    
    const noteDurationMs = item.dur * 400; // note tempo scale

    const nextTimeout = setTimeout(() => {
      activeOscillators.current = activeOscillators.current.filter(o => o !== osc);
      currentNoteIndex.current = (index + 1) % MELODY.length;
      playSynthNote(currentNoteIndex.current);
    }, noteDurationMs);

    synthTimeouts.current.push(nextTimeout);
  };

  const stopSynth = () => {
    synthTimeouts.current.forEach(clearTimeout);
    synthTimeouts.current = [];
    
    activeOscillators.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {}
    });
    activeOscillators.current = [];
  };

  const handlePlayToggle = () => {
    initAudio();
    const ctx = audioContextRef.current;
    if (ctx && ctx.state === "suspended") {
      ctx.resume();
    }

    if (isPlaying) {
      setIsPlaying(false);
      if (useSynth) {
        stopSynth();
      } else if (audioElRef.current) {
        audioElRef.current.pause();
      }
    } else {
      setIsPlaying(true);
      if (useSynth) {
        currentNoteIndex.current = 0;
        playSynthNote(0);
      } else if (audioElRef.current) {
        audioElRef.current.play().catch((err) => {
          console.warn("Could not play MP3. Falling back to Synthesizer.", err);
          setTrackError(true);
          setUseSynth(true);
          // Play synth immediately as fallback
          setTimeout(() => {
            currentNoteIndex.current = 0;
            playSynthNote(0);
          }, 100);
        });
      }
    }
  };

  // Visualizer loop
  useEffect(() => {
    let animId: number;
    
    const draw = () => {
      animId = requestAnimationFrame(draw);
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);

      if (!isPlaying || !analyserRef.current) {
        // Draw idle line
        ctx.beginPath();
        ctx.strokeStyle = "rgba(197, 168, 128, 0.2)";
        ctx.lineWidth = 1;
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      const barWidth = (width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height * 0.9;
        
        // Warm gold-to-bronze gradient
        const percent = i / bufferLength;
        const red = Math.floor(197 - percent * 55);
        const green = Math.floor(168 - percent * 46);
        const blue = Math.floor(128 - percent * 29);
        
        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = `rgba(${red}, ${green}, ${blue}, 0.3)`;

        // Draw symmetrical wave from center
        ctx.fillRect(
          x, 
          (height - barHeight) / 2, 
          barWidth - 2, 
          barHeight || 2
        );
        
        x += barWidth;
      }
      ctx.shadowBlur = 0; // Reset
    };

    draw();
    
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  // Handle mode toggle changes
  useEffect(() => {
    if (isPlaying) {
      // If changing mode while playing, stop current mode and start new one
      if (useSynth) {
        if (audioElRef.current) audioElRef.current.pause();
        currentNoteIndex.current = 0;
        playSynthNote(0);
      } else {
        stopSynth();
        if (audioElRef.current) {
          audioElRef.current.play().catch(() => {
            setTrackError(true);
            setUseSynth(true);
          });
        }
      }
    }
  }, [useSynth]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSynth();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className={styles.playerContainer}>
      <audio
        ref={audioElRef}
        src="/birthday-melody.mp3"
        loop
        onError={() => setTrackError(true)}
      />
      
      <div className={styles.deckHeader}>
        <span className={styles.deckTitle}>AUDIO TRANSCEIVER v1.0</span>
        <span className={`${styles.statusIndicator} ${isPlaying ? styles.statusActive : ""}`}>
          {isPlaying ? "TRANSMITTING" : "STANDBY"}
        </span>
      </div>

      <div className={styles.visualizerContainer}>
        <canvas ref={canvasRef} width="220" height="40" className={styles.visualizer} />
      </div>

      <div className={styles.controlsRow}>
        <button className={styles.playButton} onClick={handlePlayToggle} title={isPlaying ? "Pause Transmission" : "Initiate Tune"}>
          {isPlaying ? (
            <svg viewBox="0 0 24 24" width="16" height="16">
              <rect x="4" y="4" width="6" height="16" fill="currentColor"/>
              <rect x="14" y="4" width="6" height="16" fill="currentColor"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M8 5v14l11-7z" fill="currentColor"/>
            </svg>
          )}
        </button>

        <div className={styles.modeToggle}>
          <button 
            className={`${styles.modeButton} ${useSynth ? styles.modeActive : ""}`} 
            onClick={() => setUseSynth(true)}
            title="Play synthesized audio fallback"
          >
            SYNTH
          </button>
          <button 
            className={`${styles.modeButton} ${!useSynth ? styles.modeActive : ""} ${trackError ? styles.disabled : ""}`} 
            onClick={() => !trackError && setUseSynth(false)}
            title={trackError ? "MP3 file missing, place 'birthday-melody.mp3' in public/" : "Play MP3 file"}
          >
            MP3 {trackError && "⚠"}
          </button>
        </div>
      </div>
      
      {trackError && !useSynth && (
        <div className={styles.warningMessage}>
          * File /birthday-melody.mp3 not found. Defaulting to Synth.
        </div>
      )}
    </div>
  );
}
