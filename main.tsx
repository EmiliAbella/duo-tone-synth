import React, { useState, useRef, useEffect } from "react";
import VisitsDashboard from "./VisitsDashboard";

export default function DuoToneSynth() {
  const [currentPage, setCurrentPage] = useState<"synth" | "dashboard">("synth");
  const [voidOn, setVoidOn] = useState(false);
  const [pulseOn, setPulseOn] = useState(false);
  const [showStreamingModal, setShowStreamingModal] = useState(false);
  const [showTipJarModal, setShowTipJarModal] = useState(false);

  // 2-MINUTE BALL EXPLOSION GAME SYSTEM
  const [gameScore, setGameScore] = useState(0);
  const gameScoreRef = useRef(0);
  const [gameTimeLeft, setGameTimeLeft] = useState(120); // 120s = 2 minutes
  const gameTimeLeftRef = useRef(120);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const isGameRunningRef = useRef(false);
  const [highScore, setHighScore] = useState(0);
  const [explosions, setExplosions] = useState<{ id: string; x: number; y: number; color: string }[]>([]);
  const [scorePops, setScorePops] = useState<{ id: string; x: number; y: number; text: string }[]>([]);
  const [isPanicked, setIsPanicked] = useState(false);
  const panicRef = useRef(false);
  const [masterVol, setMasterVol] = useState(0.85);
  const masterVolRef = useRef(0.85);
  const lastAlphaRef = useRef<number | null>(null);
  const isDraggingKnobRef = useRef(false);
  const knobCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const masterGainRef = useRef<GainNode | null>(null);
  const panicHoldTimerRef = useRef<number | null>(null);
  const tripleTapRef = useRef<number[]>([]);
  const [holdIndicator, setHoldIndicator] = useState<{ x: number; y: number } | null>(null);
  const voidOnRef = useRef(false);
  const pulseOnRef = useRef(false);
  voidOnRef.current = voidOn;
  pulseOnRef.current = pulseOn;
  const [beatOn, setBeatOn] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isJogActive, setIsJogActive] = useState(false);
  const jogActiveRef = useRef(false);
  const jogWheelAngleRef = useRef(0);
  const [jogAngle, setJogAngle] = useState(0);
  const jogReleaseTimerRef = useRef<number | null>(null);
  const lastTouchMidRef = useRef<{ x: number; y: number } | null>(null);
  const isHoldingVinylRef = useRef(false);
  const [isVinylHeld, setIsVinylHeld] = useState(false);
  const [vinylStatusText, setVinylStatusText] = useState("33⅓ RPM");
  const vinylCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointerAngleRef = useRef<number | null>(null);
  const vinylPlatterVisualRef = useRef<HTMLDivElement | null>(null);
  const [visitsCount, setVisitsCount] = useState(1284);
  const [activeUsersCount, setActiveUsersCount] = useState(12);
  const [faderPos, setFaderPos] = useState(0.5); // 0 = Bottom (Pulse max, Void muted), 0.5 = Center, 1 = Top (Void max, Pulse muted)
  const faderRef = useRef(0.5);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Audio & Waveform Canvas Refs
  const voidCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pulseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const voidBtnRef = useRef<HTMLButtonElement | null>(null);
  const pulseBtnRef = useRef<HTMLButtonElement | null>(null);
  const pointerPosRef = useRef<{
    x: number;
    y: number;
    active: boolean;
    vx: number;
    vy: number;
    lastTime: number;
  } | null>(null);
  const buttonPosRef = useRef({ voidX: 0, voidY: 0, pulseX: 0, pulseY: 0 });
  const voidAnalyserRef = useRef<AnalyserNode | null>(null);
  const pulseAnalyserRef = useRef<AnalyserNode | null>(null);
  const masterAnalyserRef = useRef<AnalyserNode | null>(null);
  const bgVisualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const smoothWaveformAngleRef = useRef<number>(0);

  // Beat machine refs
  const beatActiveRef = useRef(false);
  const beatTimerRef = useRef<number | null>(null);
  const beatClockIntervalRef = useRef<number | null>(null);
  const beatStartTimeRef = useRef<number>(0);
  const currentPatternIdxRef = useRef<number>(0);
  const [patternDisplay, setPatternDisplay] = useState({
    name: "1. ELECTRO FUNK",
    secLeft: 60,
    progress: 0,
  });
  const bpmRef = useRef(110);
  const bpmDisplayRef = useRef<HTMLSpanElement | null>(null);
  const currentStepRef = useRef(0);
  const nextNoteTimeRef = useRef(0);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const drumGainRef = useRef<GainNode | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const voidBusGainRef = useRef<GainNode | null>(null);
  const pulseBusGainRef = useRef<GainNode | null>(null);
  const scratchGainRef = useRef<GainNode | null>(null);
  const masterBusRef = useRef<{
    convolver: ConvolverNode;
    delayL: DelayNode;
    delayR: DelayNode;
    delayFeedback: GainNode;
  } | null>(null);

  // Active voice nodes references
  const voidVoiceRef = useRef<{
    oscs: OscillatorNode[];
    gain: GainNode;
    filter: BiquadFilterNode;
    bloomGain: GainNode;
    subGain: GainNode;
  } | null>(null);

  const pulseVoiceRef = useRef<{
    oscs: OscillatorNode[];
    gain: GainNode;
    filter: BiquadFilterNode;
    lfos: OscillatorNode[];
    lfoGains: GainNode[];
  } | null>(null);

  // Gyroscope / Device Orientation tracking
  const [gyroActive, setGyroActive] = useState(false);
  const tiltRef = useRef<{ beta: number; gamma: number }>({ beta: 45, gamma: 0 });
  const tiltDisplayRef = useRef<HTMLDivElement | null>(null);
  const instrumentRef = useRef<HTMLDivElement | null>(null);

  // BLUETOOTH MIDI EXPORT SYSTEM
  const [bleMidiActive, setBleMidiActive] = useState(false);
  const bleMidiActiveRef = useRef(false);
  const [bleMidiDeviceName, setBleMidiDeviceName] = useState("");
  const [bleMidiStatus, setBleMidiStatus] = useState("");
  const [showMidiMonitor, setShowMidiMonitor] = useState(false);
  const [midiLogs, setMidiLogs] = useState<{ id: string; time: string; hex: string; desc: string }[]>([]);
  const [midiPacketCount, setMidiPacketCount] = useState(0);
  const midiPacketCountRef = useRef(0);
  const lastLogTimeRef = useRef(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bleDeviceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bleCharacteristicRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const midiAccessOutputsRef = useRef<any[]>([]);
  const lastMidiSendTimeRef = useRef<number>(0);
  const lastSentValuesRef = useRef({ pitch: -1, roll: -1, yaw: -1 });

  // Floating Sonic Balls: Types & Refs
  interface BallVoice {
    oscs: OscillatorNode[];
    filter: BiquadFilterNode;
    gain: GainNode;
  }

  interface Ball {
    id: string;
    type: "void" | "pulse";
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    lastBounceTime: number;
    voice: BallVoice;
  }

  const [balls, setBalls] = useState<{ id: string; type: "void" | "pulse"; radius: number }[]>([]);
  const ballsRef = useRef<Ball[]>([]);
  const rotDirRef = useRef<number>(1); // 1 = Clockwise, -1 = Counter-Clockwise
  const targetRotDirRef = useRef<number>(1);
  const nextRotDirChangeTimeRef = useRef<number>(performance.now() + 4500);

  // Send raw MIDI bytes over Web MIDI and Web Bluetooth GATT
  const sendMidiRaw = (bytes: number[], desc?: string) => {
    midiPacketCountRef.current += 1;
    setMidiPacketCount(midiPacketCountRef.current);

    const now = performance.now();
    if (now - lastLogTimeRef.current > 100 || bytes[0] === 0x90 || bytes[0] === 0x80) {
      lastLogTimeRef.current = now;
      const hexStr = bytes.map((b) => "0x" + b.toString(16).toUpperCase().padStart(2, "0")).join(" ");
      let description = desc;
      if (!description) {
        if ((bytes[0] & 0xf0) === 0xb0) {
          description = `CC ${bytes[1]} = ${bytes[2]}`;
        } else if ((bytes[0] & 0xf0) === 0x90) {
          description = `NOTE ON (${bytes[1]}) Vel ${bytes[2]}`;
        } else if ((bytes[0] & 0xf0) === 0x80) {
          description = `NOTE OFF (${bytes[1]})`;
        } else if ((bytes[0] & 0xf0) === 0xe0) {
          const bend = bytes[1] | (bytes[2] << 7);
          description = `PITCH BEND = ${bend - 8192}`;
        } else {
          description = `DATA (${bytes.length} bytes)`;
        }
      }
      const timeStr = new Date().toLocaleTimeString().slice(3);
      setMidiLogs((prev) => [
        { id: Math.random().toString(), time: timeStr, hex: hexStr, desc: description || "" },
        ...prev.slice(0, 11),
      ]);
    }

    // 1. Web MIDI API outputs
    midiAccessOutputsRef.current.forEach((out) => {
      try {
        out.send(bytes);
      } catch {}
    });

    // 2. Web Bluetooth GATT characteristic (BLE MIDI standard with timestamps)
    if (bleCharacteristicRef.current) {
      try {
        const nowMs = performance.now();
        const timestamp = Math.floor(nowMs) & 0x1fff;
        const header = 0x80 | ((timestamp >> 7) & 0x3f);
        const timestampLow = 0x80 | (timestamp & 0x7f);
        const packet = new Uint8Array([header, timestampLow, ...bytes]);
        if (bleCharacteristicRef.current.writeValueWithoutResponse) {
          bleCharacteristicRef.current.writeValueWithoutResponse(packet).catch(() => {});
        } else if (bleCharacteristicRef.current.writeValue) {
          bleCharacteristicRef.current.writeValue(packet).catch(() => {});
        }
      } catch {}
    }
  };

  const sendMidiCc = (channel: number, cc: number, value: number) => {
    const status = 0xb0 | ((channel - 1) & 0x0f);
    sendMidiRaw([status, cc & 0x7f, value & 0x7f]);
  };

  const sendMidiNote = (channel: number, note: number, velocity: number) => {
    const status = (velocity > 0 ? 0x90 : 0x80) | ((channel - 1) & 0x0f);
    sendMidiRaw([status, note & 0x7f, velocity & 0x7f]);
  };

  // Self-test sequence triggering real MIDI bursts and opening the test monitor
  const runMidiSelfTest = () => {
    ensureGameStarted();
    getAudioContext();
    if (!bleMidiActiveRef.current) {
      setBleMidiActive(true);
      bleMidiActiveRef.current = true;
      setBleMidiStatus("Prueba activa • Transmitiendo");
    }
    setShowMidiMonitor(true);

    // Audible confirmation tone
    const ctx = audioCtxRef.current;
    if (ctx) {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    }

    // Send MIDI Test Burst
    sendMidiNote(1, 36, 110);
    setTimeout(() => sendMidiNote(1, 67, 110), 90);
    setTimeout(() => sendMidiCc(1, 74, 32), 150);
    setTimeout(() => sendMidiCc(1, 74, 64), 220);
    setTimeout(() => sendMidiCc(1, 74, 100), 300);
    setTimeout(() => sendMidiCc(1, 74, 127), 380);
    setTimeout(() => sendMidiCc(1, 10, 25), 180);
    setTimeout(() => sendMidiCc(1, 10, 105), 340);
    setTimeout(() => sendMidiRaw([0xe0, 0x00, 0x60], "TEST PITCH BEND +4096"), 280);
    setTimeout(() => {
      sendMidiNote(1, 36, 0);
      sendMidiNote(1, 67, 0);
      sendMidiRaw([0xe0, 0x00, 0x40], "TEST PITCH BEND CENTER");
    }, 550);
  };

  // Export gyroscope commands over MIDI Bluetooth (Pitch, Roll, Heading)
  const sendGyroMidi = (beta: number, gamma: number, alpha = 0) => {
    if (!bleMidiActiveRef.current) return;
    const now = performance.now();
    if (now - lastMidiSendTimeRef.current < 25) return; // 40 Hz rate limit
    lastMidiSendTimeRef.current = now;

    // Pitch: normalized 0-127 (Tilt Forward/Back)
    const normBeta = Math.max(0, Math.min(1, (beta - 20) / 45));
    const pitchVal = Math.round(normBeta * 127);

    // Roll: normalized 0-127 (Tilt Left/Right)
    const normGamma = Math.max(0, Math.min(1, (gamma + 30) / 60));
    const rollVal = Math.round(normGamma * 127);

    // Heading: 0-127 (Screen rotation)
    const normAlpha = ((alpha % 360) + 360) % 360;
    const yawVal = Math.round((normAlpha / 360) * 127);

    if (pitchVal !== lastSentValuesRef.current.pitch) {
      lastSentValuesRef.current.pitch = pitchVal;
      sendMidiCc(1, 74, pitchVal); // CC 74: Brightness / Cutoff
      sendMidiCc(1, 1, pitchVal);  // CC 1: Modulation Wheel
    }

    if (rollVal !== lastSentValuesRef.current.roll) {
      lastSentValuesRef.current.roll = rollVal;
      sendMidiCc(1, 10, rollVal); // CC 10: Pan
      sendMidiCc(1, 16, rollVal); // CC 16: General Purpose 1 / Tilt
      // 14-bit Pitch Bend
      const bend = Math.round(normGamma * 16383);
      sendMidiRaw([0xe0, bend & 0x7f, (bend >> 7) & 0x7f]);
    }

    if (yawVal !== lastSentValuesRef.current.yaw) {
      lastSentValuesRef.current.yaw = yawVal;
      sendMidiCc(1, 11, yawVal); // CC 11: Expression
    }
  };

  const BLE_MIDI_SERVICE = "03b80e5a-ede8-4b33-a751-6ce34ec4c700";
  const BLE_MIDI_CHAR = "7772e5db-3868-4112-a1a9-f2669d106bf3";

  const startBleMidi = async () => {
    ensureGameStarted();
    enableGyroscope();
    let connectedName = "";

    // 1. Web Bluetooth API for direct BLE MIDI connections
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = typeof navigator !== "undefined" ? (navigator as any) : null;
    if (nav && "bluetooth" in nav) {
      try {
        setBleMidiStatus("Buscando dispositivo Bluetooth...");
        const device = await nav.bluetooth.requestDevice({
          filters: [{ services: [BLE_MIDI_SERVICE] }],
          optionalServices: [BLE_MIDI_SERVICE],
        });

        if (device && device.gatt) {
          device.addEventListener("gattserverdisconnected", () => {
            stopBleMidi();
          });
          bleDeviceRef.current = device;
          const server = await device.gatt.connect();
          const service = await server.getPrimaryService(BLE_MIDI_SERVICE);
          const char = await service.getCharacteristic(BLE_MIDI_CHAR);
          bleCharacteristicRef.current = char;
          connectedName = device.name || "Dispositivo BLE";
        }
      } catch (err) {
        console.warn("Bluetooth device request cancelled/unsupported:", err);
      }
    }

    // 2. Web MIDI API for OS-paired Bluetooth MIDI devices or DAW loopbacks
    if (nav && "requestMIDIAccess" in nav) {
      try {
        const midiAccess = await nav.requestMIDIAccess({ sysex: false });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const outputs: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        midiAccess.outputs.forEach((out: any) => outputs.push(out));
        midiAccessOutputsRef.current = outputs;
        if (!connectedName && outputs.length > 0) {
          connectedName = outputs[0].name || "Salida MIDI";
        }
      } catch (err) {
        console.warn("Web MIDI request error:", err);
      }
    }

    setBleMidiActive(true);
    bleMidiActiveRef.current = true;
    setBleMidiDeviceName(connectedName);
    setBleMidiStatus(connectedName ? `Conectado a ${connectedName}` : "Transmitiendo MIDI");
  };

  const stopBleMidi = () => {
    if (bleDeviceRef.current && bleDeviceRef.current.gatt?.connected) {
      try {
        bleDeviceRef.current.gatt.disconnect();
      } catch {}
    }
    // Send All Notes Off & Reset Controllers
    sendMidiCc(1, 123, 0);
    sendMidiCc(1, 121, 0);

    bleDeviceRef.current = null;
    bleCharacteristicRef.current = null;
    midiAccessOutputsRef.current = [];
    setBleMidiActive(false);
    bleMidiActiveRef.current = false;
    setBleMidiDeviceName("");
    setBleMidiStatus("");
  };

  const toggleBleMidi = () => {
    if (bleMidiActiveRef.current) {
      stopBleMidi();
    } else {
      startBleMidi();
    }
  };

  // 15-SECOND SUSPENSE BEEP (Volume increases from 0.18 to 0.88 as time runs out)
  const playCountdownBeep = (secondsLeft: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const bus = scratchGainRef.current || ctx.destination;

    const urgency = (16 - secondsLeft) / 15;
    const vol = Math.min(0.9, 0.18 + urgency * 0.7);
    const pitch = 750 + urgency * 650;

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(pitch, now);

    const oscHarm = ctx.createOscillator();
    oscHarm.type = "triangle";
    oscHarm.frequency.setValueAtTime(pitch * 2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (secondsLeft <= 3 ? 0.22 : 0.14));

    const harmGain = ctx.createGain();
    harmGain.gain.value = 0.35;
    oscHarm.connect(harmGain);
    harmGain.connect(gain);
    osc.connect(gain);
    gain.connect(bus);

    osc.start(now);
    oscHarm.start(now);
    const dur = secondsLeft <= 3 ? 0.24 : 0.16;
    osc.stop(now + dur);
    oscHarm.stop(now + dur);
  };

  const playFinalBuzzerSound = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const bus = scratchGainRef.current || ctx.destination;

    [440, 220].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1600;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, now + idx * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.45);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(bus);
      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 0.5);
    });
  };

  const startGame = () => {
    getAudioContext();
    gameScoreRef.current = 0;
    setGameScore(0);
    gameTimeLeftRef.current = 120;
    setGameTimeLeft(120);
    setIsGameOver(false);
    isGameRunningRef.current = true;
    setIsGameRunning(true);

    const existingVoid = ballsRef.current.filter((b) => b.type === "void").length;
    const existingPulse = ballsRef.current.filter((b) => b.type === "pulse").length;
    const voidToSpawn = Math.max(0, 3 - existingVoid);
    const pulseToSpawn = Math.max(0, 3 - existingPulse);

    setTimeout(() => {
      for (let i = 0; i < voidToSpawn; i++) spawnBall("void");
      for (let i = 0; i < pulseToSpawn; i++) spawnBall("pulse");
    }, 80);
  };

  const restartGame = () => {
    ballsRef.current.forEach((b) => {
      try {
        b.voice.oscs.forEach((osc) => osc.stop());
        b.voice.filter.disconnect();
        b.voice.gain.disconnect();
      } catch {}
    });
    ballsRef.current = [];
    setBalls([]);
    startGame();
  };

  const ensureGameStarted = () => {
    if (!isGameRunningRef.current && !isGameOver) {
      startGame();
    }
  };

  // 2-MINUTE COUNTDOWN WATCH & HIGH SCORE SYSTEM
  useEffect(() => {
    try {
      const stored = localStorage.getItem("duotone_high_score");
      if (stored) setHighScore(parseInt(stored, 10) || 0);
    } catch {}

    const interval = window.setInterval(() => {
      if (isGameRunningRef.current && !isGameOver && gameTimeLeftRef.current > 0) {
        gameTimeLeftRef.current -= 1;
        const timeLeft = gameTimeLeftRef.current;
        setGameTimeLeft(timeLeft);

        // Beep every second during last 15 seconds with increasing volume
        if (timeLeft <= 15 && timeLeft > 0) {
          playCountdownBeep(timeLeft);
        }

        if (timeLeft === 0) {
          isGameRunningRef.current = false;
          setIsGameRunning(false);
          setIsGameOver(true);
          playFinalBuzzerSound();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameOver]);

  const playExplosionSound = (type: "void" | "pulse") => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const bus = scratchGainRef.current || ctx.destination;

    const noiseBuffer = noiseBufferRef.current;
    if (noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(type === "void" ? 1800 : 3600, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.35);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(bus);
      noise.start(now);
      noise.stop(now + 0.4);
    }

    const root = type === "void" ? 130.81 : 392.0;
    [1, 1.25, 1.5, 2].forEach((ratio, idx) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(root * ratio, now + idx * 0.02);
      osc.frequency.exponentialRampToValueAtTime(root * ratio * 1.4, now + 0.28);
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.24, now + idx * 0.02);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(oscGain);
      oscGain.connect(bus);
      osc.start(now + idx * 0.02);
      osc.stop(now + 0.38);
    });
  };

  const handleTripleBallExplosion = (type: "void" | "pulse", x: number, y: number) => {
    playExplosionSound(type);

    const expId = `exp-${Date.now()}-${Math.random()}`;
    const color = type === "void" ? "#c084fc" : "#22d3ee";
    setExplosions((prev) => [...prev, { id: expId, x, y, color }]);
    setTimeout(() => {
      setExplosions((prev) => prev.filter((e) => e.id !== expId));
    }, 600);

    const popId = `pop-${Date.now()}-${Math.random()}`;
    setScorePops((prev) => [...prev, { id: popId, x, y, text: "+1 PUNTO" }]);
    setTimeout(() => {
      setScorePops((prev) => prev.filter((p) => p.id !== popId));
    }, 900);

    if (gameTimeLeftRef.current > 0) {
      gameScoreRef.current += 1;
      const nextScore = gameScoreRef.current;
      setGameScore(nextScore);
      if (nextScore > highScore) {
        setHighScore(nextScore);
        try {
          localStorage.setItem("duotone_high_score", nextScore.toString());
        } catch {}
      }
    }
  };

  // REALISTIC DJ VINYL TURNTABLE AUDIO ENGINE (BRAKE, SCRATCH & MOTOR SPIN-UP)

  // 1. Vinyl Needle Brake Sound: Turntable platter decelerating to complete stop
  const playVinylBrakeSound = (ctx: AudioContext, time: number) => {
    const scratchBus = scratchGainRef.current || ctx.destination;
    const noiseBuffer = noiseBufferRef.current;
    if (!noiseBuffer) return;

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, time);
    filter.frequency.exponentialRampToValueAtTime(70, time + 0.22);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.42, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.24);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(scratchBus);
    source.start(time);
    source.stop(time + 0.26);
  };

  // 2. Vinyl Motor Spin-Up Sound: Analog motor starting up and accelerating
  const playMotorSpinUp = (ctx: AudioContext, time: number) => {
    const scratchBus = scratchGainRef.current || ctx.destination;
    const noiseBuffer = noiseBufferRef.current;
    if (!noiseBuffer) return;

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(140, time);
    filter.frequency.exponentialRampToValueAtTime(2600, time + 0.24);
    filter.Q.value = 3.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.32, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.26);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(scratchBus);
    source.start(time);
    source.stop(time + 0.28);
  };

  // 3. Authentic Vinyl Scratch Sound: Needle groove friction + formant audio scrub
  const playVinylScratchSound = (
    ctx: AudioContext,
    time: number,
    speed: number,
    isForward: boolean
  ) => {
    const scratchBus = scratchGainRef.current || ctx.destination;
    const noiseBuffer = noiseBufferRef.current;
    if (!noiseBuffer) return;

    const spd = Math.max(0.4, Math.min(3.5, speed));
    const dur = Math.max(0.04, Math.min(0.18, 0.26 / spd));

    // A. Vinyl needle friction whoosh
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    const baseFreq = isForward ? 1900 * spd : 950 * spd;
    noiseFilter.frequency.setValueAtTime(baseFreq, time);
    noiseFilter.frequency.exponentialRampToValueAtTime(
      isForward ? baseFreq * 1.6 : Math.max(80, baseFreq * 0.5),
      time + dur
    );
    noiseFilter.Q.value = 4.2;

    const noiseGain = ctx.createGain();
    const noiseVol = Math.min(0.7, 0.28 * spd);
    noiseGain.gain.setValueAtTime(noiseVol, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(scratchBus);
    noise.start(time);
    noise.stop(time + dur + 0.02);

    // B. Vinyl Audio Scrub Tone (sawtooth resonant chirp)
    const toneOsc = ctx.createOscillator();
    toneOsc.type = "sawtooth";
    const startPitch = isForward ? 150 * spd : 420 * spd;
    const endPitch = isForward ? 440 * spd : 120 * spd;
    toneOsc.frequency.setValueAtTime(Math.max(40, startPitch), time);
    toneOsc.frequency.exponentialRampToValueAtTime(Math.max(40, endPitch), time + dur);

    const toneFilter = ctx.createBiquadFilter();
    toneFilter.type = "bandpass";
    toneFilter.frequency.setValueAtTime(isForward ? 1400 : 850, time);
    toneFilter.Q.value = 3.2;

    const toneGain = ctx.createGain();
    const toneVol = Math.min(0.55, 0.22 * spd);
    toneGain.gain.setValueAtTime(toneVol, time);
    toneGain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    toneOsc.connect(toneFilter);
    toneFilter.connect(toneGain);
    toneGain.connect(scratchBus);
    toneOsc.start(time);
    toneOsc.stop(time + dur + 0.02);
  };

  // 4. VINYL BRAKE & COMPLETE STOP: Hand touches the record platter
  const startVinylHold = () => {
    isHoldingVinylRef.current = true;
    jogActiveRef.current = true;
    setIsVinylHeld(true);
    setIsJogActive(true);
    setVinylStatusText("BRAKE • STOPPED");

    if (jogReleaseTimerRef.current) {
      clearTimeout(jogReleaseTimerRef.current);
      jogReleaseTimerRef.current = null;
    }

    const ctx = audioCtxRef.current;
    if (ctx) {
      const now = ctx.currentTime;
      playVinylBrakeSound(ctx, now);

      // Pitch brake on active synthesizers (turntable tape-stop glide)
      if (voidVoiceRef.current) {
        voidVoiceRef.current.oscs.forEach((osc) => {
          osc.detune.cancelScheduledValues(now);
          osc.detune.setValueAtTime(osc.detune.value, now);
          osc.detune.exponentialRampToValueAtTime(-1800, now + 0.16);
        });
      }
      if (pulseVoiceRef.current) {
        pulseVoiceRef.current.oscs.forEach((osc) => {
          osc.detune.cancelScheduledValues(now);
          osc.detune.setValueAtTime(osc.detune.value, now);
          osc.detune.exponentialRampToValueAtTime(-1800, now + 0.16);
        });
      }

      // Mute audio channels smoothly over 120ms to completely silence music
      if (voidBusGainRef.current) {
        voidBusGainRef.current.gain.cancelScheduledValues(now);
        voidBusGainRef.current.gain.setValueAtTime(voidBusGainRef.current.gain.value, now);
        voidBusGainRef.current.gain.linearRampToValueAtTime(0.0001, now + 0.12);
      }
      if (pulseBusGainRef.current) {
        pulseBusGainRef.current.gain.cancelScheduledValues(now);
        pulseBusGainRef.current.gain.setValueAtTime(pulseBusGainRef.current.gain.value, now);
        pulseBusGainRef.current.gain.linearRampToValueAtTime(0.0001, now + 0.12);
      }
      if (drumGainRef.current) {
        drumGainRef.current.gain.cancelScheduledValues(now);
        drumGainRef.current.gain.setValueAtTime(drumGainRef.current.gain.value, now);
        drumGainRef.current.gain.linearRampToValueAtTime(0.0001, now + 0.12);
      }
      ballsRef.current.forEach((ball) => {
        ball.voice.gain.gain.cancelScheduledValues(now);
        ball.voice.gain.gain.setValueAtTime(ball.voice.gain.gain.value, now);
        ball.voice.gain.gain.linearRampToValueAtTime(0.0001, now + 0.12);
      });
    }
  };

  // 5. MOTOR SPIN-UP RELEASE: Hand releases the record platter, motor accelerates
  const releaseVinylHold = () => {
    isHoldingVinylRef.current = false;
    jogActiveRef.current = false;
    setIsVinylHeld(false);
    setIsJogActive(false);
    setVinylStatusText("33⅓ RPM");

    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;

    playMotorSpinUp(ctx, now);

    // Pitch spin-up glide on active synthesizers
    if (voidVoiceRef.current) {
      const normBeta = Math.max(0, Math.min(1, (tiltRef.current.beta - 20) / 45));
      const targetBend = (normBeta - 0.5) * 120;
      voidVoiceRef.current.oscs.forEach((osc) => {
        osc.detune.cancelScheduledValues(now);
        osc.detune.setValueAtTime(-900, now);
        osc.detune.exponentialRampToValueAtTime(targetBend, now + 0.22);
      });
    }
    if (pulseVoiceRef.current) {
      const normGamma = Math.max(0, Math.min(1, (tiltRef.current.gamma + 30) / 60));
      const targetBend = (normGamma - 0.5) * 80;
      pulseVoiceRef.current.oscs.forEach((osc) => {
        osc.detune.cancelScheduledValues(now);
        osc.detune.setValueAtTime(-900, now);
        osc.detune.exponentialRampToValueAtTime(targetBend, now + 0.22);
      });
    }

    // Restore channels to crossfader balance
    applyCrossfade(faderRef.current);

    if (drumGainRef.current) {
      drumGainRef.current.gain.cancelScheduledValues(now);
      drumGainRef.current.gain.setValueAtTime(0.001, now);
      drumGainRef.current.gain.linearRampToValueAtTime(0.75, now + 0.2);
    }

    ballsRef.current.forEach((ball) => {
      const nominalVol = ball.type === "void" ? 0.042 : 0.028;
      ball.voice.gain.gain.cancelScheduledValues(now);
      ball.voice.gain.gain.setValueAtTime(0.001, now);
      ball.voice.gain.gain.linearRampToValueAtTime(nominalVol, now + 0.2);
    });

    if (beatActiveRef.current) {
      nextNoteTimeRef.current = ctx.currentTime + 0.05;
    }
  };

  // 6. VINYL SCRUB / SCRATCH: Rotates the platter forward or backward
  const applyVinylScrub = (delta: number, speedMultiplier = 1.0) => {
    getAudioContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;

    // Ensure vinyl stop state is active
    if (!isHoldingVinylRef.current) {
      startVinylHold();
    }

    // 1. Rotate the visual vinyl platter
    jogWheelAngleRef.current += delta;
    if (vinylPlatterVisualRef.current) {
      vinylPlatterVisualRef.current.style.transform = `rotate(${jogWheelAngleRef.current.toFixed(1)}deg)`;
    }
    setJogAngle(jogWheelAngleRef.current);

    // 2. Audible vinyl scratch sound based on velocity and direction
    const rawSpeed = Math.abs(delta) * 0.12 * speedMultiplier;
    playVinylScratchSound(ctx, now, rawSpeed, delta > 0);
    setVinylStatusText(delta > 0 ? "SCRATCH ▶" : "SCRATCH ◀");

    // 3. Step scrub on the beat sequencer (scrubs steps forward or backward)
    if (beatActiveRef.current) {
      const stepDelta = Math.round(delta * 0.18);
      if (Math.abs(stepDelta) >= 1) {
        let nextStep = (currentStepRef.current + stepDelta) % 16;
        if (nextStep < 0) nextStep += 16;
        currentStepRef.current = nextStep;
      }
    }

    // 4. Scrub physics of floating balls along their velocities
    ballsRef.current.forEach((ball) => {
      ball.x += ball.vx * delta * 0.15;
      ball.y += ball.vy * delta * 0.15;
    });
  };

  // Direct Pointer Handlers for the On-Screen Vinyl Turntable Platter
  const handleVinylPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    ensureGameStarted();
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    getAudioContext();

    const rect = e.currentTarget.getBoundingClientRect();
    vinylCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const dx = e.clientX - vinylCenterRef.current.x;
    const dy = e.clientY - vinylCenterRef.current.y;
    lastPointerAngleRef.current = Math.atan2(dy, dx) * (180 / Math.PI);

    startVinylHold();
  };

  const handleVinylPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isHoldingVinylRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const dx = e.clientX - vinylCenterRef.current.x;
    const dy = e.clientY - vinylCenterRef.current.y;
    const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);

    if (lastPointerAngleRef.current !== null) {
      let delta = currentAngle - lastPointerAngleRef.current;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      if (Math.abs(delta) > 0.4) {
        applyVinylScrub(delta, 1.2);
      }
    }

    lastPointerAngleRef.current = currentAngle;
  };

  const handleVinylPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    lastPointerAngleRef.current = null;
    releaseVinylHold();
  };

  // Aliases for global wheel and touch listeners
  const startJogMode = startVinylHold;
  const stopJogMode = releaseVinylHold;
  const applyJogScrub = (delta: number) => {
    applyVinylScrub(delta);
    if (jogReleaseTimerRef.current) {
      clearTimeout(jogReleaseTimerRef.current);
    }
    jogReleaseTimerRef.current = window.setTimeout(() => {
      releaseVinylHold();
    }, 380);
  };

  // ROTARY MASTER VOLUME REGULATION (CLOCKWISE = INCREASE)
  const adjustMasterVolume = (delta: number) => {
    if (panicRef.current) return;
    const next = Math.max(0.05, Math.min(1.0, masterVolRef.current + delta));
    masterVolRef.current = next;
    setMasterVol(next);
    const ctx = audioCtxRef.current;
    if (ctx && masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(next, ctx.currentTime, 0.03);
    }
  };

  const setMasterVolumeDirect = (val: number) => {
    if (panicRef.current) return;
    const clamped = Math.max(0.05, Math.min(1.0, val));
    masterVolRef.current = clamped;
    setMasterVol(clamped);
    const ctx = audioCtxRef.current;
    if (ctx && masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(clamped, ctx.currentTime, 0.03);
    }
  };

  // Rotary Knob Touch/Mouse Drag Handler
  const handleKnobPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const rect = e.currentTarget.getBoundingClientRect();
    knobCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    isDraggingKnobRef.current = true;
  };

  const handleKnobPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingKnobRef.current) return;
    const dx = e.clientX - knobCenterRef.current.x;
    const dy = e.clientY - knobCenterRef.current.y;
    let angleDeg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angleDeg < 0) angleDeg += 360;
    // Map angle from 40° to 320° into 0.05 .. 1.0
    const clampedAngle = Math.max(35, Math.min(325, angleDeg));
    const normalized = (clampedAngle - 35) / 290;
    setMasterVolumeDirect(normalized);
  };

  const handleKnobPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    isDraggingKnobRef.current = false;
  };

  // PANIC FUNCTION: Mutes everything, stops synthesizers and destroys all balls
  const triggerPanic = () => {
    const ctx = audioCtxRef.current;
    const now = ctx ? ctx.currentTime : 0;
    panicRef.current = true;
    setIsPanicked(true);

    // Instant MUTE ALL
    if (masterGainRef.current && ctx) {
      masterGainRef.current.gain.cancelScheduledValues(now);
      masterGainRef.current.gain.setValueAtTime(0, now);
    }
    // Stop all instruments
    if (voidVoiceRef.current) stopVoid();
    if (pulseVoiceRef.current) stopPulse();
    setVoidOn(false);
    setPulseOn(false);
    if (beatActiveRef.current) toggleBeat();

    // Clear and silence all floating balls
    ballsRef.current.forEach((b) => {
      try {
        b.voice.oscs.forEach((osc) => osc.stop());
        b.voice.filter.disconnect();
        b.voice.gain.disconnect();
      } catch {}
    });
    ballsRef.current = [];
    setBalls([]);
  };

  const resetPanic = () => {
    const ctx = audioCtxRef.current;
    const now = ctx ? ctx.currentTime : 0;
    panicRef.current = false;
    setIsPanicked(false);

    // Restore nominal master volume
    if (masterGainRef.current && ctx) {
      masterGainRef.current.gain.cancelScheduledValues(now);
      masterGainRef.current.gain.setTargetAtTime(masterVolRef.current, now, 0.05);
    }
  };

  const togglePanic = () => {
    if (panicRef.current) {
      resetPanic();
    } else {
      triggerPanic();
    }
  };

  // 2-Second Hold on Empty Screen Space for Panic Mute
  const handleEmptySpacePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only trigger if touching empty background (not on buttons, controls, or balls)
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest(".cursor-pointer") ||
      target.closest("canvas") ||
      target.tagName === "BUTTON"
    ) {
      return;
    }

    const startX = e.clientX;
    const startY = e.clientY;
    setHoldIndicator({ x: startX, y: startY });

    if (panicHoldTimerRef.current) {
      clearTimeout(panicHoldTimerRef.current);
    }

    panicHoldTimerRef.current = window.setTimeout(() => {
      triggerPanic();
      setHoldIndicator(null);
      panicHoldTimerRef.current = null;
    }, 2000);
  };

  const cancelPanicHold = () => {
    if (panicHoldTimerRef.current) {
      clearTimeout(panicHoldTimerRef.current);
      panicHoldTimerRef.current = null;
    }
    setHoldIndicator(null);
  };

  const handleEmptySpacePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!holdIndicator) return;
    const dist = Math.hypot(e.clientX - holdIndicator.x, e.clientY - holdIndicator.y);
    if (dist > 24) {
      cancelPanicHold();
    }
  };

  // Create real-time audio voice for a spawned ball (VOLUME AT EXACTLY 10% of button volume)
  const createBallVoice = (type: "void" | "pulse", ctx: AudioContext): BallVoice => {
    const now = ctx.currentTime;
    const bus = masterBusRef.current;
    const gain = ctx.createGain();

    if (type === "void") {
      // VOID BALL: Volume at 10% of Void button (0.042)
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.setTargetAtTime(0.042, now, 0.05);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, now);
      filter.Q.value = 2.4;

      const oscSub = ctx.createOscillator();
      oscSub.type = "sine";
      oscSub.frequency.value = 65.41;

      const oscFifth = ctx.createOscillator();
      oscFifth.type = "triangle";
      oscFifth.frequency.value = 98.0;

      const oscBody = ctx.createOscillator();
      oscBody.type = "sawtooth";
      oscBody.frequency.value = 130.81;
      const bodyGain = ctx.createGain();
      bodyGain.gain.value = 0.28;
      oscBody.connect(bodyGain);

      const oscBloom = ctx.createOscillator();
      oscBloom.type = "sine";
      oscBloom.frequency.value = 261.63;
      const bloomGain = ctx.createGain();
      bloomGain.gain.value = 0.2;
      oscBloom.connect(bloomGain);

      oscSub.connect(filter);
      oscFifth.connect(filter);
      bodyGain.connect(filter);
      bloomGain.connect(filter);

      filter.connect(gain);
      gain.connect(ctx.destination);
      if (bus) {
        gain.connect(bus.convolver);
      }

      const oscs = [oscSub, oscFifth, oscBody, oscBloom];
      oscs.forEach((osc) => osc.start(now));

      return { oscs, filter, gain };
    } else {
      // PULSE BALL: Volume at 10% of Pulse button (0.028)
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.setTargetAtTime(0.028, now, 0.05);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(3200, now);
      filter.Q.value = 1.8;

      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.value = 392.0;

      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = 587.33;

      const osc3 = ctx.createOscillator();
      osc3.type = "sine";
      osc3.frequency.value = 783.99;

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);

      filter.connect(gain);
      gain.connect(ctx.destination);
      if (bus) {
        gain.connect(bus.delayL);
        gain.connect(bus.convolver);
      }

      const oscs = [osc1, osc2, osc3];
      oscs.forEach((osc) => osc.start(now));

      return { oscs, filter, gain };
    }
  };

  // Modulate ball voice on physical collision (scaled to 10% volume)
  const modulateBallSoundOnCollision = (ball: Ball) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const { beta, gamma } = tiltRef.current;

    const normBeta = Math.max(0, Math.min(1, (beta - 20) / 45));
    const normGamma = Math.max(0, Math.min(1, (gamma + 30) / 60));

    if (ball.type === "void") {
      const targetFreq = 160 + normBeta * 2800;
      ball.voice.filter.frequency.setTargetAtTime(targetFreq, now, 0.04);
      ball.voice.filter.Q.setTargetAtTime(2.0 + normBeta * 3.5, now, 0.04);

      const semitones = Math.round((normGamma - 0.5) * 8);
      ball.voice.oscs.forEach((osc) => {
        osc.detune.setTargetAtTime(semitones * 100, now, 0.03);
      });

      // Subtle punchy envelope (stays at 10% scale)
      ball.voice.gain.gain.setTargetAtTime(0.065, now, 0.015);
      ball.voice.gain.gain.setTargetAtTime(0.042, now + 0.06, 0.12);
    } else {
      const targetFreq = 1200 + normBeta * 5500;
      ball.voice.filter.frequency.setTargetAtTime(targetFreq, now, 0.03);

      const pentatonic = [1, 1.125, 1.25, 1.5, 1.667, 2, 2.25];
      const scaleIndex = Math.floor(normGamma * pentatonic.length) % pentatonic.length;
      const ratio = pentatonic[scaleIndex];

      ball.voice.oscs[0].frequency.setTargetAtTime(392.0 * ratio, now, 0.03);
      if (ball.voice.oscs[1]) {
        ball.voice.oscs[1].frequency.setTargetAtTime(587.33 * ratio, now, 0.03);
      }
      if (ball.voice.oscs[2]) {
        ball.voice.oscs[2].frequency.setTargetAtTime(783.99 * ratio, now, 0.03);
      }

      // Bell chime ping envelope (stays at 10% scale)
      ball.voice.gain.gain.setTargetAtTime(0.048, now, 0.015);
      ball.voice.gain.gain.setTargetAtTime(0.028, now + 0.06, 0.14);
    }
  };

  // Spawn a new sonic bouncing ball originating from the pressed button
  const spawnBall = (type: "void" | "pulse") => {
    const ctx = getAudioContext();
    const btnEl = type === "void" ? voidBtnRef.current : pulseBtnRef.current;
    const rect = btnEl?.getBoundingClientRect();

    // Spawn radially around button perimeter so balls never overlap at (0,0)
    const spreadAngle = Math.random() * Math.PI * 2;
    const spreadDist = 44 + Math.random() * 24;
    const centerX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const centerY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    const spawnX = Math.max(30, Math.min(window.innerWidth - 30, centerX + Math.cos(spreadAngle) * spreadDist));
    const spawnY = Math.max(30, Math.min(window.innerHeight - 30, centerY + Math.sin(spreadAngle) * spreadDist));

    const launchAngle = spreadAngle + (Math.random() - 0.5) * 0.6;
    const speed = 4.5 + Math.random() * 4.5;
    const vx = Math.cos(launchAngle) * speed;
    const vy = Math.sin(launchAngle) * speed;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const radius = 14; // Smaller, sleek sonic balls (28px diameter)
    const voice = createBallVoice(type, ctx);

    const newBall: Ball = {
      id,
      type,
      x: spawnX,
      y: spawnY,
      vx,
      vy,
      radius,
      lastBounceTime: performance.now(),
      voice,
    };

    ballsRef.current.push(newBall);
    setBalls((prev) => [...prev, { id, type, radius }]);
  };

  // Destroy ball, stop its sound, and remove from simulation
  const destroyBall = (id: string) => {
    const idx = ballsRef.current.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const ball = ballsRef.current[idx];

    const ctx = audioCtxRef.current;
    if (ctx && ball.voice) {
      const now = ctx.currentTime;
      ball.voice.gain.gain.setTargetAtTime(0.0001, now, 0.02);
      setTimeout(() => {
        ball.voice.oscs.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        });
        try {
          ball.voice.filter.disconnect();
          ball.voice.gain.disconnect();
        } catch {}
      }, 60);
    }

    ballsRef.current.splice(idx, 1);
    setBalls((prev) => prev.filter((b) => b.id !== id));
  };

  // Create reverb impulse response
  const createImpulseResponse = (ctx: AudioContext, duration = 3.0, decay = 2.2): AudioBuffer => {
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * duration);
    const buffer = ctx.createBuffer(2, length, rate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    for (let i = 0; i < length; i++) {
      const factor = Math.exp((-i / rate) * decay);
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }
    return buffer;
  };

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      // Master output limiter/gain
      const masterGain = ctx.createGain();
      masterGain.gain.value = panicRef.current ? 0 : masterVolRef.current;
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Master Analyser for background reactive visualizer (2048 points for ultra-detailed waveform)
      const mAnalyser = ctx.createAnalyser();
      mAnalyser.fftSize = 2048;
      mAnalyser.smoothingTimeConstant = 0.75;
      masterGain.connect(mAnalyser);
      masterAnalyserRef.current = mAnalyser;

      // Stereo Reverb
      const convolver = ctx.createConvolver();
      convolver.buffer = createImpulseResponse(ctx);
      const reverbGain = ctx.createGain();
      reverbGain.gain.value = 0.45;
      convolver.connect(reverbGain);
      reverbGain.connect(masterGain);

      // Stereo Ping-Pong Style Delay
      const delayL = ctx.createDelay();
      const delayR = ctx.createDelay();
      delayL.delayTime.value = 0.32;
      delayR.delayTime.value = 0.48;

      const delayFeedback = ctx.createGain();
      delayFeedback.gain.value = 0.38;

      const delayFilter = ctx.createBiquadFilter();
      delayFilter.type = "lowpass";
      delayFilter.frequency.value = 2800;

      // Delay routing
      delayL.connect(delayR);
      delayR.connect(delayFilter);
      delayFilter.connect(delayFeedback);
      delayFeedback.connect(delayL);

      const delayWet = ctx.createGain();
      delayWet.gain.value = 0.35;
      delayL.connect(delayWet);
      delayR.connect(delayWet);
      delayWet.connect(masterGain);
      delayWet.connect(convolver);

      // Dedicated Channel Bus Gain Nodes for Crossfader
      const voidBus = ctx.createGain();
      voidBus.gain.value = 1.0;
      voidBus.connect(masterGain);
      voidBus.connect(convolver);
      voidBus.connect(delayL);
      voidBusGainRef.current = voidBus;

      // Void Analyser for live waveform (1024 points for high detail)
      const vAnalyser = ctx.createAnalyser();
      vAnalyser.fftSize = 1024;
      vAnalyser.smoothingTimeConstant = 0.72;
      voidBus.connect(vAnalyser);
      voidAnalyserRef.current = vAnalyser;

      const pulseBus = ctx.createGain();
      pulseBus.gain.value = 1.0;
      pulseBus.connect(masterGain);
      pulseBus.connect(convolver);
      pulseBus.connect(delayL);
      pulseBusGainRef.current = pulseBus;

      // Pulse Analyser for live waveform (1024 points for high detail)
      const pAnalyser = ctx.createAnalyser();
      pAnalyser.fftSize = 1024;
      pAnalyser.smoothingTimeConstant = 0.72;
      pulseBus.connect(pAnalyser);
      pulseAnalyserRef.current = pAnalyser;

      // Dedicated Drum Bus for the Catchy Beat
      const drumBus = ctx.createGain();
      drumBus.gain.value = 0.75;
      drumBus.connect(masterGain);
      const drumReverbSend = ctx.createGain();
      drumReverbSend.gain.value = 0.2;
      drumBus.connect(drumReverbSend);
      drumReverbSend.connect(convolver);
      drumGainRef.current = drumBus;

      // Dedicated Scratch Bus (always audible during jog wheel scrubbing even when other tracks are stopped)
      const scratchBus = ctx.createGain();
      scratchBus.gain.value = 0.85;
      scratchBus.connect(masterGain);
      scratchBus.connect(convolver);
      scratchGainRef.current = scratchBus;

      // Noise buffer for drum hits
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      noiseBufferRef.current = noiseBuffer;

      masterBusRef.current = { convolver, delayL, delayR, delayFeedback };

      // Apply initial crossfader state
      applyCrossfade(faderRef.current);
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    return audioCtxRef.current;
  };

  // Apply crossfader gain to Void and Pulse channels
  const applyCrossfade = (pos: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;

    let targetVoid = 1.0;
    let targetPulse = 1.0;

    if (pos >= 0.5) {
      // Top half: Void increases (+35% boost), Pulse drops to 0 (stops)
      const t = (pos - 0.5) / 0.5; // 0 to 1
      targetVoid = 1.0 + t * 0.35;
      targetPulse = Math.max(0, 1.0 - t);
    } else {
      // Bottom half: Pulse increases (+35% boost), Void drops to 0 (stops)
      const t = (0.5 - pos) / 0.5; // 0 to 1
      targetPulse = 1.0 + t * 0.35;
      targetVoid = Math.max(0, 1.0 - t);
    }

    if (voidBusGainRef.current) {
      voidBusGainRef.current.gain.setTargetAtTime(targetVoid, now, 0.015);
    }
    if (pulseBusGainRef.current) {
      pulseBusGainRef.current.gain.setTargetAtTime(targetPulse, now, 0.015);
    }

    // Export crossfader position via MIDI (CC 8 Balance)
    sendMidiCc(1, 8, Math.round(pos * 127));
  };

  const updateFaderFromPointer = (clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    let normalized = 1 - relativeY / rect.height; // 1 at top, 0 at bottom
    normalized = Math.max(0, Math.min(1, normalized));

    // Center detent snapping
    if (Math.abs(normalized - 0.5) < 0.04) {
      normalized = 0.5;
    }

    faderRef.current = normalized;
    setFaderPos(normalized);
    getAudioContext();
    applyCrossfade(normalized);
  };

  const handleFaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    ensureGameStarted();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    updateFaderFromPointer(e.clientY);
  };

  const handleFaderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    updateFaderFromPointer(e.clientY);
  };

  const handleFaderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
  };

  // 8-BIT RETRO VIDEO GAME CHIPTUNE SYNTHESIS
  const playKick = (ctx: AudioContext, time: number) => {
    const drumBus = drumGainRef.current;
    if (!drumBus) return;
    const osc = ctx.createOscillator();
    osc.type = "triangle"; // NES triangle punch
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(190, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);
    gain.gain.setValueAtTime(0.85, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
    osc.connect(gain);
    gain.connect(drumBus);
    osc.start(time);
    osc.stop(time + 0.16);
  };

  const playSnare = (ctx: AudioContext, time: number) => {
    const drumBus = drumGainRef.current;
    const noiseBuffer = noiseBufferRef.current;
    if (!drumBus || !noiseBuffer) return;

    // Noise snap
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 1200;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.48, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.17);
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(drumBus);
    noiseSource.start(time);
    noiseSource.stop(time + 0.18);

    // Body tone
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.frequency.setValueAtTime(190, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.11);
    oscGain.gain.setValueAtTime(0.35, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.13);
    osc.connect(oscGain);
    oscGain.connect(drumBus);
    osc.start(time);
    osc.stop(time + 0.15);
  };

  const playHat = (ctx: AudioContext, time: number, open: boolean, vol = 0.22) => {
    const drumBus = drumGainRef.current;
    const noiseBuffer = noiseBufferRef.current;
    if (!drumBus || !noiseBuffer) return;

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 9200;
    filter.Q.value = 2.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (open ? 0.2 : 0.045));

    source.connect(filter);
    filter.connect(gain);
    gain.connect(drumBus);
    source.start(time);
    source.stop(time + (open ? 0.22 : 0.05));
  };

  const playClap = (ctx: AudioContext, time: number) => {
    const drumBus = drumGainRef.current;
    const noiseBuffer = noiseBufferRef.current;
    if (!drumBus || !noiseBuffer) return;

    // Multi-burst analog clap
    [0, 0.012, 0.024].forEach((offset, idx) => {
      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1400;
      filter.Q.value = 2.2;
      const gain = ctx.createGain();
      const isFinal = idx === 2;
      gain.gain.setValueAtTime(isFinal ? 0.42 : 0.22, time + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, time + offset + (isFinal ? 0.18 : 0.03));
      source.connect(filter);
      filter.connect(gain);
      gain.connect(drumBus);
      source.start(time + offset);
      source.stop(time + offset + 0.2);
    });
  };

  const playPerc = (ctx: AudioContext, time: number) => {
    const drumBus = drumGainRef.current;
    if (!drumBus) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(820, time);
    osc.frequency.exponentialRampToValueAtTime(320, time + 0.05);
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    osc.connect(gain);
    gain.connect(drumBus);
    osc.start(time);
    osc.stop(time + 0.07);
  };

  const playBass = (
    ctx: AudioContext,
    time: number,
    freq: number,
    dur: number,
    accent = false
  ) => {
    const drumBus = drumGainRef.current;
    if (!drumBus) return;

    const osc1 = ctx.createOscillator();
    osc1.type = "triangle"; // Authentic NES 8-bit triangle bass
    osc1.frequency.setValueAtTime(freq, time);

    const osc2 = ctx.createOscillator();
    osc2.type = "square";
    osc2.frequency.setValueAtTime(freq * 0.5, time); // Sub-octave square for low-end weight

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    const startFreq = accent ? 2200 : 1500;
    filter.frequency.setValueAtTime(startFreq, time);
    filter.frequency.exponentialRampToValueAtTime(140, time + dur * 0.85);
    filter.Q.value = accent ? 4.2 : 3.0;

    const gain = ctx.createGain();
    const vol = accent ? 0.38 : 0.28;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    const subGain = ctx.createGain();
    subGain.gain.value = 0.5;
    osc2.connect(subGain);
    subGain.connect(filter);
    osc1.connect(filter);
    filter.connect(gain);
    gain.connect(drumBus);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + dur + 0.05);
    osc2.stop(time + dur + 0.05);
  };

  const scheduleBeat = () => {
    const ctx = audioCtxRef.current;
    if (!ctx || !beatActiveRef.current || jogActiveRef.current) return;

    // Check 1-minute melody pattern evolution
    const elapsedSec = (performance.now() - beatStartTimeRef.current) / 1000;
    const patternIdx = Math.floor(elapsedSec / 60) % 4;
    currentPatternIdxRef.current = patternIdx;

    while (nextNoteTimeRef.current < ctx.currentTime + 0.15) {
      const step = currentStepRef.current;
      const t = nextNoteTimeRef.current;
      const stepDur = 60 / bpmRef.current / 4;

      // 4 DISTINCT MUSICAL STYLES EVOLVING EVERY MINUTE (60s)
      if (patternIdx === 0) {
        // MINUTE 1: ELECTRO-FUNK (Driving, bouncy, slap octave bass)
        if (step === 0 || step === 7 || step === 10) playKick(ctx, t);
        if (step === 4 || step === 12) {
          playSnare(ctx, t);
          playClap(ctx, t);
        }
        if (step === 3 || step === 9 || step === 13) playPerc(ctx, t);
        if (step % 2 === 0) playHat(ctx, t, step === 14, step === 0 || step === 8 ? 0.3 : 0.2);
        else playHat(ctx, t, false, 0.12);

        const bass0: { [k: number]: { freq: number; dur: number; acc: boolean } } = {
          0: { freq: 65.41, dur: 0.95, acc: true },   // C2
          2: { freq: 65.41, dur: 0.85, acc: false },
          4: { freq: 130.81, dur: 0.95, acc: true },  // C3 slap
          6: { freq: 65.41, dur: 0.85, acc: false },
          7: { freq: 77.78, dur: 0.90, acc: true },   // Eb2
          8: { freq: 65.41, dur: 0.95, acc: false },
          10: { freq: 98.0, dur: 0.90, acc: true },   // G2
          11: { freq: 98.0, dur: 0.80, acc: false },
          12: { freq: 130.81, dur: 0.95, acc: true }, // C3
          14: { freq: 116.54, dur: 0.90, acc: true }, // Bb2
          15: { freq: 65.41, dur: 0.85, acc: false },
        };
        if (bass0[step]) playBass(ctx, t, bass0[step].freq, stepDur * bass0[step].dur, bass0[step].acc);
      } else if (patternIdx === 1) {
        // MINUTE 2: CYBERPUNK / SYNTHWAVE (Dark rolling 16th bass, double kicks, open sizzle)
        if (step === 0 || step === 3 || step === 8 || step === 11) playKick(ctx, t);
        if (step === 4 || step === 12) {
          playSnare(ctx, t);
          playClap(ctx, t);
        }
        if (step === 14) playSnare(ctx, t);
        if (step % 2 === 0) playHat(ctx, t, true, 0.24); // Constant open hat sizzle
        else playHat(ctx, t, false, 0.15);

        const bass1: { [k: number]: { freq: number; dur: number; acc: boolean } } = {
          0: { freq: 87.31, dur: 0.95, acc: true },   // F2
          1: { freq: 87.31, dur: 0.75, acc: false },
          2: { freq: 87.31, dur: 0.85, acc: false },
          3: { freq: 87.31, dur: 0.75, acc: false },
          4: { freq: 130.81, dur: 0.95, acc: true },  // C3
          6: { freq: 103.83, dur: 0.90, acc: true },  // Ab2
          8: { freq: 87.31, dur: 0.95, acc: true },
          10: { freq: 98.0, dur: 0.90, acc: true },   // G2
          12: { freq: 130.81, dur: 0.95, acc: true }, // C3
          14: { freq: 77.78, dur: 0.90, acc: true },  // Eb2
          15: { freq: 87.31, dur: 0.80, acc: false },
        };
        if (bass1[step]) playBass(ctx, t, bass1[step].freq, stepDur * bass1[step].dur, bass1[step].acc);
      } else if (patternIdx === 2) {
        // MINUTE 3: ACID TECH-HOUSE (4-on-the-floor, offbeat open hats, acid G-minor walk)
        if (step === 0 || step === 4 || step === 8 || step === 12) playKick(ctx, t);
        if (step === 4 || step === 12) playClap(ctx, t);
        if (step === 1 || step === 7 || step === 11) playPerc(ctx, t);
        if (step === 2 || step === 6 || step === 10 || step === 14) playHat(ctx, t, true, 0.32);
        else playHat(ctx, t, false, 0.1);

        const bass2: { [k: number]: { freq: number; dur: number; acc: boolean } } = {
          0: { freq: 98.0, dur: 0.95, acc: true },    // G2
          2: { freq: 98.0, dur: 0.80, acc: false },
          3: { freq: 116.54, dur: 0.90, acc: true },  // Bb2
          4: { freq: 98.0, dur: 0.90, acc: false },
          6: { freq: 146.83, dur: 0.95, acc: true },  // D3
          8: { freq: 98.0, dur: 0.95, acc: true },
          10: { freq: 87.31, dur: 0.90, acc: true },  // F2
          12: { freq: 98.0, dur: 0.90, acc: false },
          14: { freq: 130.81, dur: 0.95, acc: true }, // C3
          15: { freq: 116.54, dur: 0.85, acc: false },
        };
        if (bass2[step]) playBass(ctx, t, bass2[step].freq, stepDur * bass2[step].dur, bass2[step].acc);
      } else {
        // MINUTE 4: LIQUID BREAKBEAT (Syncopated break kicks, ghost snare rolls, melodic Eb walk)
        if (step === 0 || step === 6 || step === 10) playKick(ctx, t);
        if (step === 4 || step === 12) {
          playSnare(ctx, t);
          playClap(ctx, t);
        }
        if (step === 15) playSnare(ctx, t); // Ghost break snare
        if (step === 2 || step === 8 || step === 13) playPerc(ctx, t);
        if (step % 2 === 0) playHat(ctx, t, step === 10, 0.22);
        else playHat(ctx, t, false, 0.14);

        const bass3: { [k: number]: { freq: number; dur: number; acc: boolean } } = {
          0: { freq: 77.78, dur: 0.95, acc: true },   // Eb2
          2: { freq: 98.0, dur: 0.85, acc: false },   // G2
          4: { freq: 116.54, dur: 0.95, acc: true },  // Bb2
          6: { freq: 130.81, dur: 0.90, acc: true },  // C3
          8: { freq: 116.54, dur: 0.95, acc: false }, // Bb2
          10: { freq: 98.0, dur: 0.90, acc: true },   // G2
          12: { freq: 87.31, dur: 0.95, acc: true },  // F2
          14: { freq: 77.78, dur: 0.90, acc: false }, // Eb2
          15: { freq: 65.41, dur: 0.85, acc: true },  // C2
        };
        if (bass3[step]) playBass(ctx, t, bass3[step].freq, stepDur * bass3[step].dur, bass3[step].acc);
      }

      nextNoteTimeRef.current += stepDur;
      currentStepRef.current = (currentStepRef.current + 1) % 16;
    }
  };

  const toggleBeat = () => {
    ensureGameStarted();
    const ctx = getAudioContext();
    const nextState = !beatActiveRef.current;
    beatActiveRef.current = nextState;
    setBeatOn(nextState);

    if (nextState) {
      currentStepRef.current = 0;
      beatStartTimeRef.current = performance.now();
      nextNoteTimeRef.current = ctx.currentTime + 0.02;
      if (beatTimerRef.current) clearInterval(beatTimerRef.current);
      beatTimerRef.current = window.setInterval(scheduleBeat, 25);

      // 1-second UI updater for 8-bit retro stages
      const patternNames = [
        "STAGE 1: 8-BIT OVERWORLD",
        "STAGE 2: RETRO DUNGEON",
        "STAGE 3: 8-BIT CYBER CASTLE",
        "STAGE 4: BOSS BATTLE 8-BIT",
      ];
      if (beatClockIntervalRef.current) clearInterval(beatClockIntervalRef.current);
      beatClockIntervalRef.current = window.setInterval(() => {
        const elapsed = (performance.now() - beatStartTimeRef.current) / 1000;
        const pIdx = Math.floor(elapsed / 60) % 4;
        const secInCycle = Math.floor(elapsed) % 60;
        const secLeft = 60 - secInCycle;
        setPatternDisplay({
          name: patternNames[pIdx],
          secLeft,
          progress: (secInCycle / 60) * 100,
        });
      }, 500);
    } else {
      if (beatTimerRef.current) {
        clearInterval(beatTimerRef.current);
        beatTimerRef.current = null;
      }
      if (beatClockIntervalRef.current) {
        clearInterval(beatClockIntervalRef.current);
        beatClockIntervalRef.current = null;
      }
    }
  };
  const updateAudioFromTilt = (beta: number, gamma: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;

    // DYNAMIC BPM SYNC TO ROLL (GAMMA)
    // gamma ranges roughly -35° to +35°:
    // -35° -> ~70 BPM (slow hip-hop/downtempo), 0° -> 110 BPM (groove), +35° -> ~152 BPM (techno/drum&bass)
    const normRollBpm = Math.max(-1, Math.min(1, gamma / 35));
    const liveBpm = Math.round(110 + normRollBpm * 42); // 68 BPM to 152 BPM
    bpmRef.current = liveBpm;

    if (bpmDisplayRef.current) {
      bpmDisplayRef.current.innerText = `${liveBpm} BPM`;
    }

    // Tightened, highly responsive tilt ranges:
    // Beta: 20° to 65° sweeps the full frequency spectrum
    const normBeta = Math.max(0, Math.min(1, (beta - 20) / 45));
    // Gamma: -30° to +30° sweeps full stereo width and swell
    const normGamma = Math.max(0, Math.min(1, (gamma + 30) / 60));

    // Update active VOID voice
    if (voidVoiceRef.current) {
      const { filter, bloomGain, subGain, oscs } = voidVoiceRef.current;

      // Heavy filter sweep: from deep 90Hz sub rumble up to a screaming 3400Hz resonant peak
      const targetFreq = 90 + Math.pow(normBeta, 1.8) * 3310;
      filter.frequency.setTargetAtTime(targetFreq, now, 0.03);
      // High resonance (Q from 1.5 up to 6.2) for aggressive vowel-like bite
      filter.Q.setTargetAtTime(1.5 + normBeta * 4.7, now, 0.03);

      // Sub-bass boost when tilted back (earthquake sub), backing off when tilted forward
      const targetSub = 0.8 + (1 - normBeta) * 0.9;
      subGain.gain.setTargetAtTime(targetSub, now, 0.03);

      // Roll controls massive ambient bloom gain + deep detune spread
      const targetBloom = 0.02 + normGamma * 0.65;
      bloomGain.gain.setTargetAtTime(targetBloom, now, 0.03);

      // Pitch sag on back tilt (heavy drop feeling)
      const pitchBendCents = (normBeta - 0.5) * 120; // +/- 1 semitone pitch bend
      oscs.forEach((osc) => {
        osc.detune.setTargetAtTime(pitchBendCents, now, 0.03);
      });
    }

    // Update active PULSE voice
    if (pulseVoiceRef.current) {
      const { filter, lfoGains, oscs } = pulseVoiceRef.current;
      // Massive filter sweep from dark 400Hz up to 8800Hz searing shimmer
      const targetPulseFreq = 400 + Math.pow(normBeta, 1.5) * 8400;
      filter.frequency.setTargetAtTime(targetPulseFreq, now, 0.03);
      filter.Q.setTargetAtTime(1.2 + normBeta * 3.8, now, 0.03);

      // Heavy shimmer detune depth (up to 32 cents wide)
      const targetDetune = 3.0 + normBeta * 29.0;
      lfoGains.forEach((g) => {
        g.gain.setTargetAtTime(targetDetune, now, 0.03);
      });

      // Pitch modulation from roll
      const pulseBendCents = (normGamma - 0.5) * 80;
      oscs.forEach((osc) => {
        osc.detune.setTargetAtTime(pulseBendCents, now, 0.03);
      });
    }

    // Master Delay Feedback: Tilting right pushes into near-infinite dub delay feedback
    if (masterBusRef.current) {
      const targetFeedback = 0.15 + normGamma * 0.68;
      masterBusRef.current.delayFeedback.gain.setTargetAtTime(targetFeedback, now, 0.03);
    }

    // Export tilt commands over Bluetooth MIDI
    sendGyroMidi(beta, gamma, 0);
  };

  const handleOrientation = (e: DeviceOrientationEvent) => {
    if (e.beta === null && e.gamma === null) return;
    const beta = e.beta ?? 45;
    const gamma = e.gamma ?? 0;
    const alpha = e.alpha ?? 0;
    tiltRef.current = { beta, gamma };

    // ROTARY VOLUME CONTROL via Alpha (Device Heading / Screen plane rotation)
    // Clockwise rotation increases volume, Counter-Clockwise decreases
    if (lastAlphaRef.current !== null && !panicRef.current) {
      let deltaAlpha = alpha - lastAlphaRef.current;
      // Handle 0° / 360° boundary
      if (deltaAlpha > 180) deltaAlpha -= 360;
      if (deltaAlpha < -180) deltaAlpha += 360;

      // When rotating phone clockwise in your hands, alpha delta tracks turning speed
      if (Math.abs(deltaAlpha) > 0.4 && Math.abs(deltaAlpha) < 35) {
        // Clockwise = increase volume (+), Counter-Clockwise = decrease (-)
        const volStep = (-deltaAlpha / 15) * 0.04;
        adjustMasterVolume(volStep);
      }
    }
    lastAlphaRef.current = alpha;

    // Apply directly to Web Audio with instantaneous reaction
    updateAudioFromTilt(beta, gamma);

    // Export gyroscope orientation commands via Bluetooth MIDI
    sendGyroMidi(beta, gamma, alpha);

    // Dynamic 3D tilt of the instrument container for tactile weight
    if (instrumentRef.current) {
      const rotX = Math.max(-15, Math.min(15, (45 - beta) * 0.5));
      const rotY = Math.max(-15, Math.min(15, gamma * 0.5));
      instrumentRef.current.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }

    // Update visual readout directly on DOM without triggering 60fps React re-renders
    if (tiltDisplayRef.current) {
      const normBeta = Math.round(Math.max(0, Math.min(100, ((beta - 20) / 45) * 100)));
      const normGamma = Math.round(Math.max(0, Math.min(100, ((gamma + 30) / 60) * 100)));
      tiltDisplayRef.current.innerText = `PITCH ${normBeta}% (${Math.round(beta)}°) | ROLL ${normGamma}% (${Math.round(gamma)}°)`;
    }
  };

  const enableGyroscope = async () => {
    ensureGameStarted();
    getAudioContext();
    if (
      typeof window !== "undefined" &&
      "DeviceOrientationEvent" in window &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function"
    ) {
      try {
        const response = await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission();
        if (response === "granted") {
          window.addEventListener("deviceorientation", handleOrientation);
          setGyroActive(true);
        }
      } catch (err) {
        console.warn("DeviceOrientation error:", err);
      }
    } else if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", handleOrientation);
      setGyroActive(true);
    }
  };

  const toggleButton = (index: number) => {
    ensureGameStarted();
    if (index === 0) {
      setVoidOn((prev) => {
        const next = !prev;
        if (next) {
          startVoid();
          sendMidiNote(1, 36, 100); // VOID Note On C2
        } else {
          stopVoid();
          sendMidiNote(1, 36, 0); // VOID Note Off
        }
        return next;
      });
      // Spawn new VOID ball on press
      spawnBall("void");
    } else {
      setPulseOn((prev) => {
        const next = !prev;
        if (next) {
          startPulse();
          sendMidiNote(1, 67, 100); // PULSE Note On G4
        } else {
          stopPulse();
          sendMidiNote(1, 67, 0); // PULSE Note Off
        }
        return next;
      });
      // Spawn new PULSE ball on press
      spawnBall("pulse");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "Escape") {
        e.preventDefault();
        if (showHelp) {
          setShowHelp(false);
        } else {
          togglePanic();
        }
      } else if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        togglePanic();
      } else if (e.key === "?" || e.key.toLowerCase() === "h") {
        e.preventDefault();
        setShowHelp((prev) => !prev);
      } else if (e.key === "b" || e.key === " ") {
        e.preventDefault();
        toggleBeat();
      } else if (e.key === "1" || e.key.toLowerCase() === "v") {
        toggleButton(0);
      } else if (e.key === "2" || e.key.toLowerCase() === "p") {
        toggleButton(1);
      } else if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
        const next = Math.min(1, Math.round((faderRef.current + 0.1) * 10) / 10);
        faderRef.current = next;
        setFaderPos(next);
        applyCrossfade(next);
      } else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
        const next = Math.max(0, Math.round((faderRef.current - 0.1) * 10) / 10);
        faderRef.current = next;
        setFaderPos(next);
        applyCrossfade(next);
      } else if (e.key.toLowerCase() === "c") {
        faderRef.current = 0.5;
        setFaderPos(0.5);
        applyCrossfade(0.5);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Mouse Wheel listener for Desktop Jog Wheel Scrub
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.14;
      applyJogScrub(delta);
    };
    window.addEventListener("wheel", handleWheel, { passive: false });

    // Touch gesture listeners for 2-finger Jog Wheel on mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        lastTouchMidRef.current = { x: midX, y: midY };
        startJogMode();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastTouchMidRef.current) {
        e.preventDefault();
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const dx = midX - lastTouchMidRef.current.x;
        const dy = midY - lastTouchMidRef.current.y;
        const delta = (dx - dy) * 0.32;
        applyJogScrub(delta);
        lastTouchMidRef.current = { x: midX, y: midY };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        lastTouchMidRef.current = null;
        stopJogMode();
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: false });

    // Device motion listener: Rotation Rate around screen axis adjusts volume (Clockwise = increase)
    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      if (panicRef.current) return;
      if (e.rotationRate) {
        // Rotational angular velocity around normal/screen axis (deg/sec)
        const rotZ = e.rotationRate.alpha ?? e.rotationRate.gamma ?? 0;
        if (Math.abs(rotZ) > 8) {
          // Clockwise rotation produces positive rate -> increase volume
          const delta = (rotZ / 100) * 0.022;
          adjustMasterVolume(delta);
        }
      }
    };
    window.addEventListener("devicemotion", handleDeviceMotion);

    // Desktop mouse & touch pointer tracking for physical interaction with balls
    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (pointerPosRef.current) {
        const dt = Math.max(1, now - pointerPosRef.current.lastTime);
        const vx = ((e.clientX - pointerPosRef.current.x) / dt) * 16;
        const vy = ((e.clientY - pointerPosRef.current.y) / dt) * 16;
        pointerPosRef.current = {
          x: e.clientX,
          y: e.clientY,
          active: true,
          vx: Math.max(-20, Math.min(20, vx)),
          vy: Math.max(-20, Math.min(20, vy)),
          lastTime: now,
        };
      } else {
        pointerPosRef.current = {
          x: e.clientX,
          y: e.clientY,
          active: true,
          vx: 0,
          vy: 0,
          lastTime: now,
        };
      }

      if (gyroActive) return;
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
      const simBeta = 42 + normY * 25;
      const simGamma = normX * 30;
      tiltRef.current = { beta: simBeta, gamma: simGamma };
      updateAudioFromTilt(simBeta, simGamma);
    };

    const handlePointerUpGlobal = () => {
      if (pointerPosRef.current) {
        pointerPosRef.current.active = false;
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUpGlobal);
    window.addEventListener("pointercancel", handlePointerUpGlobal);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("devicemotion", handleDeviceMotion);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUpGlobal);
      window.removeEventListener("pointercancel", handlePointerUpGlobal);
      window.removeEventListener("deviceorientation", handleOrientation);
      // Clean up all active ball audio nodes
      ballsRef.current.forEach((b) => {
        try {
          b.voice.oscs.forEach((osc) => osc.stop());
          b.voice.filter.disconnect();
          b.voice.gain.disconnect();
        } catch {}
      });
      ballsRef.current = [];
      if (beatTimerRef.current) {
        clearInterval(beatTimerRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // VISIT COUNTER (PERSISTENT) & LIVE CONNECTED USERS SIMULATOR
  useEffect(() => {
    try {
      const stored = localStorage.getItem("duotone_total_visits");
      let count = stored ? parseInt(stored, 10) : 1284;
      if (isNaN(count)) count = 1284;
      count += 1;
      localStorage.setItem("duotone_total_visits", count.toString());
      setVisitsCount(count);
    } catch {
      setVisitsCount(1285);
    }

    // Dynamic live connected users with subtle organic fluctuations
    const baseActive = 12;
    const interval = window.setInterval(() => {
      const drift = Math.floor(Math.sin(Date.now() / 28000) * 4) + Math.floor(Math.random() * 3) - 1;
      setActiveUsersCount(Math.max(6, baseActive + drift));
    }, 14000);

    return () => clearInterval(interval);
  }, []);

  // REAL-TIME OSCILLOSCOPE WAVEFORM ANIMATION LOOP (60 FPS, Zero React State Re-renders)
  useEffect(() => {
    let animId: number;

    const drawWave = (
      canvas: HTMLCanvasElement,
      analyser: AnalyserNode | null,
      strokeColor: string,
      glowColor: string,
      isActive: boolean,
      angleRad = 0
    ) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(angleRad);

      const waveSpan = width * 0.92;
      const startX = -waveSpan / 2;

      if (!analyser || !isActive) {
        // Resting baseline along rotated axis
        ctx.beginPath();
        ctx.moveTo(startX * 0.65, 0);
        ctx.lineTo(-startX * 0.65, 0);
        ctx.strokeStyle = strokeColor;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      // Outer glow trace
      ctx.beginPath();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = strokeColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 16;

      const sliceWidth = waveSpan / bufferLength;
      const amp = height * 0.46;

      for (let i = 0; i < bufferLength; i++) {
        const v = (dataArray[i] - 128) / 128.0;
        const x = startX + i * sliceWidth;
        const y = v * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Sharp crisp core beam
      ctx.beginPath();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "#ffffff";
      ctx.shadowBlur = 0;
      for (let i = 0; i < bufferLength; i += 2) {
        const v = (dataArray[i] - 128) / 128.0;
        const x = startX + i * sliceWidth;
        const y = v * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.restore();
    };

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);

      try {
        // Continuous 33 1/3 RPM vinyl spinning when music is playing and hand is NOT on platter
        if (
          !isHoldingVinylRef.current &&
          (voidOnRef.current || pulseOnRef.current || beatActiveRef.current)
        ) {
          jogWheelAngleRef.current = (jogWheelAngleRef.current + 2.0) % 360;
          if (vinylPlatterVisualRef.current) {
            vinylPlatterVisualRef.current.style.transform = `rotate(${jogWheelAngleRef.current.toFixed(1)}deg)`;
          }
        }
        // 1. UPDATE AND RENDER BOUNCING SONIC BALLS (PHYSICS + GYROSCOPE)
        const now = performance.now();
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const { beta, gamma } = tiltRef.current;

        // INVISIBLE ROTATION PHYSICAL FORCE FIELD (Synced with Rolls & Random Direction Changes)
        if (now > nextRotDirChangeTimeRef.current) {
          // Randomly invert direction (+1 clockwise vs -1 counter-clockwise)
          targetRotDirRef.current = targetRotDirRef.current > 0 ? -1 : 1;
          // Random time interval for next direction change (between 3.5s and 8.0s)
          nextRotDirChangeTimeRef.current = now + 3500 + Math.random() * 4500;
        }

        // Smooth fluid easing of the rotation direction
        rotDirRef.current += (targetRotDirRef.current - rotDirRef.current) * 0.045;

        // Synced with rolls: gamma tilt (-30° to +30°)
        const rollMagnitude = Math.abs(gamma) / 25;
        const rollVortexBoost = 1.0 + Math.min(2.5, rollMagnitude * 1.8);
        const vortexStrength = 0.44 * rotDirRef.current * rollVortexBoost;

        const centerX = screenW / 2;
        const centerY = screenH / 2;

        // Gravity vector from phone tilt (neutral holding angle: beta ~ 42°, gamma ~ 0°)
        // When Jog Wheel Freeze is active, normal gravity is paused
        const gx = jogActiveRef.current ? 0 : (gamma / 25) * 0.55;
        const gy = jogActiveRef.current ? 0 : ((beta - 42) / 25) * 0.65;

        for (let i = 0; i < ballsRef.current.length; i++) {
          const ball = ballsRef.current[i];

          // Apply invisible rotational swirl around screen center
          const dxCenter = ball.x - centerX;
          const dyCenter = ball.y - centerY;
          const distCenter = Math.hypot(dxCenter, dyCenter);

          if (distCenter > 15 && !jogActiveRef.current) {
            // Perpendicular unit vector (-dyCenter / distCenter, dxCenter / distCenter) for tangential orbital push
            const tx = -dyCenter / distCenter;
            const ty = dxCenter / distCenter;

            // Apply tangential rotational acceleration
            ball.vx += tx * vortexStrength;
            ball.vy += ty * vortexStrength;

            // Subtle centripetal stabilizing force to produce graceful orbital curvature
            const centripetal = 0.038 * (distCenter / (screenW * 0.35));
            ball.vx -= (dxCenter / distCenter) * centripetal;
            ball.vy -= (dyCenter / distCenter) * centripetal;
          }

          ball.vx += gx;
          ball.vy += gy;

          // Speed clamping
          const speed = Math.hypot(ball.vx, ball.vy);
          if (speed > 16) {
            ball.vx = (ball.vx / speed) * 16;
            ball.vy = (ball.vy / speed) * 16;
          }

          // Atmospheric drag
          ball.vx *= 0.99;
          ball.vy *= 0.99;

          ball.x += ball.vx;
          ball.y += ball.vy;

          let collided = false;

          // Screen Boundary Collisions
          if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.vx = -ball.vx * 0.88;
            collided = true;
          } else if (ball.x + ball.radius > screenW) {
            ball.x = screenW - ball.radius;
            ball.vx = -ball.vx * 0.88;
            collided = true;
          }

          if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.vy = -ball.vy * 0.88;
            collided = true;
          } else if (ball.y + ball.radius > screenH) {
            ball.y = screenH - ball.radius;
            ball.vy = -ball.vy * 0.88;
            collided = true;
          }

          // Check for 3-ball same-color collision explosion
          const explodedIds = new Set<string>();
          for (let i = 0; i < ballsRef.current.length; i++) {
            const b1 = ballsRef.current[i];
            if (explodedIds.has(b1.id)) continue;

            for (let j = i + 1; j < ballsRef.current.length; j++) {
              const b2 = ballsRef.current[j];
              if (b2.type !== b1.type || explodedIds.has(b2.id)) continue;

              const d12 = Math.hypot(b2.x - b1.x, b2.y - b1.y);
              const touchProximity = b1.radius + b2.radius + 18;

              if (d12 < touchProximity) {
                // Find third ball of the exact same type colliding with them
                for (let k = j + 1; k < ballsRef.current.length; k++) {
                  const b3 = ballsRef.current[k];
                  if (b3.type !== b1.type || explodedIds.has(b3.id)) continue;

                  const d13 = Math.hypot(b3.x - b1.x, b3.y - b1.y);
                  const d23 = Math.hypot(b3.x - b2.x, b3.y - b2.y);

                  if (d13 < touchProximity && d23 < touchProximity) {
                    explodedIds.add(b1.id);
                    explodedIds.add(b2.id);
                    explodedIds.add(b3.id);

                    const ex = (b1.x + b2.x + b3.x) / 3;
                    const ey = (b1.y + b2.y + b3.y) / 3;
                    handleTripleBallExplosion(b1.type, ex, ey);
                    break;
                  }
                }
              }
            }
          }

          if (explodedIds.size > 0) {
            ballsRef.current.forEach((b) => {
              if (explodedIds.has(b.id)) {
                try {
                  b.voice.oscs.forEach((osc) => osc.stop());
                  b.voice.filter.disconnect();
                  b.voice.gain.disconnect();
                } catch {}
              }
            });
            ballsRef.current = ballsRef.current.filter((b) => !explodedIds.has(b.id));
            setBalls((prev) => prev.filter((b) => !explodedIds.has(b.id)));
          }

          // DYNAMIC INTERACTION: Finger / Mouse Cursor deflects and pushes balls
          if (pointerPosRef.current && pointerPosRef.current.active) {
            const ptr = pointerPosRef.current;
            const ptrRadius = 36; // touch / cursor force field radius
            const dx = ball.x - ptr.x;
            const dy = ball.y - ptr.y;
            const dist = Math.hypot(dx, dy);
            const minDist = ball.radius + ptrRadius;

            if (dist < minDist && dist > 0.1) {
              const nx = dx / dist;
              const ny = dy / dist;
              const push = (minDist - dist) * 0.75;
              ball.x += nx * push;
              ball.y += ny * push;

              // Transfer swipe / cursor velocity + repulsion impulse
              ball.vx += nx * 4.2 + ptr.vx * 0.35;
              ball.vy += ny * 4.2 + ptr.vy * 0.35;

              collided = true;
            }
          }

          // DYNAMIC INTERACTION: Balls bounce off VOID and PULSE buttons like pinball bumpers
          if (voidBtnRef.current && pulseBtnRef.current) {
            const vRect = voidBtnRef.current.getBoundingClientRect();
            const pRect = pulseBtnRef.current.getBoundingClientRect();
            const bumpers = [
              { cx: vRect.left + vRect.width / 2, cy: vRect.top + vRect.height / 2, r: vRect.width / 2 },
              { cx: pRect.left + pRect.width / 2, cy: pRect.top + pRect.height / 2, r: pRect.width / 2 },
            ];

            bumpers.forEach((bm) => {
              const dx = ball.x - bm.cx;
              const dy = ball.y - bm.cy;
              const dist = Math.hypot(dx, dy);
              const minDist = ball.radius + bm.r;

              if (dist < minDist && dist > 0.1) {
                const nx = dx / dist;
                const ny = dy / dist;
                ball.x = bm.cx + nx * minDist;
                ball.y = bm.cy + ny * minDist;

                // Reflect velocity
                const dot = ball.vx * nx + ball.vy * ny;
                if (dot < 0) {
                  ball.vx -= 1.85 * dot * nx;
                  ball.vy -= 1.85 * dot * ny;
                }
                collided = true;
              }
            });
          }

          // Ball-to-ball collisions & MAGNETIC REPULSION FOR DIFFERENT BUTTONS
          for (let j = i + 1; j < ballsRef.current.length; j++) {
            const other = ballsRef.current[j];
            const dx = other.x - ball.x;
            const dy = other.y - ball.y;
            const dist = Math.hypot(dx, dy);

            // OPPOSITE BUTTON TYPES: Repel like identical magnetic charges!
            if (ball.type !== other.type) {
              const repulsionRadius = 180;
              if (dist < repulsionRadius && dist > 1) {
                const nx = dx / dist;
                const ny = dy / dist;
                // Stronger magnetic force as they get closer
                const force = (1 - dist / repulsionRadius) * 2.2;
                ball.vx -= nx * force;
                ball.vy -= ny * force;
                other.vx += nx * force;
                other.vy += ny * force;

                // Subtle magnetic sonic tension modulation when near
                if (dist < 80 && now - ball.lastBounceTime > 150) {
                  ball.lastBounceTime = now;
                  modulateBallSoundOnCollision(ball);
                  modulateBallSoundOnCollision(other);
                }
              }
            } else {
              // SAME BUTTON TYPE: Standard elastic collision
              const minDist = ball.radius + other.radius;
              if (dist < minDist && dist > 0.1) {
                const overlap = (minDist - dist) / 2;
                const nx = dx / dist;
                const ny = dy / dist;
                ball.x -= nx * overlap;
                ball.y -= ny * overlap;
                other.x += nx * overlap;
                other.y += ny * overlap;

                const kx = ball.vx - other.vx;
                const ky = ball.vy - other.vy;
                const p = 2 * (nx * kx + ny * ky) / 2;
                ball.vx -= p * nx * 0.9;
                ball.vy -= p * ny * 0.9;
                other.vx += p * nx * 0.9;
                other.vy += p * ny * 0.9;

                collided = true;
                if (now - other.lastBounceTime > 90) {
                  other.lastBounceTime = now;
                  modulateBallSoundOnCollision(other);
                }
              }
            }
          }

          // Sound modulation on impact
          if (collided && now - ball.lastBounceTime > 90) {
            ball.lastBounceTime = now;
            modulateBallSoundOnCollision(ball);

            // Visual bounce flash
            const el = document.getElementById(`ball-${ball.id}`);
            if (el) {
              el.style.boxShadow =
                ball.type === "void"
                  ? "0 0 35px rgba(192, 132, 252, 1)"
                  : "0 0 35px rgba(34, 211, 238, 1)";
              setTimeout(() => {
                if (el) {
                  el.style.boxShadow =
                    ball.type === "void"
                      ? "0 0 20px rgba(192, 132, 252, 0.85)"
                      : "0 0 20px rgba(34, 211, 238, 0.85)";
                }
              }, 120);
            }
          }

          // Update DOM element position at 60 FPS without React re-render
          const el = document.getElementById(`ball-${ball.id}`);
          if (el) {
            el.style.transform = `translate3d(${(ball.x - ball.radius).toFixed(1)}px, ${(ball.y - ball.radius).toFixed(1)}px, 0)`;
          }
        }

        // REACTIVE AUDIO VISUALIZER DRAWING (60 FPS on background canvas)
        if (bgVisualizerCanvasRef.current) {
          const bgCanvas = bgVisualizerCanvasRef.current;
          const bgCtx = bgCanvas.getContext("2d");
          if (bgCtx) {
            const dpr = window.devicePixelRatio || 1;
            const w = bgCanvas.clientWidth;
            const h = bgCanvas.clientHeight;
            if (bgCanvas.width !== w * dpr || bgCanvas.height !== h * dpr) {
              bgCanvas.width = w * dpr;
              bgCanvas.height = h * dpr;
            }
            bgCtx.save();
            bgCtx.scale(dpr, dpr);
            bgCtx.clearRect(0, 0, w, h);

            let bassEnergy = 0;
            let midEnergy = 0;
            let highEnergy = 0;

            const mAnalyser = masterAnalyserRef.current;
            if (
              mAnalyser &&
              (voidOnRef.current || pulseOnRef.current || beatActiveRef.current || isHoldingVinylRef.current)
            ) {
              const freqData = new Uint8Array(mAnalyser.frequencyBinCount);
              mAnalyser.getByteFrequencyData(freqData);
              for (let b = 0; b < 7; b++) bassEnergy += freqData[b];
              bassEnergy = bassEnergy / 7 / 255;
              for (let b = 7; b < 25; b++) midEnergy += freqData[b];
              midEnergy = midEnergy / 18 / 255;
              for (let b = 25; b < 56; b++) highEnergy += freqData[b];
              highEnergy = highEnergy / 31 / 255;
            }

            // 1. Ambient Breathing Radial Core Glow
            const cx = w / 2;
            const cy = h / 2;
            const maxRadius = Math.min(w, h) * (0.35 + bassEnergy * 0.28);
            const radialGrad = bgCtx.createRadialGradient(cx, cy, 10, cx, cy, maxRadius);

            const vAlpha = voidOnRef.current ? 0.09 + bassEnergy * 0.16 : bassEnergy * 0.04;
            const cAlpha = pulseOnRef.current ? 0.09 + highEnergy * 0.16 : highEnergy * 0.04;
            const aAlpha = beatActiveRef.current ? 0.08 + midEnergy * 0.15 : 0;

            radialGrad.addColorStop(0, `rgba(168, 85, 247, ${vAlpha})`);
            radialGrad.addColorStop(0.5, `rgba(6, 182, 212, ${cAlpha})`);
            radialGrad.addColorStop(0.8, `rgba(245, 158, 11, ${aAlpha})`);
            radialGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

            bgCtx.fillStyle = radialGrad;
            bgCtx.fillRect(0, 0, w, h);

            // DYNAMIC DETAILED HIGH-DEFINITION AUDIO WAVEFORM (ROTATING WITH GYROSCOPE)
            const targetWaveAngle = (gamma * Math.PI) / 180;
            smoothWaveformAngleRef.current += (targetWaveAngle - smoothWaveformAngleRef.current) * 0.12;
            const waveAngle = smoothWaveformAngleRef.current;

            const isAudioActive =
              voidOnRef.current ||
              pulseOnRef.current ||
              beatActiveRef.current ||
              isHoldingVinylRef.current ||
              ballsRef.current.length > 0;

            if (mAnalyser) {
              const bufferLength = mAnalyser.frequencyBinCount;
              const timeData = new Uint8Array(bufferLength);
              mAnalyser.getByteTimeDomainData(timeData);

              const waveLength = Math.hypot(w, h) * 1.15;
              const ampHeight = Math.min(w, h) * 0.42;

              bgCtx.save();
              bgCtx.translate(cx, cy);
              bgCtx.rotate(waveAngle);

              // Subtle Horizon Axis Beam along rotated gyroscope plane
              bgCtx.beginPath();
              bgCtx.moveTo(-waveLength / 2, 0);
              bgCtx.lineTo(waveLength / 2, 0);
              bgCtx.lineWidth = 1;
              bgCtx.strokeStyle = "rgba(255, 255, 255, 0.1)";
              bgCtx.stroke();

              if (isAudioActive) {
                // Multi-chromatic Neon Gradient along rotated axis
                const grad = bgCtx.createLinearGradient(-waveLength / 2, 0, waveLength / 2, 0);
                grad.addColorStop(0, "rgba(168, 85, 247, 0.95)");
                grad.addColorStop(0.35, "rgba(245, 158, 11, 0.95)");
                grad.addColorStop(0.7, "rgba(6, 182, 212, 0.95)");
                grad.addColorStop(1, "rgba(168, 85, 247, 0.95)");

                const sliceWidth = waveLength / bufferLength;
                const startX = -waveLength / 2;

                // 1. Outer Bloom Halo
                bgCtx.beginPath();
                bgCtx.lineWidth = 6;
                bgCtx.strokeStyle = "rgba(245, 158, 11, 0.3)";
                bgCtx.shadowColor = "#f59e0b";
                bgCtx.shadowBlur = 24;

                for (let i = 0; i < bufferLength; i += 2) {
                  const raw = (timeData[i] - 128) / 128;
                  const x = startX + i * sliceWidth;
                  const y = raw * ampHeight;
                  if (i === 0) bgCtx.moveTo(x, y);
                  else bgCtx.lineTo(x, y);
                }
                bgCtx.stroke();

                // 2. High-Resolution Core Trace (2048 FFT points)
                bgCtx.beginPath();
                bgCtx.lineWidth = 2.8;
                bgCtx.strokeStyle = grad;
                bgCtx.shadowColor = "#ffffff";
                bgCtx.shadowBlur = 10;

                for (let i = 0; i < bufferLength; i++) {
                  const raw = (timeData[i] - 128) / 128;
                  const x = startX + i * sliceWidth;
                  const y = raw * ampHeight;
                  if (i === 0) bgCtx.moveTo(x, y);
                  else bgCtx.lineTo(x, y);
                }
                bgCtx.stroke();

                // 3. Ultra-Fine White Center Core Laser
                bgCtx.beginPath();
                bgCtx.lineWidth = 1.2;
                bgCtx.strokeStyle = "rgba(255, 255, 255, 0.95)";
                bgCtx.shadowBlur = 0;
                for (let i = 0; i < bufferLength; i += 2) {
                  const raw = (timeData[i] - 128) / 128;
                  const x = startX + i * sliceWidth;
                  const y = raw * ampHeight;
                  if (i === 0) bgCtx.moveTo(x, y);
                  else bgCtx.lineTo(x, y);
                }
                bgCtx.stroke();
              }

              bgCtx.restore();
            }

            // 2. Neon Soundwave Horizon Ribbons
            if (bassEnergy > 0.02 || midEnergy > 0.02 || highEnergy > 0.02) {
              const bins = 40;
              const step = w / bins;
              bgCtx.lineWidth = 1.5 + bassEnergy * 2.5;
              bgCtx.strokeStyle = `rgba(192, 132, 252, ${0.15 + bassEnergy * 0.35})`;
              bgCtx.shadowColor = "#c084fc";
              bgCtx.shadowBlur = 10;
              bgCtx.beginPath();
              for (let i = 0; i <= bins; i++) {
                const x = i * step;
                const angle = (i / bins) * Math.PI * 4 + now * 0.002;
                const y = h * 0.85 + Math.sin(angle) * (14 + bassEnergy * 32);
                if (i === 0) bgCtx.moveTo(x, y);
                else bgCtx.lineTo(x, y);
              }
              bgCtx.stroke();

              // Mirror Cyan Ribbon
              bgCtx.lineWidth = 1.2 + highEnergy * 2.2;
              bgCtx.strokeStyle = `rgba(34, 211, 238, ${0.15 + highEnergy * 0.35})`;
              bgCtx.shadowColor = "#22d3ee";
              bgCtx.shadowBlur = 10;
              bgCtx.beginPath();
              for (let i = 0; i <= bins; i++) {
                const x = i * step;
                const angle = (i / bins) * Math.PI * 4 - now * 0.0025;
                const y = h * 0.85 + Math.cos(angle) * (12 + highEnergy * 28);
                if (i === 0) bgCtx.moveTo(x, y);
                else bgCtx.lineTo(x, y);
              }
              bgCtx.stroke();
            }
            bgCtx.restore();
          }
        }

        // Smoothly glide button positions based on gyroscope tilt (VOID in tilt direction, PULSE in opposite direction)
        const targetVoidX = Math.max(-52, Math.min(52, gamma * 1.5));
        const targetVoidY = Math.max(-48, Math.min(48, (beta - 42) * 1.6));

        // Pulse moves in the exact OPPOSITE direction
        const targetPulseX = -targetVoidX;
        const targetPulseY = -targetVoidY;

        const pos = buttonPosRef.current;
        pos.voidX += (targetVoidX - pos.voidX) * 0.1;
        pos.voidY += (targetVoidY - pos.voidY) * 0.1;
        pos.pulseX += (targetPulseX - pos.pulseX) * 0.1;
        pos.pulseY += (targetPulseY - pos.pulseY) * 0.1;

        if (voidBtnRef.current) {
          const scale = voidOnRef.current ? 0.94 : 1.0;
          voidBtnRef.current.style.transform = `translate3d(${pos.voidX.toFixed(2)}px, ${pos.voidY.toFixed(2)}px, 0) scale(${scale})`;
        }

        if (pulseBtnRef.current) {
          const scale = pulseOnRef.current ? 0.94 : 1.0;
          pulseBtnRef.current.style.transform = `translate3d(${pos.pulseX.toFixed(2)}px, ${pos.pulseY.toFixed(2)}px, 0) scale(${scale})`;
        }

        const currentAngle = smoothWaveformAngleRef.current;

        if (voidCanvasRef.current) {
          drawWave(
            voidCanvasRef.current,
            voidAnalyserRef.current,
            "#ffffff", // White waveform
            "rgba(255, 255, 255, 0.85)",
            voidOnRef.current,
            currentAngle
          );
        }

        if (pulseCanvasRef.current) {
          drawWave(
            pulseCanvasRef.current,
            pulseAnalyserRef.current,
            "#ffffff", // White waveform
            "rgba(255, 255, 255, 0.85)",
            pulseOnRef.current,
            -currentAngle
          );
        }
      } catch (err) {
        console.error("renderLoop error:", err);
      }
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // VOID: Deep, massive drone with rich harmonics that blooms into a warm ambient pad
  const startVoid = () => {
    const ctx = getAudioContext();
    const bus = masterBusRef.current;
    if (!bus) return;

    if (voidVoiceRef.current) {
      stopVoid();
    }

    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    // Fast, responsive attack so taps are immediately audible on any speaker
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.linearRampToValueAtTime(0.42, now + 0.05);

    // Initial filter frequency factoring in current tilt (heavier range)
    const { beta, gamma } = tiltRef.current;
    const normBeta = Math.max(0, Math.min(1, (beta - 20) / 45));
    const normGamma = Math.max(0, Math.min(1, (gamma + 30) / 60));

    const initialFreq = 90 + Math.pow(normBeta, 1.8) * 3310;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(initialFreq, now);
    filter.frequency.linearRampToValueAtTime(Math.min(3600, initialFreq + 800), now + 3.2);
    filter.Q.value = 1.5 + normBeta * 4.7;

    // Sub foundation (C2 - 65.41 Hz) with dedicated heavy sub boost node
    const oscSub = ctx.createOscillator();
    oscSub.type = "sine";
    oscSub.frequency.value = 65.41;

    const subGain = ctx.createGain();
    subGain.gain.value = 0.8 + (1 - normBeta) * 0.9;
    oscSub.connect(subGain);

    // Dark fifth drone (G2 - 98.00 Hz)
    const oscFifth = ctx.createOscillator();
    oscFifth.type = "triangle";
    oscFifth.frequency.value = 98.0;

    // Detuned body pair (C3 - 130.81 Hz) for warm analog chorusing
    const oscBody1 = ctx.createOscillator();
    oscBody1.type = "sawtooth";
    oscBody1.frequency.value = 130.4;

    const oscBody2 = ctx.createOscillator();
    oscBody2.type = "triangle";
    oscBody2.frequency.value = 131.2;

    const bodyGain = ctx.createGain();
    bodyGain.gain.value = 0.24;
    oscBody1.connect(bodyGain);
    oscBody2.connect(bodyGain);

    // Ethereal bloom octave (C4 - 261.63 Hz)
    const oscBloom = ctx.createOscillator();
    oscBloom.type = "sine";
    oscBloom.frequency.value = 261.63;

    const initialBloom = 0.02 + normGamma * 0.65;
    const bloomGain = ctx.createGain();
    bloomGain.gain.setValueAtTime(initialBloom, now);
    bloomGain.gain.linearRampToValueAtTime(Math.min(0.7, initialBloom + 0.3), now + 3.0);
    oscBloom.connect(bloomGain);

    // Routing
    subGain.connect(filter);
    oscFifth.connect(filter);
    bodyGain.connect(filter);
    bloomGain.connect(filter);

    filter.connect(gainNode);
    if (voidBusGainRef.current) {
      gainNode.connect(voidBusGainRef.current);
    } else {
      gainNode.connect(ctx.destination);
      gainNode.connect(bus.convolver);
      gainNode.connect(bus.delayL);
    }

    const pitchBendCents = (normBeta - 0.5) * 120;
    const oscs = [oscSub, oscFifth, oscBody1, oscBody2, oscBloom];
    oscs.forEach((osc) => {
      osc.detune.setValueAtTime(pitchBendCents, now);
      osc.start(now);
    });

    voidVoiceRef.current = {
      oscs,
      gain: gainNode,
      filter,
      bloomGain,
      subGain,
    };
  };

  const stopVoid = () => {
    if (!voidVoiceRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const { gain, oscs } = voidVoiceRef.current;

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.7);

    setTimeout(() => {
      oscs.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore if already stopped
        }
      });
    }, 750);

    voidVoiceRef.current = null;
  };

  // PULSE: Soft chime that opens into an ethereal, dreamy shimmer
  const startPulse = () => {
    const ctx = getAudioContext();
    const bus = masterBusRef.current;
    if (!bus) return;

    if (pulseVoiceRef.current) {
      stopPulse();
    }

    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, now);
    // Soft attack swell
    gainNode.gain.exponentialRampToValueAtTime(0.28, now + 0.22);

    const { beta, gamma } = tiltRef.current;
    const normBeta = Math.max(0, Math.min(1, (beta - 20) / 45));
    const normGamma = Math.max(0, Math.min(1, (gamma + 30) / 60));

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    const initialPulseFreq = 400 + Math.pow(normBeta, 1.5) * 8400;
    filter.frequency.setValueAtTime(initialPulseFreq, now);
    filter.frequency.exponentialRampToValueAtTime(Math.min(9500, initialPulseFreq + 2500), now + 3.5);
    filter.Q.value = 1.2 + normBeta * 3.8;

    // Harmonic bell triad: G4 (392Hz), D5 (587.3Hz), G5 (784Hz)
    const freqs = [392.0, 587.33, 783.99];
    const lfos: OscillatorNode[] = [];
    const lfoGains: GainNode[] = [];

    // Delay feedback swell factored by gamma tilt (up to heavy dub levels)
    const initFeedback = 0.15 + normGamma * 0.68;
    bus.delayFeedback.gain.cancelScheduledValues(now);
    bus.delayFeedback.gain.setValueAtTime(initFeedback, now);
    bus.delayFeedback.gain.linearRampToValueAtTime(Math.min(0.85, initFeedback + 0.2), now + 3.5);

    const pulseBendCents = (normGamma - 0.5) * 80;
    const oscs = freqs.map((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      osc.detune.setValueAtTime(pulseBendCents, now);

      // Pitch shimmer
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 2.6 + idx * 0.4;
      const lfoGain = ctx.createGain();
      const detuneAmt = 3.0 + normBeta * 29.0;
      lfoGain.gain.setValueAtTime(detuneAmt, now);
      lfoGain.gain.linearRampToValueAtTime(detuneAmt + 6, now + 3.0);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.detune);
      lfo.start(now);
      lfos.push(lfo);
      lfoGains.push(lfoGain);

      osc.start(now);
      osc.connect(filter);
      return osc;
    });

    filter.connect(gainNode);
    if (pulseBusGainRef.current) {
      gainNode.connect(pulseBusGainRef.current);
    } else {
      gainNode.connect(ctx.destination);
      gainNode.connect(bus.delayL);
      gainNode.connect(bus.convolver);
    }

    pulseVoiceRef.current = {
      oscs,
      gain: gainNode,
      filter,
      lfos,
      lfoGains,
    };
  };

  const stopPulse = () => {
    if (!pulseVoiceRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const bus = masterBusRef.current;
    const now = ctx.currentTime;
    const { gain, oscs, lfos } = pulseVoiceRef.current;

    if (bus) {
      bus.delayFeedback.gain.cancelScheduledValues(now);
      bus.delayFeedback.gain.setValueAtTime(bus.delayFeedback.gain.value, now);
      bus.delayFeedback.gain.linearRampToValueAtTime(0.32, now + 0.8);
    }

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    // Softer, longer ringing tail
    gain.gain.linearRampToValueAtTime(0.0001, now + 1.0);

    setTimeout(() => {
      oscs.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      lfos.forEach((lfo) => {
        try {
          lfo.stop();
          lfo.disconnect();
        } catch {
          // ignore
        }
      });
    }, 1250);

    pulseVoiceRef.current = null;
  };

  const handleAddVisit = () => {
    try {
      const next = visitsCount + 1;
      setVisitsCount(next);
      localStorage.setItem("duotone_total_visits", next.toString());
    } catch {}
  };

  if (currentPage === "dashboard") {
    return (
      <VisitsDashboard
        visitsCount={visitsCount}
        activeUsersCount={activeUsersCount}
        onBack={() => setCurrentPage("synth")}
        onAddVisit={handleAddVisit}
        isAudioPlaying={voidOn || pulseOn || beatOn}
        togglePanic={togglePanic}
        isPanicked={isPanicked}
      />
    );
  }

  return (
    <div
      onPointerDown={handleEmptySpacePointerDown}
      onPointerUp={cancelPanicHold}
      onPointerCancel={cancelPanicHold}
      onPointerMove={handleEmptySpacePointerMove}
      className="h-screen h-[100dvh] max-h-screen w-full flex flex-col items-center justify-between bg-black text-white p-2 sm:p-3 font-mono select-none relative overflow-hidden"
    >
      {/* BACKGROUND REACTIVE AUDIO VISUALIZER (60 FPS Ambient Canvas) */}
      <canvas
        ref={bgVisualizerCanvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />

      <style>{`
        @keyframes panicCharge {
          from { stroke-dashoffset: 201; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
      {/* VISITOR COUNTER & LIVE CONNECTED USERS BADGE (Clickable to open Visits Dashboard) */}
      <button
        type="button"
        onClick={() => setCurrentPage("dashboard")}
        className="fixed top-4 left-4 z-30 flex items-center gap-2.5 bg-neutral-950/90 border border-neutral-800 hover:border-emerald-500/60 px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm text-[10px] font-mono select-none tracking-wider group cursor-pointer transition-all active:scale-95"
        title="Abrir Panel de Visitas y Analítica en tiempo real"
      >
        <div className="flex items-center gap-1.5 text-neutral-400">
          <span className="text-neutral-500 font-bold">VISITAS:</span>
          <span className="text-neutral-200 font-bold">{visitsCount.toLocaleString()}</span>
        </div>
        <span className="w-1 h-1 rounded-full bg-neutral-700" />
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span>{activeUsersCount} EN VIVO</span>
        </div>
        <span className="text-[9px] text-neutral-500 group-hover:text-emerald-300 font-bold ml-0.5">
          📊
        </span>
      </button>

      {/* Visits insights opens by clicking top-left visitor badge directly */}

      {/* 2-MINUTE BALL EXPLOSION GAME HUD (Start Button, Points Visualization & Countdown Watch) */}
      <div className="z-20 mb-2 flex items-center gap-2 bg-neutral-950/90 border border-amber-500/50 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.25)] backdrop-blur-sm">
        {!isGameRunning && !isGameOver ? (
          <button
            type="button"
            onClick={startGame}
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 border-amber-600 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 flex flex-col items-center justify-center text-black font-black shadow-[0_0_20px_rgba(245,158,11,0.8),inset_0_3px_5px_rgba(255,255,255,0.7)] cursor-pointer hover:scale-105 active:scale-90 active:translate-y-0.5 transition-all select-none"
            title="Pulsar para iniciar juego de 2 minutos (START)"
          >
            <div className="w-2.5 h-1 bg-white/60 rounded-full mb-0.5 pointer-events-none" />
            <span className="text-[9px] sm:text-[10px] tracking-tight font-black uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
              START
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={restartGame}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-3 border-amber-500 bg-neutral-900 text-amber-300 hover:text-white flex flex-col items-center justify-center text-[8px] font-black uppercase shadow-md cursor-pointer hover:scale-105 active:scale-90 transition-all select-none"
            title="Reiniciar juego"
          >
            <span className="text-xs">🔄</span>
            <span className="text-[7px]">RESET</span>
          </button>
        )}

        <span className="w-1 h-3 bg-neutral-800" />

        {/* Countdown Watch */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs font-black">
          <span className="text-neutral-400">⏱️:</span>
          <span
            className={`px-1.5 py-0.5 rounded ${
              gameTimeLeft <= 15 && isGameRunning
                ? "bg-red-950 text-red-400 border border-red-500 animate-pulse shadow-[0_0_8px_#ef4444]"
                : "bg-neutral-900 text-amber-300 border border-neutral-700"
            }`}
          >
            {Math.floor(gameTimeLeft / 60)
              .toString()
              .padStart(2, "0")}
            :{(gameTimeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>

        <span className="w-1 h-3 bg-neutral-800" />

        {/* Points Visualization */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs font-black">
          <span className="text-neutral-400">⭐:</span>
          <span className="text-amber-400 text-xs sm:text-sm drop-shadow-[0_0_8px_#f59e0b]">
            {gameScore}
          </span>
        </div>
      </div>

      {/* TOP-RIGHT CONTROLS: TIP JAR, STREAMING LINKS & HELP BUTTON */}
      <div className="fixed top-4 right-4 z-30 flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setShowTipJarModal(true)}
          className="px-2.5 sm:px-3 py-1.5 rounded-full border border-amber-500/50 bg-neutral-950/90 text-amber-300 hover:text-white hover:border-amber-400 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold shadow-lg transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
          title="Bote de propinas y apoyo voluntario para Emiliabella"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#f59e0b]" />
          <span className="hidden sm:inline">PROPINA</span>
          <span>☕</span>
        </button>

        <button
          type="button"
          onClick={() => setShowStreamingModal(true)}
          className="px-2.5 sm:px-3 py-1.5 rounded-full border border-emerald-500/50 bg-neutral-950/90 text-emerald-300 hover:text-white hover:border-emerald-400 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold shadow-lg transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
          title="Escuchar canciones en Tidal, Spotify, Apple Music, YouTube y SoundCloud"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
          <span className="hidden sm:inline">STREAMING</span>
          <span>🎧</span>
        </button>

        {/* CORNER HELP BUTTON (?) WITH HOVER TOOLTIP */}
        <div className="group relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowHelp(true);
            }}
            className="w-8 h-8 rounded-full border border-neutral-700 bg-neutral-950/90 text-neutral-300 hover:text-white hover:border-emerald-400 flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-150 active:scale-90 cursor-pointer"
            title="Help"
          >
            ?
          </button>
          {/* Tooltip */}
          <div className="absolute top-10 right-0 hidden group-hover:block bg-neutral-900 border border-neutral-700 text-neutral-300 text-[10px] tracking-wider py-1 px-2.5 rounded shadow-xl whitespace-nowrap pointer-events-none uppercase font-mono">
            Help
          </div>
        </div>
      </div>

      {/* TOP STATUS BAR: Rotary Master Volume Knob & Panic Button */}
      <div className="w-full max-w-sm flex items-center justify-between gap-4 mb-2 z-20 shrink-0">
        {/* ROTARY MASTER VOLUME KNOB (Clockwise = Increase) */}
        <div className="flex items-center gap-3 flex-1 bg-neutral-950/80 border border-neutral-800 px-3 py-1.5 rounded-lg backdrop-blur-sm">
          {/* Interactive Rotary Dial */}
          <div
            onPointerDown={handleKnobPointerDown}
            onPointerMove={handleKnobPointerMove}
            onPointerUp={handleKnobPointerUp}
            className="w-10 h-10 rounded-full border-2 border-neutral-700 bg-neutral-900 flex items-center justify-center relative cursor-pointer active:border-emerald-400 touch-none shadow-md group"
            title="Gira el móvil en sentido horario o arrastra la rueda para subir volumen"
          >
            {/* Knob Tick Indicator Pointer */}
            <div
              style={{
                transform: `rotate(${-135 + masterVol * 270}deg)`,
              }}
              className="w-full h-full absolute inset-0 flex items-start justify-center transition-transform duration-75"
            >
              <div className="w-1 h-3 bg-gradient-to-b from-emerald-400 to-amber-300 rounded-full shadow-[0_0_6px_#34d399]" />
            </div>
            <span className="text-[8px] font-bold text-neutral-400 z-10 select-none">
              {Math.round(masterVol * 100)}%
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest text-neutral-400 font-bold">
                VOLUMEN
              </span>
              <span className="text-emerald-400 font-bold text-[10px]">
                {Math.round(masterVol * 100)}%
              </span>
            </div>
            <span className="text-[8px] text-neutral-500 tracking-tighter leading-tight">
              ↻ GIRA EL MÓVIL CLOCKWISE PARA SUBIR
            </span>
          </div>
        </div>

        {/* OCTAGONAL RED STOP / PANIC TRAFFIC SIGN BUTTON */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePanic();
          }}
          className={`relative w-13 h-13 sm:w-15 sm:h-15 flex items-center justify-center cursor-pointer transition-transform duration-150 active:scale-90 shrink-0 group ${
            isPanicked ? "animate-pulse" : "hover:scale-105"
          }`}
          title="STOP / Pánico: Silencia todo el sonido inmediatamente (o sostén 2s en zona vacía)"
        >
          {/* Octagonal SVG STOP Sign */}
          <svg
            viewBox="0 0 100 100"
            className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-[0_0_16px_rgba(239,68,68,0.8)]"
          >
            {/* Outer red octagon body */}
            <polygon
              points="29.3,0 70.7,0 100,29.3 100,70.7 70.7,100 29.3,100 0,70.7 0,29.3"
              className={
                isPanicked
                  ? "fill-red-700 stroke-white stroke-[5]"
                  : "fill-red-600 group-hover:fill-red-500 stroke-neutral-200 stroke-[4] transition-colors"
              }
            />
            {/* Inner white border line */}
            <polygon
              points="30.5,6 69.5,6 94,30.5 94,69.5 69.5,94 30.5,94 6,69.5 6,30.5"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeDasharray={isPanicked ? "4,4" : "none"}
            />
            {/* Center STOP / MUTED text (Bigger, authoritative traffic typography) */}
            <text
              x="50"
              y="55"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ffffff"
              fontWeight="950"
              fontSize={isPanicked ? "18" : "24"}
              letterSpacing={isPanicked ? "0.5" : "1.5"}
              fontFamily="system-ui, -apple-system, sans-serif"
              className="select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-black"
            >
              {isPanicked ? "MUTED" : "STOP"}
            </text>
          </svg>
        </button>
      </div>

      <div
        ref={instrumentRef}
        className="flex flex-row items-center justify-center gap-3 sm:gap-6 md:gap-8 transition-transform duration-75 ease-out z-10 my-auto shrink-0"
      >
        {/* Left Console: VOID & PULSE Pads with Vertical Crossfader */}
        <div className="flex flex-row items-stretch justify-center gap-5 sm:gap-7">
          {/* Buttons Stack: VOID on top (Violet), PULSE on bottom (Cyan) */}
          <div className="flex flex-col gap-3 sm:gap-5 justify-between items-center relative py-1">
            {/* Button 0: VOID (Solid Violet Background, Crisp White Text, Gyro Position Float) */}
            <div className="relative w-26 h-26 sm:w-32 sm:h-32 md:w-36 md:h-36 flex items-center justify-center">
              {/* Neutral Anchor Ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-violet-500/30 pointer-events-none" />

              <button
                ref={voidBtnRef}
                type="button"
                onClick={() => toggleButton(0)}
                style={{ willChange: "transform" }}
                className={`w-26 h-26 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-4 transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer touch-none group z-10 ${
                  voidOn
                    ? "bg-violet-600 border-white shadow-[0_0_55px_rgba(139,92,246,0.9)] scale-95"
                    : "bg-violet-700 hover:bg-violet-600 border-violet-300 shadow-[0_0_25px_rgba(124,58,237,0.45)]"
                }`}
              >
                {/* Real-time Oscilloscope Waveform Canvas */}
                <canvas
                  ref={voidCanvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none rounded-full"
                />

                <span className="relative z-10 text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] uppercase select-none pointer-events-none">
                  VOID
                </span>
              </button>
            </div>

            {/* Button 1: PULSE (Solid Cyan Background, Crisp White Text, Gyro Position Float Opposite) */}
            <div className="relative w-26 h-26 sm:w-32 sm:h-32 md:w-36 md:h-36 flex items-center justify-center">
              {/* Neutral Anchor Ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30 pointer-events-none" />

              <button
                ref={pulseBtnRef}
                type="button"
                onClick={() => toggleButton(1)}
                style={{ willChange: "transform" }}
                className={`w-26 h-26 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-4 transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer touch-none group z-10 ${
                  pulseOn
                    ? "bg-cyan-500 border-white shadow-[0_0_55px_rgba(6,182,212,0.9)] scale-95"
                    : "bg-cyan-600 hover:bg-cyan-500 border-cyan-300 shadow-[0_0_25px_rgba(8,145,178,0.45)]"
                }`}
              >
                {/* Real-time Oscilloscope Waveform Canvas */}
                <canvas
                  ref={pulseCanvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none rounded-full"
                />

                <span className="relative z-10 text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] uppercase select-none pointer-events-none">
                  PULSE
                </span>
              </button>
            </div>
          </div>

          {/* Vertical Crossfader positioned all along the side of the buttons */}
          <div className="flex flex-col items-center justify-between select-none py-1">
            <div className="text-[9px] tracking-[0.2em] text-neutral-400 font-bold uppercase text-center mb-1">
              VOID <span className="text-[8px] text-neutral-600 block">▲ BOOST</span>
            </div>

            <div
              ref={trackRef}
              onPointerDown={handleFaderPointerDown}
              onPointerMove={handleFaderPointerMove}
              onPointerUp={handleFaderPointerUp}
              onPointerCancel={handleFaderPointerUp}
              onDoubleClick={() => {
                faderRef.current = 0.5;
                setFaderPos(0.5);
                applyCrossfade(0.5);
              }}
              className="w-14 sm:w-16 flex-1 min-h-[300px] sm:min-h-[360px] bg-neutral-950 border border-neutral-800 rounded flex flex-col items-center justify-center relative cursor-ns-resize touch-none p-2 group hover:border-neutral-600 transition-colors"
            >
              {/* Center rail groove */}
              <div className="w-1 h-full bg-neutral-800 rounded-full relative">
                {/* Calibration tick marks */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-neutral-700" />
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-neutral-800" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-1 bg-neutral-400 rounded-sm" />
                <div className="absolute top-3/4 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-neutral-800" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-neutral-700" />
              </div>

              {/* Fader Handle */}
              <div
                style={{ top: `${(1 - faderPos) * 100}%` }}
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 sm:w-14 h-8 bg-neutral-200 text-black rounded-sm shadow-[0_2px_12px_rgba(0,0,0,0.9)] border border-white flex flex-col items-center justify-center pointer-events-none transition-transform active:scale-95"
              >
                <div className="w-7 h-0.5 bg-neutral-900 rounded-full mb-0.5" />
                <span className="text-[8px] tracking-tighter font-extrabold uppercase text-neutral-800">
                  {faderPos === 0.5
                    ? "MID"
                    : faderPos > 0.5
                    ? `V +${Math.round((faderPos - 0.5) * 70)}%`
                    : `P +${Math.round((0.5 - faderPos) * 70)}%`}
                </span>
              </div>
            </div>

            <div className="text-[9px] tracking-[0.2em] text-neutral-400 font-bold uppercase text-center mt-1">
              PULSE <span className="text-[8px] text-neutral-600 block">▼ BOOST</span>
            </div>
          </div>
        </div>
      </div>

      {/* Catchy Beat Toggle Control & 1-Minute Evolution Display */}
      <div className="mt-2 mb-1 flex flex-col items-center gap-1.5 shrink-0 z-20">
        <button
          type="button"
          onClick={toggleBeat}
          className={`px-5 py-2.5 rounded-full border text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-200 flex items-center gap-2.5 shadow-lg cursor-pointer ${
            beatOn
              ? "bg-amber-500 text-black border-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.6)] scale-105"
              : "bg-neutral-950 text-neutral-400 border-neutral-700 hover:border-amber-500/70 hover:text-white"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              beatOn ? "bg-black animate-ping" : "bg-neutral-600"
            }`}
          />
          <span>8-BIT RETRO BGM {beatOn ? "ON" : "OFF"}:</span>
          <span
            ref={bpmDisplayRef}
            className="font-black px-1.5 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-400/40"
          >
            110 BPM
          </span>
        </button>

        {/* 1-Minute Pattern Evolution Counter */}
        {beatOn && (
          <div className="flex flex-col items-center gap-1.5 bg-neutral-950/80 border border-amber-500/30 px-3.5 py-1.5 rounded-lg shadow-md w-64 text-center">
            <div className="flex items-center justify-between w-full text-[9px] font-bold tracking-wider">
              <span className="text-amber-400">{patternDisplay.name}</span>
              <span className="text-neutral-400 font-mono">
                {patternDisplay.secLeft}s ➔ CAMBIO
              </span>
            </div>
            {/* Progress bar to next 1-minute evolution */}
            <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${patternDisplay.progress}%` }}
                className="h-full bg-amber-400 transition-all duration-300"
              />
            </div>
          </div>
        )}

        <span className="text-[9px] text-neutral-500 tracking-wider uppercase font-mono">
          ◄ INCLINA A LA IZQ (70 BPM) | INCLINA A LA DER (155 BPM) ►
        </span>
      </div>

      {/* Gyroscope & Bluetooth MIDI Controls */}
      <div className="mt-1 flex flex-col items-center gap-1.5 shrink-0 z-20">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {!gyroActive ? (
            <button
              type="button"
              onClick={enableGyroscope}
              className="px-3.5 py-1.5 border border-neutral-700 hover:border-white text-[10px] sm:text-[11px] tracking-[0.2em] uppercase transition-colors rounded-full bg-neutral-950/80 cursor-pointer"
            >
              ENABLE TILT / GYRO CONTROL
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-950 border border-emerald-500/40 text-[10px] sm:text-[11px] tracking-[0.2em] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              GYROSCOPE ACTIVE
            </div>
          )}

          {/* BLUETOOTH MIDI ON / OFF BUTTON */}
          <button
            type="button"
            onClick={toggleBleMidi}
            className={`px-3.5 py-1.5 rounded-full border text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
              bleMidiActive
                ? "bg-blue-600 text-white border-blue-300 shadow-[0_0_22px_rgba(59,130,246,0.75)] scale-105"
                : "bg-neutral-950 text-neutral-400 border-neutral-700 hover:border-blue-500 hover:text-white"
            }`}
            title="Activar o desactivar exportación de comandos del giroscopio por Bluetooth MIDI"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                bleMidiActive ? "bg-white animate-ping" : "bg-neutral-600"
              }`}
            />
            <span>BLE MIDI: {bleMidiActive ? "ON" : "OFF"}</span>
            {bleMidiDeviceName && (
              <span className="text-[9px] text-blue-200 font-mono">
                [{bleMidiDeviceName}]
              </span>
            )}
          </button>

          {/* TEST BLE MIDI BUTTON */}
          <button
            type="button"
            onClick={runMidiSelfTest}
            className="px-3.5 py-1.5 rounded-full border border-blue-500/70 bg-blue-950/70 hover:bg-blue-900 text-blue-300 hover:text-white text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-95 cursor-pointer"
            title="Probar transmisión de comandos MIDI (Test Ping, notas y barrido de CC)"
          >
            <span>⚡</span>
            <span>TEST BLE MIDI</span>
          </button>
        </div>

        {/* Status readouts */}
        {gyroActive && (
          <div
            ref={tiltDisplayRef}
            className="text-[10px] tracking-widest text-neutral-500 font-mono"
          >
            PITCH 45° | ROLL 0°
          </div>
        )}

        {bleMidiActive && bleMidiStatus && (
          <button
            type="button"
            onClick={() => setShowMidiMonitor(true)}
            className="text-[9px] text-blue-300 font-mono tracking-wider bg-blue-950/70 border border-blue-500/40 px-2.5 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.3)] hover:border-blue-400 cursor-pointer"
            title="Abrir monitor de paquetes MIDI"
          >
            📡 {bleMidiStatus} • CC 74 / CC 1 / BEND [VER MONITOR ↗]
          </button>
        )}

        <div className="text-neutral-600 text-[9px] sm:text-[10px] tracking-widest text-center max-w-xs leading-relaxed">
          TILT FORWARD/BACK: FILTER (CC 74) | TILT LEFT/RIGHT: SWELL & PAN (CC 10 / BEND)
        </div>
      </div>

      <div className="mt-1 mb-0.5 flex flex-col items-center gap-0.5 text-center select-none shrink-0 z-20">
        <span className="text-neutral-500 text-[10px] tracking-[0.25em] uppercase">
          Two-Button Instrument
        </span>
        <span className="text-neutral-600 text-[9px] tracking-wider font-sans">
          Developed by <span className="text-neutral-400 font-semibold">Emiliabella</span> • All rights reserved • 100% Free
        </span>
      </div>

      {/* Floating Sonic Gyroscope Balls */}
      {balls.map((b) => (
        <div
          key={b.id}
          id={`ball-${b.id}`}
          onPointerDown={(e) => {
            e.stopPropagation();
            destroyBall(b.id);
          }}
          className={`fixed top-0 left-0 rounded-full cursor-pointer z-50 flex items-center justify-center select-none active:scale-90 ${
            b.type === "void"
              ? "border-[3px] border-[#c084fc] bg-transparent shadow-[0_0_24px_rgba(192,132,252,0.95)]"
              : "border-[3px] border-[#22d3ee] bg-transparent shadow-[0_0_24px_rgba(34,211,238,0.95)]"
          }`}
          style={{
            width: `${b.radius * 2}px`,
            height: `${b.radius * 2}px`,
            willChange: "transform",
            touchAction: "none",
          }}
          title="Toca la bola para eliminarla y apagar su sonido"
        >
          {/* Glowing center indicator core */}
          <div
            className={`w-2 h-2 rounded-full pointer-events-none ${
              b.type === "void"
                ? "bg-violet-300 shadow-[0_0_8px_#c084fc]"
                : "bg-cyan-300 shadow-[0_0_8px_#22d3ee]"
            }`}
          />
        </div>
      ))}
      {/* FREEZE & JOG WHEEL SCRUB HUD OVERLAY */}
      {isJogActive && (
        <div className="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-center bg-black/45 backdrop-blur-[2px] select-none">
          {/* Vinyl Jog Platter */}
          <div className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-full border-4 border-amber-400 bg-neutral-950/90 shadow-[0_0_60px_rgba(245,158,11,0.65)] flex items-center justify-center">
            {/* Concentric vinyl groove rings */}
            <div className="absolute inset-3 rounded-full border border-neutral-700 pointer-events-none" />
            <div className="absolute inset-7 rounded-full border border-neutral-800 pointer-events-none" />
            <div className="absolute inset-12 rounded-full border border-neutral-800 pointer-events-none" />

            {/* Rotating Vinyl Strobe Marker */}
            <div
              style={{ transform: `rotate(${jogAngle}deg)` }}
              className="absolute inset-0 flex items-start justify-center transition-transform duration-75"
            >
              <div className="w-1.5 h-10 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b] mt-1" />
            </div>

            {/* Center Record Label */}
            <div className="relative z-10 w-24 h-24 rounded-full bg-neutral-900 border-2 border-amber-500/80 flex flex-col items-center justify-center text-center p-2 shadow-inner">
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
                FREEZE
              </span>
              <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">
                JOG SCRUB
              </span>
              <div className="mt-1 flex items-center gap-1 text-[8px] font-black text-amber-300">
                <span>◀ ◀</span>
                <span>▶ ▶</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center gap-1 bg-black/85 px-4 py-1.5 rounded-full border border-amber-500/40 shadow-lg font-mono">
            <span className="text-[10px] font-bold text-amber-400 tracking-wider">
              💽 JOG WHEEL: SCRUB ADELANTE / ATRÁS
            </span>
            <span className="text-[8px] text-neutral-400 tracking-tight">
              DOS DEDOS EN PANTALLA O RUEDA DEL RATÓN
            </span>
          </div>
        </div>
      )}

      {/* HELP & DOCUMENTATION MODAL OVERLAY */}
      {showHelp && (
        <div
          onClick={() => setShowHelp(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-950 border border-neutral-800 rounded-xl max-w-lg w-full max-h-[88vh] flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.9)] relative font-mono text-left"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950 rounded-t-xl sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <h2 className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-white">
                  Guía de Funcionamiento
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="w-7 h-7 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white hover:border-white flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                title="Cerrar ayuda"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-6 text-neutral-300 text-xs leading-relaxed select-text">
              {/* Sección 1: Botones */}
              <div>
                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  1. Botones Principales (Void y Pulse)
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
                  <li>
                    <span className="text-violet-400 font-bold">VOID (Violeta):</span> Sub-bass profundo con quinta analógica y pad ambiental que florece al sonar.
                  </li>
                  <li>
                    <span className="text-cyan-400 font-bold">PULSE (Cian):</span> Tríada de campanas armónicas cristalinas con retardo estéreo y brillo.
                  </li>
                  <li>
                    <span className="text-white">Modo Toggle:</span> Toca una vez para activar el sonido continuo; vuelve a tocar para apagar. Ambos botones pueden sonar a la vez.
                  </li>
                  <li>
                    <span className="text-white">Ondas en tiempo real:</span> Cada botón tiene un osciloscopio que muestra la forma de onda exacta del sonido generado.
                  </li>
                </ul>
              </div>

              {/* Sección 2: Bolas Sónicas */}
              <div>
                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  2. Bolas Sónicas Flotantes
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
                  <li>
                    <span className="text-white">Nacimiento:</span> Cada vez que pulsas un botón, nace una bola transparente con el anillo exterior del color de ese botón.
                  </li>
                  <li>
                    <span className="text-white">Volumen al 10%:</span> Emiten de forma continua el sonido del botón a un 10% de volumen ambiental.
                  </li>
                  <li>
                    <span className="text-white">Física por Giroscopio:</span> Ruedan por la pantalla guiadas por la gravedad de la inclinación del móvil y rebotan elásticamente.
                  </li>
                  <li>
                    <span className="text-amber-400 font-bold">Repulsión Magnética:</span> Las bolas de diferente color (Void vs. Pulse) se repelen en el aire como dos polos magnéticos iguales.
                  </li>
                  <li>
                    <span className="text-white">Mutación por Choque:</span> Al rebotar contra un borde o entre sí, su sonido (tono, filtro y armónicos) cambia según la inclinación del móvil en ese instante.
                  </li>
                  <li>
                    <span className="text-white">Interacción con Dedo y Ratón:</span> Puedes mover el cursor o deslizar el dedo para empujar, apartar y golpear las bolas con inercia física en tiempo real.
                  </li>
                  <li>
                    <span className="text-white">Rebote en los Botones:</span> Las bolas también rebotan elásticamente contra los botones de Void y Pulse como en un pinball, modulando su sonido al chocar.
                  </li>
                  <li>
                    <span className="text-white">Eliminar bola:</span> Toca directamente encima de cualquier bola para apagar su sonido y hacerla desaparecer.
                  </li>
                </ul>
              </div>

              {/* Sección 3: Crossfader */}
              <div>
                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  3. Crossfader Vertical Lateral
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
                  <li>
                    <span className="text-white">Hacia arriba:</span> Aumenta el volumen de VOID (+35%) y silencia PULSE por completo.
                  </li>
                  <li>
                    <span className="text-white">Hacia abajo:</span> Aumenta el volumen de PULSE (+35%) y silencia VOID por completo.
                  </li>
                  <li>
                    <span className="text-white">Centro (MID):</span> Balance parejo al 100% de volumen. Haz doble clic en el riel (o pulsa la tecla <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">C</code>) para centrar.
                  </li>
                </ul>
              </div>

              {/* Sección 4: Volumen Rotatorio */}
              <div>
                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  4. Control de Volumen Rotatorio (Clockwise)
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
                  <li>
                    <span className="text-white">Girar en sentido horario:</span> Gira el móvil como una perilla hacia la derecha para subir el volumen general de la app.
                  </li>
                  <li>
                    <span className="text-white">Girar en sentido antihorario:</span> Gíralo hacia la izquierda para bajar el volumen.
                  </li>
                  <li>
                    <span className="text-white">Perilla táctil:</span> También puedes arrastrar directamente con el dedo la rueda de volumen en la barra superior.
                  </li>
                </ul>
              </div>

              {/* Sección 5: Giroscopio */}
              <div>
                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  5. Inclinación del Giroscopio (Tilt)
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
                  <li>
                    <span className="text-white">Pitch (Adelante/Atrás):</span> Barre el filtro paso-bajo y la resonancia vocal de los sintetizadores.
                  </li>
                  <li>
                    <span className="text-white">Roll (Izquierda/Derecha):</span> Modula el feedback del eco estéreo dub y la apertura del pad.
                  </li>
                  <li>
                    Los propios botones se desplazan físicamente por la pantalla con inercia según la inclinación.
                  </li>
                </ul>
              </div>

              {/* Sección 6: Ritmo y Bajo */}
              <div>
                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  6. Ritmo y Bajo Sincronizado por Roll (Giroscopio)
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
                  <li>
                    <span className="text-amber-400 font-bold">Evolución cada minuto:</span> La melodía y el ritmo cambian automáticamente cada 60 segundos por 4 estilos contrastantes:
                  </li>
                  <li className="pl-4">
                    • <strong className="text-white">Minuto 1 (Electro-Funk):</strong> Bombo a negras, palmadas y bajo con slap de octavas en C menor.
                  </li>
                  <li className="pl-4">
                    • <strong className="text-white">Minuto 2 (Cyberpunk Wave):</strong> Doble bombo, bajos rodantes en semicorcheas y charles abiertos en F menor.
                  </li>
                  <li className="pl-4">
                    • <strong className="text-white">Minuto 3 (Acid Tech-House):</strong> Four-on-the-floor continuo, charles en contratiempos y bajo ácido resonante en G menor.
                  </li>
                  <li className="pl-4">
                    • <strong className="text-white">Minuto 4 (Liquid Breakbeat):</strong> Bombo sincopado estilo break, redobles fantasma de caja y bajo melódico en Eb mayor.
                  </li>
                  <li>
                    <span className="text-amber-400 font-bold">Sincronización de BPM en tiempo real:</span> El tempo de la batería y el bajo responde directamente a la inclinación lateral (<code className="text-white">Roll / Gamma</code>) del móvil:
                  </li>
                  <li className="pl-4">
                    • <strong className="text-white">Inclinar a la derecha:</strong> Acelera el ritmo de forma progresiva hasta alcanzar <strong>152 BPM</strong> (techno / drum & bass).
                  </li>
                  <li className="pl-4">
                    • <strong className="text-white">Centro equilibrado:</strong> Tempo nominal de <strong>110 BPM</strong> (groove electro funk).
                  </li>
                  <li className="pl-4">
                    • <strong className="text-white">Inclinar a la izquierda:</strong> Ralentiza el tempo hasta <strong>68 BPM</strong> (slow-tempo / hip-hop pesada).
                  </li>
                  <li>
                    Las notas del sintetizador de bajo y las subdivisiones de percusión recalculan su duración y caída en cada paso para mantenerse perfectamente ajustadas y enérgicas sin importar la velocidad.
                  </li>
                </ul>
              </div>

              {/* Sección 7: Pánico */}
              <div>
                <h3 className="text-red-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  7. Función de Pánico (Silencio Inmediato)
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
                  <li>
                    <span className="text-red-400 font-bold">Pulsación de 2 segundos en vacío:</span> Mantén el dedo apoyado en cualquier espacio libre de la pantalla durante 2 segundos para cortar todo el sonido, apagar los sintetizadores, parar el ritmo y eliminar las bolas.
                  </li>
                  <li>
                    <span className="text-white">Botón superior:</span> También puedes pulsar el botón rojo <code className="bg-neutral-900 px-1 py-0.5 rounded text-red-400">PANIC</code> (o la tecla <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">Esc</code> / <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">M</code>). Pulsa de nuevo para desmutear.
                  </li>
                </ul>
              </div>

              {/* Sección 8: Plato de Vinilo / Jog Wheel (Turntable DJ) */}
              <div>
                <h3 className="text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  8. Plato de Vinilo / Jog Wheel (Turntable DJ)
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
                  <li>
                    <span className="text-amber-400 font-bold">Tocar para frenar (Vinyl Brake):</span> Apoya el dedo o haz clic y mantén pulsado sobre el plato de vinilo para frenar en seco la música inmediatamente, exactamente como al poner la mano sobre un tocadiscos de vinilo en marcha.
                  </li>
                  <li>
                    <span className="text-white">Girar para Scratch:</span> Mientras mantienes el dedo en el vinilo, arrastra hacia adelante o hacia atrás para rascar (*scratch*) el sonido con fricción realista de aguja, modulación de tono y desplazamiento del ritmo.
                  </li>
                  <li>
                    <span className="text-white">Soltar para Continuar (Motor Spin-Up):</span> Al levantar la mano del vinilo, el motor acelera suavemente (*spin-up*) y la música recupera su reproducción normal al instante.
                  </li>
                  <li>
                    <span className="text-white">Giro Continuo a 33⅓ RPM:</span> El plato gira de forma continua mientras la música está sonando, deteniéndose al instante cuando apoyas la mano encima.
                  </li>
                  <li>
                    <span className="text-white">Gestos adicionales:</span> También puedes rascar con la rueda del ratón en escritorio o con dos dedos en la pantalla táctil.
                  </li>
                </ul>
              </div>

              {/* Sección 9: Exportación Bluetooth MIDI */}
              <div>
                <h3 className="text-blue-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  9. Exportación MIDI por Bluetooth (BLE MIDI)
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
                  <li>
                    <span className="text-blue-400 font-bold">Botón BLE MIDI ON/OFF:</span> Toca el botón para conectar y transmitir los datos del giroscopio a cualquier DAW (Ableton, Logic, GarageBand, FL Studio, Reaper) o sintetizador por Bluetooth MIDI o Web MIDI.
                  </li>
                  <li>
                    <span className="text-white">Inclinación Pitch (Adelante/Atrás):</span> Envía <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">CC 74 (Filtro Cutoff)</code> y <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">CC 1 (Mod Wheel)</code> de 0 a 127.
                  </li>
                  <li>
                    <span className="text-white">Inclinación Roll (Izquierda/Derecha):</span> Envía <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">CC 10 (Pan)</code>, <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">CC 16 (General 1)</code> y <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">Pitch Bend</code> de 14 bits.
                  </li>
                  <li>
                    <span className="text-white">Rotación de Pantalla (Yaw):</span> Envía <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">CC 11 (Expresión)</code> de 0 a 127.
                  </li>
                  <li>
                    <span className="text-white">Botones VOID y PULSE:</span> Transmiten notas MIDI estándar (C2 y G4) con velocidad 100.
                  </li>
                  <li>
                    <span className="text-white">Crossfader:</span> Transmite <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">CC 8 (Balance)</code> de 0 a 127.
                  </li>
                </ul>
              </div>
            </div>

            {/* Creator Attribution & Rights Footer */}
            <div className="px-5 py-3 bg-neutral-900/60 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] text-neutral-500 font-sans">
              <span>
                Developed & created by <strong className="text-neutral-300 font-semibold">Emiliabella</strong>. All rights reserved.
              </span>
              <span className="text-emerald-400/80 font-mono text-[9px] tracking-wider uppercase">
                100% Free for all users
              </span>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-950 rounded-b-xl flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="px-5 py-2 bg-neutral-900 border border-neutral-700 hover:border-emerald-400 hover:text-emerald-300 text-white rounded text-xs tracking-wider transition-colors uppercase font-bold cursor-pointer"
              >
                Cerrar y Volver al Instrumento
              </button>
            </div>
          </div>
        </div>
      )}
      {holdIndicator && (
        <div
          className="fixed pointer-events-none z-50 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
          style={{ left: holdIndicator.x, top: holdIndicator.y }}
        >
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                className="stroke-neutral-800"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                className="stroke-red-500"
                strokeWidth="4"
                fill="none"
                strokeDasharray="201"
                strokeDashoffset="201"
                style={{
                  animation: "panicCharge 2000ms linear forwards",
                }}
              />
            </svg>
            <span className="absolute text-[10px] font-black tracking-widest text-red-400 uppercase">
              2s
            </span>
          </div>
          <span className="text-[9px] font-black tracking-widest text-red-400 uppercase mt-1 bg-black/90 px-2 py-0.5 rounded border border-red-600/60 shadow-[0_0_15px_rgba(239,68,68,0.7)]">
            SOSTÉN PARA PÁNICO
          </span>
        </div>
      )}

      {/* STREAMING PLATFORMS MODAL */}
      <StreamingModal
        isOpen={showStreamingModal}
        onClose={() => setShowStreamingModal(false)}
      />

      {/* TIP JAR / BOTE DE PROPINAS MODAL */}
      <TipJarModal
        isOpen={showTipJarModal}
        onClose={() => setShowTipJarModal(false)}
      />

      {/* LIVE MIDI TEST MONITOR MODAL */}
      {showMidiMonitor && (
        <div
          onClick={() => setShowMidiMonitor(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-950 border-2 border-blue-500/80 rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(59,130,246,0.4)] font-mono text-left overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-neutral-800 bg-neutral-950 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_#3b82f6]" />
                <span className="text-xs sm:text-sm font-black tracking-wider uppercase text-white">
                  MONITOR Y TEST BLE MIDI
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowMidiMonitor(false)}
                className="w-7 h-7 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3 overflow-y-auto">
              {/* Status Banner */}
              <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/40 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-blue-300 font-bold">ESTADO DE CONEXIÓN</div>
                  <div className="text-xs font-black text-white">
                    {bleMidiActive ? "TRANSMITIENDO EN VIVO (40 HZ)" : "STANDBY (PULSA TEST O ON)"}
                  </div>
                  <div className="text-[9px] text-neutral-400 mt-0.5">
                    {bleMidiDeviceName ? `Dispositivo: ${bleMidiDeviceName}` : "Canal MIDI 1 • Web Bluetooth / Web MIDI"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-neutral-400 font-bold">PAQUETES</div>
                  <div className="text-lg font-black text-blue-400">{midiPacketCount}</div>
                </div>
              </div>

              {/* Action buttons inside monitor */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={runMidiSelfTest}
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] tracking-wider uppercase shadow-[0_0_15px_rgba(59,130,246,0.5)] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>⚡</span>
                  <span>ENVIAR RÁFAGA DE TEST</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMidiLogs([])}
                  className="px-2.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white text-[9px] font-bold cursor-pointer"
                >
                  LIMPIAR
                </button>
              </div>

              {/* Live Log Stream */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] text-neutral-500 font-bold uppercase pb-1">
                  <span>FLUJO EN TIEMPO REAL (ÚLTIMOS PAQUETES)</span>
                  <span className="text-emerald-400 animate-pulse">● LIVE</span>
                </div>
                <div className="bg-black border border-neutral-800 rounded-lg p-2.5 space-y-1.5 max-h-48 overflow-y-auto font-mono text-[9px]">
                  {midiLogs.length === 0 ? (
                    <div className="text-neutral-600 text-center py-4">
                      No hay paquetes en el búfer. Pulsa "ENVIAR RÁFAGA DE TEST" o inclina el dispositivo.
                    </div>
                  ) : (
                    midiLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between py-0.5 border-b border-neutral-900/80 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-500">{log.time}</span>
                          <span className="text-blue-400 font-bold font-mono">{log.hex}</span>
                        </div>
                        <span className="text-emerald-300 font-bold truncate ml-2">
                          {log.desc}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* CC Map Reference */}
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-2 text-[8.5px] text-neutral-400 space-y-0.5">
                <div className="text-neutral-300 font-bold uppercase mb-1">Mapeo de Controladores:</div>
                <div>• <span className="text-white">Inclinación Pitch:</span> CC 74 (Cutoff) & CC 1 (Mod Wheel) [0-127]</div>
                <div>• <span className="text-white">Inclinación Roll:</span> CC 10 (Pan) & Pitch Bend 14-bit [-8192..+8191]</div>
                <div>• <span className="text-white">Giro Yaw:</span> CC 11 (Expresión) [0-127]</div>
                <div>• <span className="text-white">Botones:</span> C2 (Nota 36) para VOID, G4 (Nota 67) para PULSE</div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMidiMonitor(false)}
                className="px-4 py-1.5 bg-neutral-900 border border-neutral-700 hover:border-blue-400 text-white rounded text-[10px] font-bold cursor-pointer"
              >
                Cerrar Monitor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-MINUTE GAME OVER MODAL OVERLAY */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border-2 border-amber-500/80 rounded-2xl max-w-sm w-full p-5 flex flex-col items-center text-center shadow-[0_0_50px_rgba(245,158,11,0.5)] font-mono">
            <span className="text-4xl mb-2">🏆</span>
            <h2 className="text-base font-black text-amber-400 tracking-wider uppercase mb-1">
              ¡TIEMPO TERMINADO!
            </h2>
            <p className="text-[11px] text-neutral-400 mb-4">
              Han finalizado los 2 minutos de partida.
            </p>

            <div className="w-full bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl mb-4 flex items-center justify-around">
              <div>
                <div className="text-[9px] text-neutral-500 uppercase font-bold">PUNTOS</div>
                <div className="text-2xl font-black text-amber-300">{gameScore}</div>
              </div>
              <div className="w-px h-8 bg-neutral-800" />
              <div>
                <div className="text-[9px] text-neutral-500 uppercase font-bold">RÉCORD</div>
                <div className="text-2xl font-black text-emerald-400">{highScore}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={restartGame}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(245,158,11,0.6)] cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>🔄</span>
              <span>REINICIAR JUEGO (2 MIN)</span>
            </button>
          </div>
        </div>
      )}

      {/* EXPLOSION BURSTS & FLOATING POINTS */}
      {explosions.map((exp) => (
        <div
          key={exp.id}
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ left: exp.x, top: exp.y }}
        >
          <div
            className="w-20 h-20 rounded-full animate-ping opacity-90"
            style={{
              backgroundColor: exp.color,
              boxShadow: `0 0 40px ${exp.color}`,
            }}
          />
        </div>
      ))}

      {scorePops.map((pop) => (
        <div
          key={pop.id}
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 text-sm sm:text-base font-black text-amber-300 drop-shadow-[0_0_10px_#f59e0b] animate-bounce"
          style={{ left: pop.x, top: pop.y - 20 }}
        >
          {pop.text}
        </div>
      ))}
    </div>
  );
}

// STREAMING MODAL COMPONENT (TIDAL, SPOTIFY, APPLE MUSIC, YOUTUBE & SOUNDCLOUD)
interface StreamingLinks {
  tidal: string;
  spotify: string;
  apple: string;
  youtube: string;
  soundcloud: string;
}

function StreamingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [links, setLinks] = useState<StreamingLinks>({
    tidal: "https://tidal.com/browse/search?q=Emiliabella",
    spotify: "https://open.spotify.com/search/Emiliabella",
    apple: "https://music.apple.com/search?term=Emiliabella",
    youtube: "https://www.youtube.com/results?search_query=Emiliabella+Music",
    soundcloud: "https://soundcloud.com/search?q=Emiliabella",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("duotone_streaming_links");
      if (stored) {
        setLinks(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const saveLinks = (next: StreamingLinks) => {
    setLinks(next);
    try {
      localStorage.setItem("duotone_streaming_links", JSON.stringify(next));
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9)] relative font-mono text-left overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-neutral-800 bg-neutral-950 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white">
              PLATAFORMAS DE STREAMING
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 overflow-y-auto">
          <p className="text-[11px] text-neutral-400">
            Escucha la música oficial de <strong className="text-white">Emiliabella</strong> en tus aplicaciones favoritas:
          </p>

          {/* Platform Links */}
          <div className="space-y-2">
            {/* Tidal (Top Recommended Payout) */}
            <a
              href={links.tidal}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/90 border border-cyan-500/50 hover:border-cyan-400 hover:bg-neutral-900 transition-all group cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.12)]"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-sm font-black text-cyan-300">
                  ◈
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                      Tidal
                    </span>
                    <span className="text-[7.5px] font-bold px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/60 text-cyan-300 tracking-wider">
                      MÁS RETRIBUCIÓN (~$0.012)
                    </span>
                  </div>
                  <div className="text-[9px] text-neutral-400">Audio HiFi Master • Mejor pago por stream</div>
                </div>
              </div>
              <span className="text-[10px] text-cyan-400 group-hover:text-white font-bold">
                Abrir ↗
              </span>
            </a>

            {/* Spotify */}
            <a
              href={links.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-emerald-500/70 hover:bg-neutral-900 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-sm">
                  🟢
                </span>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-400">
                    Spotify
                  </div>
                  <div className="text-[9px] text-neutral-500">Perfil de Artista & Singles</div>
                </div>
              </div>
              <span className="text-[10px] text-neutral-400 group-hover:text-white font-bold">
                Abrir ↗
              </span>
            </a>

            {/* Apple Music */}
            <a
              href={links.apple}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-pink-500/70 hover:bg-neutral-900 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#FA243C]/20 border border-[#FA243C]/40 flex items-center justify-center text-sm">
                  🟣
                </span>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-pink-400">
                    Apple Music
                  </div>
                  <div className="text-[9px] text-neutral-500">Álbumes en Alta Fidelidad</div>
                </div>
              </div>
              <span className="text-[10px] text-neutral-400 group-hover:text-white font-bold">
                Abrir ↗
              </span>
            </a>

            {/* YouTube Music */}
            <a
              href={links.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-red-500/70 hover:bg-neutral-900 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#FF0000]/20 border border-[#FF0000]/40 flex items-center justify-center text-sm">
                  🔴
                </span>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-red-400">
                    YouTube / YouTube Music
                  </div>
                  <div className="text-[9px] text-neutral-500">Vídeos y Audio Oficial</div>
                </div>
              </div>
              <span className="text-[10px] text-neutral-400 group-hover:text-white font-bold">
                Abrir ↗
              </span>
            </a>

            {/* SoundCloud */}
            <a
              href={links.soundcloud}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/70 hover:bg-neutral-900 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#FF5500]/20 border border-[#FF5500]/40 flex items-center justify-center text-sm">
                  🟠
                </span>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-400">
                    SoundCloud
                  </div>
                  <div className="text-[9px] text-neutral-500">Remixes, Beats & Sets</div>
                </div>
              </div>
              <span className="text-[10px] text-neutral-400 group-hover:text-white font-bold">
                Abrir ↗
              </span>
            </a>
          </div>

          {/* Edit / Customize Toggle */}
          <div className="pt-2 border-t border-neutral-900">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-[9px] text-neutral-500 hover:text-neutral-300 underline font-bold cursor-pointer"
            >
              {isEditing ? "▲ Ocultar edición de enlaces" : "⚙️ Personalizar mis URLs directas"}
            </button>

            {isEditing && (
              <div className="mt-2.5 space-y-2 bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800 text-[9px]">
                <div>
                  <label className="text-cyan-400 font-bold block mb-0.5">URL Tidal:</label>
                  <input
                    type="text"
                    value={links.tidal}
                    onChange={(e) => saveLinks({ ...links, tidal: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-[9px]"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-0.5">URL Spotify:</label>
                  <input
                    type="text"
                    value={links.spotify}
                    onChange={(e) => saveLinks({ ...links, spotify: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-[9px]"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-0.5">URL Apple Music:</label>
                  <input
                    type="text"
                    value={links.apple}
                    onChange={(e) => saveLinks({ ...links, apple: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-[9px]"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-0.5">URL YouTube:</label>
                  <input
                    type="text"
                    value={links.youtube}
                    onChange={(e) => saveLinks({ ...links, youtube: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-[9px]"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-0.5">URL SoundCloud:</label>
                  <input
                    type="text"
                    value={links.soundcloud}
                    onChange={(e) => saveLinks({ ...links, soundcloud: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-[9px]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-[10px] text-neutral-500 shrink-0">
          <button
            type="button"
            onClick={() => {
              try {
                navigator.clipboard?.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {}
            }}
            className="text-neutral-400 hover:text-white cursor-pointer font-bold"
          >
            {copied ? "✓ ¡Enlace copiado!" : "📋 Compartir esta app"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-neutral-900 border border-neutral-700 hover:border-emerald-400 text-white rounded text-[10px] font-bold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// TIP JAR / BOTE DE PROPINAS MODAL COMPONENT (KO-FI, BUY ME A COFFEE, PAYPAL)
interface TipLinks {
  kofi: string;
  buymeacoffee: string;
  paypal: string;
}

function TipJarModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [tipLinks, setTipLinks] = useState<TipLinks>({
    kofi: "https://ko-fi.com/Emiliabella",
    buymeacoffee: "https://buymeacoffee.com/Emiliabella",
    paypal: "https://paypal.me/Emiliabella",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("duotone_tip_links");
      if (stored) {
        setTipLinks(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const saveTipLinks = (next: TipLinks) => {
    setTipLinks(next);
    try {
      localStorage.setItem("duotone_tip_links", JSON.stringify(next));
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9)] relative font-mono text-left overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-neutral-800 bg-neutral-950 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white">
              BOTE DE PROPINAS • APOYO VOLUNTARIO
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 overflow-y-auto">
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            Si disfrutas creando con este sintetizador y quieres apoyar el trabajo de{" "}
            <strong className="text-amber-400">Emiliabella</strong>, cualquier aportación voluntaria ayuda a mantener la app 100% gratuita:
          </p>

          {/* Voluntary Tiers Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 text-center">
              <div className="text-lg mb-0.5">☕</div>
              <div className="text-xs font-black text-amber-300">1 €</div>
              <div className="text-[8px] text-neutral-400">Un café</div>
            </div>
            <div className="p-2 rounded-lg bg-neutral-900/60 border border-amber-500/40 text-center shadow-[0_0_10px_rgba(245,158,11,0.15)]">
              <div className="text-lg mb-0.5">🎵</div>
              <div className="text-xs font-black text-amber-300">3 €</div>
              <div className="text-[8px] text-neutral-400">Un single</div>
            </div>
            <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 text-center">
              <div className="text-lg mb-0.5">🎛️</div>
              <div className="text-xs font-black text-amber-300">5 €</div>
              <div className="text-[8px] text-neutral-400">Sesión Pro</div>
            </div>
          </div>

          {/* Direct Support Payment Options */}
          <div className="space-y-2">
            {/* Ko-fi */}
            <a
              href={tipLinks.kofi}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/90 border border-amber-500/50 hover:border-amber-400 hover:bg-neutral-900 transition-all group cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.12)]"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#FF5E5B]/20 border border-[#FF5E5B]/50 flex items-center justify-center text-sm">
                  ☕
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300">
                      Ko-fi
                    </span>
                    <span className="text-[7.5px] font-bold px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500/60 text-amber-300 tracking-wider">
                      0% COMISIÓN
                    </span>
                  </div>
                  <div className="text-[9px] text-neutral-400">Dona 1€, 2€ o más con tarjeta/Bizum</div>
                </div>
              </div>
              <span className="text-[10px] text-amber-400 group-hover:text-white font-bold">
                Donar ↗
              </span>
            </a>

            {/* Buy Me a Coffee */}
            <a
              href={tipLinks.buymeacoffee}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-yellow-400/70 hover:bg-neutral-900 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#FFDD00]/20 border border-[#FFDD00]/40 flex items-center justify-center text-sm">
                  💛
                </span>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-yellow-300">
                    Buy Me a Coffee
                  </div>
                  <div className="text-[9px] text-neutral-500">Invita a un café rápidamente</div>
                </div>
              </div>
              <span className="text-[10px] text-neutral-400 group-hover:text-white font-bold">
                Invitar ↗
              </span>
            </a>

            {/* PayPal.me */}
            <a
              href={tipLinks.paypal}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-blue-400/70 hover:bg-neutral-900 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#0079C1]/20 border border-[#0079C1]/40 flex items-center justify-center text-sm">
                  🅿️
                </span>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-blue-300">
                    PayPal.me
                  </div>
                  <div className="text-[9px] text-neutral-500">Aportación directa y segura</div>
                </div>
              </div>
              <span className="text-[10px] text-neutral-400 group-hover:text-white font-bold">
                Enviar ↗
              </span>
            </a>
          </div>

          {/* Edit / Customize Toggle */}
          <div className="pt-2 border-t border-neutral-900">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-[9px] text-neutral-500 hover:text-neutral-300 underline font-bold cursor-pointer"
            >
              {isEditing ? "▲ Ocultar edición de enlaces" : "⚙️ Personalizar mis enlaces de propina"}
            </button>

            {isEditing && (
              <div className="mt-2.5 space-y-2 bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800 text-[9px]">
                <div>
                  <label className="text-amber-400 font-bold block mb-0.5">URL Ko-fi:</label>
                  <input
                    type="text"
                    value={tipLinks.kofi}
                    onChange={(e) => saveTipLinks({ ...tipLinks, kofi: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-[9px]"
                  />
                </div>
                <div>
                  <label className="text-yellow-400 font-bold block mb-0.5">URL Buy Me a Coffee:</label>
                  <input
                    type="text"
                    value={tipLinks.buymeacoffee}
                    onChange={(e) => saveTipLinks({ ...tipLinks, buymeacoffee: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-[9px]"
                  />
                </div>
                <div>
                  <label className="text-blue-400 font-bold block mb-0.5">URL PayPal.me:</label>
                  <input
                    type="text"
                    value={tipLinks.paypal}
                    onChange={(e) => saveTipLinks({ ...tipLinks, paypal: e.target.value })}
                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-[9px]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-[10px] text-neutral-500 shrink-0">
          <button
            type="button"
            onClick={() => {
              try {
                navigator.clipboard?.writeText(tipLinks.kofi);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {}
            }}
            className="text-neutral-400 hover:text-white cursor-pointer font-bold"
          >
            {copied ? "✓ ¡Enlace copiado!" : "📋 Copiar enlace de Ko-fi"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-neutral-900 border border-neutral-700 hover:border-amber-400 text-white rounded text-[10px] font-bold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
