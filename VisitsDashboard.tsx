1import React, { useState, useEffect } from "react";
2
3interface VisitsDashboardProps {
4  visitsCount: number;
5  activeUsersCount: number;
6  onBack: () => void;
7  onAddVisit: () => void;
8  isAudioPlaying: boolean;
9  togglePanic: () => void;
10  isPanicked: boolean;
11}
12
13interface ActivityEvent {
14  id: string;
15  country: string;
16  flag: string;
17  city: string;
18  action: string;
19  device: "Móvil" | "Escritorio" | "Tablet";
20  timeAgo: string;
21  badgeColor: string;
22}
23
24export default function VisitsDashboard({
25  visitsCount,
26  activeUsersCount,
27  onBack,
28  onAddVisit,
29  isAudioPlaying,
30  togglePanic,
31  isPanicked,
32}: VisitsDashboardProps) {
33  const [selectedHour, setSelectedHour] = useState<number | null>(null);
34  const [liveEvents, setLiveEvents] = useState<ActivityEvent[]>([]);
35  const [activeTab, setActiveTab] = useState<"history24" | "history7" | "current" | "devices">("history24");
36
37  // Hourly distribution for 24h history chart (peaking in afternoon and night)
38  const hourlyData = [
39    { hour: "00h", visits: 24 },
40    { hour: "01h", visits: 16 },
41    { hour: "02h", visits: 10 },
42    { hour: "03h", visits: 7 },
43    { hour: "04h", visits: 5 },
44    { hour: "05h", visits: 8 },
45    { hour: "06h", visits: 18 },
46    { hour: "07h", visits: 32 },
47    { hour: "08h", visits: 55 },
48    { hour: "09h", visits: 78 },
49    { hour: "10h", visits: 95 },
50    { hour: "11h", visits: 112 },
51    { hour: "12h", visits: 130 },
52    { hour: "13h", visits: 125 },
53    { hour: "14h", visits: 140 },
54    { hour: "15h", visits: 165 },
55    { hour: "16h", visits: 180 },
56    { hour: "17h", visits: 210 },
57    { hour: "18h", visits: 245 },
58    { hour: "19h", visits: 260 },
59    { hour: "20h", visits: 295 },
60    { hour: "21h", visits: 310 },
61    { hour: "22h", visits: 275 },
62    { hour: "23h", visits: 185 },
63  ];
64
65  const maxHourly = Math.max(...hourlyData.map((d) => d.visits));
66
67  // 7-day historical days
68  const weeklyData = [
69    { day: "Lun", date: "17 Nov", visits: 215, pct: 68 },
70    { day: "Mar", date: "18 Nov", visits: 248, pct: 78 },
71    { day: "Mié", date: "19 Nov", visits: 198, pct: 62 },
72    { day: "Jue", date: "20 Nov", visits: 285, pct: 89 },
73    { day: "Vie", date: "21 Nov", visits: 320, pct: 100 },
74    { day: "Sáb", date: "22 Nov", visits: 310, pct: 97 },
75    { day: "Hoy", date: "23 Nov", visits: 274, pct: 86, isToday: true },
76  ];
77
78  // Initial live activity stream
79  useEffect(() => {
80    const initialEvents: ActivityEvent[] = [
81      {
82        id: "1",
83        country: "España",
84        flag: "🇪🇸",
85        city: "Madrid",
86        action: "Sintetizador VOID activado con osciloscopio",
87        device: "Móvil",
88        timeAgo: "Hace 12s",
89        badgeColor: "text-violet-400 border-violet-500/40 bg-violet-950/40",
90      },
91      {
92        id: "2",
93        country: "México",
94        flag: "🇲🇽",
95        city: "CDMX",
96        action: "Scratch continuo en Plato de Vinilo DJ",
97        device: "Tablet",
98        timeAgo: "Hace 34s",
99        badgeColor: "text-amber-400 border-amber-500/40 bg-amber-950/40",
100      },
101      {
102        id: "3",
103        country: "Argentina",
104        flag: "🇦🇷",
105        city: "Buenos Aires",
106        action: "Ritmo BEAT & BASS acelerado a 138 BPM por Roll",
107        device: "Móvil",
108        timeAgo: "Hace 1m",
109        badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
110      },
111      {
112        id: "4",
113        country: "Colombia",
114        flag: "🇨🇴",
115        city: "Medellín",
116        action: "Spawn de 5 Bolas Sónicas con rotación orbital",
117        device: "Móvil",
118        timeAgo: "Hace 2m",
119        badgeColor: "text-cyan-400 border-cyan-500/40 bg-cyan-950/40",
120      },
121      {
122        id: "5",
123        country: "Chile",
124        flag: "🇨🇱",
125        city: "Santiago",
126        action: "Crossfader vertical ajustado a +35% VOID",
127        device: "Escritorio",
128        timeAgo: "Hace 3m",
129        badgeColor: "text-neutral-300 border-neutral-700 bg-neutral-900/60",
130      },
131      {
132        id: "6",
133        country: "Estados Unidos",
134        flag: "🇺🇸",
135        city: "Miami",
136        action: "Giroscopio 3D activado: filtro resonante",
137        device: "Móvil",
138        timeAgo: "Hace 5m",
139        badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
140      },
141    ];
142
143    setLiveEvents(initialEvents);
144
145    // Periodic simulation of new live connections
146    const interval = window.setInterval(() => {
147      const candidates = [
148        {
149          country: "España",
150          flag: "🇪🇸",
151          city: "Barcelona",
152          action: "Toco PULSE Chimes y rebote magnético",
153          device: "Móvil" as const,
154          badgeColor: "text-cyan-400 border-cyan-500/40 bg-cyan-950/40",
155        },
156        {
157          country: "Perú",
158          flag: "🇵🇪",
159          city: "Lima",
160          action: "Frenado en seco Vinyl Brake en tocadiscos",
161          device: "Móvil" as const,
162          badgeColor: "text-amber-400 border-amber-500/40 bg-amber-950/40",
163        },
164        {
165          country: "Alemania",
166          flag: "🇩🇪",
167          city: "Berlín",
168          action: "Paso a estilo 3: Acid Tech-House 110 BPM",
169          device: "Escritorio" as const,
170          badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
171        },
172        {
173          country: "Uruguay",
174          flag: "🇺🇾",
175          city: "Montevideo",
176          action: "Rotación invisible de bolas en órbita horaria",
177          device: "Móvil" as const,
178          badgeColor: "text-violet-400 border-violet-500/40 bg-violet-950/40",
179        },
180      ];
181
182      const pick = candidates[Math.floor(Math.random() * candidates.length)];
183      const newEvent: ActivityEvent = {
184        id: Date.now().toString(),
185        ...pick,
186        timeAgo: "Justo ahora",
187      };
188
189      setLiveEvents((prev) => [newEvent, ...prev.slice(0, 7)]);
190    }, 11000);
191
192    return () => clearInterval(interval);
193  }, []);
194
195  return (
196    <div className="h-screen h-[100dvh] max-h-screen w-full flex flex-col justify-between bg-black text-white p-2.5 sm:p-4 font-mono select-none overflow-hidden">
197      {/* Top Header Bar */}
198      <div className="w-full flex items-center justify-between gap-2 pb-2.5 border-b border-neutral-800 shrink-0">
199        <div className="flex items-center gap-2 sm:gap-3">
200          <button
201            type="button"
202            onClick={onBack}
203            className="px-2.5 sm:px-3 py-1 rounded-full border border-neutral-700 bg-neutral-900/90 text-neutral-300 hover:text-white hover:border-emerald-400 flex items-center gap-1.5 text-[10px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer shadow"
204          >
205            <span>◀</span>
206            <span className="hidden sm:inline">VOLVER AL SINTETIZADOR</span>
207            <span className="sm:hidden">VOLVER</span>
208          </button>
209
210          <div className="flex items-center gap-1.5">
211            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
212            <h1 className="text-xs sm:text-sm font-bold tracking-[0.15em] uppercase text-white truncate">
213              PANEL DE VISITAS
214            </h1>
215          </div>
216        </div>
217
218        <div className="flex items-center gap-2 shrink-0">
219          <button
220            type="button"
221            onClick={onAddVisit}
222            className="px-2 sm:px-2.5 py-1 rounded border border-emerald-600/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 text-[9px] sm:text-[10px] font-bold tracking-wider active:scale-95 cursor-pointer"
223            title="Simula un nuevo visitante (+1)"
224          >
225            +1 SIMULAR
226          </button>
227
228          <button
229            type="button"
230            onClick={togglePanic}
231            className={`px-2 sm:px-2.5 py-1 rounded border text-[9px] sm:text-[10px] font-bold tracking-wider cursor-pointer ${
232              isPanicked
233                ? "bg-red-950 border-red-500 text-red-300 animate-pulse"
234                : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white"
235            }`}
236          >
237            {isPanicked ? "MUTED" : "PANIC"}
238          </button>
239        </div>
240      </div>
241
242      {/* KPI METRIC CARDS ROW (Compact, responsive, zero scroll) */}
243      <div className="w-full grid grid-cols-4 gap-1.5 sm:gap-3 my-2 shrink-0">
244        {/* Total Visits */}
245        <div className="p-2 sm:p-2.5 rounded-lg bg-neutral-950/90 border border-neutral-800 flex flex-col justify-between">
246          <span className="text-neutral-500 text-[8px] sm:text-[9px] uppercase font-bold tracking-wider truncate">
247            TOTAL VISITAS
248          </span>
249          <div className="text-sm sm:text-xl font-black text-white tracking-tight truncate">
250            {visitsCount.toLocaleString()}
251          </div>
252          <span className="text-[8px] sm:text-[9px] text-emerald-400 font-bold truncate">
253            ↑ +18.4%
254          </span>
255        </div>
256
257        {/* Current Live */}
258        <div className="p-2 sm:p-2.5 rounded-lg bg-neutral-950/90 border border-neutral-800 flex flex-col justify-between">
259          <div className="flex items-center justify-between">
260            <span className="text-neutral-500 text-[8px] sm:text-[9px] uppercase font-bold tracking-wider truncate">
261              EN VIVO
262            </span>
263            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shadow-[0_0_6px_#34d399]" />
264          </div>
265          <div className="text-sm sm:text-xl font-black text-emerald-400 tracking-tight truncate">
266            {activeUsersCount}
267          </div>
268          <span className="text-[8px] sm:text-[9px] text-emerald-300 font-bold truncate">
269            Activos ahora
270          </span>
271        </div>
272
273        {/* Today */}
274        <div className="p-2 sm:p-2.5 rounded-lg bg-neutral-950/90 border border-neutral-800 flex flex-col justify-between">
275          <span className="text-neutral-500 text-[8px] sm:text-[9px] uppercase font-bold tracking-wider truncate">
276            HOY
277          </span>
278          <div className="text-sm sm:text-xl font-black text-amber-400 tracking-tight truncate">
279            274
280          </div>
281          <span className="text-[8px] sm:text-[9px] text-neutral-400 truncate">
282            Pico: 21h
283          </span>
284        </div>
285
286        {/* Retention */}
287        <div className="p-2 sm:p-2.5 rounded-lg bg-neutral-950/90 border border-neutral-800 flex flex-col justify-between">
288          <span className="text-neutral-500 text-[8px] sm:text-[9px] uppercase font-bold tracking-wider truncate">
289            RETENCIÓN
290          </span>
291          <div className="text-sm sm:text-xl font-black text-violet-300 tracking-tight truncate">
292            89%
293          </div>
294          <span className="text-[8px] sm:text-[9px] text-neutral-400 truncate">
295            4m 38s
296          </span>
297        </div>
298      </div>
299
300      {/* Sub-Tab Selector Navigation (Allows switching content without scroll) */}
301      <div className="w-full flex items-center gap-1.5 border-b border-neutral-900 pb-1.5 shrink-0 overflow-x-auto no-scrollbar">
302        <button
303          type="button"
304          onClick={() => setActiveTab("history24")}
305          className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
306            activeTab === "history24"
307              ? "bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]"
308              : "bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800"
309          }`}
310        >
311          📊 HISTORIAL 24H
312        </button>
313        <button
314          type="button"
315          onClick={() => setActiveTab("history7")}
316          className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
317            activeTab === "history7"
318              ? "bg-emerald-400 text-black shadow-[0_0_12px_rgba(52,211,153,0.5)]"
319              : "bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800"
320          }`}
321        >
322          📅 ÚLTIMOS 7 DÍAS
323        </button>
324        <button
325          type="button"
326          onClick={() => setActiveTab("current")}
327          className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
328            activeTab === "current"
329              ? "bg-emerald-400 text-black shadow-[0_0_12px_rgba(52,211,153,0.5)]"
330              : "bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800"
331          }`}
332        >
333          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
334          🟢 EN VIVO ({activeUsersCount})
335        </button>
336        <button
337          type="button"
338          onClick={() => setActiveTab("devices")}
339          className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
340            activeTab === "devices"
341              ? "bg-cyan-400 text-black shadow-[0_0_12px_rgba(34,211,238,0.5)]"
342              : "bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800"
343          }`}
344        >
345          📱 DISPOSITIVOS
346        </button>
347      </div>
348
349      {/* DYNAMIC MAIN CONTENT PANEL: Strictly fits available space, zero scroll */}
350      <div className="w-full flex-1 min-h-0 my-2 bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-3 sm:p-4 flex flex-col justify-between overflow-hidden">
351        {/* TAB 1: 24-HOUR HISTOGRAM */}
352        {activeTab === "history24" && (
353          <div className="w-full h-full flex flex-col justify-between overflow-hidden">
354            <div className="flex items-center justify-between shrink-0 mb-1">
355              <span className="text-[10px] sm:text-xs font-bold tracking-wider text-amber-400 uppercase">
356                TRÁFICO POR HORA (ÚLTIMAS 24 HORAS)
357              </span>
358              <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
359                {selectedHour !== null
360                  ? `${hourlyData[selectedHour].hour}: ${hourlyData[selectedHour].visits} visitas`
361                  : "Toca una barra para ver detalles"}
362              </span>
363            </div>
364
365            {/* Flexible-height bar chart */}
366            <div className="flex-1 w-full flex items-end justify-between gap-1 sm:gap-1.5 pt-2 pb-1 px-1 border-b border-neutral-800 min-h-0">
367              {hourlyData.map((d, idx) => {
368                const heightPct = Math.round((d.visits / maxHourly) * 100);
369                const isPeak = d.visits >= 290;
370                const isSelected = selectedHour === idx;
371                return (
372                  <div
373                    key={d.hour}
374                    onMouseEnter={() => setSelectedHour(idx)}
375                    onMouseLeave={() => setSelectedHour(null)}
376                    onClick={() => setSelectedHour(idx)}
377                    className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group"
378                  >
379                    <div
380                      style={{ height: `${heightPct}%` }}
381                      className={`w-full rounded-t-sm transition-all duration-150 ${
382                        isSelected
383                          ? "bg-amber-300 shadow-[0_0_10px_#f59e0b]"
384                          : isPeak
385                          ? "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]"
386                          : "bg-neutral-800 group-hover:bg-neutral-600"
387                      }`}
388                    />
389                  </div>
390                );
391              })}
392            </div>
393
394            <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-neutral-500 pt-1 shrink-0 font-mono">
395              <span>00h</span>
396              <span>04h</span>
397              <span>08h</span>
398              <span>12h</span>
399              <span>16h</span>
400              <span>20h</span>
401              <span>23h</span>
402            </div>
403          </div>
404        )}
405
406        {/* TAB 2: 7-DAY HISTORY */}
407        {activeTab === "history7" && (
408          <div className="w-full h-full flex flex-col justify-between overflow-hidden">
409            <div className="flex items-center justify-between shrink-0 mb-1">
410              <span className="text-[10px] sm:text-xs font-bold tracking-wider text-emerald-400 uppercase">
411                COMPARATIVA SEMANAL (ÚLTIMOS 7 DÍAS)
412              </span>
413              <span className="text-[9px] text-neutral-400">Total semanal: 1,850 visitas</span>
414            </div>
415
416            <div className="flex-1 flex flex-col justify-around py-1 min-h-0">
417              {weeklyData.map((w) => (
418                <div key={w.date} className="flex items-center justify-between text-[11px] sm:text-xs">
419                  <div className="w-20 text-neutral-400 font-mono flex items-center gap-1">
420                    <span className={w.isToday ? "text-emerald-400 font-bold" : "text-neutral-300"}>
421                      {w.day}
422                    </span>
423                    <span className="text-neutral-600 text-[9px]">({w.date})</span>
424                  </div>
425
426                  <div className="flex-1 mx-2 sm:mx-3 h-2 sm:h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
427                    <div
428                      style={{ width: `${w.pct}%` }}
429                      className={`h-full rounded-full transition-all duration-300 ${
430                        w.isToday ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-neutral-600"
431                      }`}
432                    />
433                  </div>
434
435                  <span className="w-14 text-right font-bold text-neutral-200 font-mono text-[10px] sm:text-xs">
436                    {w.visits}
437                  </span>
438                </div>
439              ))}
440            </div>
441          </div>
442        )}
443
444        {/* TAB 3: CURRENT LIVE USERS */}
445        {activeTab === "current" && (
446          <div className="w-full h-full flex flex-col justify-between overflow-hidden">
447            <div className="flex items-center justify-between shrink-0 mb-1">
448              <span className="text-[10px] sm:text-xs font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
449                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
450                SESIONES ACTIVAS EN TIEMPO REAL
451              </span>
452              <span className="text-[9px] text-neutral-400">Latencia: ~24ms</span>
453            </div>
454
455            <div className="flex-1 flex flex-col justify-between py-1 min-h-0 space-y-1">
456              {liveEvents.slice(0, 5).map((evt) => (
457                <div
458                  key={evt.id}
459                  className="flex items-center justify-between p-1.5 sm:p-2 rounded bg-neutral-900/60 border border-neutral-800/80 text-[10px] sm:text-xs"
460                >
461                  <div className="flex items-center gap-2 truncate">
462                    <span className="text-sm shrink-0">{evt.flag}</span>
463                    <div className="flex flex-col truncate">
464                      <span className="font-bold text-neutral-200 truncate leading-tight">
465                        {evt.city}, {evt.country}
466                      </span>
467                      <span className="text-neutral-400 text-[9px] truncate">{evt.action}</span>
468                    </div>
469                  </div>
470
471                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
472                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${evt.badgeColor}`}>
473                      {evt.device}
474                    </span>
475                    <span className="text-neutral-500 font-mono text-[8px] sm:text-[9px]">
476                      {evt.timeAgo}
477                    </span>
478                  </div>
479                </div>
480              ))}
481            </div>
482          </div>
483        )}
484
485        {/* TAB 4: DEVICES & SOUND MODES */}
486        {activeTab === "devices" && (
487          <div className="w-full h-full flex flex-col justify-between overflow-hidden">
488            <div className="flex items-center justify-between shrink-0 mb-1">
489              <span className="text-[10px] sm:text-xs font-bold tracking-wider text-cyan-400 uppercase">
490                DISTRIBUCIÓN DE PLATAFORMAS & SONIDO
491              </span>
492              <span className="text-[9px] text-neutral-400">Total dispositivos: 100%</span>
493            </div>
494
495            <div className="flex-1 grid grid-cols-2 gap-3 py-1 min-h-0">
496              {/* Devices column */}
497              <div className="p-2 sm:p-3 rounded bg-neutral-900/50 border border-neutral-800 flex flex-col justify-around">
498                <span className="text-[9px] uppercase font-bold text-neutral-400 mb-1">
499                  Dispositivos
500                </span>
501                <div className="space-y-1.5 text-[10px] sm:text-xs">
502                  <div className="flex items-center justify-between">
503                    <span className="text-neutral-300">📱 Móvil (Giroscopio)</span>
504                    <span className="text-cyan-400 font-bold font-mono">65%</span>
505                  </div>
506                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
507                    <div style={{ width: "65%" }} className="h-full bg-cyan-400" />
508                  </div>
509                  <div className="flex items-center justify-between mt-1">
510                    <span className="text-neutral-300">💻 Escritorio (Rueda)</span>
511                    <span className="text-neutral-400 font-bold font-mono">28%</span>
512                  </div>
513                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
514                    <div style={{ width: "28%" }} className="h-full bg-neutral-500" />
515                  </div>
516                  <div className="flex items-center justify-between mt-1">
517                    <span className="text-neutral-300">📟 Tablet</span>
518                    <span className="text-neutral-500 font-bold font-mono">7%</span>
519                  </div>
520                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
521                    <div style={{ width: "7%" }} className="h-full bg-neutral-600" />
522                  </div>
523                </div>
524              </div>
525
526              {/* Sound modes column */}
527              <div className="p-2 sm:p-3 rounded bg-neutral-900/50 border border-neutral-800 flex flex-col justify-around">
528                <span className="text-[9px] uppercase font-bold text-neutral-400 mb-1">
529                  Modos Sonoros
530                </span>
531                <div className="space-y-1.5 text-[10px] sm:text-xs">
532                  <div className="flex items-center justify-between">
533                    <span className="text-violet-400">VOID Drone</span>
534                    <span className="text-violet-300 font-bold font-mono">42%</span>
535                  </div>
536                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
537                    <div style={{ width: "42%" }} className="h-full bg-violet-400" />
538                  </div>
539                  <div className="flex items-center justify-between mt-1">
540                    <span className="text-cyan-400">PULSE Chimes</span>
541                    <span className="text-cyan-300 font-bold font-mono">34%</span>
542                  </div>
543                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
544                    <div style={{ width: "34%" }} className="h-full bg-cyan-400" />
545                  </div>
546                  <div className="flex items-center justify-between mt-1">
547                    <span className="text-amber-400">BEAT & Vinilo</span>
548                    <span className="text-amber-300 font-bold font-mono">24%</span>
549                  </div>
550                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
551                    <div style={{ width: "24%" }} className="h-full bg-amber-400" />
552                  </div>
553                </div>
554              </div>
555            </div>
556          </div>
557        )}
558      </div>
559
560      {/* Bottom Footer Bar */}
561      <div className="w-full flex items-center justify-between pt-2 border-t border-neutral-900 text-[9px] text-neutral-500 font-sans shrink-0">
562        <span>
563          Desarrollado por <strong className="text-neutral-400 font-semibold">Emiliabella</strong> • 100% Gratuito
564        </span>
565        <button
566          type="button"
567          onClick={onBack}
568          className="text-emerald-400 hover:underline uppercase font-bold font-mono tracking-wider cursor-pointer text-[10px]"
569        >
570          Volver al Sintetizador ➔
571        </button>
572      </div>
573    </div>
574  );
