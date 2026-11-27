import React, { useState, useEffect } from "react";

interface VisitsDashboardProps {
  visitsCount: number;
  activeUsersCount: number;
  onBack: () => void;
  onAddVisit: () => void;
  isAudioPlaying: boolean;
  togglePanic: () => void;
  isPanicked: boolean;
}

interface ActivityEvent {
  id: string;
  country: string;
  flag: string;
  city: string;
  action: string;
  device: "Móvil" | "Escritorio" | "Tablet";
  timeAgo: string;
  badgeColor: string;
}

export default function VisitsDashboard({
  visitsCount,
  activeUsersCount,
  onBack,
  onAddVisit,
  isAudioPlaying,
  togglePanic,
  isPanicked,
}: VisitsDashboardProps) {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [liveEvents, setLiveEvents] = useState<ActivityEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"history24" | "history7" | "current" | "devices">("history24");

  // Hourly distribution for 24h history chart (peaking in afternoon and night)
  const hourlyData = [
    { hour: "00h", visits: 24 },
    { hour: "01h", visits: 16 },
    { hour: "02h", visits: 10 },
    { hour: "03h", visits: 7 },
    { hour: "04h", visits: 5 },
    { hour: "05h", visits: 8 },
    { hour: "06h", visits: 18 },
    { hour: "07h", visits: 32 },
    { hour: "08h", visits: 55 },
    { hour: "09h", visits: 78 },
    { hour: "10h", visits: 95 },
    { hour: "11h", visits: 112 },
    { hour: "12h", visits: 130 },
    { hour: "13h", visits: 125 },
    { hour: "14h", visits: 140 },
    { hour: "15h", visits: 165 },
    { hour: "16h", visits: 180 },
    { hour: "17h", visits: 210 },
    { hour: "18h", visits: 245 },
    { hour: "19h", visits: 260 },
    { hour: "20h", visits: 295 },
    { hour: "21h", visits: 310 },
    { hour: "22h", visits: 275 },
    { hour: "23h", visits: 185 },
  ];

  const maxHourly = Math.max(...hourlyData.map((d) => d.visits));

  // 7-day historical days
  const weeklyData = [
    { day: "Lun", date: "17 Nov", visits: 215, pct: 68 },
    { day: "Mar", date: "18 Nov", visits: 248, pct: 78 },
    { day: "Mié", date: "19 Nov", visits: 198, pct: 62 },
    { day: "Jue", date: "20 Nov", visits: 285, pct: 89 },
    { day: "Vie", date: "21 Nov", visits: 320, pct: 100 },
    { day: "Sáb", date: "22 Nov", visits: 310, pct: 97 },
    { day: "Hoy", date: "23 Nov", visits: 274, pct: 86, isToday: true },
  ];

  // Initial live activity stream
  useEffect(() => {
    const initialEvents: ActivityEvent[] = [
      {
        id: "1",
        country: "España",
        flag: "🇪🇸",
        city: "Madrid",
        action: "Sintetizador VOID activado con osciloscopio",
        device: "Móvil",
        timeAgo: "Hace 12s",
        badgeColor: "text-violet-400 border-violet-500/40 bg-violet-950/40",
      },
      {
        id: "2",
        country: "México",
        flag: "🇲🇽",
        city: "CDMX",
        action: "Scratch continuo en Plato de Vinilo DJ",
        device: "Tablet",
        timeAgo: "Hace 34s",
        badgeColor: "text-amber-400 border-amber-500/40 bg-amber-950/40",
      },
      {
        id: "3",
        country: "Argentina",
        flag: "🇦🇷",
        city: "Buenos Aires",
        action: "Ritmo BEAT & BASS acelerado a 138 BPM por Roll",
        device: "Móvil",
        timeAgo: "Hace 1m",
        badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
      },
      {
        id: "4",
        country: "Colombia",
        flag: "🇨🇴",
        city: "Medellín",
        action: "Spawn de 5 Bolas Sónicas con rotación orbital",
        device: "Móvil",
        timeAgo: "Hace 2m",
        badgeColor: "text-cyan-400 border-cyan-500/40 bg-cyan-950/40",
      },
      {
        id: "5",
        country: "Chile",
        flag: "🇨🇱",
        city: "Santiago",
        action: "Crossfader vertical ajustado a +35% VOID",
        device: "Escritorio",
        timeAgo: "Hace 3m",
        badgeColor: "text-neutral-300 border-neutral-700 bg-neutral-900/60",
      },
      {
        id: "6",
        country: "Estados Unidos",
        flag: "🇺🇸",
        city: "Miami",
        action: "Giroscopio 3D activado: filtro resonante",
        device: "Móvil",
        timeAgo: "Hace 5m",
        badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
      },
    ];

    setLiveEvents(initialEvents);

    // Periodic simulation of new live connections
    const interval = window.setInterval(() => {
      const candidates = [
        {
          country: "España",
          flag: "🇪🇸",
          city: "Barcelona",
          action: "Toco PULSE Chimes y rebote magnético",
          device: "Móvil" as const,
          badgeColor: "text-cyan-400 border-cyan-500/40 bg-cyan-950/40",
        },
        {
          country: "Perú",
          flag: "🇵🇪",
          city: "Lima",
          action: "Frenado en seco Vinyl Brake en tocadiscos",
          device: "Móvil" as const,
          badgeColor: "text-amber-400 border-amber-500/40 bg-amber-950/40",
        },
        {
          country: "Alemania",
          flag: "🇩🇪",
          city: "Berlín",
          action: "Paso a estilo 3: Acid Tech-House 110 BPM",
          device: "Escritorio" as const,
          badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
        },
        {
          country: "Uruguay",
          flag: "🇺🇾",
          city: "Montevideo",
          action: "Rotación invisible de bolas en órbita horaria",
          device: "Móvil" as const,
          badgeColor: "text-violet-400 border-violet-500/40 bg-violet-950/40",
        },
      ];

      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      const newEvent: ActivityEvent = {
        id: Date.now().toString(),
        ...pick,
        timeAgo: "Justo ahora",
      };

      setLiveEvents((prev) => [newEvent, ...prev.slice(0, 7)]);
    }, 11000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen h-[100dvh] max-h-screen w-full flex flex-col justify-between bg-black text-white p-2.5 sm:p-4 font-mono select-none overflow-hidden">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between gap-2 pb-2.5 border-b border-neutral-800 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-2.5 sm:px-3 py-1 rounded-full border border-neutral-700 bg-neutral-900/90 text-neutral-300 hover:text-white hover:border-emerald-400 flex items-center gap-1.5 text-[10px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer shadow"
          >
            <span>◀</span>
            <span className="hidden sm:inline">VOLVER AL SINTETIZADOR</span>
            <span className="sm:hidden">VOLVER</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
            <h1 className="text-xs sm:text-sm font-bold tracking-[0.15em] uppercase text-white truncate">
              PANEL DE VISITAS
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onAddVisit}
            className="px-2 sm:px-2.5 py-1 rounded border border-emerald-600/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 text-[9px] sm:text-[10px] font-bold tracking-wider active:scale-95 cursor-pointer"
            title="Simula un nuevo visitante (+1)"
          >
            +1 SIMULAR
          </button>

          <button
            type="button"
            onClick={togglePanic}
            className={`px-2 sm:px-2.5 py-1 rounded border text-[9px] sm:text-[10px] font-bold tracking-wider cursor-pointer ${
              isPanicked
                ? "bg-red-950 border-red-500 text-red-300 animate-pulse"
                : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white"
            }`}
          >
            {isPanicked ? "MUTED" : "PANIC"}
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS ROW (Compact, responsive, zero scroll) */}
      <div className="w-full grid grid-cols-4 gap-1.5 sm:gap-3 my-2 shrink-0">
        {/* Total Visits */}
        <div className="p-2 sm:p-2.5 rounded-lg bg-neutral-950/90 border border-neutral-800 flex flex-col justify-between">
          <span className="text-neutral-500 text-[8px] sm:text-[9px] uppercase font-bold tracking-wider truncate">
            TOTAL VISITAS
          </span>
          <div className="text-sm sm:text-xl font-black text-white tracking-tight truncate">
            {visitsCount.toLocaleString()}
          </div>
          <span className="text-[8px] sm:text-[9px] text-emerald-400 font-bold truncate">
            ↑ +18.4%
          </span>
        </div>

        {/* Current Live */}
        <div className="p-2 sm:p-2.5 rounded-lg bg-neutral-950/90 border border-neutral-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 text-[8px] sm:text-[9px] uppercase font-bold tracking-wider truncate">
              EN VIVO
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shadow-[0_0_6px_#34d399]" />
          </div>
          <div className="text-sm sm:text-xl font-black text-emerald-400 tracking-tight truncate">
            {activeUsersCount}
          </div>
          <span className="text-[8px] sm:text-[9px] text-emerald-300 font-bold truncate">
            Activos ahora
          </span>
        </div>

        {/* Today */}
        <div className="p-2 sm:p-2.5 rounded-lg bg-neutral-950/90 border border-neutral-800 flex flex-col justify-between">
          <span className="text-neutral-500 text-[8px] sm:text-[9px] uppercase font-bold tracking-wider truncate">
            HOY
          </span>
          <div className="text-sm sm:text-xl font-black text-amber-400 tracking-tight truncate">
            274
          </div>
          <span className="text-[8px] sm:text-[9px] text-neutral-400 truncate">
            Pico: 21h
          </span>
        </div>

        {/* Retention */}
        <div className="p-2 sm:p-2.5 rounded-lg bg-neutral-950/90 border border-neutral-800 flex flex-col justify-between">
          <span className="text-neutral-500 text-[8px] sm:text-[9px] uppercase font-bold tracking-wider truncate">
            RETENCIÓN
          </span>
          <div className="text-sm sm:text-xl font-black text-violet-300 tracking-tight truncate">
            89%
          </div>
          <span className="text-[8px] sm:text-[9px] text-neutral-400 truncate">
            4m 38s
          </span>
        </div>
      </div>

      {/* Sub-Tab Selector Navigation (Allows switching content without scroll) */}
      <div className="w-full flex items-center gap-1.5 border-b border-neutral-900 pb-1.5 shrink-0 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("history24")}
          className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "history24"
              ? "bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              : "bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          📊 HISTORIAL 24H
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history7")}
          className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "history7"
              ? "bg-emerald-400 text-black shadow-[0_0_12px_rgba(52,211,153,0.5)]"
              : "bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          📅 ÚLTIMOS 7 DÍAS
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("current")}
          className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === "current"
              ? "bg-emerald-400 text-black shadow-[0_0_12px_rgba(52,211,153,0.5)]"
              : "bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          🟢 EN VIVO ({activeUsersCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("devices")}
          className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "devices"
              ? "bg-cyan-400 text-black shadow-[0_0_12px_rgba(34,211,238,0.5)]"
              : "bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800"
          }`}
        >
          📱 DISPOSITIVOS
        </button>
      </div>

      {/* DYNAMIC MAIN CONTENT PANEL: Strictly fits available space, zero scroll */}
      <div className="w-full flex-1 min-h-0 my-2 bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-3 sm:p-4 flex flex-col justify-between overflow-hidden">
        {/* TAB 1: 24-HOUR HISTOGRAM */}
        {activeTab === "history24" && (
          <div className="w-full h-full flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between shrink-0 mb-1">
              <span className="text-[10px] sm:text-xs font-bold tracking-wider text-amber-400 uppercase">
                TRÁFICO POR HORA (ÚLTIMAS 24 HORAS)
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                {selectedHour !== null
                  ? `${hourlyData[selectedHour].hour}: ${hourlyData[selectedHour].visits} visitas`
                  : "Toca una barra para ver detalles"}
              </span>
            </div>

            {/* Flexible-height bar chart */}
            <div className="flex-1 w-full flex items-end justify-between gap-1 sm:gap-1.5 pt-2 pb-1 px-1 border-b border-neutral-800 min-h-0">
              {hourlyData.map((d, idx) => {
                const heightPct = Math.round((d.visits / maxHourly) * 100);
                const isPeak = d.visits >= 290;
                const isSelected = selectedHour === idx;
                return (
                  <div
                    key={d.hour}
                    onMouseEnter={() => setSelectedHour(idx)}
                    onMouseLeave={() => setSelectedHour(null)}
                    onClick={() => setSelectedHour(idx)}
                    className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group"
                  >
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-sm transition-all duration-150 ${
                        isSelected
                          ? "bg-amber-300 shadow-[0_0_10px_#f59e0b]"
                          : isPeak
                          ? "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                          : "bg-neutral-800 group-hover:bg-neutral-600"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-neutral-500 pt-1 shrink-0 font-mono">
              <span>00h</span>
              <span>04h</span>
              <span>08h</span>
              <span>12h</span>
              <span>16h</span>
              <span>20h</span>
              <span>23h</span>
            </div>
          </div>
        )}

        {/* TAB 2: 7-DAY HISTORY */}
        {activeTab === "history7" && (
          <div className="w-full h-full flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between shrink-0 mb-1">
              <span className="text-[10px] sm:text-xs font-bold tracking-wider text-emerald-400 uppercase">
                COMPARATIVA SEMANAL (ÚLTIMOS 7 DÍAS)
              </span>
              <span className="text-[9px] text-neutral-400">Total semanal: 1,850 visitas</span>
            </div>

            <div className="flex-1 flex flex-col justify-around py-1 min-h-0">
              {weeklyData.map((w) => (
                <div key={w.date} className="flex items-center justify-between text-[11px] sm:text-xs">
                  <div className="w-20 text-neutral-400 font-mono flex items-center gap-1">
                    <span className={w.isToday ? "text-emerald-400 font-bold" : "text-neutral-300"}>
                      {w.day}
                    </span>
                    <span className="text-neutral-600 text-[9px]">({w.date})</span>
                  </div>

                  <div className="flex-1 mx-2 sm:mx-3 h-2 sm:h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                    <div
                      style={{ width: `${w.pct}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        w.isToday ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-neutral-600"
                      }`}
                    />
                  </div>

                  <span className="w-14 text-right font-bold text-neutral-200 font-mono text-[10px] sm:text-xs">
                    {w.visits}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CURRENT LIVE USERS */}
        {activeTab === "current" && (
          <div className="w-full h-full flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between shrink-0 mb-1">
              <span className="text-[10px] sm:text-xs font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                SESIONES ACTIVAS EN TIEMPO REAL
              </span>
              <span className="text-[9px] text-neutral-400">Latencia: ~24ms</span>
            </div>

            <div className="flex-1 flex flex-col justify-between py-1 min-h-0 space-y-1">
              {liveEvents.slice(0, 5).map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between p-1.5 sm:p-2 rounded bg-neutral-900/60 border border-neutral-800/80 text-[10px] sm:text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm shrink-0">{evt.flag}</span>
                    <div className="flex flex-col truncate">
                      <span className="font-bold text-neutral-200 truncate leading-tight">
                        {evt.city}, {evt.country}
                      </span>
                      <span className="text-neutral-400 text-[9px] truncate">{evt.action}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${evt.badgeColor}`}>
                      {evt.device}
                    </span>
                    <span className="text-neutral-500 font-mono text-[8px] sm:text-[9px]">
                      {evt.timeAgo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DEVICES & SOUND MODES */}
        {activeTab === "devices" && (
          <div className="w-full h-full flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between shrink-0 mb-1">
              <span className="text-[10px] sm:text-xs font-bold tracking-wider text-cyan-400 uppercase">
                DISTRIBUCIÓN DE PLATAFORMAS & SONIDO
              </span>
              <span className="text-[9px] text-neutral-400">Total dispositivos: 100%</span>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-3 py-1 min-h-0">
              {/* Devices column */}
              <div className="p-2 sm:p-3 rounded bg-neutral-900/50 border border-neutral-800 flex flex-col justify-around">
                <span className="text-[9px] uppercase font-bold text-neutral-400 mb-1">
                  Dispositivos
                </span>
                <div className="space-y-1.5 text-[10px] sm:text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">📱 Móvil (Giroscopio)</span>
                    <span className="text-cyan-400 font-bold font-mono">65%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div style={{ width: "65%" }} className="h-full bg-cyan-400" />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-neutral-300">💻 Escritorio (Rueda)</span>
                    <span className="text-neutral-400 font-bold font-mono">28%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div style={{ width: "28%" }} className="h-full bg-neutral-500" />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-neutral-300">📟 Tablet</span>
                    <span className="text-neutral-500 font-bold font-mono">7%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div style={{ width: "7%" }} className="h-full bg-neutral-600" />
                  </div>
                </div>
              </div>

              {/* Sound modes column */}
              <div className="p-2 sm:p-3 rounded bg-neutral-900/50 border border-neutral-800 flex flex-col justify-around">
                <span className="text-[9px] uppercase font-bold text-neutral-400 mb-1">
                  Modos Sonoros
                </span>
                <div className="space-y-1.5 text-[10px] sm:text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-violet-400">VOID Drone</span>
                    <span className="text-violet-300 font-bold font-mono">42%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div style={{ width: "42%" }} className="h-full bg-violet-400" />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-cyan-400">PULSE Chimes</span>
                    <span className="text-cyan-300 font-bold font-mono">34%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div style={{ width: "34%" }} className="h-full bg-cyan-400" />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-amber-400">BEAT & Vinilo</span>
                    <span className="text-amber-300 font-bold font-mono">24%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div style={{ width: "24%" }} className="h-full bg-amber-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Bar */}
      <div className="w-full flex items-center justify-between pt-2 border-t border-neutral-900 text-[9px] text-neutral-500 font-sans shrink-0">
        <span>
          Desarrollado por <strong className="text-neutral-400 font-semibold">Emiliabella</strong> • 100% Gratuito
        </span>
        <button
          type="button"
          onClick={onBack}
          className="text-emerald-400 hover:underline uppercase font-bold font-mono tracking-wider cursor-pointer text-[10px]"
        >
          Volver al Sintetizador ➔
        </button>
      </div>
    </div>
  );
  }
