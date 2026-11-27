import React, { useState, useRef, useEffect } from "react";
2import VisitsDashboard from "./VisitsDashboard";
3
4export default function DuoToneSynth() {
5  const [currentPage, setCurrentPage] = useState<"synth" | "dashboard">("synth");
6  const [voidOn, setVoidOn] = useState(false);
7  const [pulseOn, setPulseOn] = useState(false);
8  const [showStreamingModal, setShowStreamingModal] = useState(false);
9  const [showTipJarModal, setShowTipJarModal] = useState(false);
10
11  // 2-MINUTE BALL EXPLOSION GAME SYSTEM
12  const [gameScore, setGameScore] = useState(0);
13  const gameScoreRef = useRef(0);
14  const [gameTimeLeft, setGameTimeLeft] = useState(120); // 120s = 2 minutes
15  const gameTimeLeftRef = useRef(120);
16  const [isGameOver, setIsGameOver] = useState(false);
17  const [isGameRunning, setIsGameRunning] = useState(false);
18  const isGameRunningRef = useRef(false);
19  const [highScore, setHighScore] = useState(0);
20  const [explosions, setExplosions] = useState<{ id: string; x: number; y: number; color: string }[]>([]);
21  const [scorePops, setScorePops] = useState<{ id: string; x: number; y: number; text: string }[]>([]);
22  const [isPanicked, setIsPanicked] = useState(false);
23  const panicRef = useRef(false);
24  const [masterVol, setMasterVol] = useState(0.85);
25  const masterVolRef = useRef(0.85);
26  const lastAlphaRef = useRef<number | null>(null);
27  const isDraggingKnobRef = useRef(false);
28  const knobCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
29  const masterGainRef = useRef<GainNode | null>(null);
30  const panicHoldTimerRef = useRef<number | null>(null);
31  const tripleTapRef = useRef<number[]>([]);
32  const [holdIndicator, setHoldIndicator] = useState<{ x: number; y: number } | null>(null);
33  const voidOnRef = useRef(false);
34  const pulseOnRef = useRef(false);
35  voidOnRef.current = voidOn;
36  pulseOnRef.current = pulseOn;
37  const [beatOn, setBeatOn] = useState(false);
38  const [showHelp, setShowHelp] = useState(false);
39  const [isJogActive, setIsJogActive] = useState(false);
40  const jogActiveRef = useRef(false);
41  const jogWheelAngleRef = useRef(0);
42  const [jogAngle, setJogAngle] = useState(0);
43  const jogReleaseTimerRef = useRef<number | null>(null);
44  const lastTouchMidRef = useRef<{ x: number; y: number } | null>(null);
45  const isHoldingVinylRef = useRef(false);
46  const [isVinylHeld, setIsVinylHeld] = useState(false);
47  const [vinylStatusText, setVinylStatusText] = useState("33⅓ RPM");
48  const vinylCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
49  const lastPointerAngleRef = useRef<number | null>(null);
50  const vinylPlatterVisualRef = useRef<HTMLDivElement | null>(null);
51  const [visitsCount, setVisitsCount] = useState(1284);
52  const [activeUsersCount, setActiveUsersCount] = useState(12);
53  const [faderPos, setFaderPos] = useState(0.5); // 0 = Bottom (Pulse max, Void muted), 0.5 = Center, 1 = Top (Void max, Pulse muted)
54  const faderRef = useRef(0.5);
55  const trackRef = useRef<HTMLDivElement | null>(null);
56
57  // Audio & Waveform Canvas Refs
58  const voidCanvasRef = useRef<HTMLCanvasElement | null>(null);
59  const pulseCanvasRef = useRef<HTMLCanvasElement | null>(null);
60  const voidBtnRef = useRef<HTMLButtonElement | null>(null);
61  const pulseBtnRef = useRef<HTMLButtonElement | null>(null);
62  const pointerPosRef = useRef<{
63    x: number;
64    y: number;
65    active: boolean;
66    vx: number;
67    vy: number;
68    lastTime: number;
69  } | null>(null);
70  const buttonPosRef = useRef({ voidX: 0, voidY: 0, pulseX: 0, pulseY: 0 });
71  const voidAnalyserRef = useRef<AnalyserNode | null>(null);
72  const pulseAnalyserRef = useRef<AnalyserNode | null>(null);
73  const masterAnalyserRef = useRef<AnalyserNode | null>(null);
74  const bgVisualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
75  const smoothWaveformAngleRef = useRef<number>(0);
76
77  // Beat machine refs
78  const beatActiveRef = useRef(false);
79  const beatTimerRef = useRef<number | null>(null);
80  const beatClockIntervalRef = useRef<number | null>(null);
81  const beatStartTimeRef = useRef<number>(0);
82  const currentPatternIdxRef = useRef<number>(0);
83  const [patternDisplay, setPatternDisplay] = useState({
84    name: "1. ELECTRO FUNK",
85    secLeft: 60,
86    progress: 0,
87  });
88  const bpmRef = useRef(110);
89  const bpmDisplayRef = useRef<HTMLSpanElement | null>(null);
90  const currentStepRef = useRef(0);
91  const nextNoteTimeRef = useRef(0);
92  const noiseBufferRef = useRef<AudioBuffer | null>(null);
93  const drumGainRef = useRef<GainNode | null>(null);
94
95  const audioCtxRef = useRef<AudioContext | null>(null);
96  const voidBusGainRef = useRef<GainNode | null>(null);
97  const pulseBusGainRef = useRef<GainNode | null>(null);
98  const scratchGainRef = useRef<GainNode | null>(null);
99  const masterBusRef = useRef<{
100    convolver: ConvolverNode;
101    delayL: DelayNode;
102    delayR: DelayNode;
103    delayFeedback: GainNode;
104  } | null>(null);
105
106  // Active voice nodes references
107  const voidVoiceRef = useRef<{
108    oscs: OscillatorNode[];
109    gain: GainNode;
110    filter: BiquadFilterNode;
111    bloomGain: GainNode;
112    subGain: GainNode;
113  } | null>(null);
114
115  const pulseVoiceRef = useRef<{
116    oscs: OscillatorNode[];
117    gain: GainNode;
118    filter: BiquadFilterNode;
119    lfos: OscillatorNode[];
120    lfoGains: GainNode[];
121  } | null>(null);
122
123  // Gyroscope / Device Orientation tracking
124  const [gyroActive, setGyroActive] = useState(false);
125  const tiltRef = useRef<{ beta: number; gamma: number }>({ beta: 45, gamma: 0 });
126  const tiltDisplayRef = useRef<HTMLDivElement | null>(null);
127  const instrumentRef = useRef<HTMLDivElement | null>(null);
128
129  // BLUETOOTH MIDI EXPORT SYSTEM
130  const [bleMidiActive, setBleMidiActive] = useState(false);
131  const bleMidiActiveRef = useRef(false);
132  const [bleMidiDeviceName, setBleMidiDeviceName] = useState("");
133  const [bleMidiStatus, setBleMidiStatus] = useState("");
134  const [showMidiMonitor, setShowMidiMonitor] = useState(false);
135  const [midiLogs, setMidiLogs] = useState<{ id: string; time: string; hex: string; desc: string }[]>([]);
136  const [midiPacketCount, setMidiPacketCount] = useState(0);
137  const midiPacketCountRef = useRef(0);
138  const lastLogTimeRef = useRef(0);
139  // eslint-disable-next-line @typescript-eslint/no-explicit-any
140  const bleDeviceRef = useRef<any>(null);
141  // eslint-disable-next-line @typescript-eslint/no-explicit-any
142  const bleCharacteristicRef = useRef<any>(null);
143  // eslint-disable-next-line @typescript-eslint/no-explicit-any
144  const midiAccessOutputsRef = useRef<any[]>([]);
145  const lastMidiSendTimeRef = useRef<number>(0);
146  const lastSentValuesRef = useRef({ pitch: -1, roll: -1, yaw: -1 });
147
148  // Floating Sonic Balls: Types & Refs
149  interface BallVoice {
150    oscs: OscillatorNode[];
151    filter: BiquadFilterNode;
152    gain: GainNode;
153  }
154
155  interface Ball {
156    id: string;
157    type: "void" | "pulse";
158    x: number;
159    y: number;
160    vx: number;
161    vy: number;
162    radius: number;
163    lastBounceTime: number;
164    voice: BallVoice;
165  }
166
167  const [balls, setBalls] = useState<{ id: string; type: "void" | "pulse"; radius: number }[]>([]);
168  const ballsRef = useRef<Ball[]>([]);
169  const rotDirRef = useRef<number>(1); // 1 = Clockwise, -1 = Counter-Clockwise
170  const targetRotDirRef = useRef<number>(1);
171  const nextRotDirChangeTimeRef = useRef<number>(performance.now() + 4500);
172
173  // Send raw MIDI bytes over Web MIDI and Web Bluetooth GATT
174  const sendMidiRaw = (bytes: number[], desc?: string) => {
175    midiPacketCountRef.current += 1;
176    setMidiPacketCount(midiPacketCountRef.current);
177
178    const now = performance.now();
179    if (now - lastLogTimeRef.current > 100 || bytes[0] === 0x90 || bytes[0] === 0x80) {
180      lastLogTimeRef.current = now;
181      const hexStr = bytes.map((b) => "0x" + b.toString(16).toUpperCase().padStart(2, "0")).join(" ");
182      let description = desc;
183      if (!description) {
184        if ((bytes[0] & 0xf0) === 0xb0) {
185          description = `CC ${bytes[1]} = ${bytes[2]}`;
186        } else if ((bytes[0] & 0xf0) === 0x90) {
187          description = `NOTE ON (${bytes[1]}) Vel ${bytes[2]}`;
188        } else if ((bytes[0] & 0xf0) === 0x80) {
189          description = `NOTE OFF (${bytes[1]})`;
190        } else if ((bytes[0] & 0xf0) === 0xe0) {
191          const bend = bytes[1] | (bytes[2] << 7);
192          description = `PITCH BEND = ${bend - 8192}`;
193        } else {
194          description = `DATA (${bytes.length} bytes)`;
195        }
196      }
197      const timeStr = new Date().toLocaleTimeString().slice(3);
198      setMidiLogs((prev) => [
199        { id: Math.random().toString(), time: timeStr, hex: hexStr, desc: description || "" },
200        ...prev.slice(0, 11),
201      ]);
202    }
203
204    // 1. Web MIDI API outputs
205    midiAccessOutputsRef.current.forEach((out) => {
206      try {
207        out.send(bytes);
208      } catch {}
209    });
210
211    // 2. Web Bluetooth GATT characteristic (BLE MIDI standard with timestamps)
212    if (bleCharacteristicRef.current) {
213      try {
214        const nowMs = performance.now();
215        const timestamp = Math.floor(nowMs) & 0x1fff;
216        const header = 0x80 | ((timestamp >> 7) & 0x3f);
217        const timestampLow = 0x80 | (timestamp & 0x7f);
218        const packet = new Uint8Array([header, timestampLow, ...bytes]);
219        if (bleCharacteristicRef.current.writeValueWithoutResponse) {
220          bleCharacteristicRef.current.writeValueWithoutResponse(packet).catch(() => {});
221        } else if (bleCharacteristicRef.current.writeValue) {
222          bleCharacteristicRef.current.writeValue(packet).catch(() => {});
223        }
224      } catch {}
225    }
226  };
227
228  const sendMidiCc = (channel: number, cc: number, value: number) => {
229    const status = 0xb0 | ((channel - 1) & 0x0f);
230    sendMidiRaw([status, cc & 0x7f, value & 0x7f]);
231  };
232
233  const sendMidiNote = (channel: number, note: number, velocity: number) => {
234    const status = (velocity > 0 ? 0x90 : 0x80) | ((channel - 1) & 0x0f);
235    sendMidiRaw([status, note & 0x7f, velocity & 0x7f]);
236  };
237
238  // Self-test sequence triggering real MIDI bursts and opening the test monitor
239  const runMidiSelfTest = () => {
240    ensureGameStarted();
241    getAudioContext();
242    if (!bleMidiActiveRef.current) {
243      setBleMidiActive(true);
244      bleMidiActiveRef.current = true;
245      setBleMidiStatus("Prueba activa • Transmitiendo");
246    }
247    setShowMidiMonitor(true);
248
249    // Audible confirmation tone
250    const ctx = audioCtxRef.current;
251    if (ctx) {
252      const now = ctx.currentTime;
253      const osc = ctx.createOscillator();
254      osc.type = "sine";
255      osc.frequency.setValueAtTime(880, now);
256      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
257      const gain = ctx.createGain();
258      gain.gain.setValueAtTime(0.2, now);
259      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
260      osc.connect(gain);
261      gain.connect(ctx.destination);
262      osc.start(now);
263      osc.stop(now + 0.2);
264    }
265
266    // Send MIDI Test Burst
267    sendMidiNote(1, 36, 110);
268    setTimeout(() => sendMidiNote(1, 67, 110), 90);
269    setTimeout(() => sendMidiCc(1, 74, 32), 150);
270    setTimeout(() => sendMidiCc(1, 74, 64), 220);
271    setTimeout(() => sendMidiCc(1, 74, 100), 300);
272    setTimeout(() => sendMidiCc(1, 74, 127), 380);
273    setTimeout(() => sendMidiCc(1, 10, 25), 180);
274    setTimeout(() => sendMidiCc(1, 10, 105), 340);
275    setTimeout(() => sendMidiRaw([0xe0, 0x00, 0x60], "TEST PITCH BEND +4096"), 280);
276    setTimeout(() => {
277      sendMidiNote(1, 36, 0);
278      sendMidiNote(1, 67, 0);
279      sendMidiRaw([0xe0, 0x00, 0x40], "TEST PITCH BEND CENTER");
280    }, 550);
281  };
282
283  // Export gyroscope commands over MIDI Bluetooth (Pitch, Roll, Heading)
284  const sendGyroMidi = (beta: number, gamma: number, alpha = 0) => {
285    if (!bleMidiActiveRef.current) return;
286    const now = performance.now();
287    if (now - lastMidiSendTimeRef.current < 25) return; // 40 Hz rate limit
288    lastMidiSendTimeRef.current = now;
289
290    // Pitch: normalized 0-127 (Tilt Forward/Back)
291    const normBeta = Math.max(0, Math.min(1, (beta - 20) / 45));
292    const pitchVal = Math.round(normBeta * 127);
293
294    // Roll: normalized 0-127 (Tilt Left/Right)
295    const normGamma = Math.max(0, Math.min(1, (gamma + 30) / 60));
296    const rollVal = Math.round(normGamma * 127);
297
298    // Heading: 0-127 (Screen rotation)
299    const normAlpha = ((alpha % 360) + 360) % 360;
300    const yawVal = Math.round((normAlpha / 360) * 127);
301
302    if (pitchVal !== lastSentValuesRef.current.pitch) {
303      lastSentValuesRef.current.pitch = pitchVal;
304      sendMidiCc(1, 74, pitchVal); // CC 74: Brightness / Cutoff
305      sendMidiCc(1, 1, pitchVal);  // CC 1: Modulation Wheel
306    }
307
308    if (rollVal !== lastSentValuesRef.current.roll) {
309      lastSentValuesRef.current.roll = rollVal;
310      sendMidiCc(1, 10, rollVal); // CC 10: Pan
311      sendMidiCc(1, 16, rollVal); // CC 16: General Purpose 1 / Tilt
312      // 14-bit Pitch Bend
313      const bend = Math.round(normGamma * 16383);
314      sendMidiRaw([0xe0, bend & 0x7f, (bend >> 7) & 0x7f]);
315    }
316
317    if (yawVal !== lastSentValuesRef.current.yaw) {
318      lastSentValuesRef.current.yaw = yawVal;
319      sendMidiCc(1, 11, yawVal); // CC 11: Expression
320    }
321  };
322
323  const BLE_MIDI_SERVICE = "03b80e5a-ede8-4b33-a751-6ce34ec4c700";
324  const BLE_MIDI_CHAR = "7772e5db-3868-4112-a1a9-f2669d106bf3";
325
326  const startBleMidi = async () => {
327    ensureGameStarted();
328    enableGyroscope();
329    let connectedName = "";
330
331    // 1. Web Bluetooth API for direct BLE MIDI connections
332    // eslint-disable-next-line @typescript-eslint/no-explicit-any
333    const nav = typeof navigator !== "undefined" ? (navigator as any) : null;
334    if (nav && "bluetooth" in nav) {
335      try {
336        setBleMidiStatus("Buscando dispositivo Bluetooth...");
337        const device = await nav.bluetooth.requestDevice({
338          filters: [{ services: [BLE_MIDI_SERVICE] }],
339          optionalServices: [BLE_MIDI_SERVICE],
340        });
341
342        if (device && device.gatt) {
343          device.addEventListener("gattserverdisconnected", () => {
344            stopBleMidi();
345          });
346          bleDeviceRef.current = device;
347          const server = await device.gatt.connect();
348          const service = await server.getPrimaryService(BLE_MIDI_SERVICE);
349          const char = await service.getCharacteristic(BLE_MIDI_CHAR);
350          bleCharacteristicRef.current = char;
351          connectedName = device.name || "Dispositivo BLE";
352        }
353      } catch (err) {
354        console.warn("Bluetooth device request cancelled/unsupported:", err);
355      }
356    }
357
358    // 2. Web MIDI API for OS-paired Bluetooth MIDI devices or DAW loopbacks
359    if (nav && "requestMIDIAccess" in nav) {
360      try {
361        const midiAccess = await nav.requestMIDIAccess({ sysex: false });
362        // eslint-disable-next-line @typescript-eslint/no-explicit-any
363        const outputs: any[] = [];
364        // eslint-disable-next-line @typescript-eslint/no-explicit-any
365        midiAccess.outputs.forEach((out: any) => outputs.push(out));
366        midiAccessOutputsRef.current = outputs;
367        if (!connectedName && outputs.length > 0) {
368          connectedName = outputs[0].name || "Salida MIDI";
369        }
370      } catch (err) {
371        console.warn("Web MIDI request error:", err);
372      }
373    }
374
375    setBleMidiActive(true);
376    bleMidiActiveRef.current = true;
377    setBleMidiDeviceName(connectedName);
378    setBleMidiStatus(connectedName ? `Conectado a ${connectedName}` : "Transmitiendo MIDI");
379  };
380
381  const stopBleMidi = () => {
382    if (bleDeviceRef.current && bleDeviceRef.current.gatt?.connected) {
383      try {
384        bleDeviceRef.current.gatt.disconnect();
385      } catch {}
386    }
387    // Send All Notes Off & Reset Controllers
388    sendMidiCc(1, 123, 0);
389    sendMidiCc(1, 121, 0);
390
391    bleDeviceRef.current = null;
392    bleCharacteristicRef.current = null;
393    midiAccessOutputsRef.current = [];
394    setBleMidiActive(false);
395    bleMidiActiveRef.current = false;
396    setBleMidiDeviceName("");
397    setBleMidiStatus("");
398  };
399
400  const toggleBleMidi = () => {
401    if (bleMidiActiveRef.current) {
402      stopBleMidi();
403    } else {
404      startBleMidi();
405    }
406  };
407
408  // 15-SECOND SUSPENSE BEEP (Volume increases from 0.18 to 0.88 as time runs out)
409  const playCountdownBeep = (secondsLeft: number) => {
410    const ctx = audioCtxRef.current;
411    if (!ctx) return;
412    const now = ctx.currentTime;
413    const bus = scratchGainRef.current || ctx.destination;
414
415    const urgency = (16 - secondsLeft) / 15;
416    const vol = Math.min(0.9, 0.18 + urgency * 0.7);
417    const pitch = 750 + urgency * 650;
418
419    const osc = ctx.createOscillator();
420    osc.type = "sine";
421    osc.frequency.setValueAtTime(pitch, now);
422
423    const oscHarm = ctx.createOscillator();
424    oscHarm.type = "triangle";
425    oscHarm.frequency.setValueAtTime(pitch * 2, now);
426
427    const gain = ctx.createGain();
428    gain.gain.setValueAtTime(0.0001, now);
429    gain.gain.linearRampToValueAtTime(vol, now + 0.015);
430    gain.gain.exponentialRampToValueAtTime(0.001, now + (secondsLeft <= 3 ? 0.22 : 0.14));
431
432    const harmGain = ctx.createGain();
433    harmGain.gain.value = 0.35;
434    oscHarm.connect(harmGain);
435    harmGain.connect(gain);
436    osc.connect(gain);
437    gain.connect(bus);
438
439    osc.start(now);
440    oscHarm.start(now);
441    const dur = secondsLeft <= 3 ? 0.24 : 0.16;
442    osc.stop(now + dur);
443    oscHarm.stop(now + dur);
444  };
445
446  const playFinalBuzzerSound = () => {
447    const ctx = audioCtxRef.current;
448    if (!ctx) return;
449    const now = ctx.currentTime;
450    const bus = scratchGainRef.current || ctx.destination;
451
452    [440, 220].forEach((freq, idx) => {
453      const osc = ctx.createOscillator();
454      osc.type = "sawtooth";
455      osc.frequency.setValueAtTime(freq, now + idx * 0.18);
456      const filter = ctx.createBiquadFilter();
457      filter.type = "lowpass";
458      filter.frequency.value = 1600;
459      const gain = ctx.createGain();
460      gain.gain.setValueAtTime(0.5, now + idx * 0.18);
461      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.45);
462      osc.connect(filter);
463      filter.connect(gain);
464      gain.connect(bus);
465      osc.start(now + idx * 0.18);
466      osc.stop(now + idx * 0.18 + 0.5);
467    });
468  };
469
470  const startGame = () => {
471    getAudioContext();
472    gameScoreRef.current = 0;
473    setGameScore(0);
474    gameTimeLeftRef.current = 120;
475    setGameTimeLeft(120);
476    setIsGameOver(false);
477    isGameRunningRef.current = true;
478    setIsGameRunning(true);
479
480    const existingVoid = ballsRef.current.filter((b) => b.type === "void").length;
481    const existingPulse = ballsRef.current.filter((b) => b.type === "pulse").length;
482    const voidToSpawn = Math.max(0, 3 - existingVoid);
483    const pulseToSpawn = Math.max(0, 3 - existingPulse);
484
485    setTimeout(() => {
486      for (let i = 0; i < voidToSpawn; i++) spawnBall("void");
487      for (let i = 0; i < pulseToSpawn; i++) spawnBall("pulse");
488    }, 80);
489  };
490
491  const restartGame = () => {
492    ballsRef.current.forEach((b) => {
493      try {
494        b.voice.oscs.forEach((osc) => osc.stop());
495        b.voice.filter.disconnect();
496        b.voice.gain.disconnect();
497      } catch {}
498    });
499    ballsRef.current = [];
500    setBalls([]);
501    startGame();
502  };
503
504  const ensureGameStarted = () => {
505    if (!isGameRunningRef.current && !isGameOver) {
506      startGame();
507    }
508  };
509
510  // 2-MINUTE COUNTDOWN WATCH & HIGH SCORE SYSTEM
511  useEffect(() => {
512    try {
513      const stored = localStorage.getItem("duotone_high_score");
514      if (stored) setHighScore(parseInt(stored, 10) || 0);
515    } catch {}
516
517    const interval = window.setInterval(() => {
518      if (isGameRunningRef.current && !isGameOver && gameTimeLeftRef.current > 0) {
519        gameTimeLeftRef.current -= 1;
520        const timeLeft = gameTimeLeftRef.current;
521        setGameTimeLeft(timeLeft);
522
523        // Beep every second during last 15 seconds with increasing volume
524        if (timeLeft <= 15 && timeLeft > 0) {
525          playCountdownBeep(timeLeft);
526        }
527
528        if (timeLeft === 0) {
529          isGameRunningRef.current = false;
530          setIsGameRunning(false);
531          setIsGameOver(true);
532          playFinalBuzzerSound();
533        }
534      }
535    }, 1000);
536
537    return () => clearInterval(interval);
538  }, [isGameOver]);
539
540  const playExplosionSound = (type: "void" | "pulse") => {
541    const ctx = audioCtxRef.current;
542    if (!ctx) return;
543    const now = ctx.currentTime;
544    const bus = scratchGainRef.current || ctx.destination;
545
546    const noiseBuffer = noiseBufferRef.current;
547    if (noiseBuffer) {
548      const noise = ctx.createBufferSource();
549      noise.buffer = noiseBuffer;
550      const filter = ctx.createBiquadFilter();
551      filter.type = "lowpass";
552      filter.frequency.setValueAtTime(type === "void" ? 1800 : 3600, now);
553      filter.frequency.exponentialRampToValueAtTime(80, now + 0.35);
554
555      const gain = ctx.createGain();
556      gain.gain.setValueAtTime(0.7, now);
557      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
558
559      noise.connect(filter);
560      filter.connect(gain);
561      gain.connect(bus);
562      noise.start(now);
563      noise.stop(now + 0.4);
564    }
565
566    const root = type === "void" ? 130.81 : 392.0;
567    [1, 1.25, 1.5, 2].forEach((ratio, idx) => {
568      const osc = ctx.createOscillator();
569      osc.type = "sine";
570      osc.frequency.setValueAtTime(root * ratio, now + idx * 0.02);
571      osc.frequency.exponentialRampToValueAtTime(root * ratio * 1.4, now + 0.28);
572      const oscGain = ctx.createGain();
573      oscGain.gain.setValueAtTime(0.24, now + idx * 0.02);
574      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
575      osc.connect(oscGain);
576      oscGain.connect(bus);
577      osc.start(now + idx * 0.02);
578      osc.stop(now + 0.38);
579    });
580  };
581
582  const handleTripleBallExplosion = (type: "void" | "pulse", x: number, y: number) => {
583    playExplosionSound(type);
584
585    const expId = `exp-${Date.now()}-${Math.random()}`;
586    const color = type === "void" ? "#c084fc" : "#22d3ee";
587    setExplosions((prev) => [...prev, { id: expId, x, y, color }]);
588    setTimeout(() => {
589      setExplosions((prev) => prev.filter((e) => e.id !== expId));
590    }, 600);
591
592    const popId = `pop-${Date.now()}-${Math.random()}`;
593    setScorePops((prev) => [...prev, { id: popId, x, y, text: "+1 PUNTO" }]);
594    setTimeout(() => {
595      setScorePops((prev) => prev.filter((p) => p.id !== popId));
596    }, 900);
597
598    if (gameTimeLeftRef.current > 0) {
599      gameScoreRef.current += 1;
600      const nextScore = gameScoreRef.current;
601      setGameScore(nextScore);
602      if (nextScore > highScore) {
603        setHighScore(nextScore);
604        try {
605          localStorage.setItem("duotone_high_score", nextScore.toString());
606        } catch {}
607      }
608    }
609  };
610
611  // REALISTIC DJ VINYL TURNTABLE AUDIO ENGINE (BRAKE, SCRATCH & MOTOR SPIN-UP)
612
613  // 1. Vinyl Needle Brake Sound: Turntable platter decelerating to complete stop
614  const playVinylBrakeSound = (ctx: AudioContext, time: number) => {
615    const scratchBus = scratchGainRef.current || ctx.destination;
616    const noiseBuffer = noiseBufferRef.current;
617    if (!noiseBuffer) return;
618
619    const source = ctx.createBufferSource();
620    source.buffer = noiseBuffer;
621    const filter = ctx.createBiquadFilter();
622    filter.type = "lowpass";
623    filter.frequency.setValueAtTime(1200, time);
624    filter.frequency.exponentialRampToValueAtTime(70, time + 0.22);
625
626    const gain = ctx.createGain();
627    gain.gain.setValueAtTime(0.42, time);
628    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.24);
629
630    source.connect(filter);
631    filter.connect(gain);
632    gain.connect(scratchBus);
633    source.start(time);
634    source.stop(time + 0.26);
635  };
636
637  // 2. Vinyl Motor Spin-Up Sound: Analog motor starting up and accelerating
638  const playMotorSpinUp = (ctx: AudioContext, time: number) => {
639    const scratchBus = scratchGainRef.current || ctx.destination;
640    const noiseBuffer = noiseBufferRef.current;
641    if (!noiseBuffer) return;
642
643    const source = ctx.createBufferSource();
644    source.buffer = noiseBuffer;
645    const filter = ctx.createBiquadFilter();
646    filter.type = "bandpass";
647    filter.frequency.setValueAtTime(140, time);
648    filter.frequency.exponentialRampToValueAtTime(2600, time + 0.24);
649    filter.Q.value = 3.8;
650
651    const gain = ctx.createGain();
652    gain.gain.setValueAtTime(0.32, time);
653    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.26);
654
655    source.connect(filter);
656    filter.connect(gain);
657    gain.connect(scratchBus);
658    source.start(time);
659    source.stop(time + 0.28);
660  };
661
662  // 3. Authentic Vinyl Scratch Sound: Needle groove friction + formant audio scrub
663  const playVinylScratchSound = (
664    ctx: AudioContext,
665    time: number,
666    speed: number,
667    isForward: boolean
668  ) => {
669    const scratchBus = scratchGainRef.current || ctx.destination;
670    const noiseBuffer = noiseBufferRef.current;
671    if (!noiseBuffer) return;
672
673    const spd = Math.max(0.4, Math.min(3.5, speed));
674    const dur = Math.max(0.04, Math.min(0.18, 0.26 / spd));
675
676    // A. Vinyl needle friction whoosh
677    const noise = ctx.createBufferSource();
678    noise.buffer = noiseBuffer;
679    const noiseFilter = ctx.createBiquadFilter();
680    noiseFilter.type = "bandpass";
681    const baseFreq = isForward ? 1900 * spd : 950 * spd;
682    noiseFilter.frequency.setValueAtTime(baseFreq, time);
683    noiseFilter.frequency.exponentialRampToValueAtTime(
684      isForward ? baseFreq * 1.6 : Math.max(80, baseFreq * 0.5),
685      time + dur
686    );
687    noiseFilter.Q.value = 4.2;
688
689    const noiseGain = ctx.createGain();
690    const noiseVol = Math.min(0.7, 0.28 * spd);
691    noiseGain.gain.setValueAtTime(noiseVol, time);
692    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + dur);
693
694    noise.connect(noiseFilter);
695    noiseFilter.connect(noiseGain);
696    noiseGain.connect(scratchBus);
697    noise.start(time);
698    noise.stop(time + dur + 0.02);
699
700    // B. Vinyl Audio Scrub Tone (sawtooth resonant chirp)
701    const toneOsc = ctx.createOscillator();
702    toneOsc.type = "sawtooth";
703    const startPitch = isForward ? 150 * spd : 420 * spd;
704    const endPitch = isForward ? 440 * spd : 120 * spd;
705    toneOsc.frequency.setValueAtTime(Math.max(40, startPitch), time);
706    toneOsc.frequency.exponentialRampToValueAtTime(Math.max(40, endPitch), time + dur);
707
708    const toneFilter = ctx.createBiquadFilter();
709    toneFilter.type = "bandpass";
710    toneFilter.frequency.setValueAtTime(isForward ? 1400 : 850, time);
711    toneFilter.Q.value = 3.2;
712
713    const toneGain = ctx.createGain();
714    const toneVol = Math.min(0.55, 0.22 * spd);
715    toneGain.gain.setValueAtTime(toneVol, time);
716    toneGain.gain.exponentialRampToValueAtTime(0.001, time + dur);
717
718    toneOsc.connect(toneFilter);
719    toneFilter.connect(toneGain);
720    toneGain.connect(scratchBus);
721    toneOsc.start(time);
722    toneOsc.stop(time + dur + 0.02);
723  };
724
725  // 4. VINYL BRAKE & COMPLETE STOP: Hand touches the record platter
726  const startVinylHold = () => {
727    isHoldingVinylRef.current = true;
728    jogActiveRef.current = true;
729    setIsVinylHeld(true);
730    setIsJogActive(true);
731    setVinylStatusText("BRAKE • STOPPED");
732
733    if (jogReleaseTimerRef.current) {
734      clearTimeout(jogReleaseTimerRef.current);
735      jogReleaseTimerRef.current = null;
736    }
737
738    const ctx = audioCtxRef.current;
739    if (ctx) {
740      const now = ctx.currentTime;
741      playVinylBrakeSound(ctx, now);
742
743      // Pitch brake on active synthesizers (turntable tape-stop glide)
744      if (voidVoiceRef.current) {
745        voidVoiceRef.current.oscs.forEach((osc) => {
746          osc.detune.cancelScheduledValues(now);
747          osc.detune.setValueAtTime(osc.detune.value, now);
748          osc.detune.exponentialRampToValueAtTime(-1800, now + 0.16);
749        });
750      }
751      if (pulseVoiceRef.current) {
752        pulseVoiceRef.current.oscs.forEach((osc) => {
753          osc.detune.cancelScheduledValues(now);
754          osc.detune.setValueAtTime(osc.detune.value, now);
755          osc.detune.exponentialRampToValueAtTime(-1800, now + 0.16);
756        });
757      }
758
759      // Mute audio channels smoothly over 120ms to completely silence music
760      if (voidBusGainRef.current) {
761        voidBusGainRef.current.gain.cancelScheduledValues(now);
762        voidBusGainRef.current.gain.setValueAtTime(voidBusGainRef.current.gain.value, now);
763        voidBusGainRef.current.gain.linearRampToValueAtTime(0.0001, now + 0.12);
764      }
765      if (pulseBusGainRef.current) {
766        pulseBusGainRef.current.gain.cancelScheduledValues(now);
767        pulseBusGainRef.current.gain.setValueAtTime(pulseBusGainRef.current.gain.value, now);
768        pulseBusGainRef.current.gain.linearRampToValueAtTime(0.0001, now + 0.12);
769      }
770      if (drumGainRef.current) {
771        drumGainRef.current.gain.cancelScheduledValues(now);
772        drumGainRef.current.gain.setValueAtTime(drumGainRef.current.gain.value, now);
773        drumGainRef.current.gain.linearRampToValueAtTime(0.0001, now + 0.12);
774      }
775      ballsRef.current.forEach((ball) => {
776        ball.voice.gain.gain.cancelScheduledValues(now);
777        ball.voice.gain.gain.setValueAtTime(ball.voice.gain.gain.value, now);
778        ball.voice.gain.gain.linearRampToValueAtTime(0.0001, now + 0.12);
779      });
780    }
781  };
782
783  // 5. MOTOR SPIN-UP RELEASE: Hand releases the record platter, motor accelerates
784  const releaseVinylHold = () => {
785    isHoldingVinylRef.current = false;
786    jogActiveRef.current = false;
787    setIsVinylHeld(false);
788    setIsJogActive(false);
789    setVinylStatusText("33⅓ RPM");
790
791    const ctx = audioCtxRef.current;
792    if (!ctx) return;
793    const now = ctx.currentTime;
794
795    playMotorSpinUp(ctx, now);
796
797    // Pitch spin-up glide on active synthesizers
798    if (voidVoiceRef.current) {
799      const normBeta = Math.max(0, Math.min(1, (tiltRef.current.beta - 20) / 45));
800      const targetBend = (normBeta - 0.5) * 120;
801      voidVoiceRef.current.oscs.forEach((osc) => {
802        osc.detune.cancelScheduledValues(now);
803        osc.detune.setValueAtTime(-900, now);
804        osc.detune.exponentialRampToValueAtTime(targetBend, now + 0.22);
805      });
806    }
807    if (pulseVoiceRef.current) {
808      const normGamma = Math.max(0, Math.min(1, (tiltRef.current.gamma + 30) / 60));
809      const targetBend = (normGamma - 0.5) * 80;
810      pulseVoiceRef.current.oscs.forEach((osc) => {
811        osc.detune.cancelScheduledValues(now);
812        osc.detune.setValueAtTime(-900, now);
813        osc.detune.exponentialRampToValueAtTime(targetBend, now + 0.22);
814      });
815    }
816
817    // Restore channels to crossfader balance
818    applyCrossfade(faderRef.current);
819
820    if (drumGainRef.current) {
821      drumGainRef.current.gain.cancelScheduledValues(now);
822      drumGainRef.current.gain.setValueAtTime(0.001, now);
823      drumGainRef.current.gain.linearRampToValueAtTime(0.75, now + 0.2);
824    }
825
826    ballsRef.current.forEach((ball) => {
827      const nominalVol = ball.type === "void" ? 0.042 : 0.028;
828      ball.voice.gain.gain.cancelScheduledValues(now);
829      ball.voice.gain.gain.setValueAtTime(0.001, now);
830      ball.voice.gain.gain.linearRampToValueAtTime(nominalVol, now + 0.2);
831    });
832
833    if (beatActiveRef.current) {
834      nextNoteTimeRef.current = ctx.currentTime + 0.05;
835    }
836  };
837
838  // 6. VINYL SCRUB / SCRATCH: Rotates the platter forward or backward
839  const applyVinylScrub = (delta: number, speedMultiplier = 1.0) => {
840    getAudioContext();
841    const ctx = audioCtxRef.current;
842    if (!ctx) return;
843    const now = ctx.currentTime;
844
845    // Ensure vinyl stop state is active
846    if (!isHoldingVinylRef.current) {
847      startVinylHold();
848    }
849
850    // 1. Rotate the visual vinyl platter
851    jogWheelAngleRef.current += delta;
852    if (vinylPlatterVisualRef.current) {
853      vinylPlatterVisualRef.current.style.transform = `rotate(${jogWheelAngleRef.current.toFixed(1)}deg)`;
854    }
855    setJogAngle(jogWheelAngleRef.current);
856
857    // 2. Audible vinyl scratch sound based on velocity and direction
858    const rawSpeed = Math.abs(delta) * 0.12 * speedMultiplier;
859    playVinylScratchSound(ctx, now, rawSpeed, delta > 0);
860    setVinylStatusText(delta > 0 ? "SCRATCH ▶" : "SCRATCH ◀");
861
862    // 3. Step scrub on the beat sequencer (scrubs steps forward or backward)
863    if (beatActiveRef.current) {
864      const stepDelta = Math.round(delta * 0.18);
865      if (Math.abs(stepDelta) >= 1) {
866        let nextStep = (currentStepRef.current + stepDelta) % 16;
867        if (nextStep < 0) nextStep += 16;
868        currentStepRef.current = nextStep;
869      }
870    }
871
872    // 4. Scrub physics of floating balls along their velocities
873    ballsRef.current.forEach((ball) => {
874      ball.x += ball.vx * delta * 0.15;
875      ball.y += ball.vy * delta * 0.15;
876    });
877  };
878
879  // Direct Pointer Handlers for the On-Screen Vinyl Turntable Platter
880  const handleVinylPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
881    ensureGameStarted();
882    e.preventDefault();
883    e.stopPropagation();
884    try {
885      e.currentTarget.setPointerCapture(e.pointerId);
886    } catch {}
887
888    getAudioContext();
889
890    const rect = e.currentTarget.getBoundingClientRect();
891    vinylCenterRef.current = {
892      x: rect.left + rect.width / 2,
893      y: rect.top + rect.height / 2,
894    };
895
896    const dx = e.clientX - vinylCenterRef.current.x;
897    const dy = e.clientY - vinylCenterRef.current.y;
898    lastPointerAngleRef.current = Math.atan2(dy, dx) * (180 / Math.PI);
899
900    startVinylHold();
901  };
902
903  const handleVinylPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
904    if (!isHoldingVinylRef.current) return;
905    e.preventDefault();
906    e.stopPropagation();
907
908    const dx = e.clientX - vinylCenterRef.current.x;
909    const dy = e.clientY - vinylCenterRef.current.y;
910    const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);
911
912    if (lastPointerAngleRef.current !== null) {
913      let delta = currentAngle - lastPointerAngleRef.current;
914      if (delta > 180) delta -= 360;
915      if (delta < -180) delta += 360;
916
917      if (Math.abs(delta) > 0.4) {
918        applyVinylScrub(delta, 1.2);
919      }
920    }
921
922    lastPointerAngleRef.current = currentAngle;
923  };
924
925  const handleVinylPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
926    e.preventDefault();
927    e.stopPropagation();
928    try {
929      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
930        e.currentTarget.releasePointerCapture(e.pointerId);
931      }
932    } catch {}
933
934    lastPointerAngleRef.current = null;
935    releaseVinylHold();
936  };
937
938  // Aliases for global wheel and touch listeners
939  const startJogMode = startVinylHold;
940  const stopJogMode = releaseVinylHold;
941  const applyJogScrub = (delta: number) => {
942    applyVinylScrub(delta);
943    if (jogReleaseTimerRef.current) {
944      clearTimeout(jogReleaseTimerRef.current);
945    }
946    jogReleaseTimerRef.current = window.setTimeout(() => {
947      releaseVinylHold();
948    }, 380);
949  };
950
951  // ROTARY MASTER VOLUME REGULATION (CLOCKWISE = INCREASE)
952  const adjustMasterVolume = (delta: number) => {
953    if (panicRef.current) return;
954    const next = Math.max(0.05, Math.min(1.0, masterVolRef.current + delta));
955    masterVolRef.current = next;
956    setMasterVol(next);
957    const ctx = audioCtxRef.current;
958    if (ctx && masterGainRef.current) {
959      masterGainRef.current.gain.setTargetAtTime(next, ctx.currentTime, 0.03);
960    }
961  };
962
963  const setMasterVolumeDirect = (val: number) => {
964    if (panicRef.current) return;
965    const clamped = Math.max(0.05, Math.min(1.0, val));
966    masterVolRef.current = clamped;
967    setMasterVol(clamped);
968    const ctx = audioCtxRef.current;
969    if (ctx && masterGainRef.current) {
970      masterGainRef.current.gain.setTargetAtTime(clamped, ctx.currentTime, 0.03);
971    }
972  };
973
974  // Rotary Knob Touch/Mouse Drag Handler
975  const handleKnobPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
976    try {
977      e.currentTarget.setPointerCapture(e.pointerId);
978    } catch {}
979    const rect = e.currentTarget.getBoundingClientRect();
980    knobCenterRef.current = {
981      x: rect.left + rect.width / 2,
982      y: rect.top + rect.height / 2,
983    };
984    isDraggingKnobRef.current = true;
985  };
986
987  const handleKnobPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
988    if (!isDraggingKnobRef.current) return;
989    const dx = e.clientX - knobCenterRef.current.x;
990    const dy = e.clientY - knobCenterRef.current.y;
991    let angleDeg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
992    if (angleDeg < 0) angleDeg += 360;
993    // Map angle from 40° to 320° into 0.05 .. 1.0
994    const clampedAngle = Math.max(35, Math.min(325, angleDeg));
995    const normalized = (clampedAngle - 35) / 290;
996    setMasterVolumeDirect(normalized);
997  };
998
999  const handleKnobPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
1000    try {
1001      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
1002        e.currentTarget.releasePointerCapture(e.pointerId);
1003      }
1004    } catch {}
1005    isDraggingKnobRef.current = false;
1006  };
1007
1008  // PANIC FUNCTION: Mutes everything, stops synthesizers and destroys all balls
1009  const triggerPanic = () => {
1010    const ctx = audioCtxRef.current;
1011    const now = ctx ? ctx.currentTime : 0;
1012    panicRef.current = true;
1013    setIsPanicked(true);
1014
1015    // Instant MUTE ALL
1016    if (masterGainRef.current && ctx) {
1017      masterGainRef.current.gain.cancelScheduledValues(now);
1018      masterGainRef.current.gain.setValueAtTime(0, now);
1019    }
1020    // Stop all instruments
1021    if (voidVoiceRef.current) stopVoid();
1022    if (pulseVoiceRef.current) stopPulse();
1023    setVoidOn(false);
1024    setPulseOn(false);
1025    if (beatActiveRef.current) toggleBeat();
1026
1027    // Clear and silence all floating balls
1028    ballsRef.current.forEach((b) => {
1029      try {
1030        b.voice.oscs.forEach((osc) => osc.stop());
1031        b.voice.filter.disconnect();
1032        b.voice.gain.disconnect();
1033      } catch {}
1034    });
1035    ballsRef.current = [];
1036    setBalls([]);
1037  };
1038
1039  const resetPanic = () => {
1040    const ctx = audioCtxRef.current;
1041    const now = ctx ? ctx.currentTime : 0;
1042    panicRef.current = false;
1043    setIsPanicked(false);
1044
1045    // Restore nominal master volume
1046    if (masterGainRef.current && ctx) {
1047      masterGainRef.current.gain.cancelScheduledValues(now);
1048      masterGainRef.current.gain.setTargetAtTime(masterVolRef.current, now, 0.05);
1049    }
1050  };
1051
1052  const togglePanic = () => {
1053    if (panicRef.current) {
1054      resetPanic();
1055    } else {
1056      triggerPanic();
1057    }
1058  };
1059
1060  // 2-Second Hold on Empty Screen Space for Panic Mute
1061  const handleEmptySpacePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
1062    // Only trigger if touching empty background (not on buttons, controls, or balls)
1063    const target = e.target as HTMLElement;
1064    if (
1065      target.closest("button") ||
1066      target.closest(".cursor-pointer") ||
1067      target.closest("canvas") ||
1068      target.tagName === "BUTTON"
1069    ) {
1070      return;
1071    }
1072
1073    const startX = e.clientX;
1074    const startY = e.clientY;
1075    setHoldIndicator({ x: startX, y: startY });
1076
1077    if (panicHoldTimerRef.current) {
1078      clearTimeout(panicHoldTimerRef.current);
1079    }
1080
1081    panicHoldTimerRef.current = window.setTimeout(() => {
1082      triggerPanic();
1083      setHoldIndicator(null);
1084      panicHoldTimerRef.current = null;
1085    }, 2000);
1086  };
1087
1088  const cancelPanicHold = () => {
1089    if (panicHoldTimerRef.current) {
1090      clearTimeout(panicHoldTimerRef.current);
1091      panicHoldTimerRef.current = null;
1092    }
1093    setHoldIndicator(null);
1094  };
1095
1096  const handleEmptySpacePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
1097    if (!holdIndicator) return;
1098    const dist = Math.hypot(e.clientX - holdIndicator.x, e.clientY - holdIndicator.y);
1099    if (dist > 24) {
1100      cancelPanicHold();
1101    }
1102  };
1103
1104  // Create real-time audio voice for a spawned ball (VOLUME AT EXACTLY 10% of button volume)
1105  const createBallVoice = (type: "void" | "pulse", ctx: AudioContext): BallVoice => {
1106    const now = ctx.currentTime;
1107    const bus = masterBusRef.current;
1108    const gain = ctx.createGain();
1109
1110    if (type === "void") {
1111      // VOID BALL: Volume at 10% of Void button (0.042)
1112      gain.gain.setValueAtTime(0.0001, now);
1113      gain.gain.setTargetAtTime(0.042, now, 0.05);
1114
1115      const filter = ctx.createBiquadFilter();
1116      filter.type = "lowpass";
1117      filter.frequency.setValueAtTime(450, now);
1118      filter.Q.value = 2.4;
1119
1120      const oscSub = ctx.createOscillator();
1121      oscSub.type = "sine";
1122      oscSub.frequency.value = 65.41;
1123
1124      const oscFifth = ctx.createOscillator();
1125      oscFifth.type = "triangle";
1126      oscFifth.frequency.value = 98.0;
1127
1128      const oscBody = ctx.createOscillator();
1129      oscBody.type = "sawtooth";
1130      oscBody.frequency.value = 130.81;
1131      const bodyGain = ctx.createGain();
1132      bodyGain.gain.value = 0.28;
1133      oscBody.connect(bodyGain);
1134
1135      const oscBloom = ctx.createOscillator();
1136      oscBloom.type = "sine";
1137      oscBloom.frequency.value = 261.63;
1138      const bloomGain = ctx.createGain();
1139      bloomGain.gain.value = 0.2;
1140      oscBloom.connect(bloomGain);
1141
1142      oscSub.connect(filter);
1143      oscFifth.connect(filter);
1144      bodyGain.connect(filter);
1145      bloomGain.connect(filter);
1146
1147      filter.connect(gain);
1148      gain.connect(ctx.destination);
1149      if (bus) {
1150        gain.connect(bus.convolver);
1151      }
1152
1153      const oscs = [oscSub, oscFifth, oscBody, oscBloom];
1154      oscs.forEach((osc) => osc.start(now));
1155
1156      return { oscs, filter, gain };
1157    } else {
1158      // PULSE BALL: Volume at 10% of Pulse button (0.028)
1159      gain.gain.setValueAtTime(0.0001, now);
1160      gain.gain.setTargetAtTime(0.028, now, 0.05);
1161
1162      const filter = ctx.createBiquadFilter();
1163      filter.type = "lowpass";
1164      filter.frequency.setValueAtTime(3200, now);
1165      filter.Q.value = 1.8;
1166
1167      const osc1 = ctx.createOscillator();
1168      osc1.type = "sine";
1169      osc1.frequency.value = 392.0;
1170
1171      const osc2 = ctx.createOscillator();
1172      osc2.type = "sine";
1173      osc2.frequency.value = 587.33;
1174
1175      const osc3 = ctx.createOscillator();
1176      osc3.type = "sine";
1177      osc3.frequency.value = 783.99;
1178
1179      osc1.connect(filter);
1180      osc2.connect(filter);
1181      osc3.connect(filter);
1182
1183      filter.connect(gain);
1184      gain.connect(ctx.destination);
1185      if (bus) {
1186        gain.connect(bus.delayL);
1187        gain.connect(bus.convolver);
1188      }
1189
1190      const oscs = [osc1, osc2, osc3];
1191      oscs.forEach((osc) => osc.start(now));
1192
1193      return { oscs, filter, gain };
1194    }
1195  };
1196
1197  // Modulate ball voice on physical collision (scaled to 10% volume)
1198  const modulateBallSoundOnCollision = (ball: Ball) => {
1199    const ctx = audioCtxRef.current;
1200    if (!ctx) return;
1201    const now = ctx.currentTime;
1202    const { beta, gamma } = tiltRef.current;
1203
1204    const normBeta = Math.max(0, Math.min(1, (beta - 20) / 45));
1205    const normGamma = Math.max(0, Math.min(1, (gamma + 30) / 60));
1206
1207    if (ball.type === "void") {
1208      const targetFreq = 160 + normBeta * 2800;
1209      ball.voice.filter.frequency.setTargetAtTime(targetFreq, now, 0.04);
1210      ball.voice.filter.Q.setTargetAtTime(2.0 + normBeta * 3.5, now, 0.04);
1211
1212      const semitones = Math.round((normGamma - 0.5) * 8);
1213      ball.voice.oscs.forEach((osc) => {
1214        osc.detune.setTargetAtTime(semitones * 100, now, 0.03);
1215      });
1216
1217      // Subtle punchy envelope (stays at 10% scale)
1218      ball.voice.gain.gain.setTargetAtTime(0.065, now, 0.015);
1219      ball.voice.gain.gain.setTargetAtTime(0.042, now + 0.06, 0.12);
1220    } else {
1221      const targetFreq = 1200 + normBeta * 5500;
1222      ball.voice.filter.frequency.setTargetAtTime(targetFreq, now, 0.03);
1223
1224      const pentatonic = [1, 1.125, 1.25, 1.5, 1.667, 2, 2.25];
1225      const scaleIndex = Math.floor(normGamma * pentatonic.length) % pentatonic.length;
1226      const ratio = pentatonic[scaleIndex];
1227
1228      ball.voice.oscs[0].frequency.setTargetAtTime(392.0 * ratio, now, 0.03);
1229      if (ball.voice.oscs[1]) {
1230        ball.voice.oscs[1].frequency.setTargetAtTime(587.33 * ratio, now, 0.03);
1231      }
1232      if (ball.voice.oscs[2]) {
1233        ball.voice.oscs[2].frequency.setTargetAtTime(783.99 * ratio, now, 0.03);
1234      }
1235
1236      // Bell chime ping envelope (stays at 10% scale)
1237      ball.voice.gain.gain.setTargetAtTime(0.048, now, 0.015);
1238      ball.voice.gain.gain.setTargetAtTime(0.028, now + 0.06, 0.14);
1239    }
1240  };
1241
1242  // Spawn a new sonic bouncing ball originating from the pressed button
1243  const spawnBall = (type: "void" | "pulse") => {
1244    const ctx = getAudioContext();
1245    const btnEl = type === "void" ? voidBtnRef.current : pulseBtnRef.current;
1246    const rect = btnEl?.getBoundingClientRect();
1247
1248    // Spawn radially around button perimeter so balls never overlap at (0,0)
1249    const spreadAngle = Math.random() * Math.PI * 2;
1250    const spreadDist = 44 + Math.random() * 24;
1251    const centerX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
1252    const centerY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
1253
1254    const spawnX = Math.max(30, Math.min(window.innerWidth - 30, centerX + Math.cos(spreadAngle) * spreadDist));
1255    const spawnY = Math.max(30, Math.min(window.innerHeight - 30, centerY + Math.sin(spreadAngle) * spreadDist));
1256
1257    const launchAngle = spreadAngle + (Math.random() - 0.5) * 0.6;
1258    const speed = 4.5 + Math.random() * 4.5;
1259    const vx = Math.cos(launchAngle) * speed;
1260    const vy = Math.sin(launchAngle) * speed;
1261
1262    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
1263    const radius = 14; // Smaller, sleek sonic balls (28px diameter)
1264    const voice = createBallVoice(type, ctx);
1265
1266    const newBall: Ball = {
1267      id,
1268      type,
1269      x: spawnX,
1270      y: spawnY,
1271      vx,
1272      vy,
1273      radius,
1274      lastBounceTime: performance.now(),
1275      voice,
1276    };
1277
1278    ballsRef.current.push(newBall);
1279    setBalls((prev) => [...prev, { id, type, radius }]);
1280  };
1281
1282  // Destroy ball, stop its sound, and remove from simulation
1283  const destroyBall = (id: string) => {
1284    const idx = ballsRef.current.findIndex((b) => b.id === id);
1285    if (idx === -1) return;
1286    const ball = ballsRef.current[idx];
1287
1288    const ctx = audioCtxRef.current;
1289    if (ctx && ball.voice) {
1290      const now = ctx.currentTime;
1291      ball.voice.gain.gain.setTargetAtTime(0.0001, now, 0.02);
1292      setTimeout(() => {
1293        ball.voice.oscs.forEach((osc) => {
1294          try {
1295            osc.stop();
1296            osc.disconnect();
1297          } catch {}
1298        });
1299        try {
1300          ball.voice.filter.disconnect();
1301          ball.voice.gain.disconnect();
1302        } catch {}
1303      }, 60);
1304    }
1305
1306    ballsRef.current.splice(idx, 1);
1307    setBalls((prev) => prev.filter((b) => b.id !== id));
1308  };
1309
1310  // Create reverb impulse response
1311  const createImpulseResponse = (ctx: AudioContext, duration = 3.0, decay = 2.2): AudioBuffer => {
1312    const rate = ctx.sampleRate;
1313    const length = Math.floor(rate * duration);
1314    const buffer = ctx.createBuffer(2, length, rate);
1315    const left = buffer.getChannelData(0);
1316    const right = buffer.getChannelData(1);
1317    for (let i = 0; i < length; i++) {
1318      const factor = Math.exp((-i / rate) * decay);
1319      left[i] = (Math.random() * 2 - 1) * factor;
1320      right[i] = (Math.random() * 2 - 1) * factor;
1321    }
1322    return buffer;
1323  };
1324
1325  const getAudioContext = () => {
1326    if (!audioCtxRef.current) {
1327      const ctx = new AudioContext();
1328      audioCtxRef.current = ctx;
1329
1330      // Master output limiter/gain
1331      const masterGain = ctx.createGain();
1332      masterGain.gain.value = panicRef.current ? 0 : masterVolRef.current;
1333      masterGain.connect(ctx.destination);
1334      masterGainRef.current = masterGain;
1335
1336      // Master Analyser for background reactive visualizer (2048 points for ultra-detailed waveform)
1337      const mAnalyser = ctx.createAnalyser();
1338      mAnalyser.fftSize = 2048;
1339      mAnalyser.smoothingTimeConstant = 0.75;
1340      masterGain.connect(mAnalyser);
1341      masterAnalyserRef.current = mAnalyser;
1342
1343      // Stereo Reverb
1344      const convolver = ctx.createConvolver();
1345      convolver.buffer = createImpulseResponse(ctx);
1346      const reverbGain = ctx.createGain();
1347      reverbGain.gain.value = 0.45;
1348      convolver.connect(reverbGain);
1349      reverbGain.connect(masterGain);
1350
1351      // Stereo Ping-Pong Style Delay
1352      const delayL = ctx.createDelay();
1353      const delayR = ctx.createDelay();
1354      delayL.delayTime.value = 0.32;
1355      delayR.delayTime.value = 0.48;
1356
1357      const delayFeedback = ctx.createGain();
1358      delayFeedback.gain.value = 0.38;
1359
1360      const delayFilter = ctx.createBiquadFilter();
1361      delayFilter.type = "lowpass";
1362      delayFilter.frequency.value = 2800;
1363
1364      // Delay routing
1365      delayL.connect(delayR);
1366      delayR.connect(delayFilter);
1367      delayFilter.connect(delayFeedback);
1368      delayFeedback.connect(delayL);
1369
1370      const delayWet = ctx.createGain();
1371      delayWet.gain.value = 0.35;
1372      delayL.connect(delayWet);
1373      delayR.connect(delayWet);
1374      delayWet.connect(masterGain);
1375      delayWet.connect(convolver);
1376
1377      // Dedicated Channel Bus Gain Nodes for Crossfader
1378      const voidBus = ctx.createGain();
1379      voidBus.gain.value = 1.0;
1380      voidBus.connect(masterGain);
1381      voidBus.connect(convolver);
1382      voidBus.connect(delayL);
1383      voidBusGainRef.current = voidBus;
1384
1385      // Void Analyser for live waveform (1024 points for high detail)
1386      const vAnalyser = ctx.createAnalyser();
1387      vAnalyser.fftSize = 1024;
1388      vAnalyser.smoothingTimeConstant = 0.72;
1389      voidBus.connect(vAnalyser);
1390      voidAnalyserRef.current = vAnalyser;
1391
1392      const pulseBus = ctx.createGain();
1393      pulseBus.gain.value = 1.0;
1394      pulseBus.connect(masterGain);
1395      pulseBus.connect(convolver);
1396      pulseBus.connect(delayL);
1397      pulseBusGainRef.current = pulseBus;
1398
1399      // Pulse Analyser for live waveform (1024 points for high detail)
1400      const pAnalyser = ctx.createAnalyser();
1401      pAnalyser.fftSize = 1024;
1402      pAnalyser.smoothingTimeConstant = 0.72;
1403      pulseBus.connect(pAnalyser);
1404      pulseAnalyserRef.current = pAnalyser;
1405
1406      // Dedicated Drum Bus for the Catchy Beat
1407      const drumBus = ctx.createGain();
1408      drumBus.gain.value = 0.75;
1409      drumBus.connect(masterGain);
1410      const drumReverbSend = ctx.createGain();
1411      drumReverbSend.gain.value = 0.2;
1412      drumBus.connect(drumReverbSend);
1413      drumReverbSend.connect(convolver);
1414      drumGainRef.current = drumBus;
1415
1416      // Dedicated Scratch Bus (always audible during jog wheel scrubbing even when other tracks are stopped)
1417      const scratchBus = ctx.createGain();
1418      scratchBus.gain.value = 0.85;
1419      scratchBus.connect(masterGain);
1420      scratchBus.connect(convolver);
1421      scratchGainRef.current = scratchBus;
1422
1423      // Noise buffer for drum hits
1424      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
1425      const output = noiseBuffer.getChannelData(0);
1426      for (let i = 0; i < noiseBuffer.length; i++) {
1427        output[i] = Math.random() * 2 - 1;
1428      }
1429      noiseBufferRef.current = noiseBuffer;
1430
1431      masterBusRef.current = { convolver, delayL, delayR, delayFeedback };
1432
1433      // Apply initial crossfader state
1434      applyCrossfade(faderRef.current);
1435    }
1436
1437    if (audioCtxRef.current.state === "suspended") {
1438      audioCtxRef.current.resume();
1439    }
1440
1441    return audioCtxRef.current;
1442  };
1443
1444  // Apply crossfader gain to Void and Pulse channels
1445  const applyCrossfade = (pos: number) => {
1446    const ctx = audioCtxRef.current;
1447    if (!ctx) return;
1448    const now = ctx.currentTime;
1449
1450    let targetVoid = 1.0;
1451    let targetPulse = 1.0;
1452
1453    if (pos >= 0.5) {
1454      // Top half: Void increases (+35% boost), Pulse drops to 0 (stops)
1455      const t = (pos - 0.5) / 0.5; // 0 to 1
1456      targetVoid = 1.0 + t * 0.35;
1457      targetPulse = Math.max(0, 1.0 - t);
1458    } else {
1459      // Bottom half: Pulse increases (+35% boost), Void drops to 0 (stops)
1460      const t = (0.5 - pos) / 0.5; // 0 to 1
1461      targetPulse = 1.0 + t * 0.35;
1462      targetVoid = Math.max(0, 1.0 - t);
1463    }
1464
1465    if (voidBusGainRef.current) {
1466      voidBusGainRef.current.gain.setTargetAtTime(targetVoid, now, 0.015);
1467    }
1468    if (pulseBusGainRef.current) {
1469      pulseBusGainRef.current.gain.setTargetAtTime(targetPulse, now, 0.015);
1470    }
1471
1472    // Export crossfader position via MIDI (CC 8 Balance)
1473    sendMidiCc(1, 8, Math.round(pos * 127));
1474  };
1475
1476  const updateFaderFromPointer = (clientY: number) => {
1477    if (!trackRef.current) return;
1478    const rect = trackRef.current.getBoundingClientRect();
1479    const relativeY = clientY - rect.top;
1480    let normalized = 1 - relativeY / rect.height; // 1 at top, 0 at bottom
1481    normalized = Math.max(0, Math.min(1, normalized));
1482
1483    // Center detent snapping
1484    if (Math.abs(normalized - 0.5) < 0.04) {
1485      normalized = 0.5;
1486    }
1487
1488    faderRef.current = normalized;
1489    setFaderPos(normalized);
1490    getAudioContext();
1491    applyCrossfade(normalized);
1492  };
1493
1494  const handleFaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
1495    ensureGameStarted();
1496    try {
1497      e.currentTarget.setPointerCapture(e.pointerId);
1498    } catch {}
1499    updateFaderFromPointer(e.clientY);
1500  };
1501
1502  const handleFaderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
1503    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
1504    updateFaderFromPointer(e.clientY);
1505  };
1506
1507  const handleFaderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
1508    try {
1509      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
1510        e.currentTarget.releasePointerCapture(e.pointerId);
1511      }
1512    } catch {}
1513  };
1514
1515  // 8-BIT RETRO VIDEO GAME CHIPTUNE SYNTHESIS
1516  const playKick = (ctx: AudioContext, time: number) => {
1517    const drumBus = drumGainRef.current;
1518    if (!drumBus) return;
1519    const osc = ctx.createOscillator();
1520    osc.type = "triangle"; // NES triangle punch
1521    const gain = ctx.createGain();
1522    osc.frequency.setValueAtTime(190, time);
1523    osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);
1524    gain.gain.setValueAtTime(0.85, time);
1525    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
1526    osc.connect(gain);
1527    gain.connect(drumBus);
1528    osc.start(time);
1529    osc.stop(time + 0.16);
1530  };
1531
1532  const playSnare = (ctx: AudioContext, time: number) => {
1533    const drumBus = drumGainRef.current;
1534    const noiseBuffer = noiseBufferRef.current;
1535    if (!drumBus || !noiseBuffer) return;
1536
1537    // Noise snap
1538    const noiseSource = ctx.createBufferSource();
1539    noiseSource.buffer = noiseBuffer;
1540    const filter = ctx.createBiquadFilter();
1541    filter.type = "highpass";
1542    filter.frequency.value = 1200;
1543    const noiseGain = ctx.createGain();
1544    noiseGain.gain.setValueAtTime(0.48, time);
1545    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.17);
1546    noiseSource.connect(filter);
1547    filter.connect(noiseGain);
1548    noiseGain.connect(drumBus);
1549    noiseSource.start(time);
1550    noiseSource.stop(time + 0.18);
1551
1552    // Body tone
1553    const osc = ctx.createOscillator();
1554    const oscGain = ctx.createGain();
1555    osc.frequency.setValueAtTime(190, time);
1556    osc.frequency.exponentialRampToValueAtTime(80, time + 0.11);
1557    oscGain.gain.setValueAtTime(0.35, time);
1558    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.13);
1559    osc.connect(oscGain);
1560    oscGain.connect(drumBus);
1561    osc.start(time);
1562    osc.stop(time + 0.15);
1563  };
1564
1565  const playHat = (ctx: AudioContext, time: number, open: boolean, vol = 0.22) => {
1566    const drumBus = drumGainRef.current;
1567    const noiseBuffer = noiseBufferRef.current;
1568    if (!drumBus || !noiseBuffer) return;
1569
1570    const source = ctx.createBufferSource();
1571    source.buffer = noiseBuffer;
1572    const filter = ctx.createBiquadFilter();
1573    filter.type = "bandpass";
1574    filter.frequency.value = 9200;
1575    filter.Q.value = 2.0;
1576
1577    const gain = ctx.createGain();
1578    gain.gain.setValueAtTime(vol, time);
1579    gain.gain.exponentialRampToValueAtTime(0.001, time + (open ? 0.2 : 0.045));
1580
1581    source.connect(filter);
1582    filter.connect(gain);
1583    gain.connect(drumBus);
1584    source.start(time);
1585    source.stop(time + (open ? 0.22 : 0.05));
1586  };
1587
1588  const playClap = (ctx: AudioContext, time: number) => {
1589    const drumBus = drumGainRef.current;
1590    const noiseBuffer = noiseBufferRef.current;
1591    if (!drumBus || !noiseBuffer) return;
1592
1593    // Multi-burst analog clap
1594    [0, 0.012, 0.024].forEach((offset, idx) => {
1595      const source = ctx.createBufferSource();
1596      source.buffer = noiseBuffer;
1597      const filter = ctx.createBiquadFilter();
1598      filter.type = "bandpass";
1599      filter.frequency.value = 1400;
1600      filter.Q.value = 2.2;
1601      const gain = ctx.createGain();
1602      const isFinal = idx === 2;
1603      gain.gain.setValueAtTime(isFinal ? 0.42 : 0.22, time + offset);
1604      gain.gain.exponentialRampToValueAtTime(0.001, time + offset + (isFinal ? 0.18 : 0.03));
1605      source.connect(filter);
1606      filter.connect(gain);
1607      gain.connect(drumBus);
1608      source.start(time + offset);
1609      source.stop(time + offset + 0.2);
1610    });
1611  };
1612
1613  const playPerc = (ctx: AudioContext, time: number) => {
1614    const drumBus = drumGainRef.current;
1615    if (!drumBus) return;
1616    const osc = ctx.createOscillator();
1617    const gain = ctx.createGain();
1618    osc.frequency.setValueAtTime(820, time);
1619    osc.frequency.exponentialRampToValueAtTime(320, time + 0.05);
1620    gain.gain.setValueAtTime(0.25, time);
1621    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
1622    osc.connect(gain);
1623    gain.connect(drumBus);
1624    osc.start(time);
1625    osc.stop(time + 0.07);
1626  };
1627
1628  const playBass = (
1629    ctx: AudioContext,
1630    time: number,
1631    freq: number,
1632    dur: number,
1633    accent = false
1634  ) => {
1635    const drumBus = drumGainRef.current;
1636    if (!drumBus) return;
1637
1638    const osc1 = ctx.createOscillator();
1639    osc1.type = "triangle"; // Authentic NES 8-bit triangle bass
1640    osc1.frequency.setValueAtTime(freq, time);
1641
1642    const osc2 = ctx.createOscillator();
1643    osc2.type = "square";
1644    osc2.frequency.setValueAtTime(freq * 0.5, time); // Sub-octave square for low-end weight
1645
1646    const filter = ctx.createBiquadFilter();
1647    filter.type = "lowpass";
1648    const startFreq = accent ? 2200 : 1500;
1649    filter.frequency.setValueAtTime(startFreq, time);
1650    filter.frequency.exponentialRampToValueAtTime(140, time + dur * 0.85);
1651    filter.Q.value = accent ? 4.2 : 3.0;
1652
1653    const gain = ctx.createGain();
1654    const vol = accent ? 0.38 : 0.28;
1655    gain.gain.setValueAtTime(0.0001, time);
1656    gain.gain.linearRampToValueAtTime(vol, time + 0.008);
1657    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
1658
1659    const subGain = ctx.createGain();
1660    subGain.gain.value = 0.5;
1661    osc2.connect(subGain);
1662    subGain.connect(filter);
1663    osc1.connect(filter);
1664    filter.connect(gain);
1665    gain.connect(drumBus);
1666
1667    osc1.start(time);
1668    osc2.start(time);
1669    osc1.stop(time + dur + 0.05);
1670    osc2.stop(time + dur + 0.05);
1671  };
1672
1673  const scheduleBeat = () => {
1674    const ctx = audioCtxRef.current;
1675    if (!ctx || !beatActiveRef.current || jogActiveRef.current) return;
1676
1677    // Check 1-minute melody pattern evolution
1678    const elapsedSec = (performance.now() - beatStartTimeRef.current) / 1000;
1679    const patternIdx = Math.floor(elapsedSec / 60) % 4;
1680    currentPatternIdxRef.current = patternIdx;
1681
1682    while (nextNoteTimeRef.current < ctx.currentTime + 0.15) {
1683      const step = currentStepRef.current;
1684      const t = nextNoteTimeRef.current;
1685      const stepDur = 60 / bpmRef.current / 4;
1686
1687      // 4 DISTINCT MUSICAL STYLES EVOLVING EVERY MINUTE (60s)
1688      if (patternIdx === 0) {
1689        // MINUTE 1: ELECTRO-FUNK (Driving, bouncy, slap octave bass)
1690        if (step === 0 || step === 7 || step === 10) playKick(ctx, t);
1691        if (step === 4 || step === 12) {
1692          playSnare(ctx, t);
1693          playClap(ctx, t);
1694        }
1695        if (step === 3 || step === 9 || step === 13) playPerc(ctx, t);
1696        if (step % 2 === 0) playHat(ctx, t, step === 14, step === 0 || step === 8 ? 0.3 : 0.2);
1697        else playHat(ctx, t, false, 0.12);
1698
1699        const bass0: { [k: number]: { freq: number; dur: number; acc: boolean } } = {
1700          0: { freq: 65.41, dur: 0.95, acc: true },   // C2
1701          2: { freq: 65.41, dur: 0.85, acc: false },
1702          4: { freq: 130.81, dur: 0.95, acc: true },  // C3 slap
1703          6: { freq: 65.41, dur: 0.85, acc: false },
1704          7: { freq: 77.78, dur: 0.90, acc: true },   // Eb2
1705          8: { freq: 65.41, dur: 0.95, acc: false },
1706          10: { freq: 98.0, dur: 0.90, acc: true },   // G2
1707          11: { freq: 98.0, dur: 0.80, acc: false },
1708          12: { freq: 130.81, dur: 0.95, acc: true }, // C3
1709          14: { freq: 116.54, dur: 0.90, acc: true }, // Bb2
1710          15: { freq: 65.41, dur: 0.85, acc: false },
1711        };
1712        if (bass0[step]) playBass(ctx, t, bass0[step].freq, stepDur * bass0[step].dur, bass0[step].acc);
1713      } else if (patternIdx === 1) {
1714        // MINUTE 2: CYBERPUNK / SYNTHWAVE (Dark rolling 16th bass, double kicks, open sizzle)
1715        if (step === 0 || step === 3 || step === 8 || step === 11) playKick(ctx, t);
1716        if (step === 4 || step === 12) {
1717          playSnare(ctx, t);
1718          playClap(ctx, t);
1719        }
1720        if (step === 14) playSnare(ctx, t);
1721        if (step % 2 === 0) playHat(ctx, t, true, 0.24); // Constant open hat sizzle
1722        else playHat(ctx, t, false, 0.15);
1723
1724        const bass1: { [k: number]: { freq: number; dur: number; acc: boolean } } = {
1725          0: { freq: 87.31, dur: 0.95, acc: true },   // F2
1726          1: { freq: 87.31, dur: 0.75, acc: false },
1727          2: { freq: 87.31, dur: 0.85, acc: false },
1728          3: { freq: 87.31, dur: 0.75, acc: false },
1729          4: { freq: 130.81, dur: 0.95, acc: true },  // C3
1730          6: { freq: 103.83, dur: 0.90, acc: true },  // Ab2
1731          8: { freq: 87.31, dur: 0.95, acc: true },
1732          10: { freq: 98.0, dur: 0.90, acc: true },   // G2
1733          12: { freq: 130.81, dur: 0.95, acc: true }, // C3
1734          14: { freq: 77.78, dur: 0.90, acc: true },  // Eb2
1735          15: { freq: 87.31, dur: 0.80, acc: false },
1736        };
1737        if (bass1[step]) playBass(ctx, t, bass1[step].freq, stepDur * bass1[step].dur, bass1[step].acc);
1738      } else if (patternIdx === 2) {
1739        // MINUTE 3: ACID TECH-HOUSE (4-on-the-floor, offbeat open hats, acid G-minor walk)
1740        if (step === 0 || step === 4 || step === 8 || step === 12) playKick(ctx, t);
1741        if (step === 4 || step === 12) playClap(ctx, t);
1742        if (step === 1 || step === 7 || step === 11) playPerc(ctx, t);
1743        if (step === 2 || step === 6 || step === 10 || step === 14) playHat(ctx, t, true, 0.32);
1744        else playHat(ctx, t, false, 0.1);
1745
1746        const bass2: { [k: number]: { freq: number; dur: number; acc: boolean } } = {
1747          0: { freq: 98.0, dur: 0.95, acc: true },    // G2
1748          2: { freq: 98.0, dur: 0.80, acc: false },
1749          3: { freq: 116.54, dur: 0.90, acc: true },  // Bb2
1750          4: { freq: 98.0, dur: 0.90, acc: false },
1751          6: { freq: 146.83, dur: 0.95, acc: true },  // D3
1752          8: { freq: 98.0, dur: 0.95, acc: true },
1753          10: { freq: 87.31, dur: 0.90, acc: true },  // F2
1754          12: { freq: 98.0, dur: 0.90, acc: false },
1755          14: { freq: 130.81, dur: 0.95, acc: true }, // C3
1756          15: { freq: 116.54, dur: 0.85, acc: false },
1757        };
1758        if (bass2[step]) playBass(ctx, t, bass2[step].freq, stepDur * bass2[step].dur, bass2[step].acc);
1759      } else {
1760        // MINUTE 4: LIQUID BREAKBEAT (Syncopated break kicks, ghost snare rolls, melodic Eb walk)
1761        if (step === 0 || step === 6 || step === 10) playKick(ctx, t);
1762        if (step === 4 || step === 12) {
1763          playSnare(ctx, t);
1764          playClap(ctx, t);
1765        }
1766        if (step === 15) playSnare(ctx, t); // Ghost break snare
1767        if (step === 2 || step === 8 || step === 13) playPerc(ctx, t);
1768        if (step % 2 === 0) playHat(ctx, t, step === 10, 0.22);
1769        else playHat(ctx, t, false, 0.14);
1770
1771        const bass3: { [k: number]: { freq: number; dur: number; acc: boolean } } = {
1772          0: { freq: 77.78, dur: 0.95, acc: true },   // Eb2
1773          2: { freq: 98.0, dur: 0.85, acc: false },   // G2
1774          4: { freq: 116.54, dur: 0.95, acc: true },  // Bb2
1775          6: { freq: 130.81, dur: 0.90, acc: true },  // C3
1776          8: { freq: 116.54, dur: 0.95, acc: false }, // Bb2
1777          10: { freq: 98.0, dur: 0.90, acc: true },   // G2
1778          12: { freq: 87.31, dur: 0.95, acc: true },  // F2
1779          14: { freq: 77.78, dur: 0.90, acc: false }, // Eb2
1780          15: { freq: 65.41, dur: 0.85, acc: true },  // C2
1781        };
1782        if (bass3[step]) playBass(ctx, t, bass3[step].freq, stepDur * bass3[step].dur, bass3[step].acc);
1783      }
1784
1785      nextNoteTimeRef.current += stepDur;
1786      currentStepRef.current = (currentStepRef.current + 1) % 16;
1787    }
1788  };
1789
1790  const toggleBeat = () => {
1791    ensureGameStarted();
1792    const ctx = getAudioContext();
1793    const nextState = !beatActiveRef.current;
1794    beatActiveRef.current = nextState;
1795    setBeatOn(nextState);
1796
1797    if (nextState) {
1798      currentStepRef.current = 0;
1799      beatStartTimeRef.current = performance.now();
1800      nextNoteTimeRef.current = ctx.currentTime + 0.02;
1801      if (beatTimerRef.current) clearInterval(beatTimerRef.current);
1802      beatTimerRef.current = window.setInterval(scheduleBeat, 25);
1803
1804      // 1-second UI updater for 8-bit retro stages
1805      const patternNames = [
1806        "STAGE 1: 8-BIT OVERWORLD",
1807        "STAGE 2: RETRO DUNGEON",
1808        "STAGE 3: 8-BIT CYBER CASTLE",
1809        "STAGE 4: BOSS BATTLE 8-BIT",
1810      ];
1811      if (beatClockIntervalRef.current) clearInterval(beatClockIntervalRef.current);
1812      beatClockIntervalRef.current = window.setInterval(() => {
1813        const elapsed = (performance.now() - beatStartTimeRef.current) / 1000;
1814        const pIdx = Math.floor(elapsed / 60) % 4;
1815        const secInCycle = Math.floor(elapsed) % 60;
1816        const secLeft = 60 - secInCycle;
1817        setPatternDisplay({
1818          name: patternNames[pIdx],
1819          secLeft,
1820          progress: (secInCycle / 60) * 100,
1821        });
1822      }, 500);
1823    } else {
1824      if (beatTimerRef.current) {
1825        clearInterval(beatTimerRef.current);
1826        beatTimerRef.current = null;
1827      }
1828      if (beatClockIntervalRef.current) {
1829        clearInterval(beatClockIntervalRef.current);
1830        beatClockIntervalRef.current = null;
1831      }
1832    }
1833  };
1834  const updateAudioFromTilt = (beta: number, gamma: number) => {
1835    const ctx = audioCtxRef.current;
1836    if (!ctx) return;
1837    const now = ctx.currentTime;
1838
1839    // DYNAMIC BPM SYNC TO ROLL (GAMMA)
1840    // gamma ranges roughly -35° to +35°:
1841    // -35° -> ~70 BPM (slow hip-hop/downtempo), 0° -> 110 BPM (groove), +35° -> ~152 BPM (techno/drum&bass)
1842    const normRollBpm = Math.max(-1, Math.min(1, gamma / 35));
1843    const liveBpm = Math.round(110 + normRollBpm * 42); // 68 BPM to 152 BPM
1844    bpmRef.current = liveBpm;
1845
1846    if (bpmDisplayRef.current) {
1847      bpmDisplayRef.current.innerText = `${liveBpm} BPM`;
1848    }
1849
1850    // Tightened, highly responsive tilt ranges:
1851    // Beta: 20° to 65° sweeps the full frequency spectrum
1852    const normBeta = Math.max(0, Math.min(1, (beta - 20) / 45));
1853    // Gamma: -30° to +30° sweeps full stereo width and swell
1854    const normGamma = Math.max(0, Math.min(1, (gamma + 30) / 60));
1855
1856    // Update active VOID voice
1857    if (voidVoiceRef.current) {
1858      const { filter, bloomGain, subGain, oscs } = voidVoiceRef.current;
1859
1860      // Heavy filter sweep: from deep 90Hz sub rumble up to a screaming 3400Hz resonant peak
1861      const targetFreq = 90 + Math.pow(normBeta, 1.8) * 3310;
1862      filter.frequency.setTargetAtTime(targetFreq, now, 0.03);
1863      // High resonance (Q from 1.5 up to 6.2) for aggressive vowel-like bite
1864      filter.Q.setTargetAtTime(1.5 + normBeta * 4.7, now, 0.03);
1865
1866      // Sub-bass boost when tilted back (earthquake sub), backing off when tilted forward
1867      const targetSub = 0.8 + (1 - normBeta) * 0.9;
1868      subGain.gain.setTargetAtTime(targetSub, now, 0.03);
1869
1870      // Roll controls massive ambient bloom gain + deep detune spread
1871      const targetBloom = 0.02 + normGamma * 0.65;
1872      bloomGain.gain.setTargetAtTime(targetBloom, now, 0.03);
1873
1874      // Pitch sag on back tilt (heavy drop feeling)
1875      const pitchBendCents = (normBeta - 0.5) * 120; // +/- 1 semitone pitch bend
1876      oscs.forEach((osc) => {
1877        osc.detune.setTargetAtTime(pitchBendCents, now, 0.03);
1878      });
1879    }
1880
1881    // Update active PULSE voice
1882    if (pulseVoiceRef.current) {
1883      const { filter, lfoGains, oscs } = pulseVoiceRef.current;
1884      // Massive filter sweep from dark 400Hz up to 8800Hz searing shimmer
1885      const targetPulseFreq = 400 + Math.pow(normBeta, 1.5) * 8400;
1886      filter.frequency.setTargetAtTime(targetPulseFreq, now, 0.03);
1887      filter.Q.setTargetAtTime(1.2 + normBeta * 3.8, now, 0.03);
1888
1889      // Heavy shimmer detune depth (up to 32 cents wide)
1890      const targetDetune = 3.0 + normBeta * 29.0;
1891      lfoGains.forEach((g) => {
1892        g.gain.setTargetAtTime(targetDetune, now, 0.03);
1893      });
1894
1895      // Pitch modulation from roll
1896      const pulseBendCents = (normGamma - 0.5) * 80;
1897      oscs.forEach((osc) => {
1898        osc.detune.setTargetAtTime(pulseBendCents, now, 0.03);
1899      });
1900    }
1901
1902    // Master Delay Feedback: Tilting right pushes into near-infinite dub delay feedback
1903    if (masterBusRef.current) {
1904      const targetFeedback = 0.15 + normGamma * 0.68;
1905      masterBusRef.current.delayFeedback.gain.setTargetAtTime(targetFeedback, now, 0.03);
1906    }
1907
1908    // Export tilt commands over Bluetooth MIDI
1909    sendGyroMidi(beta, gamma, 0);
1910  };
1911
1912  const handleOrientation = (e: DeviceOrientationEvent) => {
1913    if (e.beta === null && e.gamma === null) return;
1914    const beta = e.beta ?? 45;
1915    const gamma = e.gamma ?? 0;
1916    const alpha = e.alpha ?? 0;
1917    tiltRef.current = { beta, gamma };
1918
1919    // ROTARY VOLUME CONTROL via Alpha (Device Heading / Screen plane rotation)
1920    // Clockwise rotation increases volume, Counter-Clockwise decreases
1921    if (lastAlphaRef.current !== null && !panicRef.current) {
1922      let deltaAlpha = alpha - lastAlphaRef.current;
1923      // Handle 0° / 360° boundary
1924      if (deltaAlpha > 180) deltaAlpha -= 360;
1925      if (deltaAlpha < -180) deltaAlpha += 360;
1926
1927      // When rotating phone clockwise in your hands, alpha delta tracks turning speed
1928      if (Math.abs(deltaAlpha) > 0.4 && Math.abs(deltaAlpha) < 35) {
1929        // Clockwise = increase volume (+), Counter-Clockwise = decrease (-)
1930        const volStep = (-deltaAlpha / 15) * 0.04;
1931        adjustMasterVolume(volStep);
1932      }
1933    }
1934    lastAlphaRef.current = alpha;
1935
1936    // Apply directly to Web Audio with instantaneous reaction
1937    updateAudioFromTilt(beta, gamma);
1938
1939    // Export gyroscope orientation commands via Bluetooth MIDI
1940    sendGyroMidi(beta, gamma, alpha);
1941
1942    // Dynamic 3D tilt of the instrument container for tactile weight
1943    if (instrumentRef.current) {
1944      const rotX = Math.max(-15, Math.min(15, (45 - beta) * 0.5));
1945      const rotY = Math.max(-15, Math.min(15, gamma * 0.5));
1946      instrumentRef.current.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
1947    }
1948
1949    // Update visual readout directly on DOM without triggering 60fps React re-renders
1950    if (tiltDisplayRef.current) {
1951      const normBeta = Math.round(Math.max(0, Math.min(100, ((beta - 20) / 45) * 100)));
1952      const normGamma = Math.round(Math.max(0, Math.min(100, ((gamma + 30) / 60) * 100)));
1953      tiltDisplayRef.current.innerText = `PITCH ${normBeta}% (${Math.round(beta)}°) | ROLL ${normGamma}% (${Math.round(gamma)}°)`;
1954    }
1955  };
1956
1957  const enableGyroscope = async () => {
1958    ensureGameStarted();
1959    getAudioContext();
1960    if (
1961      typeof window !== "undefined" &&
1962      "DeviceOrientationEvent" in window &&
1963      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function"
1964    ) {
1965      try {
1966        const response = await (
1967          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
1968        ).requestPermission();
1969        if (response === "granted") {
1970          window.addEventListener("deviceorientation", handleOrientation);
1971          setGyroActive(true);
1972        }
1973      } catch (err) {
1974        console.warn("DeviceOrientation error:", err);
1975      }
1976    } else if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
1977      window.addEventListener("deviceorientation", handleOrientation);
1978      setGyroActive(true);
1979    }
1980  };
1981
1982  const toggleButton = (index: number) => {
1983    ensureGameStarted();
1984    if (index === 0) {
1985      setVoidOn((prev) => {
1986        const next = !prev;
1987        if (next) {
1988          startVoid();
1989          sendMidiNote(1, 36, 100); // VOID Note On C2
1990        } else {
1991          stopVoid();
1992          sendMidiNote(1, 36, 0); // VOID Note Off
1993        }
1994        return next;
1995      });
1996      // Spawn new VOID ball on press
1997      spawnBall("void");
1998    } else {
1999      setPulseOn((prev) => {
2000        const next = !prev;
2001        if (next) {
2002          startPulse();
2003          sendMidiNote(1, 67, 100); // PULSE Note On G4
2004        } else {
2005          stopPulse();
2006          sendMidiNote(1, 67, 0); // PULSE Note Off
2007        }
2008        return next;
2009      });
2010      // Spawn new PULSE ball on press
2011      spawnBall("pulse");
2012    }
2013  };
2014
2015  useEffect(() => {
2016    const handleKeyDown = (e: KeyboardEvent) => {
2017      if (e.repeat) return;
2018      if (e.key === "Escape") {
2019        e.preventDefault();
2020        if (showHelp) {
2021          setShowHelp(false);
2022        } else {
2023          togglePanic();
2024        }
2025      } else if (e.key.toLowerCase() === "m") {
2026        e.preventDefault();
2027        togglePanic();
2028      } else if (e.key === "?" || e.key.toLowerCase() === "h") {
2029        e.preventDefault();
2030        setShowHelp((prev) => !prev);
2031      } else if (e.key === "b" || e.key === " ") {
2032        e.preventDefault();
2033        toggleBeat();
2034      } else if (e.key === "1" || e.key.toLowerCase() === "v") {
2035        toggleButton(0);
2036      } else if (e.key === "2" || e.key.toLowerCase() === "p") {
2037        toggleButton(1);
2038      } else if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
2039        const next = Math.min(1, Math.round((faderRef.current + 0.1) * 10) / 10);
2040        faderRef.current = next;
2041        setFaderPos(next);
2042        applyCrossfade(next);
2043      } else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
2044        const next = Math.max(0, Math.round((faderRef.current - 0.1) * 10) / 10);
2045        faderRef.current = next;
2046        setFaderPos(next);
2047        applyCrossfade(next);
2048      } else if (e.key.toLowerCase() === "c") {
2049        faderRef.current = 0.5;
2050        setFaderPos(0.5);
2051        applyCrossfade(0.5);
2052      }
2053    };
2054
2055    window.addEventListener("keydown", handleKeyDown);
2056
2057    // Mouse Wheel listener for Desktop Jog Wheel Scrub
2058    const handleWheel = (e: WheelEvent) => {
2059      e.preventDefault();
2060      const delta = -e.deltaY * 0.14;
2061      applyJogScrub(delta);
2062    };
2063    window.addEventListener("wheel", handleWheel, { passive: false });
2064
2065    // Touch gesture listeners for 2-finger Jog Wheel on mobile
2066    const handleTouchStart = (e: TouchEvent) => {
2067      if (e.touches.length === 2) {
2068        e.preventDefault();
2069        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
2070        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
2071        lastTouchMidRef.current = { x: midX, y: midY };
2072        startJogMode();
2073      }
2074    };
2075
2076    const handleTouchMove = (e: TouchEvent) => {
2077      if (e.touches.length === 2 && lastTouchMidRef.current) {
2078        e.preventDefault();
2079        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
2080        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
2081        const dx = midX - lastTouchMidRef.current.x;
2082        const dy = midY - lastTouchMidRef.current.y;
2083        const delta = (dx - dy) * 0.32;
2084        applyJogScrub(delta);
2085        lastTouchMidRef.current = { x: midX, y: midY };
2086      }
2087    };
2088
2089    const handleTouchEnd = (e: TouchEvent) => {
2090      if (e.touches.length < 2) {
2091        lastTouchMidRef.current = null;
2092        stopJogMode();
2093      }
2094    };
2095
2096    window.addEventListener("touchstart", handleTouchStart, { passive: false });
2097    window.addEventListener("touchmove", handleTouchMove, { passive: false });
2098    window.addEventListener("touchend", handleTouchEnd, { passive: false });
2099    window.addEventListener("touchcancel", handleTouchEnd, { passive: false });
2100
2101    // Device motion listener: Rotation Rate around screen axis adjusts volume (Clockwise = increase)
2102    const handleDeviceMotion = (e: DeviceMotionEvent) => {
2103      if (panicRef.current) return;
2104      if (e.rotationRate) {
2105        // Rotational angular velocity around normal/screen axis (deg/sec)
2106        const rotZ = e.rotationRate.alpha ?? e.rotationRate.gamma ?? 0;
2107        if (Math.abs(rotZ) > 8) {
2108          // Clockwise rotation produces positive rate -> increase volume
2109          const delta = (rotZ / 100) * 0.022;
2110          adjustMasterVolume(delta);
2111        }
2112      }
2113    };
2114    window.addEventListener("devicemotion", handleDeviceMotion);
2115
2116    // Desktop mouse & touch pointer tracking for physical interaction with balls
2117    const handlePointerMove = (e: PointerEvent) => {
2118      const now = performance.now();
2119      if (pointerPosRef.current) {
2120        const dt = Math.max(1, now - pointerPosRef.current.lastTime);
2121        const vx = ((e.clientX - pointerPosRef.current.x) / dt) * 16;
2122        const vy = ((e.clientY - pointerPosRef.current.y) / dt) * 16;
2123        pointerPosRef.current = {
2124          x: e.clientX,
2125          y: e.clientY,
2126          active: true,
2127          vx: Math.max(-20, Math.min(20, vx)),
2128          vy: Math.max(-20, Math.min(20, vy)),
2129          lastTime: now,
2130        };
2131      } else {
2132        pointerPosRef.current = {
2133          x: e.clientX,
2134          y: e.clientY,
2135          active: true,
2136          vx: 0,
2137          vy: 0,
2138          lastTime: now,
2139        };
2140      }
2141
2142      if (gyroActive) return;
2143      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
2144      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
2145      const simBeta = 42 + normY * 25;
2146      const simGamma = normX * 30;
2147      tiltRef.current = { beta: simBeta, gamma: simGamma };
2148      updateAudioFromTilt(simBeta, simGamma);
2149    };
2150
2151    const handlePointerUpGlobal = () => {
2152      if (pointerPosRef.current) {
2153        pointerPosRef.current.active = false;
2154      }
2155    };
2156
2157    window.addEventListener("pointermove", handlePointerMove);
2158    window.addEventListener("pointerup", handlePointerUpGlobal);
2159    window.addEventListener("pointercancel", handlePointerUpGlobal);
2160
2161    return () => {
2162      window.removeEventListener("keydown", handleKeyDown);
2163      window.removeEventListener("devicemotion", handleDeviceMotion);
2164      window.removeEventListener("wheel", handleWheel);
2165      window.removeEventListener("touchstart", handleTouchStart);
2166      window.removeEventListener("touchmove", handleTouchMove);
2167      window.removeEventListener("touchend", handleTouchEnd);
2168      window.removeEventListener("touchcancel", handleTouchEnd);
2169      window.removeEventListener("pointermove", handlePointerMove);
2170      window.removeEventListener("pointerup", handlePointerUpGlobal);
2171      window.removeEventListener("pointercancel", handlePointerUpGlobal);
2172      window.removeEventListener("deviceorientation", handleOrientation);
2173      // Clean up all active ball audio nodes
2174      ballsRef.current.forEach((b) => {
2175        try {
2176          b.voice.oscs.forEach((osc) => osc.stop());
2177          b.voice.filter.disconnect();
2178          b.voice.gain.disconnect();
2179        } catch {}
2180      });
2181      ballsRef.current = [];
2182      if (beatTimerRef.current) {
2183        clearInterval(beatTimerRef.current);
2184      }
2185      if (audioCtxRef.current) {
2186        audioCtxRef.current.close();
2187      }
2188    };
2189  }, []);
2190
2191  // VISIT COUNTER (PERSISTENT) & LIVE CONNECTED USERS SIMULATOR
2192  useEffect(() => {
2193    try {
2194      const stored = localStorage.getItem("duotone_total_visits");
2195      let count = stored ? parseInt(stored, 10) : 1284;
2196      if (isNaN(count)) count = 1284;
2197      count += 1;
2198      localStorage.setItem("duotone_total_visits", count.toString());
2199      setVisitsCount(count);
2200    } catch {
2201      setVisitsCount(1285);
2202    }
2203
2204    // Dynamic live connected users with subtle organic fluctuations
2205    const baseActive = 12;
2206    const interval = window.setInterval(() => {
2207      const drift = Math.floor(Math.sin(Date.now() / 28000) * 4) + Math.floor(Math.random() * 3) - 1;
2208      setActiveUsersCount(Math.max(6, baseActive + drift));
2209    }, 14000);
2210
2211    return () => clearInterval(interval);
2212  }, []);
2213
2214  // REAL-TIME OSCILLOSCOPE WAVEFORM ANIMATION LOOP (60 FPS, Zero React State Re-renders)
2215  useEffect(() => {
2216    let animId: number;
2217
2218    const drawWave = (
2219      canvas: HTMLCanvasElement,
2220      analyser: AnalyserNode | null,
2221      strokeColor: string,
2222      glowColor: string,
2223      isActive: boolean,
2224      angleRad = 0
2225    ) => {
2226      const ctx = canvas.getContext("2d");
2227      if (!ctx) return;
2228      const dpr = window.devicePixelRatio || 1;
2229      const width = canvas.clientWidth;
2230      const height = canvas.clientHeight;
2231      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
2232        canvas.width = width * dpr;
2233        canvas.height = height * dpr;
2234      }
2235
2236      ctx.save();
2237      ctx.scale(dpr, dpr);
2238      ctx.clearRect(0, 0, width, height);
2239
2240      const cx = width / 2;
2241      const cy = height / 2;
2242      ctx.translate(cx, cy);
2243      ctx.rotate(angleRad);
2244
2245      const waveSpan = width * 0.92;
2246      const startX = -waveSpan / 2;
2247
2248      if (!analyser || !isActive) {
2249        // Resting baseline along rotated axis
2250        ctx.beginPath();
2251        ctx.moveTo(startX * 0.65, 0);
2252        ctx.lineTo(-startX * 0.65, 0);
2253        ctx.strokeStyle = strokeColor;
2254        ctx.globalAlpha = 0.3;
2255        ctx.lineWidth = 2;
2256        ctx.stroke();
2257        ctx.restore();
2258        return;
2259      }
2260
2261      const bufferLength = analyser.frequencyBinCount;
2262      const dataArray = new Uint8Array(bufferLength);
2263      analyser.getByteTimeDomainData(dataArray);
2264
2265      // Outer glow trace
2266      ctx.beginPath();
2267      ctx.lineWidth = 3.5;
2268      ctx.strokeStyle = strokeColor;
2269      ctx.shadowColor = glowColor;
2270      ctx.shadowBlur = 16;
2271
2272      const sliceWidth = waveSpan / bufferLength;
2273      const amp = height * 0.46;
2274
2275      for (let i = 0; i < bufferLength; i++) {
2276        const v = (dataArray[i] - 128) / 128.0;
2277        const x = startX + i * sliceWidth;
2278        const y = v * amp;
2279        if (i === 0) ctx.moveTo(x, y);
2280        else ctx.lineTo(x, y);
2281      }
2282      ctx.stroke();
2283
2284      // Sharp crisp core beam
2285      ctx.beginPath();
2286      ctx.lineWidth = 1.2;
2287      ctx.strokeStyle = "#ffffff";
2288      ctx.shadowBlur = 0;
2289      for (let i = 0; i < bufferLength; i += 2) {
2290        const v = (dataArray[i] - 128) / 128.0;
2291        const x = startX + i * sliceWidth;
2292        const y = v * amp;
2293        if (i === 0) ctx.moveTo(x, y);
2294        else ctx.lineTo(x, y);
2295      }
2296      ctx.stroke();
2297
2298      ctx.restore();
2299    };
2300
2301    const renderLoop = () => {
2302      animId = requestAnimationFrame(renderLoop);
2303
2304      try {
2305        // Continuous 33 1/3 RPM vinyl spinning when music is playing and hand is NOT on platter
2306        if (
2307          !isHoldingVinylRef.current &&
2308          (voidOnRef.current || pulseOnRef.current || beatActiveRef.current)
2309        ) {
2310          jogWheelAngleRef.current = (jogWheelAngleRef.current + 2.0) % 360;
2311          if (vinylPlatterVisualRef.current) {
2312            vinylPlatterVisualRef.current.style.transform = `rotate(${jogWheelAngleRef.current.toFixed(1)}deg)`;
2313          }
2314        }
2315        // 1. UPDATE AND RENDER BOUNCING SONIC BALLS (PHYSICS + GYROSCOPE)
2316        const now = performance.now();
2317        const screenW = window.innerWidth;
2318        const screenH = window.innerHeight;
2319        const { beta, gamma } = tiltRef.current;
2320
2321        // INVISIBLE ROTATION PHYSICAL FORCE FIELD (Synced with Rolls & Random Direction Changes)
2322        if (now > nextRotDirChangeTimeRef.current) {
2323          // Randomly invert direction (+1 clockwise vs -1 counter-clockwise)
2324          targetRotDirRef.current = targetRotDirRef.current > 0 ? -1 : 1;
2325          // Random time interval for next direction change (between 3.5s and 8.0s)
2326          nextRotDirChangeTimeRef.current = now + 3500 + Math.random() * 4500;
2327        }
2328
2329        // Smooth fluid easing of the rotation direction
2330        rotDirRef.current += (targetRotDirRef.current - rotDirRef.current) * 0.045;
2331
2332        // Synced with rolls: gamma tilt (-30° to +30°)
2333        const rollMagnitude = Math.abs(gamma) / 25;
2334        const rollVortexBoost = 1.0 + Math.min(2.5, rollMagnitude * 1.8);
2335        const vortexStrength = 0.44 * rotDirRef.current * rollVortexBoost;
2336
2337        const centerX = screenW / 2;
2338        const centerY = screenH / 2;
2339
2340        // Gravity vector from phone tilt (neutral holding angle: beta ~ 42°, gamma ~ 0°)
2341        // When Jog Wheel Freeze is active, normal gravity is paused
2342        const gx = jogActiveRef.current ? 0 : (gamma / 25) * 0.55;
2343        const gy = jogActiveRef.current ? 0 : ((beta - 42) / 25) * 0.65;
2344
2345        for (let i = 0; i < ballsRef.current.length; i++) {
2346          const ball = ballsRef.current[i];
2347
2348          // Apply invisible rotational swirl around screen center
2349          const dxCenter = ball.x - centerX;
2350          const dyCenter = ball.y - centerY;
2351          const distCenter = Math.hypot(dxCenter, dyCenter);
2352
2353          if (distCenter > 15 && !jogActiveRef.current) {
2354            // Perpendicular unit vector (-dyCenter / distCenter, dxCenter / distCenter) for tangential orbital push
2355            const tx = -dyCenter / distCenter;
2356            const ty = dxCenter / distCenter;
2357
2358            // Apply tangential rotational acceleration
2359            ball.vx += tx * vortexStrength;
2360            ball.vy += ty * vortexStrength;
2361
2362            // Subtle centripetal stabilizing force to produce graceful orbital curvature
2363            const centripetal = 0.038 * (distCenter / (screenW * 0.35));
2364            ball.vx -= (dxCenter / distCenter) * centripetal;
2365            ball.vy -= (dyCenter / distCenter) * centripetal;
2366          }
2367
2368          ball.vx += gx;
2369          ball.vy += gy;
2370
2371          // Speed clamping
2372          const speed = Math.hypot(ball.vx, ball.vy);
2373          if (speed > 16) {
2374            ball.vx = (ball.vx / speed) * 16;
2375            ball.vy = (ball.vy / speed) * 16;
2376          }
2377
2378          // Atmospheric drag
2379          ball.vx *= 0.99;
2380          ball.vy *= 0.99;
2381
2382          ball.x += ball.vx;
2383          ball.y += ball.vy;
2384
2385          let collided = false;
2386
2387          // Screen Boundary Collisions
2388          if (ball.x - ball.radius < 0) {
2389            ball.x = ball.radius;
2390            ball.vx = -ball.vx * 0.88;
2391            collided = true;
2392          } else if (ball.x + ball.radius > screenW) {
2393            ball.x = screenW - ball.radius;
2394            ball.vx = -ball.vx * 0.88;
2395            collided = true;
2396          }
2397
2398          if (ball.y - ball.radius < 0) {
2399            ball.y = ball.radius;
2400            ball.vy = -ball.vy * 0.88;
2401            collided = true;
2402          } else if (ball.y + ball.radius > screenH) {
2403            ball.y = screenH - ball.radius;
2404            ball.vy = -ball.vy * 0.88;
2405            collided = true;
2406          }
2407
2408          // Check for 3-ball same-color collision explosion
2409          const explodedIds = new Set<string>();
2410          for (let i = 0; i < ballsRef.current.length; i++) {
2411            const b1 = ballsRef.current[i];
2412            if (explodedIds.has(b1.id)) continue;
2413
2414            for (let j = i + 1; j < ballsRef.current.length; j++) {
2415              const b2 = ballsRef.current[j];
2416              if (b2.type !== b1.type || explodedIds.has(b2.id)) continue;
2417
2418              const d12 = Math.hypot(b2.x - b1.x, b2.y - b1.y);
2419              const touchProximity = b1.radius + b2.radius + 18;
2420
2421              if (d12 < touchProximity) {
2422                // Find third ball of the exact same type colliding with them
2423                for (let k = j + 1; k < ballsRef.current.length; k++) {
2424                  const b3 = ballsRef.current[k];
2425                  if (b3.type !== b1.type || explodedIds.has(b3.id)) continue;
2426
2427                  const d13 = Math.hypot(b3.x - b1.x, b3.y - b1.y);
2428                  const d23 = Math.hypot(b3.x - b2.x, b3.y - b2.y);
2429
2430                  if (d13 < touchProximity && d23 < touchProximity) {
2431                    explodedIds.add(b1.id);
2432                    explodedIds.add(b2.id);
2433                    explodedIds.add(b3.id);
2434
2435                    const ex = (b1.x + b2.x + b3.x) / 3;
2436                    const ey = (b1.y + b2.y + b3.y) / 3;
2437                    handleTripleBallExplosion(b1.type, ex, ey);
2438                    break;
2439                  }
2440                }
2441              }
2442            }
2443          }
2444
2445          if (explodedIds.size > 0) {
2446            ballsRef.current.forEach((b) => {
2447              if (explodedIds.has(b.id)) {
2448                try {
2449                  b.voice.oscs.forEach((osc) => osc.stop());
2450                  b.voice.filter.disconnect();
2451                  b.voice.gain.disconnect();
2452                } catch {}
2453              }
2454            });
2455            ballsRef.current = ballsRef.current.filter((b) => !explodedIds.has(b.id));
2456            setBalls((prev) => prev.filter((b) => !explodedIds.has(b.id)));
2457          }
2458
2459          // DYNAMIC INTERACTION: Finger / Mouse Cursor deflects and pushes balls
2460          if (pointerPosRef.current && pointerPosRef.current.active) {
2461            const ptr = pointerPosRef.current;
2462            const ptrRadius = 36; // touch / cursor force field radius
2463            const dx = ball.x - ptr.x;
2464            const dy = ball.y - ptr.y;
2465            const dist = Math.hypot(dx, dy);
2466            const minDist = ball.radius + ptrRadius;
2467
2468            if (dist < minDist && dist > 0.1) {
2469              const nx = dx / dist;
2470              const ny = dy / dist;
2471              const push = (minDist - dist) * 0.75;
2472              ball.x += nx * push;
2473              ball.y += ny * push;
2474
2475              // Transfer swipe / cursor velocity + repulsion impulse
2476              ball.vx += nx * 4.2 + ptr.vx * 0.35;
2477              ball.vy += ny * 4.2 + ptr.vy * 0.35;
2478
2479              collided = true;
2480            }
2481          }
2482
2483          // DYNAMIC INTERACTION: Balls bounce off VOID and PULSE buttons like pinball bumpers
2484          if (voidBtnRef.current && pulseBtnRef.current) {
2485            const vRect = voidBtnRef.current.getBoundingClientRect();
2486            const pRect = pulseBtnRef.current.getBoundingClientRect();
2487            const bumpers = [
2488              { cx: vRect.left + vRect.width / 2, cy: vRect.top + vRect.height / 2, r: vRect.width / 2 },
2489              { cx: pRect.left + pRect.width / 2, cy: pRect.top + pRect.height / 2, r: pRect.width / 2 },
2490            ];
2491
2492            bumpers.forEach((bm) => {
2493              const dx = ball.x - bm.cx;
2494              const dy = ball.y - bm.cy;
2495              const dist = Math.hypot(dx, dy);
2496              const minDist = ball.radius + bm.r;
2497
2498              if (dist < minDist && dist > 0.1) {
2499                const nx = dx / dist;
2500                const ny = dy / dist;
2501                ball.x = bm.cx + nx * minDist;
2502                ball.y = bm.cy + ny * minDist;
2503
2504                // Reflect velocity
2505                const dot = ball.vx * nx + ball.vy * ny;
2506                if (dot < 0) {
2507                  ball.vx -= 1.85 * dot * nx;
2508                  ball.vy -= 1.85 * dot * ny;
2509                }
2510                collided = true;
2511              }
2512            });
2513          }
2514
2515          // Ball-to-ball collisions & MAGNETIC REPULSION FOR DIFFERENT BUTTONS
2516          for (let j = i + 1; j < ballsRef.current.length; j++) {
2517            const other = ballsRef.current[j];
2518            const dx = other.x - ball.x;
2519            const dy = other.y - ball.y;
2520            const dist = Math.hypot(dx, dy);
2521
2522            // OPPOSITE BUTTON TYPES: Repel like identical magnetic charges!
2523            if (ball.type !== other.type) {
2524              const repulsionRadius = 180;
2525              if (dist < repulsionRadius && dist > 1) {
2526                const nx = dx / dist;
2527                const ny = dy / dist;
2528                // Stronger magnetic force as they get closer
2529                const force = (1 - dist / repulsionRadius) * 2.2;
2530                ball.vx -= nx * force;
2531                ball.vy -= ny * force;
2532                other.vx += nx * force;
2533                other.vy += ny * force;
2534
2535                // Subtle magnetic sonic tension modulation when near
2536                if (dist < 80 && now - ball.lastBounceTime > 150) {
2537                  ball.lastBounceTime = now;
2538                  modulateBallSoundOnCollision(ball);
2539                  modulateBallSoundOnCollision(other);
2540                }
2541              }
2542            } else {
2543              // SAME BUTTON TYPE: Standard elastic collision
2544              const minDist = ball.radius + other.radius;
2545              if (dist < minDist && dist > 0.1) {
2546                const overlap = (minDist - dist) / 2;
2547                const nx = dx / dist;
2548                const ny = dy / dist;
2549                ball.x -= nx * overlap;
2550                ball.y -= ny * overlap;
2551                other.x += nx * overlap;
2552                other.y += ny * overlap;
2553
2554                const kx = ball.vx - other.vx;
2555                const ky = ball.vy - other.vy;
2556                const p = 2 * (nx * kx + ny * ky) / 2;
2557                ball.vx -= p * nx * 0.9;
2558                ball.vy -= p * ny * 0.9;
2559                other.vx += p * nx * 0.9;
2560                other.vy += p * ny * 0.9;
2561
2562                collided = true;
2563                if (now - other.lastBounceTime > 90) {
2564                  other.lastBounceTime = now;
2565                  modulateBallSoundOnCollision(other);
2566                }
2567              }
2568            }
2569          }
2570
2571          // Sound modulation on impact
2572          if (collided && now - ball.lastBounceTime > 90) {
2573            ball.lastBounceTime = now;
2574            modulateBallSoundOnCollision(ball);
2575
2576            // Visual bounce flash
2577            const el = document.getElementById(`ball-${ball.id}`);
2578            if (el) {
2579              el.style.boxShadow =
2580                ball.type === "void"
2581                  ? "0 0 35px rgba(192, 132, 252, 1)"
2582                  : "0 0 35px rgba(34, 211, 238, 1)";
2583              setTimeout(() => {
2584                if (el) {
2585                  el.style.boxShadow =
2586                    ball.type === "void"
2587                      ? "0 0 20px rgba(192, 132, 252, 0.85)"
2588                      : "0 0 20px rgba(34, 211, 238, 0.85)";
2589                }
2590              }, 120);
2591            }
2592          }
2593
2594          // Update DOM element position at 60 FPS without React re-render
2595          const el = document.getElementById(`ball-${ball.id}`);
2596          if (el) {
2597            el.style.transform = `translate3d(${(ball.x - ball.radius).toFixed(1)}px, ${(ball.y - ball.radius).toFixed(1)}px, 0)`;
2598          }
2599        }
2600
2601        // REACTIVE AUDIO VISUALIZER DRAWING (60 FPS on background canvas)
2602        if (bgVisualizerCanvasRef.current) {
2603          const bgCanvas = bgVisualizerCanvasRef.current;
2604          const bgCtx = bgCanvas.getContext("2d");
2605          if (bgCtx) {
2606            const dpr = window.devicePixelRatio || 1;
2607            const w = bgCanvas.clientWidth;
2608            const h = bgCanvas.clientHeight;
2609            if (bgCanvas.width !== w * dpr || bgCanvas.height !== h * dpr) {
2610              bgCanvas.width = w * dpr;
2611              bgCanvas.height = h * dpr;
2612            }
2613            bgCtx.save();
2614            bgCtx.scale(dpr, dpr);
2615            bgCtx.clearRect(0, 0, w, h);
2616
2617            let bassEnergy = 0;
2618            let midEnergy = 0;
2619            let highEnergy = 0;
2620
2621            const mAnalyser = masterAnalyserRef.current;
2622            if (
2623              mAnalyser &&
2624              (voidOnRef.current || pulseOnRef.current || beatActiveRef.current || isHoldingVinylRef.current)
2625            ) {
2626              const freqData = new Uint8Array(mAnalyser.frequencyBinCount);
2627              mAnalyser.getByteFrequencyData(freqData);
2628              for (let b = 0; b < 7; b++) bassEnergy += freqData[b];
2629              bassEnergy = bassEnergy / 7 / 255;
2630              for (let b = 7; b < 25; b++) midEnergy += freqData[b];
2631              midEnergy = midEnergy / 18 / 255;
2632              for (let b = 25; b < 56; b++) highEnergy += freqData[b];
2633              highEnergy = highEnergy / 31 / 255;
2634            }
2635
2636            // 1. Ambient Breathing Radial Core Glow
2637            const cx = w / 2;
2638            const cy = h / 2;
2639            const maxRadius = Math.min(w, h) * (0.35 + bassEnergy * 0.28);
2640            const radialGrad = bgCtx.createRadialGradient(cx, cy, 10, cx, cy, maxRadius);
2641
2642            const vAlpha = voidOnRef.current ? 0.09 + bassEnergy * 0.16 : bassEnergy * 0.04;
2643            const cAlpha = pulseOnRef.current ? 0.09 + highEnergy * 0.16 : highEnergy * 0.04;
2644            const aAlpha = beatActiveRef.current ? 0.08 + midEnergy * 0.15 : 0;
2645
2646            radialGrad.addColorStop(0, `rgba(168, 85, 247, ${vAlpha})`);
2647            radialGrad.addColorStop(0.5, `rgba(6, 182, 212, ${cAlpha})`);
2648            radialGrad.addColorStop(0.8, `rgba(245, 158, 11, ${aAlpha})`);
2649            radialGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
2650
2651            bgCtx.fillStyle = radialGrad;
2652            bgCtx.fillRect(0, 0, w, h);
2653
2654            // DYNAMIC DETAILED HIGH-DEFINITION AUDIO WAVEFORM (ROTATING WITH GYROSCOPE)
2655            const targetWaveAngle = (gamma * Math.PI) / 180;
2656            smoothWaveformAngleRef.current += (targetWaveAngle - smoothWaveformAngleRef.current) * 0.12;
2657            const waveAngle = smoothWaveformAngleRef.current;
2658
2659            const isAudioActive =
2660              voidOnRef.current ||
2661              pulseOnRef.current ||
2662              beatActiveRef.current ||
2663              isHoldingVinylRef.current ||
2664              ballsRef.current.length > 0;
2665
2666            if (mAnalyser) {
2667              const bufferLength = mAnalyser.frequencyBinCount;
2668              const timeData = new Uint8Array(bufferLength);
2669              mAnalyser.getByteTimeDomainData(timeData);
2670
2671              const waveLength = Math.hypot(w, h) * 1.15;
2672              const ampHeight = Math.min(w, h) * 0.42;
2673
2674              bgCtx.save();
2675              bgCtx.translate(cx, cy);
2676              bgCtx.rotate(waveAngle);
2677
2678              // Subtle Horizon Axis Beam along rotated gyroscope plane
2679              bgCtx.beginPath();
2680              bgCtx.moveTo(-waveLength / 2, 0);
2681              bgCtx.lineTo(waveLength / 2, 0);
2682              bgCtx.lineWidth = 1;
2683              bgCtx.strokeStyle = "rgba(255, 255, 255, 0.1)";
2684              bgCtx.stroke();
2685
2686              if (isAudioActive) {
2687                // Multi-chromatic Neon Gradient along rotated axis
2688                const grad = bgCtx.createLinearGradient(-waveLength / 2, 0, waveLength / 2, 0);
2689                grad.addColorStop(0, "rgba(168, 85, 247, 0.95)");
2690                grad.addColorStop(0.35, "rgba(245, 158, 11, 0.95)");
2691                grad.addColorStop(0.7, "rgba(6, 182, 212, 0.95)");
2692                grad.addColorStop(1, "rgba(168, 85, 247, 0.95)");
2693
2694                const sliceWidth = waveLength / bufferLength;
2695                const startX = -waveLength / 2;
2696
2697                // 1. Outer Bloom Halo
2698                bgCtx.beginPath();
2699                bgCtx.lineWidth = 6;
2700                bgCtx.strokeStyle = "rgba(245, 158, 11, 0.3)";
2701                bgCtx.shadowColor = "#f59e0b";
2702                bgCtx.shadowBlur = 24;
2703
2704                for (let i = 0; i < bufferLength; i += 2) {
2705                  const raw = (timeData[i] - 128) / 128;
2706                  const x = startX + i * sliceWidth;
2707                  const y = raw * ampHeight;
2708                  if (i === 0) bgCtx.moveTo(x, y);
2709                  else bgCtx.lineTo(x, y);
2710                }
2711                bgCtx.stroke();
2712
2713                // 2. High-Resolution Core Trace (2048 FFT points)
2714                bgCtx.beginPath();
2715                bgCtx.lineWidth = 2.8;
2716                bgCtx.strokeStyle = grad;
2717                bgCtx.shadowColor = "#ffffff";
2718                bgCtx.shadowBlur = 10;
2719
2720                for (let i = 0; i < bufferLength; i++) {
2721                  const raw = (timeData[i] - 128) / 128;
2722                  const x = startX + i * sliceWidth;
2723                  const y = raw * ampHeight;
2724                  if (i === 0) bgCtx.moveTo(x, y);
2725                  else bgCtx.lineTo(x, y);
2726                }
2727                bgCtx.stroke();
2728
2729                // 3. Ultra-Fine White Center Core Laser
2730                bgCtx.beginPath();
2731                bgCtx.lineWidth = 1.2;
2732                bgCtx.strokeStyle = "rgba(255, 255, 255, 0.95)";
2733                bgCtx.shadowBlur = 0;
2734                for (let i = 0; i < bufferLength; i += 2) {
2735                  const raw = (timeData[i] - 128) / 128;
2736                  const x = startX + i * sliceWidth;
2737                  const y = raw * ampHeight;
2738                  if (i === 0) bgCtx.moveTo(x, y);
2739                  else bgCtx.lineTo(x, y);
2740                }
2741                bgCtx.stroke();
2742              }
2743
2744              bgCtx.restore();
2745            }
2746
2747            // 2. Neon Soundwave Horizon Ribbons
2748            if (bassEnergy > 0.02 || midEnergy > 0.02 || highEnergy > 0.02) {
2749              const bins = 40;
2750              const step = w / bins;
2751              bgCtx.lineWidth = 1.5 + bassEnergy * 2.5;
2752              bgCtx.strokeStyle = `rgba(192, 132, 252, ${0.15 + bassEnergy * 0.35})`;
2753              bgCtx.shadowColor = "#c084fc";
2754              bgCtx.shadowBlur = 10;
2755              bgCtx.beginPath();
2756              for (let i = 0; i <= bins; i++) {
2757                const x = i * step;
2758                const angle = (i / bins) * Math.PI * 4 + now * 0.002;
2759                const y = h * 0.85 + Math.sin(angle) * (14 + bassEnergy * 32);
2760                if (i === 0) bgCtx.moveTo(x, y);
2761                else bgCtx.lineTo(x, y);
2762              }
2763              bgCtx.stroke();
2764
2765              // Mirror Cyan Ribbon
2766              bgCtx.lineWidth = 1.2 + highEnergy * 2.2;
2767              bgCtx.strokeStyle = `rgba(34, 211, 238, ${0.15 + highEnergy * 0.35})`;
2768              bgCtx.shadowColor = "#22d3ee";
2769              bgCtx.shadowBlur = 10;
2770              bgCtx.beginPath();
2771              for (let i = 0; i <= bins; i++) {
2772                const x = i * step;
2773                const angle = (i / bins) * Math.PI * 4 - now * 0.0025;
2774                const y = h * 0.85 + Math.cos(angle) * (12 + highEnergy * 28);
2775                if (i === 0) bgCtx.moveTo(x, y);
2776                else bgCtx.lineTo(x, y);
2777              }
2778              bgCtx.stroke();
2779            }
2780            bgCtx.restore();
2781          }
2782        }
2783
2784        // Smoothly glide button positions based on gyroscope tilt (VOID in tilt direction, PULSE in opposite direction)
2785        const targetVoidX = Math.max(-52, Math.min(52, gamma * 1.5));
2786        const targetVoidY = Math.max(-48, Math.min(48, (beta - 42) * 1.6));
2787
2788        // Pulse moves in the exact OPPOSITE direction
2789        const targetPulseX = -targetVoidX;
2790        const targetPulseY = -targetVoidY;
2791
2792        const pos = buttonPosRef.current;
2793        pos.voidX += (targetVoidX - pos.voidX) * 0.1;
2794        pos.voidY += (targetVoidY - pos.voidY) * 0.1;
2795        pos.pulseX += (targetPulseX - pos.pulseX) * 0.1;
2796        pos.pulseY += (targetPulseY - pos.pulseY) * 0.1;
2797
2798        if (voidBtnRef.current) {
2799          const scale = voidOnRef.current ? 0.94 : 1.0;
2800          voidBtnRef.current.style.transform = `translate3d(${pos.voidX.toFixed(2)}px, ${pos.voidY.toFixed(2)}px, 0) scale(${scale})`;
2801        }
2802
2803        if (pulseBtnRef.current) {
2804          const scale = pulseOnRef.current ? 0.94 : 1.0;
2805          pulseBtnRef.current.style.transform = `translate3d(${pos.pulseX.toFixed(2)}px, ${pos.pulseY.toFixed(2)}px, 0) scale(${scale})`;
2806        }
2807
2808        const currentAngle = smoothWaveformAngleRef.current;
2809
2810        if (voidCanvasRef.current) {
2811          drawWave(
2812            voidCanvasRef.current,
2813            voidAnalyserRef.current,
2814            "#ffffff", // White waveform
2815            "rgba(255, 255, 255, 0.85)",
2816            voidOnRef.current,
2817            currentAngle
2818          );
2819        }
2820
2821        if (pulseCanvasRef.current) {
2822          drawWave(
2823            pulseCanvasRef.current,
2824            pulseAnalyserRef.current,
2825            "#ffffff", // White waveform
2826            "rgba(255, 255, 255, 0.85)",
2827            pulseOnRef.current,
2828            -currentAngle
2829          );
2830        }
2831      } catch (err) {
2832        console.error("renderLoop error:", err);
2833      }
2834    };
2835
2836    animId = requestAnimationFrame(renderLoop);
2837    return () => cancelAnimationFrame(animId);
2838  }, []);
2839
2840  // VOID: Deep, massive drone with rich harmonics that blooms into a warm ambient pad
2841  const startVoid = () => {
2842    const ctx = getAudioContext();
2843    const bus = masterBusRef.current;
2844    if (!bus) return;
2845
2846    if (voidVoiceRef.current) {
2847      stopVoid();
2848    }
2849
2850    const now = ctx.currentTime;
2851    const gainNode = ctx.createGain();
2852    // Fast, responsive attack so taps are immediately audible on any speaker
2853    gainNode.gain.setValueAtTime(0.0001, now);
2854    gainNode.gain.linearRampToValueAtTime(0.42, now + 0.05);
2855
2856    // Initial filter frequency factoring in current tilt (heavier range)
2857    const { beta, gamma } = tiltRef.current;
2858    const normBeta = Math.max(0, Math.min(1, (beta - 20) / 45));
2859    const normGamma = Math.max(0, Math.min(1, (gamma + 30) / 60));
2860
2861    const initialFreq = 90 + Math.pow(normBeta, 1.8) * 3310;
2862    const filter = ctx.createBiquadFilter();
2863    filter.type = "lowpass";
2864    filter.frequency.setValueAtTime(initialFreq, now);
2865    filter.frequency.linearRampToValueAtTime(Math.min(3600, initialFreq + 800), now + 3.2);
2866    filter.Q.value = 1.5 + normBeta * 4.7;
2867
2868    // Sub foundation (C2 - 65.41 Hz) with dedicated heavy sub boost node
2869    const oscSub = ctx.createOscillator();
2870    oscSub.type = "sine";
2871    oscSub.frequency.value = 65.41;
2872
2873    const subGain = ctx.createGain();
2874    subGain.gain.value = 0.8 + (1 - normBeta) * 0.9;
2875    oscSub.connect(subGain);
2876
2877    // Dark fifth drone (G2 - 98.00 Hz)
2878    const oscFifth = ctx.createOscillator();
2879    oscFifth.type = "triangle";
2880    oscFifth.frequency.value = 98.0;
2881
2882    // Detuned body pair (C3 - 130.81 Hz) for warm analog chorusing
2883    const oscBody1 = ctx.createOscillator();
2884    oscBody1.type = "sawtooth";
2885    oscBody1.frequency.value = 130.4;
2886
2887    const oscBody2 = ctx.createOscillator();
2888    oscBody2.type = "triangle";
2889    oscBody2.frequency.value = 131.2;
2890
2891    const bodyGain = ctx.createGain();
2892    bodyGain.gain.value = 0.24;
2893    oscBody1.connect(bodyGain);
2894    oscBody2.connect(bodyGain);
2895
2896    // Ethereal bloom octave (C4 - 261.63 Hz)
2897    const oscBloom = ctx.createOscillator();
2898    oscBloom.type = "sine";
2899    oscBloom.frequency.value = 261.63;
2900
2901    const initialBloom = 0.02 + normGamma * 0.65;
2902    const bloomGain = ctx.createGain();
2903    bloomGain.gain.setValueAtTime(initialBloom, now);
2904    bloomGain.gain.linearRampToValueAtTime(Math.min(0.7, initialBloom + 0.3), now + 3.0);
2905    oscBloom.connect(bloomGain);
2906
2907    // Routing
2908    subGain.connect(filter);
2909    oscFifth.connect(filter);
2910    bodyGain.connect(filter);
2911    bloomGain.connect(filter);
2912
2913    filter.connect(gainNode);
2914    if (voidBusGainRef.current) {
2915      gainNode.connect(voidBusGainRef.current);
2916    } else {
2917      gainNode.connect(ctx.destination);
2918      gainNode.connect(bus.convolver);
2919      gainNode.connect(bus.delayL);
2920    }
2921
2922    const pitchBendCents = (normBeta - 0.5) * 120;
2923    const oscs = [oscSub, oscFifth, oscBody1, oscBody2, oscBloom];
2924    oscs.forEach((osc) => {
2925      osc.detune.setValueAtTime(pitchBendCents, now);
2926      osc.start(now);
2927    });
2928
2929    voidVoiceRef.current = {
2930      oscs,
2931      gain: gainNode,
2932      filter,
2933      bloomGain,
2934      subGain,
2935    };
2936  };
2937
2938  const stopVoid = () => {
2939    if (!voidVoiceRef.current || !audioCtxRef.current) return;
2940    const ctx = audioCtxRef.current;
2941    const now = ctx.currentTime;
2942    const { gain, oscs } = voidVoiceRef.current;
2943
2944    gain.gain.cancelScheduledValues(now);
2945    gain.gain.setValueAtTime(gain.gain.value, now);
2946    gain.gain.linearRampToValueAtTime(0.0001, now + 0.7);
2947
2948    setTimeout(() => {
2949      oscs.forEach((osc) => {
2950        try {
2951          osc.stop();
2952          osc.disconnect();
2953        } catch {
2954          // ignore if already stopped
2955        }
2956      });
2957    }, 750);
2958
2959    voidVoiceRef.current = null;
2960  };
2961
2962  // PULSE: Soft chime that opens into an ethereal, dreamy shimmer
2963  const startPulse = () => {
2964    const ctx = getAudioContext();
2965    const bus = masterBusRef.current;
2966    if (!bus) return;
2967
2968    if (pulseVoiceRef.current) {
2969      stopPulse();
2970    }
2971
2972    const now = ctx.currentTime;
2973    const gainNode = ctx.createGain();
2974    gainNode.gain.setValueAtTime(0.0001, now);
2975    // Soft attack swell
2976    gainNode.gain.exponentialRampToValueAtTime(0.28, now + 0.22);
2977
2978    const { beta, gamma } = tiltRef.current;
2979    const normBeta = Math.max(0, Math.min(1, (beta - 20) / 45));
2980    const normGamma = Math.max(0, Math.min(1, (gamma + 30) / 60));
2981
2982    const filter = ctx.createBiquadFilter();
2983    filter.type = "lowpass";
2984    const initialPulseFreq = 400 + Math.pow(normBeta, 1.5) * 8400;
2985    filter.frequency.setValueAtTime(initialPulseFreq, now);
2986    filter.frequency.exponentialRampToValueAtTime(Math.min(9500, initialPulseFreq + 2500), now + 3.5);
2987    filter.Q.value = 1.2 + normBeta * 3.8;
2988
2989    // Harmonic bell triad: G4 (392Hz), D5 (587.3Hz), G5 (784Hz)
2990    const freqs = [392.0, 587.33, 783.99];
2991    const lfos: OscillatorNode[] = [];
2992    const lfoGains: GainNode[] = [];
2993
2994    // Delay feedback swell factored by gamma tilt (up to heavy dub levels)
2995    const initFeedback = 0.15 + normGamma * 0.68;
2996    bus.delayFeedback.gain.cancelScheduledValues(now);
2997    bus.delayFeedback.gain.setValueAtTime(initFeedback, now);
2998    bus.delayFeedback.gain.linearRampToValueAtTime(Math.min(0.85, initFeedback + 0.2), now + 3.5);
2999
3000    const pulseBendCents = (normGamma - 0.5) * 80;
3001    const oscs = freqs.map((f, idx) => {
3002      const osc = ctx.createOscillator();
3003      osc.type = "sine";
3004      osc.frequency.value = f;
3005      osc.detune.setValueAtTime(pulseBendCents, now);
3006
3007      // Pitch shimmer
3008      const lfo = ctx.createOscillator();
3009      lfo.frequency.value = 2.6 + idx * 0.4;
3010      const lfoGain = ctx.createGain();
3011      const detuneAmt = 3.0 + normBeta * 29.0;
3012      lfoGain.gain.setValueAtTime(detuneAmt, now);
3013      lfoGain.gain.linearRampToValueAtTime(detuneAmt + 6, now + 3.0);
3014
3015      lfo.connect(lfoGain);
3016      lfoGain.connect(osc.detune);
3017      lfo.start(now);
3018      lfos.push(lfo);
3019      lfoGains.push(lfoGain);
3020
3021      osc.start(now);
3022      osc.connect(filter);
3023      return osc;
3024    });
3025
3026    filter.connect(gainNode);
3027    if (pulseBusGainRef.current) {
3028      gainNode.connect(pulseBusGainRef.current);
3029    } else {
3030      gainNode.connect(ctx.destination);
3031      gainNode.connect(bus.delayL);
3032      gainNode.connect(bus.convolver);
3033    }
3034
3035    pulseVoiceRef.current = {
3036      oscs,
3037      gain: gainNode,
3038      filter,
3039      lfos,
3040      lfoGains,
3041    };
3042  };
3043
3044  const stopPulse = () => {
3045    if (!pulseVoiceRef.current || !audioCtxRef.current) return;
3046    const ctx = audioCtxRef.current;
3047    const bus = masterBusRef.current;
3048    const now = ctx.currentTime;
3049    const { gain, oscs, lfos } = pulseVoiceRef.current;
3050
3051    if (bus) {
3052      bus.delayFeedback.gain.cancelScheduledValues(now);
3053      bus.delayFeedback.gain.setValueAtTime(bus.delayFeedback.gain.value, now);
3054      bus.delayFeedback.gain.linearRampToValueAtTime(0.32, now + 0.8);
3055    }
3056
3057    gain.gain.cancelScheduledValues(now);
3058    gain.gain.setValueAtTime(gain.gain.value, now);
3059    // Softer, longer ringing tail
3060    gain.gain.linearRampToValueAtTime(0.0001, now + 1.0);
3061
3062    setTimeout(() => {
3063      oscs.forEach((osc) => {
3064        try {
3065          osc.stop();
3066          osc.disconnect();
3067        } catch {
3068          // ignore
3069        }
3070      });
3071      lfos.forEach((lfo) => {
3072        try {
3073          lfo.stop();
3074          lfo.disconnect();
3075        } catch {
3076          // ignore
3077        }
3078      });
3079    }, 1250);
3080
3081    pulseVoiceRef.current = null;
3082  };
3083
3084  const handleAddVisit = () => {
3085    try {
3086      const next = visitsCount + 1;
3087      setVisitsCount(next);
3088      localStorage.setItem("duotone_total_visits", next.toString());
3089    } catch {}
3090  };
3091
3092  if (currentPage === "dashboard") {
3093    return (
3094      <VisitsDashboard
3095        visitsCount={visitsCount}
3096        activeUsersCount={activeUsersCount}
3097        onBack={() => setCurrentPage("synth")}
3098        onAddVisit={handleAddVisit}
3099        isAudioPlaying={voidOn || pulseOn || beatOn}
3100        togglePanic={togglePanic}
3101        isPanicked={isPanicked}
3102      />
3103    );
3104  }
3105
3106  return (
3107    <div
3108      onPointerDown={handleEmptySpacePointerDown}
3109      onPointerUp={cancelPanicHold}
3110      onPointerCancel={cancelPanicHold}
3111      onPointerMove={handleEmptySpacePointerMove}
3112      className="h-screen h-[100dvh] max-h-screen w-full flex flex-col items-center justify-between bg-black text-white p-2 sm:p-3 font-mono select-none relative overflow-hidden"
3113    >
3114      {/* BACKGROUND REACTIVE AUDIO VISUALIZER (60 FPS Ambient Canvas) */}
3115      <canvas
3116        ref={bgVisualizerCanvasRef}
3117        className="fixed inset-0 w-full h-full pointer-events-none z-0"
3118      />
3119
3120      <style>{`
3121        @keyframes panicCharge {
3122          from { stroke-dashoffset: 201; }
3123          to { stroke-dashoffset: 0; }
3124        }
3125      `}</style>
3126      {/* VISITOR COUNTER & LIVE CONNECTED USERS BADGE (Clickable to open Visits Dashboard) */}
3127      <button
3128        type="button"
3129        onClick={() => setCurrentPage("dashboard")}
3130        className="fixed top-4 left-4 z-30 flex items-center gap-2.5 bg-neutral-950/90 border border-neutral-800 hover:border-emerald-500/60 px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm text-[10px] font-mono select-none tracking-wider group cursor-pointer transition-all active:scale-95"
3131        title="Abrir Panel de Visitas y Analítica en tiempo real"
3132      >
3133        <div className="flex items-center gap-1.5 text-neutral-400">
3134          <span className="text-neutral-500 font-bold">VISITAS:</span>
3135          <span className="text-neutral-200 font-bold">{visitsCount.toLocaleString()}</span>
3136        </div>
3137        <span className="w-1 h-1 rounded-full bg-neutral-700" />
3138        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
3139          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
3140          <span>{activeUsersCount} EN VIVO</span>
3141        </div>
3142        <span className="text-[9px] text-neutral-500 group-hover:text-emerald-300 font-bold ml-0.5">
3143          📊
3144        </span>
3145      </button>
3146
3147      {/* Visits insights opens by clicking top-left visitor badge directly */}
3148
3149      {/* 2-MINUTE BALL EXPLOSION GAME HUD (Start Button, Points Visualization & Countdown Watch) */}
3150      <div className="z-20 mb-2 flex items-center gap-2 bg-neutral-950/90 border border-amber-500/50 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.25)] backdrop-blur-sm">
3151        {!isGameRunning && !isGameOver ? (
3152          <button
3153            type="button"
3154            onClick={startGame}
3155            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 border-amber-600 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 flex flex-col items-center justify-center text-black font-black shadow-[0_0_20px_rgba(245,158,11,0.8),inset_0_3px_5px_rgba(255,255,255,0.7)] cursor-pointer hover:scale-105 active:scale-90 active:translate-y-0.5 transition-all select-none"
3156            title="Pulsar para iniciar juego de 2 minutos (START)"
3157          >
3158            <div className="w-2.5 h-1 bg-white/60 rounded-full mb-0.5 pointer-events-none" />
3159            <span className="text-[9px] sm:text-[10px] tracking-tight font-black uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
3160              START
3161            </span>
3162          </button>
3163        ) : (
3164          <button
3165            type="button"
3166            onClick={restartGame}
3167            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-3 border-amber-500 bg-neutral-900 text-amber-300 hover:text-white flex flex-col items-center justify-center text-[8px] font-black uppercase shadow-md cursor-pointer hover:scale-105 active:scale-90 transition-all select-none"
3168            title="Reiniciar juego"
3169          >
3170            <span className="text-xs">🔄</span>
3171            <span className="text-[7px]">RESET</span>
3172          </button>
3173        )}
3174
3175        <span className="w-1 h-3 bg-neutral-800" />
3176
3177        {/* Countdown Watch */}
3178        <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs font-black">
3179          <span className="text-neutral-400">⏱️:</span>
3180          <span
3181            className={`px-1.5 py-0.5 rounded ${
3182              gameTimeLeft <= 15 && isGameRunning
3183                ? "bg-red-950 text-red-400 border border-red-500 animate-pulse shadow-[0_0_8px_#ef4444]"
3184                : "bg-neutral-900 text-amber-300 border border-neutral-700"
3185            }`}
3186          >
3187            {Math.floor(gameTimeLeft / 60)
3188              .toString()
3189              .padStart(2, "0")}
3190            :{(gameTimeLeft % 60).toString().padStart(2, "0")}
3191          </span>
3192        </div>
3193
3194        <span className="w-1 h-3 bg-neutral-800" />
3195
3196        {/* Points Visualization */}
3197        <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs font-black">
3198          <span className="text-neutral-400">⭐:</span>
3199          <span className="text-amber-400 text-xs sm:text-sm drop-shadow-[0_0_8px_#f59e0b]">
3200            {gameScore}
3201          </span>
3202        </div>
3203      </div>
3204
3205      {/* TOP-RIGHT CONTROLS: TIP JAR, STREAMING LINKS & HELP BUTTON */}
3206      <div className="fixed top-4 right-4 z-30 flex items-center gap-1.5 sm:gap-2">
3207        <button
3208          type="button"
3209          onClick={() => setShowTipJarModal(true)}
3210          className="px-2.5 sm:px-3 py-1.5 rounded-full border border-amber-500/50 bg-neutral-950/90 text-amber-300 hover:text-white hover:border-amber-400 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold shadow-lg transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
3211          title="Bote de propinas y apoyo voluntario para Emiliabella"
3212        >
3213          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#f59e0b]" />
3214          <span className="hidden sm:inline">PROPINA</span>
3215          <span>☕</span>
3216        </button>
3217
3218        <button
3219          type="button"
3220          onClick={() => setShowStreamingModal(true)}
3221          className="px-2.5 sm:px-3 py-1.5 rounded-full border border-emerald-500/50 bg-neutral-950/90 text-emerald-300 hover:text-white hover:border-emerald-400 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold shadow-lg transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
3222          title="Escuchar canciones en Tidal, Spotify, Apple Music, YouTube y SoundCloud"
3223        >
3224          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
3225          <span className="hidden sm:inline">STREAMING</span>
3226          <span>🎧</span>
3227        </button>
3228
3229        {/* CORNER HELP BUTTON (?) WITH HOVER TOOLTIP */}
3230        <div className="group relative">
3231          <button
3232            type="button"
3233            onClick={(e) => {
3234              e.stopPropagation();
3235              setShowHelp(true);
3236            }}
3237            className="w-8 h-8 rounded-full border border-neutral-700 bg-neutral-950/90 text-neutral-300 hover:text-white hover:border-emerald-400 flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-150 active:scale-90 cursor-pointer"
3238            title="Help"
3239          >
3240            ?
3241          </button>
3242          {/* Tooltip */}
3243          <div className="absolute top-10 right-0 hidden group-hover:block bg-neutral-900 border border-neutral-700 text-neutral-300 text-[10px] tracking-wider py-1 px-2.5 rounded shadow-xl whitespace-nowrap pointer-events-none uppercase font-mono">
3244            Help
3245          </div>
3246        </div>
3247      </div>
3248
3249      {/* TOP STATUS BAR: Rotary Master Volume Knob & Panic Button */}
3250      <div className="w-full max-w-sm flex items-center justify-between gap-4 mb-2 z-20 shrink-0">
3251        {/* ROTARY MASTER VOLUME KNOB (Clockwise = Increase) */}
3252        <div className="flex items-center gap-3 flex-1 bg-neutral-950/80 border border-neutral-800 px-3 py-1.5 rounded-lg backdrop-blur-sm">
3253          {/* Interactive Rotary Dial */}
3254          <div
3255            onPointerDown={handleKnobPointerDown}
3256            onPointerMove={handleKnobPointerMove}
3257            onPointerUp={handleKnobPointerUp}
3258            className="w-10 h-10 rounded-full border-2 border-neutral-700 bg-neutral-900 flex items-center justify-center relative cursor-pointer active:border-emerald-400 touch-none shadow-md group"
3259            title="Gira el móvil en sentido horario o arrastra la rueda para subir volumen"
3260          >
3261            {/* Knob Tick Indicator Pointer */}
3262            <div
3263              style={{
3264                transform: `rotate(${-135 + masterVol * 270}deg)`,
3265              }}
3266              className="w-full h-full absolute inset-0 flex items-start justify-center transition-transform duration-75"
3267            >
3268              <div className="w-1 h-3 bg-gradient-to-b from-emerald-400 to-amber-300 rounded-full shadow-[0_0_6px_#34d399]" />
3269            </div>
3270            <span className="text-[8px] font-bold text-neutral-400 z-10 select-none">
3271              {Math.round(masterVol * 100)}%
3272            </span>
3273          </div>
3274
3275          <div className="flex flex-col gap-0.5">
3276            <div className="flex items-center gap-2">
3277              <span className="text-[10px] tracking-widest text-neutral-400 font-bold">
3278                VOLUMEN
3279              </span>
3280              <span className="text-emerald-400 font-bold text-[10px]">
3281                {Math.round(masterVol * 100)}%
3282              </span>
3283            </div>
3284            <span className="text-[8px] text-neutral-500 tracking-tighter leading-tight">
3285              ↻ GIRA EL MÓVIL CLOCKWISE PARA SUBIR
3286            </span>
3287          </div>
3288        </div>
3289
3290        {/* OCTAGONAL RED STOP / PANIC TRAFFIC SIGN BUTTON */}
3291        <button
3292          type="button"
3293          onClick={(e) => {
3294            e.stopPropagation();
3295            togglePanic();
3296          }}
3297          className={`relative w-13 h-13 sm:w-15 sm:h-15 flex items-center justify-center cursor-pointer transition-transform duration-150 active:scale-90 shrink-0 group ${
3298            isPanicked ? "animate-pulse" : "hover:scale-105"
3299          }`}
3300          title="STOP / Pánico: Silencia todo el sonido inmediatamente (o sostén 2s en zona vacía)"
3301        >
3302          {/* Octagonal SVG STOP Sign */}
3303          <svg
3304            viewBox="0 0 100 100"
3305            className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-[0_0_16px_rgba(239,68,68,0.8)]"
3306          >
3307            {/* Outer red octagon body */}
3308            <polygon
3309              points="29.3,0 70.7,0 100,29.3 100,70.7 70.7,100 29.3,100 0,70.7 0,29.3"
3310              className={
3311                isPanicked
3312                  ? "fill-red-700 stroke-white stroke-[5]"
3313                  : "fill-red-600 group-hover:fill-red-500 stroke-neutral-200 stroke-[4] transition-colors"
3314              }
3315            />
3316            {/* Inner white border line */}
3317            <polygon
3318              points="30.5,6 69.5,6 94,30.5 94,69.5 69.5,94 30.5,94 6,69.5 6,30.5"
3319              fill="none"
3320              stroke="#ffffff"
3321              strokeWidth="2.5"
3322              strokeDasharray={isPanicked ? "4,4" : "none"}
3323            />
3324            {/* Center STOP / MUTED text (Bigger, authoritative traffic typography) */}
3325            <text
3326              x="50"
3327              y="55"
3328              textAnchor="middle"
3329              dominantBaseline="middle"
3330              fill="#ffffff"
3331              fontWeight="950"
3332              fontSize={isPanicked ? "18" : "24"}
3333              letterSpacing={isPanicked ? "0.5" : "1.5"}
3334              fontFamily="system-ui, -apple-system, sans-serif"
3335              className="select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-black"
3336            >
3337              {isPanicked ? "MUTED" : "STOP"}
3338            </text>
3339          </svg>
3340        </button>
3341      </div>
3342
3343      <div
3344        ref={instrumentRef}
3345        className="flex flex-row items-center justify-center gap-3 sm:gap-6 md:gap-8 transition-transform duration-75 ease-out z-10 my-auto shrink-0"
3346      >
3347        {/* Left Console: VOID & PULSE Pads with Vertical Crossfader */}
3348        <div className="flex flex-row items-stretch justify-center gap-5 sm:gap-7">
3349          {/* Buttons Stack: VOID on top (Violet), PULSE on bottom (Cyan) */}
3350          <div className="flex flex-col gap-3 sm:gap-5 justify-between items-center relative py-1">
3351            {/* Button 0: VOID (Solid Violet Background, Crisp White Text, Gyro Position Float) */}
3352            <div className="relative w-26 h-26 sm:w-32 sm:h-32 md:w-36 md:h-36 flex items-center justify-center">
3353              {/* Neutral Anchor Ring */}
3354              <div className="absolute inset-0 rounded-full border border-dashed border-violet-500/30 pointer-events-none" />
3355
3356              <button
3357                ref={voidBtnRef}
3358                type="button"
3359                onClick={() => toggleButton(0)}
3360                style={{ willChange: "transform" }}
3361                className={`w-26 h-26 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-4 transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer touch-none group z-10 ${
3362                  voidOn
3363                    ? "bg-violet-600 border-white shadow-[0_0_55px_rgba(139,92,246,0.9)] scale-95"
3364                    : "bg-violet-700 hover:bg-violet-600 border-violet-300 shadow-[0_0_25px_rgba(124,58,237,0.45)]"
3365                }`}
3366              >
3367                {/* Real-time Oscilloscope Waveform Canvas */}
3368                <canvas
3369                  ref={voidCanvasRef}
3370                  className="absolute inset-0 w-full h-full pointer-events-none rounded-full"
3371                />
3372
3373                <span className="relative z-10 text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] uppercase select-none pointer-events-none">
3374                  VOID
3375                </span>
3376              </button>
3377            </div>
3378
3379            {/* Button 1: PULSE (Solid Cyan Background, Crisp White Text, Gyro Position Float Opposite) */}
3380            <div className="relative w-26 h-26 sm:w-32 sm:h-32 md:w-36 md:h-36 flex items-center justify-center">
3381              {/* Neutral Anchor Ring */}
3382              <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30 pointer-events-none" />
3383
3384              <button
3385                ref={pulseBtnRef}
3386                type="button"
3387                onClick={() => toggleButton(1)}
3388                style={{ willChange: "transform" }}
3389                className={`w-26 h-26 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-4 transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer touch-none group z-10 ${
3390                  pulseOn
3391                    ? "bg-cyan-500 border-white shadow-[0_0_55px_rgba(6,182,212,0.9)] scale-95"
3392                    : "bg-cyan-600 hover:bg-cyan-500 border-cyan-300 shadow-[0_0_25px_rgba(8,145,178,0.45)]"
3393                }`}
3394              >
3395                {/* Real-time Oscilloscope Waveform Canvas */}
3396                <canvas
3397                  ref={pulseCanvasRef}
3398                  className="absolute inset-0 w-full h-full pointer-events-none rounded-full"
3399                />
3400
3401                <span className="relative z-10 text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] uppercase select-none pointer-events-none">
3402                  PULSE
3403                </span>
3404              </button>
3405            </div>
3406          </div>
3407
3408          {/* Vertical Crossfader positioned all along the side of the buttons */}
3409          <div className="flex flex-col items-center justify-between select-none py-1">
3410            <div className="text-[9px] tracking-[0.2em] text-neutral-400 font-bold uppercase text-center mb-1">
3411              VOID <span className="text-[8px] text-neutral-600 block">▲ BOOST</span>
3412            </div>
3413
3414            <div
3415              ref={trackRef}
3416              onPointerDown={handleFaderPointerDown}
3417              onPointerMove={handleFaderPointerMove}
3418              onPointerUp={handleFaderPointerUp}
3419              onPointerCancel={handleFaderPointerUp}
3420              onDoubleClick={() => {
3421                faderRef.current = 0.5;
3422                setFaderPos(0.5);
3423                applyCrossfade(0.5);
3424              }}
3425              className="w-14 sm:w-16 flex-1 min-h-[300px] sm:min-h-[360px] bg-neutral-950 border border-neutral-800 rounded flex flex-col items-center justify-center relative cursor-ns-resize touch-none p-2 group hover:border-neutral-600 transition-colors"
3426            >
3427              {/* Center rail groove */}
3428              <div className="w-1 h-full bg-neutral-800 rounded-full relative">
3429                {/* Calibration tick marks */}
3430                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-neutral-700" />
3431                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-neutral-800" />
3432                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-1 bg-neutral-400 rounded-sm" />
3433                <div className="absolute top-3/4 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-neutral-800" />
3434                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-neutral-700" />
3435              </div>
3436
3437              {/* Fader Handle */}
3438              <div
3439                style={{ top: `${(1 - faderPos) * 100}%` }}
3440                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 sm:w-14 h-8 bg-neutral-200 text-black rounded-sm shadow-[0_2px_12px_rgba(0,0,0,0.9)] border border-white flex flex-col items-center justify-center pointer-events-none transition-transform active:scale-95"
3441              >
3442                <div className="w-7 h-0.5 bg-neutral-900 rounded-full mb-0.5" />
3443                <span className="text-[8px] tracking-tighter font-extrabold uppercase text-neutral-800">
3444                  {faderPos === 0.5
3445                    ? "MID"
3446                    : faderPos > 0.5
3447                    ? `V +${Math.round((faderPos - 0.5) * 70)}%`
3448                    : `P +${Math.round((0.5 - faderPos) * 70)}%`}
3449                </span>
3450              </div>
3451            </div>
3452
3453            <div className="text-[9px] tracking-[0.2em] text-neutral-400 font-bold uppercase text-center mt-1">
3454              PULSE <span className="text-[8px] text-neutral-600 block">▼ BOOST</span>
3455            </div>
3456          </div>
3457        </div>
3458      </div>
3459
3460      {/* Catchy Beat Toggle Control & 1-Minute Evolution Display */}
3461      <div className="mt-2 mb-1 flex flex-col items-center gap-1.5 shrink-0 z-20">
3462        <button
3463          type="button"
3464          onClick={toggleBeat}
3465          className={`px-5 py-2.5 rounded-full border text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-200 flex items-center gap-2.5 shadow-lg cursor-pointer ${
3466            beatOn
3467              ? "bg-amber-500 text-black border-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.6)] scale-105"
3468              : "bg-neutral-950 text-neutral-400 border-neutral-700 hover:border-amber-500/70 hover:text-white"
3469          }`}
3470        >
3471          <span
3472            className={`w-2 h-2 rounded-full ${
3473              beatOn ? "bg-black animate-ping" : "bg-neutral-600"
3474            }`}
3475          />
3476          <span>8-BIT RETRO BGM {beatOn ? "ON" : "OFF"}:</span>
3477          <span
3478            ref={bpmDisplayRef}
3479            className="font-black px-1.5 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-400/40"
3480          >
3481            110 BPM
3482          </span>
3483        </button>
3484
3485        {/* 1-Minute Pattern Evolution Counter */}
3486        {beatOn && (
3487          <div className="flex flex-col items-center gap-1.5 bg-neutral-950/80 border border-amber-500/30 px-3.5 py-1.5 rounded-lg shadow-md w-64 text-center">
3488            <div className="flex items-center justify-between w-full text-[9px] font-bold tracking-wider">
3489              <span className="text-amber-400">{patternDisplay.name}</span>
3490              <span className="text-neutral-400 font-mono">
3491                {patternDisplay.secLeft}s ➔ CAMBIO
3492              </span>
3493            </div>
3494            {/* Progress bar to next 1-minute evolution */}
3495            <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
3496              <div
3497                style={{ width: `${patternDisplay.progress}%` }}
3498                className="h-full bg-amber-400 transition-all duration-300"
3499              />
3500            </div>
3501          </div>
3502        )}
3503
3504        <span className="text-[9px] text-neutral-500 tracking-wider uppercase font-mono">
3505          ◄ INCLINA A LA IZQ (70 BPM) | INCLINA A LA DER (155 BPM) ►
3506        </span>
3507      </div>
3508
3509      {/* Gyroscope & Bluetooth MIDI Controls */}
3510      <div className="mt-1 flex flex-col items-center gap-1.5 shrink-0 z-20">
3511        <div className="flex flex-wrap items-center justify-center gap-2">
3512          {!gyroActive ? (
3513            <button
3514              type="button"
3515              onClick={enableGyroscope}
3516              className="px-3.5 py-1.5 border border-neutral-700 hover:border-white text-[10px] sm:text-[11px] tracking-[0.2em] uppercase transition-colors rounded-full bg-neutral-950/80 cursor-pointer"
3517            >
3518              ENABLE TILT / GYRO CONTROL
3519            </button>
3520          ) : (
3521            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-950 border border-emerald-500/40 text-[10px] sm:text-[11px] tracking-[0.2em] text-emerald-400">
3522              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
3523              GYROSCOPE ACTIVE
3524            </div>
3525          )}
3526
3527          {/* BLUETOOTH MIDI ON / OFF BUTTON */}
3528          <button
3529            type="button"
3530            onClick={toggleBleMidi}
3531            className={`px-3.5 py-1.5 rounded-full border text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
3532              bleMidiActive
3533                ? "bg-blue-600 text-white border-blue-300 shadow-[0_0_22px_rgba(59,130,246,0.75)] scale-105"
3534                : "bg-neutral-950 text-neutral-400 border-neutral-700 hover:border-blue-500 hover:text-white"
3535            }`}
3536            title="Activar o desactivar exportación de comandos del giroscopio por Bluetooth MIDI"
3537          >
3538            <span
3539              className={`w-2 h-2 rounded-full ${
3540                bleMidiActive ? "bg-white animate-ping" : "bg-neutral-600"
3541              }`}
3542            />
3543            <span>BLE MIDI: {bleMidiActive ? "ON" : "OFF"}</span>
3544            {bleMidiDeviceName && (
3545              <span className="text-[9px] text-blue-200 font-mono">
3546                [{bleMidiDeviceName}]
3547              </span>
3548            )}
3549          </button>
3550
3551          {/* TEST BLE MIDI BUTTON */}
3552          <button
3553            type="button"
3554            onClick={runMidiSelfTest}
3555            className="px-3.5 py-1.5 rounded-full border border-blue-500/70 bg-blue-950/70 hover:bg-blue-900 text-blue-300 hover:text-white text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-95 cursor-pointer"
3556            title="Probar transmisión de comandos MIDI (Test Ping, notas y barrido de CC)"
3557          >
3558            <span>⚡</span>
3559            <span>TEST BLE MIDI</span>
3560          </button>
3561        </div>
3562
3563        {/* Status readouts */}
3564        {gyroActive && (
3565          <div
3566            ref={tiltDisplayRef}
3567            className="text-[10px] tracking-widest text-neutral-500 font-mono"
3568          >
3569            PITCH 45° | ROLL 0°
3570          </div>
3571        )}
3572
3573        {bleMidiActive && bleMidiStatus && (
3574          <button
3575            type="button"
3576            onClick={() => setShowMidiMonitor(true)}
3577            className="text-[9px] text-blue-300 font-mono tracking-wider bg-blue-950/70 border border-blue-500/40 px-2.5 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.3)] hover:border-blue-400 cursor-pointer"
3578            title="Abrir monitor de paquetes MIDI"
3579          >
3580            📡 {bleMidiStatus} • CC 74 / CC 1 / BEND [VER MONITOR ↗]
3581          </button>
3582        )}
3583
3584        <div className="text-neutral-600 text-[9px] sm:text-[10px] tracking-widest text-center max-w-xs leading-relaxed">
3585          TILT FORWARD/BACK: FILTER (CC 74) | TILT LEFT/RIGHT: SWELL & PAN (CC 10 / BEND)
3586        </div>
3587      </div>
3588
3589      <div className="mt-1 mb-0.5 flex flex-col items-center gap-0.5 text-center select-none shrink-0 z-20">
3590        <span className="text-neutral-500 text-[10px] tracking-[0.25em] uppercase">
3591          Two-Button Instrument
3592        </span>
3593        <span className="text-neutral-600 text-[9px] tracking-wider font-sans">
3594          Developed by <span className="text-neutral-400 font-semibold">Emiliabella</span> • All rights reserved • 100% Free
3595        </span>
3596      </div>
3597
3598      {/* Floating Sonic Gyroscope Balls */}
3599      {balls.map((b) => (
3600        <div
3601          key={b.id}
3602          id={`ball-${b.id}`}
3603          onPointerDown={(e) => {
3604            e.stopPropagation();
3605            destroyBall(b.id);
3606          }}
3607          className={`fixed top-0 left-0 rounded-full cursor-pointer z-50 flex items-center justify-center select-none active:scale-90 ${
3608            b.type === "void"
3609              ? "border-[3px] border-[#c084fc] bg-transparent shadow-[0_0_24px_rgba(192,132,252,0.95)]"
3610              : "border-[3px] border-[#22d3ee] bg-transparent shadow-[0_0_24px_rgba(34,211,238,0.95)]"
3611          }`}
3612          style={{
3613            width: `${b.radius * 2}px`,
3614            height: `${b.radius * 2}px`,
3615            willChange: "transform",
3616            touchAction: "none",
3617          }}
3618          title="Toca la bola para eliminarla y apagar su sonido"
3619        >
3620          {/* Glowing center indicator core */}
3621          <div
3622            className={`w-2 h-2 rounded-full pointer-events-none ${
3623              b.type === "void"
3624                ? "bg-violet-300 shadow-[0_0_8px_#c084fc]"
3625                : "bg-cyan-300 shadow-[0_0_8px_#22d3ee]"
3626            }`}
3627          />
3628        </div>
3629      ))}
3630      {/* FREEZE & JOG WHEEL SCRUB HUD OVERLAY */}
3631      {isJogActive && (
3632        <div className="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-center bg-black/45 backdrop-blur-[2px] select-none">
3633          {/* Vinyl Jog Platter */}
3634          <div className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-full border-4 border-amber-400 bg-neutral-950/90 shadow-[0_0_60px_rgba(245,158,11,0.65)] flex items-center justify-center">
3635            {/* Concentric vinyl groove rings */}
3636            <div className="absolute inset-3 rounded-full border border-neutral-700 pointer-events-none" />
3637            <div className="absolute inset-7 rounded-full border border-neutral-800 pointer-events-none" />
3638            <div className="absolute inset-12 rounded-full border border-neutral-800 pointer-events-none" />
3639
3640            {/* Rotating Vinyl Strobe Marker */}
3641            <div
3642              style={{ transform: `rotate(${jogAngle}deg)` }}
3643              className="absolute inset-0 flex items-start justify-center transition-transform duration-75"
3644            >
3645              <div className="w-1.5 h-10 bg-amber-400 rounded-full shadow-[0_0_10px_#f59e0b] mt-1" />
3646            </div>
3647
3648            {/* Center Record Label */}
3649            <div className="relative z-10 w-24 h-24 rounded-full bg-neutral-900 border-2 border-amber-500/80 flex flex-col items-center justify-center text-center p-2 shadow-inner">
3650              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
3651                FREEZE
3652              </span>
3653              <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">
3654                JOG SCRUB
3655              </span>
3656              <div className="mt-1 flex items-center gap-1 text-[8px] font-black text-amber-300">
3657                <span>◀ ◀</span>
3658                <span>▶ ▶</span>
3659              </div>
3660            </div>
3661          </div>
3662
3663          <div className="mt-4 flex flex-col items-center gap-1 bg-black/85 px-4 py-1.5 rounded-full border border-amber-500/40 shadow-lg font-mono">
3664            <span className="text-[10px] font-bold text-amber-400 tracking-wider">
3665              💽 JOG WHEEL: SCRUB ADELANTE / ATRÁS
3666            </span>
3667            <span className="text-[8px] text-neutral-400 tracking-tight">
3668              DOS DEDOS EN PANTALLA O RUEDA DEL RATÓN
3669            </span>
3670          </div>
3671        </div>
3672      )}
3673
3674      {/* HELP & DOCUMENTATION MODAL OVERLAY */}
3675      {showHelp && (
3676        <div
3677          onClick={() => setShowHelp(false)}
3678          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
3679        >
3680          <div
3681            onClick={(e) => e.stopPropagation()}
3682            className="bg-neutral-950 border border-neutral-800 rounded-xl max-w-lg w-full max-h-[88vh] flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.9)] relative font-mono text-left"
3683          >
3684            {/* Modal Header */}
3685            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950 rounded-t-xl sticky top-0 z-10">
3686              <div className="flex items-center gap-2.5">
3687                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
3688                <h2 className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-white">
3689                  Guía de Funcionamiento
3690                </h2>
3691              </div>
3692              <button
3693                type="button"
3694                onClick={() => setShowHelp(false)}
3695                className="w-7 h-7 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white hover:border-white flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
3696                title="Cerrar ayuda"
3697              >
3698                ✕
3699              </button>
3700            </div>
3701
3702            {/* Modal Scrollable Body */}
3703            <div className="p-5 overflow-y-auto space-y-6 text-neutral-300 text-xs leading-relaxed select-text">
3704              {/* Sección 1: Botones */}
3705              <div>
3706                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
3707                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
3708                  1. Botones Principales (Void y Pulse)
3709                </h3>
3710                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
3711                  <li>
3712                    <span className="text-violet-400 font-bold">VOID (Violeta):</span> Sub-bass profundo con quinta analógica y pad ambiental que florece al sonar.
3713                  </li>
3714                  <li>
3715                    <span className="text-cyan-400 font-bold">PULSE (Cian):</span> Tríada de campanas armónicas cristalinas con retardo estéreo y brillo.
3716                  </li>
3717                  <li>
3718                    <span className="text-white">Modo Toggle:</span> Toca una vez para activar el sonido continuo; vuelve a tocar para apagar. Ambos botones pueden sonar a la vez.
3719                  </li>
3720                  <li>
3721                    <span className="text-white">Ondas en tiempo real:</span> Cada botón tiene un osciloscopio que muestra la forma de onda exacta del sonido generado.
3722                  </li>
3723                </ul>
3724              </div>
3725
3726              {/* Sección 2: Bolas Sónicas */}
3727              <div>
3728                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
3729                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
3730                  2. Bolas Sónicas Flotantes
3731                </h3>
3732                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
3733                  <li>
3734                    <span className="text-white">Nacimiento:</span> Cada vez que pulsas un botón, nace una bola transparente con el anillo exterior del color de ese botón.
3735                  </li>
3736                  <li>
3737                    <span className="text-white">Volumen al 10%:</span> Emiten de forma continua el sonido del botón a un 10% de volumen ambiental.
3738                  </li>
3739                  <li>
3740                    <span className="text-white">Física por Giroscopio:</span> Ruedan por la pantalla guiadas por la gravedad de la inclinación del móvil y rebotan elásticamente.
3741                  </li>
3742                  <li>
3743                    <span className="text-amber-400 font-bold">Repulsión Magnética:</span> Las bolas de diferente color (Void vs. Pulse) se repelen en el aire como dos polos magnéticos iguales.
3744                  </li>
3745                  <li>
3746                    <span className="text-white">Mutación por Choque:</span> Al rebotar contra un borde o entre sí, su sonido (tono, filtro y armónicos) cambia según la inclinación del móvil en ese instante.
3747                  </li>
3748                  <li>
3749                    <span className="text-white">Interacción con Dedo y Ratón:</span> Puedes mover el cursor o deslizar el dedo para empujar, apartar y golpear las bolas con inercia física en tiempo real.
3750                  </li>
3751                  <li>
3752                    <span className="text-white">Rebote en los Botones:</span> Las bolas también rebotan elásticamente contra los botones de Void y Pulse como en un pinball, modulando su sonido al chocar.
3753                  </li>
3754                  <li>
3755                    <span className="text-white">Eliminar bola:</span> Toca directamente encima de cualquier bola para apagar su sonido y hacerla desaparecer.
3756                  </li>
3757                </ul>
3758              </div>
3759
3760              {/* Sección 3: Crossfader */}
3761              <div>
3762                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
3763                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
3764                  3. Crossfader Vertical Lateral
3765                </h3>
3766                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
3767                  <li>
3768                    <span className="text-white">Hacia arriba:</span> Aumenta el volumen de VOID (+35%) y silencia PULSE por completo.
3769                  </li>
3770                  <li>
3771                    <span className="text-white">Hacia abajo:</span> Aumenta el volumen de PULSE (+35%) y silencia VOID por completo.
3772                  </li>
3773                  <li>
3774                    <span className="text-white">Centro (MID):</span> Balance parejo al 100% de volumen. Haz doble clic en el riel (o pulsa la tecla <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">C</code>) para centrar.
3775                  </li>
3776                </ul>
3777              </div>
3778
3779              {/* Sección 4: Volumen Rotatorio */}
3780              <div>
3781                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
3782                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
3783                  4. Control de Volumen Rotatorio (Clockwise)
3784                </h3>
3785                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
3786                  <li>
3787                    <span className="text-white">Girar en sentido horario:</span> Gira el móvil como una perilla hacia la derecha para subir el volumen general de la app.
3788                  </li>
3789                  <li>
3790                    <span className="text-white">Girar en sentido antihorario:</span> Gíralo hacia la izquierda para bajar el volumen.
3791                  </li>
3792                  <li>
3793                    <span className="text-white">Perilla táctil:</span> También puedes arrastrar directamente con el dedo la rueda de volumen en la barra superior.
3794                  </li>
3795                </ul>
3796              </div>
3797
3798              {/* Sección 5: Giroscopio */}
3799              <div>
3800                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
3801                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
3802                  5. Inclinación del Giroscopio (Tilt)
3803                </h3>
3804                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
3805                  <li>
3806                    <span className="text-white">Pitch (Adelante/Atrás):</span> Barre el filtro paso-bajo y la resonancia vocal de los sintetizadores.
3807                  </li>
3808                  <li>
3809                    <span className="text-white">Roll (Izquierda/Derecha):</span> Modula el feedback del eco estéreo dub y la apertura del pad.
3810                  </li>
3811                  <li>
3812                    Los propios botones se desplazan físicamente por la pantalla con inercia según la inclinación.
3813                  </li>
3814                </ul>
3815              </div>
3816
3817              {/* Sección 6: Ritmo y Bajo */}
3818              <div>
3819                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
3820                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
3821                  6. Ritmo y Bajo Sincronizado por Roll (Giroscopio)
3822                </h3>
3823                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
3824                  <li>
3825                    <span className="text-amber-400 font-bold">Evolución cada minuto:</span> La melodía y el ritmo cambian automáticamente cada 60 segundos por 4 estilos contrastantes:
3826                  </li>
3827                  <li className="pl-4">
3828                    • <strong className="text-white">Minuto 1 (Electro-Funk):</strong> Bombo a negras, palmadas y bajo con slap de octavas en C menor.
3829                  </li>
3830                  <li className="pl-4">
3831                    • <strong className="text-white">Minuto 2 (Cyberpunk Wave):</strong> Doble bombo, bajos rodantes en semicorcheas y charles abiertos en F menor.
3832                  </li>
3833                  <li className="pl-4">
3834                    • <strong className="text-white">Minuto 3 (Acid Tech-House):</strong> Four-on-the-floor continuo, charles en contratiempos y bajo ácido resonante en G menor.
3835                  </li>
3836                  <li className="pl-4">
3837                    • <strong className="text-white">Minuto 4 (Liquid Breakbeat):</strong> Bombo sincopado estilo break, redobles fantasma de caja y bajo melódico en Eb mayor.
3838                  </li>
3839                  <li>
3840                    <span className="text-amber-400 font-bold">Sincronización de BPM en tiempo real:</span> El tempo de la batería y el bajo responde directamente a la inclinación lateral (<code className="text-white">Roll / Gamma</code>) del móvil:
3841                  </li>
3842                  <li className="pl-4">
3843                    • <strong className="text-white">Inclinar a la derecha:</strong> Acelera el ritmo de forma progresiva hasta alcanzar <strong>152 BPM</strong> (techno / drum & bass).
3844                  </li>
3845                  <li className="pl-4">
3846                    • <strong className="text-white">Centro equilibrado:</strong> Tempo nominal de <strong>110 BPM</strong> (groove electro funk).
3847                  </li>
3848                  <li className="pl-4">
3849                    • <strong className="text-white">Inclinar a la izquierda:</strong> Ralentiza el tempo hasta <strong>68 BPM</strong> (slow-tempo / hip-hop pesada).
3850                  </li>
3851                  <li>
3852                    Las notas del sintetizador de bajo y las subdivisiones de percusión recalculan su duración y caída en cada paso para mantenerse perfectamente ajustadas y enérgicas sin importar la velocidad.
3853                  </li>
3854                </ul>
3855              </div>
3856
3857              {/* Sección 7: Pánico */}
3858              <div>
3859                <h3 className="text-red-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
3860                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
3861                  7. Función de Pánico (Silencio Inmediato)
3862                </h3>
3863                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
3864                  <li>
3865                    <span className="text-red-400 font-bold">Pulsación de 2 segundos en vacío:</span> Mantén el dedo apoyado en cualquier espacio libre de la pantalla durante 2 segundos para cortar todo el sonido, apagar los sintetizadores, parar el ritmo y eliminar las bolas.
3866                  </li>
3867                  <li>
3868                    <span className="text-white">Botón superior:</span> También puedes pulsar el botón rojo <code className="bg-neutral-900 px-1 py-0.5 rounded text-red-400">PANIC</code> (o la tecla <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">Esc</code> / <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">M</code>). Pulsa de nuevo para desmutear.
3869                  </li>
3870                </ul>
3871              </div>
3872
3873              {/* Sección 8: Plato de Vinilo / Jog Wheel (Turntable DJ) */}
3874              <div>
3875                <h3 className="text-amber-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
3876                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
3877                  8. Plato de Vinilo / Jog Wheel (Turntable DJ)
3878                </h3>
3879                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
3880                  <li>
3881                    <span className="text-amber-400 font-bold">Tocar para frenar (Vinyl Brake):</span> Apoya el dedo o haz clic y mantén pulsado sobre el plato de vinilo para frenar en seco la música inmediatamente, exactamente como al poner la mano sobre un tocadiscos de vinilo en marcha.
3882                  </li>
3883                  <li>
3884                    <span className="text-white">Girar para Scratch:</span> Mientras mantienes el dedo en el vinilo, arrastra hacia adelante o hacia atrás para rascar (*scratch*) el sonido con fricción realista de aguja, modulación de tono y desplazamiento del ritmo.
3885                  </li>
3886                  <li>
3887                    <span className="text-white">Soltar para Continuar (Motor Spin-Up):</span> Al levantar la mano del vinilo, el motor acelera suavemente (*spin-up*) y la música recupera su reproducción normal al instante.
3888                  </li>
3889                  <li>
3890                    <span className="text-white">Giro Continuo a 33⅓ RPM:</span> El plato gira de forma continua mientras la música está sonando, deteniéndose al instante cuando apoyas la mano encima.
3891                  </li>
3892                  <li>
3893                    <span className="text-white">Gestos adicionales:</span> También puedes rascar con la rueda del ratón en escritorio o con dos dedos en la pantalla táctil.
3894                  </li>
3895                </ul>
3896              </div>
3897
3898              {/* Sección 9: Exportación Bluetooth MIDI */}
3899              <div>
3900                <h3 className="text-blue-400 font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
3901                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
3902                  9. Exportación MIDI por Bluetooth (BLE MIDI)
3903                </h3>
3904                <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
3905                  <li>
3906                    <span className="text-blue-400 font-bold">Botón BLE MIDI ON/OFF:</span> Toca el botón para conectar y transmitir los datos del giroscopio a cualquier DAW (Ableton, Logic, GarageBand, FL Studio, Reaper) o sintetizador por Bluetooth MIDI o Web MIDI.
3907                  </li>
3908                  <li>
3909                    <span className="text-white">Inclinación Pitch (Adelante/Atrás):</span> Envía <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">CC 74 (Filtro Cutoff)</code> y <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">CC 1 (Mod Wheel)</code> de 0 a 127.
3910                  </li>
3911                  <li>
3912                    <span className="text-white">Inclinación Roll (Izquierda/Derecha):</span> Envía <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">CC 10 (Pan)</code>, <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">CC 16 (General 1)</code> y <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">Pitch Bend</code> de 14 bits.
3913                  </li>
3914                  <li>
3915                    <span className="text-white">Rotación de Pantalla (Yaw):</span> Envía <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">CC 11 (Expresión)</code> de 0 a 127.
3916                  </li>
3917                  <li>
3918                    <span className="text-white">Botones VOID y PULSE:</span> Transmiten notas MIDI estándar (C2 y G4) con velocidad 100.
3919                  </li>
3920                  <li>
3921                    <span className="text-white">Crossfader:</span> Transmite <code className="bg-neutral-900 px-1 py-0.5 rounded text-white">CC 8 (Balance)</code> de 0 a 127.
3922                  </li>
3923                </ul>
3924              </div>
3925            </div>
3926
3927            {/* Creator Attribution & Rights Footer */}
3928            <div className="px-5 py-3 bg-neutral-900/60 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] text-neutral-500 font-sans">
3929              <span>
3930                Developed & created by <strong className="text-neutral-300 font-semibold">Emiliabella</strong>. All rights reserved.
3931              </span>
3932              <span className="text-emerald-400/80 font-mono text-[9px] tracking-wider uppercase">
3933                100% Free for all users
3934              </span>
3935            </div>
3936
3937            {/* Modal Footer */}
3938            <div className="p-4 border-t border-neutral-800 bg-neutral-950 rounded-b-xl flex justify-end">
3939              <button
3940                type="button"
3941                onClick={() => setShowHelp(false)}
3942                className="px-5 py-2 bg-neutral-900 border border-neutral-700 hover:border-emerald-400 hover:text-emerald-300 text-white rounded text-xs tracking-wider transition-colors uppercase font-bold cursor-pointer"
3943              >
3944                Cerrar y Volver al Instrumento
3945              </button>
3946            </div>
3947          </div>
3948        </div>
3949      )}
3950      {holdIndicator && (
3951        <div
3952          className="fixed pointer-events-none z-50 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
3953          style={{ left: holdIndicator.x, top: holdIndicator.y }}
3954        >
3955          <div className="relative w-20 h-20 flex items-center justify-center">
3956            <svg className="w-20 h-20 -rotate-90">
3957              <circle
3958                cx="40"
3959                cy="40"
3960                r="32"
3961                className="stroke-neutral-800"
3962                strokeWidth="4"
3963                fill="none"
3964              />
3965              <circle
3966                cx="40"
3967                cy="40"
3968                r="32"
3969                className="stroke-red-500"
3970                strokeWidth="4"
3971                fill="none"
3972                strokeDasharray="201"
3973                strokeDashoffset="201"
3974                style={{
3975                  animation: "panicCharge 2000ms linear forwards",
3976                }}
3977              />
3978            </svg>
3979            <span className="absolute text-[10px] font-black tracking-widest text-red-400 uppercase">
3980              2s
3981            </span>
3982          </div>
3983          <span className="text-[9px] font-black tracking-widest text-red-400 uppercase mt-1 bg-black/90 px-2 py-0.5 rounded border border-red-600/60 shadow-[0_0_15px_rgba(239,68,68,0.7)]">
3984            SOSTÉN PARA PÁNICO
3985          </span>
3986        </div>
3987      )}
3988
3989      {/* STREAMING PLATFORMS MODAL */}
3990      <StreamingModal
3991        isOpen={showStreamingModal}
3992        onClose={() => setShowStreamingModal(false)}
3993      />
3994
3995      {/* TIP JAR / BOTE DE PROPINAS MODAL */}
3996      <TipJarModal
3997        isOpen={showTipJarModal}
3998        onClose={() => setShowTipJarModal(false)}
3999      />
4000
4001      {/* LIVE MIDI TEST MONITOR MODAL */}
4002      {showMidiMonitor && (
4003        <div
4004          onClick={() => setShowMidiMonitor(false)}
4005          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
4006        >
4007          <div
4008            onClick={(e) => e.stopPropagation()}
4009            className="bg-neutral-950 border-2 border-blue-500/80 rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(59,130,246,0.4)] font-mono text-left overflow-hidden"
4010          >
4011            {/* Header */}
4012            <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-neutral-800 bg-neutral-950 shrink-0">
4013              <div className="flex items-center gap-2">
4014                <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_#3b82f6]" />
4015                <span className="text-xs sm:text-sm font-black tracking-wider uppercase text-white">
4016                  MONITOR Y TEST BLE MIDI
4017                </span>
4018              </div>
4019              <button
4020                type="button"
4021                onClick={() => setShowMidiMonitor(false)}
4022                className="w-7 h-7 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
4023              >
4024                ✕
4025              </button>
4026            </div>
4027
4028            {/* Body */}
4029            <div className="p-4 space-y-3 overflow-y-auto">
4030              {/* Status Banner */}
4031              <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/40 flex items-center justify-between">
4032                <div>
4033                  <div className="text-[10px] text-blue-300 font-bold">ESTADO DE CONEXIÓN</div>
4034                  <div className="text-xs font-black text-white">
4035                    {bleMidiActive ? "TRANSMITIENDO EN VIVO (40 HZ)" : "STANDBY (PULSA TEST O ON)"}
4036                  </div>
4037                  <div className="text-[9px] text-neutral-400 mt-0.5">
4038                    {bleMidiDeviceName ? `Dispositivo: ${bleMidiDeviceName}` : "Canal MIDI 1 • Web Bluetooth / Web MIDI"}
4039                  </div>
4040                </div>
4041                <div className="text-right">
4042                  <div className="text-[9px] text-neutral-400 font-bold">PAQUETES</div>
4043                  <div className="text-lg font-black text-blue-400">{midiPacketCount}</div>
4044                </div>
4045              </div>
4046
4047              {/* Action buttons inside monitor */}
4048              <div className="flex items-center gap-2">
4049                <button
4050                  type="button"
4051                  onClick={runMidiSelfTest}
4052                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] tracking-wider uppercase shadow-[0_0_15px_rgba(59,130,246,0.5)] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
4053                >
4054                  <span>⚡</span>
4055                  <span>ENVIAR RÁFAGA DE TEST</span>
4056                </button>
4057                <button
4058                  type="button"
4059                  onClick={() => setMidiLogs([])}
4060                  className="px-2.5 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white text-[9px] font-bold cursor-pointer"
4061                >
4062                  LIMPIAR
4063                </button>
4064              </div>
4065
4066              {/* Live Log Stream */}
4067              <div className="space-y-1">
4068                <div className="flex items-center justify-between text-[9px] text-neutral-500 font-bold uppercase pb-1">
4069                  <span>FLUJO EN TIEMPO REAL (ÚLTIMOS PAQUETES)</span>
4070                  <span className="text-emerald-400 animate-pulse">● LIVE</span>
4071                </div>
4072                <div className="bg-black border border-neutral-800 rounded-lg p-2.5 space-y-1.5 max-h-48 overflow-y-auto font-mono text-[9px]">
4073                  {midiLogs.length === 0 ? (
4074                    <div className="text-neutral-600 text-center py-4">
4075                      No hay paquetes en el búfer. Pulsa "ENVIAR RÁFAGA DE TEST" o inclina el dispositivo.
4076                    </div>
4077                  ) : (
4078                    midiLogs.map((log) => (
4079                      <div
4080                        key={log.id}
4081                        className="flex items-center justify-between py-0.5 border-b border-neutral-900/80 last:border-0"
4082                      >
4083                        <div className="flex items-center gap-2">
4084                          <span className="text-neutral-500">{log.time}</span>
4085                          <span className="text-blue-400 font-bold font-mono">{log.hex}</span>
4086                        </div>
4087                        <span className="text-emerald-300 font-bold truncate ml-2">
4088                          {log.desc}
4089                        </span>
4090                      </div>
4091                    ))
4092                  )}
4093                </div>
4094              </div>
4095
4096              {/* CC Map Reference */}
4097              <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-2 text-[8.5px] text-neutral-400 space-y-0.5">
4098                <div className="text-neutral-300 font-bold uppercase mb-1">Mapeo de Controladores:</div>
4099                <div>• <span className="text-white">Inclinación Pitch:</span> CC 74 (Cutoff) & CC 1 (Mod Wheel) [0-127]</div>
4100                <div>• <span className="text-white">Inclinación Roll:</span> CC 10 (Pan) & Pitch Bend 14-bit [-8192..+8191]</div>
4101                <div>• <span className="text-white">Giro Yaw:</span> CC 11 (Expresión) [0-127]</div>
4102                <div>• <span className="text-white">Botones:</span> C2 (Nota 36) para VOID, G4 (Nota 67) para PULSE</div>
4103              </div>
4104            </div>
4105
4106            {/* Footer */}
4107            <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
4108              <button
4109                type="button"
4110                onClick={() => setShowMidiMonitor(false)}
4111                className="px-4 py-1.5 bg-neutral-900 border border-neutral-700 hover:border-blue-400 text-white rounded text-[10px] font-bold cursor-pointer"
4112              >
4113                Cerrar Monitor
4114              </button>
4115            </div>
4116          </div>
4117        </div>
4118      )}
4119
4120      {/* 2-MINUTE GAME OVER MODAL OVERLAY */}
4121      {isGameOver && (
4122        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
4123          <div className="bg-neutral-950 border-2 border-amber-500/80 rounded-2xl max-w-sm w-full p-5 flex flex-col items-center text-center shadow-[0_0_50px_rgba(245,158,11,0.5)] font-mono">
4124            <span className="text-4xl mb-2">🏆</span>
4125            <h2 className="text-base font-black text-amber-400 tracking-wider uppercase mb-1">
4126              ¡TIEMPO TERMINADO!
4127            </h2>
4128            <p className="text-[11px] text-neutral-400 mb-4">
4129              Han finalizado los 2 minutos de partida.
4130            </p>
4131
4132            <div className="w-full bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl mb-4 flex items-center justify-around">
4133              <div>
4134                <div className="text-[9px] text-neutral-500 uppercase font-bold">PUNTOS</div>
4135                <div className="text-2xl font-black text-amber-300">{gameScore}</div>
4136              </div>
4137              <div className="w-px h-8 bg-neutral-800" />
4138              <div>
4139                <div className="text-[9px] text-neutral-500 uppercase font-bold">RÉCORD</div>
4140                <div className="text-2xl font-black text-emerald-400">{highScore}</div>
4141              </div>
4142            </div>
4143
4144            <button
4145              type="button"
4146              onClick={restartGame}
4147              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(245,158,11,0.6)] cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
4148            >
4149              <span>🔄</span>
4150              <span>REINICIAR JUEGO (2 MIN)</span>
4151            </button>
4152          </div>
4153        </div>
4154      )}
4155
4156      {/* EXPLOSION BURSTS & FLOATING POINTS */}
4157      {explosions.map((exp) => (
4158        <div
4159          key={exp.id}
4160          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
4161          style={{ left: exp.x, top: exp.y }}
4162        >
4163          <div
4164            className="w-20 h-20 rounded-full animate-ping opacity-90"
4165            style={{
4166              backgroundColor: exp.color,
4167              boxShadow: `0 0 40px ${exp.color}`,
4168            }}
4169          />
4170        </div>
4171      ))}
4172
4173      {scorePops.map((pop) => (
4174        <div
4175          key={pop.id}
4176          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 text-sm sm:text-base font-black text-amber-300 drop-shadow-[0_0_10px_#f59e0b] animate-bounce"
4177          style={{ left: pop.x, top: pop.y - 20 }}
4178        >
4179          {pop.text}
4180        </div>
4181      ))}
4182    </div>
4183  );
4184}
4185
4186// STREAMING MODAL COMPONENT (TIDAL, SPOTIFY, APPLE MUSIC, YOUTUBE & SOUNDCLOUD)
4187interface StreamingLinks {
4188  tidal: string;
4189  spotify: string;
4190  apple: string;
4191  youtube: string;
4192  soundcloud: string;
4193}
4194
4195function StreamingModal({
4196  isOpen,
4197  onClose,
4198}: {
4199  isOpen: boolean;
4200  onClose: () => void;
4201}) {
4202  const [links, setLinks] = useState<StreamingLinks>({
4203    tidal: "https://tidal.com/browse/search?q=Emiliabella",
4204    spotify: "https://open.spotify.com/search/Emiliabella",
4205    apple: "https://music.apple.com/search?term=Emiliabella",
4206    youtube: "https://www.youtube.com/results?search_query=Emiliabella+Music",
4207    soundcloud: "https://soundcloud.com/search?q=Emiliabella",
4208  });
4209  const [isEditing, setIsEditing] = useState(false);
4210  const [copied, setCopied] = useState(false);
4211
4212  useEffect(() => {
4213    try {
4214      const stored = localStorage.getItem("duotone_streaming_links");
4215      if (stored) {
4216        setLinks(JSON.parse(stored));
4217      }
4218    } catch {}
4219  }, []);
4220
4221  const saveLinks = (next: StreamingLinks) => {
4222    setLinks(next);
4223    try {
4224      localStorage.setItem("duotone_streaming_links", JSON.stringify(next));
4225    } catch {}
4226  };
4227
4228  if (!isOpen) return null;
4229
4230  return (
4231    <div
4232      onClick={onClose}
4233      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
4234    >
4235      <div
4236        onClick={(e) => e.stopPropagation()}
4237        className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9)] relative font-mono text-left overflow-hidden"
4238      >
4239        {/* Header */}
4240        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-neutral-800 bg-neutral-950 shrink-0">
4241          <div className="flex items-center gap-2">
4242            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
4243            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white">
4244              PLATAFORMAS DE STREAMING
4245            </span>
4246          </div>
4247          <button
4248            type="button"
4249            onClick={onClose}
4250            className="w-7 h-7 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
4251          >
4252            ✕
4253          </button>
4254        </div>
4255
4256        {/* Content */}
4257        <div className="p-4 space-y-3 overflow-y-auto">
4258          <p className="text-[11px] text-neutral-400">
4259            Escucha la música oficial de <strong className="text-white">Emiliabella</strong> en tus aplicaciones favoritas:
4260          </p>
4261
4262          {/* Platform Links */}
4263          <div className="space-y-2">
4264            {/* Tidal (Top Recommended Payout) */}
4265            <a
4266              href={links.tidal}
4267              target="_blank"
4268              rel="noopener noreferrer"
4269              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/90 border border-cyan-500/50 hover:border-cyan-400 hover:bg-neutral-900 transition-all group cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.12)]"
4270            >
4271              <div className="flex items-center gap-3">
4272                <span className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-sm font-black text-cyan-300">
4273                  ◈
4274                </span>
4275                <div>
4276                  <div className="flex items-center gap-2">
4277                    <span className="text-xs font-bold text-white group-hover:text-cyan-300">
4278                      Tidal
4279                    </span>
4280                    <span className="text-[7.5px] font-bold px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/60 text-cyan-300 tracking-wider">
4281                      MÁS RETRIBUCIÓN (~$0.012)
4282                    </span>
4283                  </div>
4284                  <div className="text-[9px] text-neutral-400">Audio HiFi Master • Mejor pago por stream</div>
4285                </div>
4286              </div>
4287              <span className="text-[10px] text-cyan-400 group-hover:text-white font-bold">
4288                Abrir ↗
4289              </span>
4290            </a>
4291
4292            {/* Spotify */}
4293            <a
4294              href={links.spotify}
4295              target="_blank"
4296              rel="noopener noreferrer"
4297              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-emerald-500/70 hover:bg-neutral-900 transition-all group cursor-pointer"
4298            >
4299              <div className="flex items-center gap-3">
4300                <span className="w-8 h-8 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center text-sm">
4301                  🟢
4302                </span>
4303                <div>
4304                  <div className="text-xs font-bold text-white group-hover:text-emerald-400">
4305                    Spotify
4306                  </div>
4307                  <div className="text-[9px] text-neutral-500">Perfil de Artista & Singles</div>
4308                </div>
4309              </div>
4310              <span className="text-[10px] text-neutral-400 group-hover:text-white font-bold">
4311                Abrir ↗
4312              </span>
4313            </a>
4314
4315            {/* Apple Music */}
4316            <a
4317              href={links.apple}
4318              target="_blank"
4319              rel="noopener noreferrer"
4320              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-pink-500/70 hover:bg-neutral-900 transition-all group cursor-pointer"
4321            >
4322              <div className="flex items-center gap-3">
4323                <span className="w-8 h-8 rounded-full bg-[#FA243C]/20 border border-[#FA243C]/40 flex items-center justify-center text-sm">
4324                  🟣
4325                </span>
4326                <div>
4327                  <div className="text-xs font-bold text-white group-hover:text-pink-400">
4328                    Apple Music
4329                  </div>
4330                  <div className="text-[9px] text-neutral-500">Álbumes en Alta Fidelidad</div>
4331                </div>
4332              </div>
4333              <span className="text-[10px] text-neutral-400 group-hover:text-white font-bold">
4334                Abrir ↗
4335              </span>
4336            </a>
4337
4338            {/* YouTube Music */}
4339            <a
4340              href={links.youtube}
4341              target="_blank"
4342              rel="noopener noreferrer"
4343              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-red-500/70 hover:bg-neutral-900 transition-all group cursor-pointer"
4344            >
4345              <div className="flex items-center gap-3">
4346                <span className="w-8 h-8 rounded-full bg-[#FF0000]/20 border border-[#FF0000]/40 flex items-center justify-center text-sm">
4347                  🔴
4348                </span>
4349                <div>
4350                  <div className="text-xs font-bold text-white group-hover:text-red-400">
4351                    YouTube / YouTube Music
4352                  </div>
4353                  <div className="text-[9px] text-neutral-500">Vídeos y Audio Oficial</div>
4354                </div>
4355              </div>
4356              <span className="text-[10px] text-neutral-400 group-hover:text-white font-bold">
4357                Abrir ↗
4358              </span>
4359            </a>
4360
4361            {/* SoundCloud */}
4362            <a
4363              href={links.soundcloud}
4364              target="_blank"
4365              rel="noopener noreferrer"
4366              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/70 hover:bg-neutral-900 transition-all group cursor-pointer"
4367            >
4368              <div className="flex items-center gap-3">
4369                <span className="w-8 h-8 rounded-full bg-[#FF5500]/20 border border-[#FF5500]/40 flex items-center justify-center text-sm">
4370                  🟠
4371                </span>
4372                <div>
4373                  <div className="text-xs font-bold text-white group-hover:text-amber-400">
4374                    SoundCloud
4375                  </div>
4376                  <div className="text-[9px] text-neutral-500">Remixes, Beats & Sets</div>
4377                </div>
4378              </div>
4379              <span className="text-[10px] text-neutral-400 group-hover:text-white font-bold">
4380                Abrir ↗
4381              </span>
4382            </a>
4383          </div>
4384
4385          {/* Edit / Customize Toggle */}
4386          <div className="pt-2 border-t border-neutral-900">
4387            <button
4388              type="button"
4389              onClick={() => setIsEditing(!isEditing)}
4390              className="text-[9px] text-neutral-500 hover:text-neutral-300 underline font-bold cursor-pointer"
4391            >
4392              {isEditing ? "▲ Ocultar edición de enlaces" : "⚙️ Personalizar mis URLs directas"}
4393            </button>
4394
4395            {isEditing && (
4396              <div className="mt-2.5 space-y-2 bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800 text-[9px]">
4397                <div>
4398                  <label className="text-cyan-400 font-bold block mb-0.5">URL Tidal:</label>
4399                  <input
4400                    type="text"
4401                    value={links.tidal}
4402                    onChange={(e) => saveLinks({ ...links, tidal: e.target.value })}
4403                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-[9px]"
4404                  />
4405                </div>
4406                <div>
4407                  <label className="text-neutral-400 block mb-0.5">URL Spotify:</label>
4408                  <input
4409                    type="text"
4410                    value={links.spotify}
4411                    onChange={(e) => saveLinks({ ...links, spotify: e.target.value })}
4412                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-[9px]"
4413                  />
4414                </div>
4415                <div>
4416                  <label className="text-neutral-400 block mb-0.5">URL Apple Music:</label>
4417                  <input
4418                    type="text"
4419                    value={links.apple}
4420                    onChange={(e) => saveLinks({ ...links, apple: e.target.value })}
4421                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-[9px]"
4422                  />
4423                </div>
4424                <div>
4425                  <label className="text-neutral-400 block mb-0.5">URL YouTube:</label>
4426                  <input
4427                    type="text"
4428                    value={links.youtube}
4429                    onChange={(e) => saveLinks({ ...links, youtube: e.target.value })}
4430                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-[9px]"
4431                  />
4432                </div>
4433                <div>
4434                  <label className="text-neutral-400 block mb-0.5">URL SoundCloud:</label>
4435                  <input
4436                    type="text"
4437                    value={links.soundcloud}
4438                    onChange={(e) => saveLinks({ ...links, soundcloud: e.target.value })}
4439                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-[9px]"
4440                  />
4441                </div>
4442              </div>
4443            )}
4444          </div>
4445        </div>
4446
4447        {/* Footer */}
4448        <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-[10px] text-neutral-500 shrink-0">
4449          <button
4450            type="button"
4451            onClick={() => {
4452              try {
4453                navigator.clipboard?.writeText(window.location.href);
4454                setCopied(true);
4455                setTimeout(() => setCopied(false), 2000);
4456              } catch {}
4457            }}
4458            className="text-neutral-400 hover:text-white cursor-pointer font-bold"
4459          >
4460            {copied ? "✓ ¡Enlace copiado!" : "📋 Compartir esta app"}
4461          </button>
4462          <button
4463            type="button"
4464            onClick={onClose}
4465            className="px-3 py-1 bg-neutral-900 border border-neutral-700 hover:border-emerald-400 text-white rounded text-[10px] font-bold cursor-pointer"
4466          >
4467            Cerrar
4468          </button>
4469        </div>
4470      </div>
4471    </div>
4472  );
4473}
4474
4475// TIP JAR / BOTE DE PROPINAS MODAL COMPONENT (KO-FI, BUY ME A COFFEE, PAYPAL)
4476interface TipLinks {
4477  kofi: string;
4478  buymeacoffee: string;
4479  paypal: string;
4480}
4481
4482function TipJarModal({
4483  isOpen,
4484  onClose,
4485}: {
4486  isOpen: boolean;
4487  onClose: () => void;
4488}) {
4489  const [tipLinks, setTipLinks] = useState<TipLinks>({
4490    kofi: "https://ko-fi.com/Emiliabella",
4491    buymeacoffee: "https://buymeacoffee.com/Emiliabella",
4492    paypal: "https://paypal.me/Emiliabella",
4493  });
4494  const [isEditing, setIsEditing] = useState(false);
4495  const [copied, setCopied] = useState(false);
4496
4497  useEffect(() => {
4498    try {
4499      const stored = localStorage.getItem("duotone_tip_links");
4500      if (stored) {
4501        setTipLinks(JSON.parse(stored));
4502      }
4503    } catch {}
4504  }, []);
4505
4506  const saveTipLinks = (next: TipLinks) => {
4507    setTipLinks(next);
4508    try {
4509      localStorage.setItem("duotone_tip_links", JSON.stringify(next));
4510    } catch {}
4511  };
4512
4513  if (!isOpen) return null;
4514
4515  return (
4516    <div
4517      onClick={onClose}
4518      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
4519    >
4520      <div
4521        onClick={(e) => e.stopPropagation()}
4522        className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.9)] relative font-mono text-left overflow-hidden"
4523      >
4524        {/* Header */}
4525        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-neutral-800 bg-neutral-950 shrink-0">
4526          <div className="flex items-center gap-2">
4527            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
4528            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-white">
4529              BOTE DE PROPINAS • APOYO VOLUNTARIO
4530            </span>
4531          </div>
4532          <button
4533            type="button"
4534            onClick={onClose}
4535            className="w-7 h-7 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
4536          >
4537            ✕
4538          </button>
4539        </div>
4540
4541        {/* Content */}
4542        <div className="p-4 space-y-3.5 overflow-y-auto">
4543          <p className="text-[11px] text-neutral-300 leading-relaxed">
4544            Si disfrutas creando con este sintetizador y quieres apoyar el trabajo de{" "}
4545            <strong className="text-amber-400">Emiliabella</strong>, cualquier aportación voluntaria ayuda a mantener la app 100% gratuita:
4546          </p>
4547
4548          {/* Voluntary Tiers Grid */}
4549          <div className="grid grid-cols-3 gap-2">
4550            <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 text-center">
4551              <div className="text-lg mb-0.5">☕</div>
4552              <div className="text-xs font-black text-amber-300">1 €</div>
4553              <div className="text-[8px] text-neutral-400">Un café</div>
4554            </div>
4555            <div className="p-2 rounded-lg bg-neutral-900/60 border border-amber-500/40 text-center shadow-[0_0_10px_rgba(245,158,11,0.15)]">
4556              <div className="text-lg mb-0.5">🎵</div>
4557              <div className="text-xs font-black text-amber-300">3 €</div>
4558              <div className="text-[8px] text-neutral-400">Un single</div>
4559            </div>
4560            <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 text-center">
4561              <div className="text-lg mb-0.5">🎛️</div>
4562              <div className="text-xs font-black text-amber-300">5 €</div>
4563              <div className="text-[8px] text-neutral-400">Sesión Pro</div>
4564            </div>
4565          </div>
4566
4567          {/* Direct Support Payment Options */}
4568          <div className="space-y-2">
4569            {/* Ko-fi */}
4570            <a
4571              href={tipLinks.kofi}
4572              target="_blank"
4573              rel="noopener noreferrer"
4574              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/90 border border-amber-500/50 hover:border-amber-400 hover:bg-neutral-900 transition-all group cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.12)]"
4575            >
4576              <div className="flex items-center gap-3">
4577                <span className="w-8 h-8 rounded-full bg-[#FF5E5B]/20 border border-[#FF5E5B]/50 flex items-center justify-center text-sm">
4578                  ☕
4579                </span>
4580                <div>
4581                  <div className="flex items-center gap-2">
4582                    <span className="text-xs font-bold text-white group-hover:text-amber-300">
4583                      Ko-fi
4584                    </span>
4585                    <span className="text-[7.5px] font-bold px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500/60 text-amber-300 tracking-wider">
4586                      0% COMISIÓN
4587                    </span>
4588                  </div>
4589                  <div className="text-[9px] text-neutral-400">Dona 1€, 2€ o más con tarjeta/Bizum</div>
4590                </div>
4591              </div>
4592              <span className="text-[10px] text-amber-400 group-hover:text-white font-bold">
4593                Donar ↗
4594              </span>
4595            </a>
4596
4597            {/* Buy Me a Coffee */}
4598            <a
4599              href={tipLinks.buymeacoffee}
4600              target="_blank"
4601              rel="noopener noreferrer"
4602              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-yellow-400/70 hover:bg-neutral-900 transition-all group cursor-pointer"
4603            >
4604              <div className="flex items-center gap-3">
4605                <span className="w-8 h-8 rounded-full bg-[#FFDD00]/20 border border-[#FFDD00]/40 flex items-center justify-center text-sm">
4606                  💛
4607                </span>
4608                <div>
4609                  <div className="text-xs font-bold text-white group-hover:text-yellow-300">
4610                    Buy Me a Coffee
4611                  </div>
4612                  <div className="text-[9px] text-neutral-500">Invita a un café rápidamente</div>
4613                </div>
4614              </div>
4615              <span className="text-[10px] text-neutral-400 group-hover:text-white font-bold">
4616                Invitar ↗
4617              </span>
4618            </a>
4619
4620            {/* PayPal.me */}
4621            <a
4622              href={tipLinks.paypal}
4623              target="_blank"
4624              rel="noopener noreferrer"
4625              className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-blue-400/70 hover:bg-neutral-900 transition-all group cursor-pointer"
4626            >
4627              <div className="flex items-center gap-3">
4628                <span className="w-8 h-8 rounded-full bg-[#0079C1]/20 border border-[#0079C1]/40 flex items-center justify-center text-sm">
4629                  🅿️
4630                </span>
4631                <div>
4632                  <div className="text-xs font-bold text-white group-hover:text-blue-300">
4633                    PayPal.me
4634                  </div>
4635                  <div className="text-[9px] text-neutral-500">Aportación directa y segura</div>
4636                </div>
4637              </div>
4638              <span className="text-[10px] text-neutral-400 group-hover:text-white font-bold">
4639                Enviar ↗
4640              </span>
4641            </a>
4642          </div>
4643
4644          {/* Edit / Customize Toggle */}
4645          <div className="pt-2 border-t border-neutral-900">
4646            <button
4647              type="button"
4648              onClick={() => setIsEditing(!isEditing)}
4649              className="text-[9px] text-neutral-500 hover:text-neutral-300 underline font-bold cursor-pointer"
4650            >
4651              {isEditing ? "▲ Ocultar edición de enlaces" : "⚙️ Personalizar mis enlaces de propina"}
4652            </button>
4653
4654            {isEditing && (
4655              <div className="mt-2.5 space-y-2 bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800 text-[9px]">
4656                <div>
4657                  <label className="text-amber-400 font-bold block mb-0.5">URL Ko-fi:</label>
4658                  <input
4659                    type="text"
4660                    value={tipLinks.kofi}
4661                    onChange={(e) => saveTipLinks({ ...tipLinks, kofi: e.target.value })}
4662                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-[9px]"
4663                  />
4664                </div>
4665                <div>
4666                  <label className="text-yellow-400 font-bold block mb-0.5">URL Buy Me a Coffee:</label>
4667                  <input
4668                    type="text"
4669                    value={tipLinks.buymeacoffee}
4670                    onChange={(e) => saveTipLinks({ ...tipLinks, buymeacoffee: e.target.value })}
4671                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-[9px]"
4672                  />
4673                </div>
4674                <div>
4675                  <label className="text-blue-400 font-bold block mb-0.5">URL PayPal.me:</label>
4676                  <input
4677                    type="text"
4678                    value={tipLinks.paypal}
4679                    onChange={(e) => saveTipLinks({ ...tipLinks, paypal: e.target.value })}
4680                    className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-white text-[9px]"
4681                  />
4682                </div>
4683              </div>
4684            )}
4685          </div>
4686        </div>
4687
4688        {/* Footer */}
4689        <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-[10px] text-neutral-500 shrink-0">
4690          <button
4691            type="button"
4692            onClick={() => {
4693              try {
4694                navigator.clipboard?.writeText(tipLinks.kofi);
4695                setCopied(true);
4696                setTimeout(() => setCopied(false), 2000);
4697              } catch {}
4698            }}
4699            className="text-neutral-400 hover:text-white cursor-pointer font-bold"
4700          >
4701            {copied ? "✓ ¡Enlace copiado!" : "📋 Copiar enlace de Ko-fi"}
4702          </button>
4703          <button
4704            type="button"
4705            onClick={onClose}
4706            className="px-3 py-1 bg-neutral-900 border border-neutral-700 hover:border-amber-400 text-white rounded text-[10px] font-bold cursor-pointer"
4707          >
4708            Cerrar
4709          </button>
4710        </div>
4711      </div>
4712    </div>
4713  );
4714}