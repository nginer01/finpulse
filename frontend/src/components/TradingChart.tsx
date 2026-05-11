"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  LineStyle,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";

/* ──────────────────────────────────────────────
   MOCK DATA — OHLCV per timeframe
   ────────────────────────────────────────────── */

type OHLCV = { time: string; open: number; high: number; low: number; close: number; volume: number };
type EventMarker = { time: string; label: string; color: string; position: "aboveBar" | "belowBar"; shape: "arrowDown" | "arrowUp" | "circle" };

function generateData(range: string): { candles: OHLCV[]; markers: EventMarker[] } {
  const ranges: Record<string, { candles: OHLCV[]; markers: EventMarker[] }> = {
    "1S": {
      candles: [
        { time: "2026-05-05", open: 12480, high: 12560, low: 12420, close: 12520, volume: 3200 },
        { time: "2026-05-06", open: 12520, high: 12540, low: 12440, close: 12480, volume: 2800 },
        { time: "2026-05-07", open: 12480, high: 12650, low: 12470, close: 12610, volume: 5100 },
        { time: "2026-05-08", open: 12610, high: 12630, low: 12530, close: 12580, volume: 4200 },
        { time: "2026-05-09", open: 12580, high: 12750, low: 12570, close: 12720, volume: 6300 },
        { time: "2026-05-10", open: 12720, high: 12810, low: 12700, close: 12790, volume: 3100 },
        { time: "2026-05-11", open: 12790, high: 12880, low: 12780, close: 12847, volume: 2900 },
      ],
      markers: [
        { time: "2026-05-06", label: "IPC EEUU en linea", color: "#71717a", position: "belowBar", shape: "circle" },
        { time: "2026-05-07", label: "Nvidia Blackwell Ultra → SEMI +4.2%", color: "#22c55e", position: "belowBar", shape: "arrowUp" },
        { time: "2026-05-08", label: "Venta BRT — Iran avanza", color: "#ef4444", position: "aboveBar", shape: "arrowDown" },
        { time: "2026-05-09", label: "Acuerdo EEUU-China → S&P maximos", color: "#22c55e", position: "belowBar", shape: "arrowUp" },
      ],
    },
    "1M": {
      candles: [
        { time: "2026-04-11", open: 11750, high: 11830, low: 11700, close: 11800, volume: 3500 },
        { time: "2026-04-14", open: 11800, high: 11900, low: 11780, close: 11880, volume: 3200 },
        { time: "2026-04-15", open: 11880, high: 11980, low: 11850, close: 11950, volume: 4100 },
        { time: "2026-04-17", open: 11950, high: 12050, low: 11900, close: 11980, volume: 3800 },
        { time: "2026-04-21", open: 11980, high: 12080, low: 11920, close: 12050, volume: 3600 },
        { time: "2026-04-23", open: 12050, high: 12100, low: 11950, close: 11980, volume: 4500 },
        { time: "2026-04-25", open: 11980, high: 12150, low: 11960, close: 12100, volume: 3900 },
        { time: "2026-04-28", open: 12100, high: 12250, low: 12080, close: 12200, volume: 4200 },
        { time: "2026-04-30", open: 12200, high: 12380, low: 12180, close: 12350, volume: 5100 },
        { time: "2026-05-02", open: 12350, high: 12400, low: 12250, close: 12280, volume: 3300 },
        { time: "2026-05-05", open: 12280, high: 12560, low: 12250, close: 12520, volume: 4800 },
        { time: "2026-05-07", open: 12520, high: 12650, low: 12470, close: 12610, volume: 5100 },
        { time: "2026-05-09", open: 12610, high: 12750, low: 12570, close: 12720, volume: 6300 },
        { time: "2026-05-11", open: 12720, high: 12880, low: 12700, close: 12847, volume: 3500 },
      ],
      markers: [
        { time: "2026-04-15", label: "Compra VUAA — FOMO rally", color: "#71717a", position: "belowBar", shape: "circle" },
        { time: "2026-04-23", label: "Caida tech earnings mixtos", color: "#ef4444", position: "aboveBar", shape: "arrowDown" },
        { time: "2026-04-25", label: "Compra EUNA — tesis BCE dovish", color: "#22c55e", position: "belowBar", shape: "arrowUp" },
        { time: "2026-05-02", label: "Compra SEMI — ciclo semis", color: "#22c55e", position: "belowBar", shape: "arrowUp" },
        { time: "2026-05-07", label: "Nvidia Blackwell Ultra", color: "#22c55e", position: "belowBar", shape: "arrowUp" },
        { time: "2026-05-09", label: "Acuerdo EEUU-China", color: "#22c55e", position: "belowBar", shape: "arrowUp" },
      ],
    },
    "3M": {
      candles: [
        { time: "2026-02-11", open: 10750, high: 10850, low: 10680, close: 10800, volume: 4200 },
        { time: "2026-02-18", open: 10800, high: 11050, low: 10780, close: 11000, volume: 4500 },
        { time: "2026-02-25", open: 11000, high: 11080, low: 10650, close: 10700, volume: 5800 },
        { time: "2026-03-04", open: 10700, high: 10980, low: 10680, close: 10950, volume: 4100 },
        { time: "2026-03-11", open: 10950, high: 11250, low: 10920, close: 11200, volume: 4800 },
        { time: "2026-03-18", open: 11200, high: 11300, low: 11050, close: 11100, volume: 5200 },
        { time: "2026-03-25", open: 11100, high: 11450, low: 11080, close: 11400, volume: 4600 },
        { time: "2026-04-01", open: 11400, high: 11500, low: 11150, close: 11200, volume: 5500 },
        { time: "2026-04-08", open: 11200, high: 11500, low: 11180, close: 11450, volume: 4300 },
        { time: "2026-04-15", open: 11450, high: 11850, low: 11420, close: 11800, volume: 5100 },
        { time: "2026-04-22", open: 11800, high: 12000, low: 11750, close: 11980, volume: 4700 },
        { time: "2026-04-29", open: 11980, high: 12200, low: 11950, close: 12100, volume: 5300 },
        { time: "2026-05-06", open: 12100, high: 12650, low: 12050, close: 12520, volume: 6800 },
        { time: "2026-05-11", open: 12520, high: 12880, low: 12500, close: 12847, volume: 5200 },
      ],
      markers: [
        { time: "2026-02-25", label: "Correccion tech — Nasdaq -3%", color: "#ef4444", position: "aboveBar", shape: "arrowDown" },
        { time: "2026-03-11", label: "BCE senala recorte junio", color: "#22c55e", position: "belowBar", shape: "arrowUp" },
        { time: "2026-04-15", label: "Earnings MSFT/GOOGL superan", color: "#22c55e", position: "belowBar", shape: "arrowUp" },
        { time: "2026-05-06", label: "Nvidia + Acuerdo China", color: "#22c55e", position: "belowBar", shape: "arrowUp" },
      ],
    },
    "6M": {
      candles: [
        { time: "2025-11-11", open: 10150, high: 10280, low: 10100, close: 10200, volume: 3800 },
        { time: "2025-11-25", open: 10200, high: 10480, low: 10180, close: 10400, volume: 4200 },
        { time: "2025-12-09", open: 10400, high: 10420, low: 10050, close: 10150, volume: 5600 },
        { time: "2025-12-23", open: 10150, high: 10680, low: 10120, close: 10600, volume: 4100 },
        { time: "2026-01-06", open: 10600, high: 10650, low: 10480, close: 10550, volume: 3900 },
        { time: "2026-01-20", open: 10550, high: 10950, low: 10520, close: 10900, volume: 5200 },
        { time: "2026-02-03", open: 10900, high: 11180, low: 10880, close: 11100, volume: 4800 },
        { time: "2026-02-17", open: 11100, high: 11150, low: 10720, close: 10800, volume: 5900 },
        { time: "2026-03-03", open: 10800, high: 11380, low: 10780, close: 11300, volume: 5100 },
        { time: "2026-03-17", open: 11300, high: 11580, low: 11280, close: 11500, volume: 4500 },
        { time: "2026-03-31", open: 11500, high: 11520, low: 11120, close: 11200, volume: 5800 },
        { time: "2026-04-14", open: 11200, high: 11780, low: 11180, close: 11700, volume: 5300 },
        { time: "2026-04-28", open: 11700, high: 11980, low: 11680, close: 11900, volume: 4700 },
        { time: "2026-05-05", open: 11900, high: 12380, low: 11880, close: 12300, volume: 6500 },
        { time: "2026-05-09", open: 12300, high: 12680, low: 12280, close: 12600, volume: 5800 },
        { time: "2026-05-11", open: 12600, high: 12880, low: 12580, close: 12847, volume: 4200 },
      ],
      markers: [
        { time: "2025-12-09", label: "Fed mantiene tipos", color: "#ef4444", position: "aboveBar", shape: "arrowDown" },
        { time: "2026-01-20", label: "Rally inicio de ano — flujos ETFs", color: "#22c55e", position: "belowBar", shape: "arrowUp" },
        { time: "2026-02-17", label: "Aranceles EEUU-China", color: "#ef4444", position: "aboveBar", shape: "arrowDown" },
        { time: "2026-03-31", label: "Correccion Q1", color: "#ef4444", position: "aboveBar", shape: "arrowDown" },
        { time: "2026-05-05", label: "Rumores acuerdo EEUU-China", color: "#22c55e", position: "belowBar", shape: "arrowUp" },
        { time: "2026-05-09", label: "Acuerdo oficial + Nvidia", color: "#22c55e", position: "belowBar", shape: "arrowUp" },
      ],
    },
    "1A": {
      candles: [
        { time: "2025-05-12", open: 8450, high: 8550, low: 8380, close: 8500, volume: 4200 },
        { time: "2025-06-09", open: 8500, high: 8880, low: 8480, close: 8800, volume: 4500 },
        { time: "2025-07-07", open: 8800, high: 9280, low: 8780, close: 9200, volume: 5100 },
        { time: "2025-08-04", open: 9200, high: 9250, low: 8820, close: 8900, volume: 5800 },
        { time: "2025-09-01", open: 8900, high: 9480, low: 8850, close: 9400, volume: 4800 },
        { time: "2025-09-29", open: 9400, high: 9780, low: 9380, close: 9700, volume: 4600 },
        { time: "2025-10-27", open: 9700, high: 10080, low: 9680, close: 10000, volume: 5200 },
        { time: "2025-11-24", open: 10000, high: 10280, low: 9950, close: 10200, volume: 4800 },
        { time: "2025-12-22", open: 10200, high: 10680, low: 10050, close: 10600, volume: 5100 },
        { time: "2026-01-19", open: 10600, high: 10980, low: 10520, close: 10900, volume: 5500 },
        { time: "2026-02-16", open: 10900, high: 11180, low: 10700, close: 10800, volume: 5900 },
        { time: "2026-03-16", open: 10800, high: 11480, low: 10780, close: 11400, volume: 5300 },
        { time: "2026-04-13", open: 11400, high: 12180, low: 11200, close: 12100, volume: 6200 },
        { time: "2026-05-11", open: 12100, high: 12880, low: 12050, close: 12847, volume: 6800 },
      ],
      markers: [
        { time: "2025-08-04", label: "Crisis bancaria regional EEUU", color: "#ef4444", position: "aboveBar", shape: "arrowDown" },
        { time: "2025-10-27", label: "Fed primer recorte de tipos", color: "#22c55e", position: "belowBar", shape: "arrowUp" },
        { time: "2026-01-19", label: "Nuevos aranceles EEUU-China", color: "#ef4444", position: "aboveBar", shape: "arrowDown" },
        { time: "2026-04-13", label: "Earnings Q1 excepcionales", color: "#22c55e", position: "belowBar", shape: "arrowUp" },
      ],
    },
    "YTD": {
      candles: [
        { time: "2026-01-02", open: 10350, high: 10480, low: 10320, close: 10400, volume: 4100 },
        { time: "2026-01-13", open: 10400, high: 10680, low: 10380, close: 10600, volume: 4800 },
        { time: "2026-01-27", open: 10600, high: 10950, low: 10580, close: 10900, volume: 5200 },
        { time: "2026-02-10", open: 10900, high: 11050, low: 10650, close: 10700, volume: 5600 },
        { time: "2026-02-24", open: 10700, high: 11150, low: 10680, close: 11100, volume: 5100 },
        { time: "2026-03-10", open: 11100, high: 11480, low: 11080, close: 11400, volume: 4900 },
        { time: "2026-03-24", open: 11400, high: 11450, low: 11120, close: 11200, volume: 5500 },
        { time: "2026-04-07", open: 11200, high: 11580, low: 11180, close: 11500, volume: 5000 },
        { time: "2026-04-21", open: 11500, high: 11950, low: 11480, close: 11900, volume: 5800 },
        { time: "2026-05-05", open: 11900, high: 12580, low: 11880, close: 12520, volume: 6500 },
        { time: "2026-05-11", open: 12520, high: 12880, low: 12500, close: 12847, volume: 5200 },
      ],
      markers: [
        { time: "2026-01-13", label: "Aranceles EEUU-China anunciados", color: "#ef4444", position: "aboveBar", shape: "arrowDown" },
        { time: "2026-02-24", label: "BCE confirma tono dovish", color: "#22c55e", position: "belowBar", shape: "arrowUp" },
        { time: "2026-03-24", label: "Toma de beneficios Q1", color: "#ef4444", position: "aboveBar", shape: "arrowDown" },
        { time: "2026-04-21", label: "Compra SEMI pre-Nvidia", color: "#22c55e", position: "belowBar", shape: "arrowUp" },
        { time: "2026-05-05", label: "Nvidia + Acuerdo China", color: "#22c55e", position: "belowBar", shape: "arrowUp" },
      ],
    },
  };
  return ranges[range] || ranges["6M"];
}

/* ──────────────────────────────────────────────
   CHART TYPES
   ────────────────────────────────────────────── */

type ChartMode = "candle" | "line" | "area";

const timeRanges = ["1S", "1M", "3M", "6M", "1A", "YTD"] as const;

/* ──────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────── */

export default function TradingChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<"Candlestick" | "Line" | "Area"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const [range, setRange] = useState<string>("6M");
  const [mode, setMode] = useState<ChartMode>("candle");
  const [ohlc, setOhlc] = useState<{ o: number; h: number; l: number; c: number; v: number; change: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup previous chart
    if (chartRef.current) {
      try { chartRef.current.remove(); } catch { /* already disposed */ }
      chartRef.current = null;
    }

    // Clear container to avoid duplicates from strict mode
    containerRef.current.innerHTML = "";

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 380,
      layout: {
        background: { type: ColorType.Solid, color: "#12121a" },
        textColor: "#71717a",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1e1e2e" },
        horzLines: { color: "#1e1e2e" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "#6366f1",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#6366f1",
        },
        horzLine: {
          color: "#6366f1",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#6366f1",
        },
      },
      rightPriceScale: {
        borderColor: "#1e1e2e",
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: "#1e1e2e",
        timeVisible: false,
        rightOffset: 5,
        barSpacing: mode === "candle" ? 12 : 6,
      },
      handleScroll: { vertTouchDrag: false },
    });

    chartRef.current = chart;

    const { candles, markers } = generateData(range);

    // Main series
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mainSeries: any;

    if (mode === "candle") {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderDownColor: "#ef4444",
        borderUpColor: "#22c55e",
        wickDownColor: "#ef4444",
        wickUpColor: "#22c55e",
      });
      mainSeries.setData(candles.map((c: OHLCV) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })));
    } else if (mode === "line") {
      mainSeries = chart.addSeries(LineSeries, {
        color: "#6366f1",
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 5,
        crosshairMarkerBackgroundColor: "#818cf8",
        crosshairMarkerBorderColor: "#0a0a0f",
      });
      mainSeries.setData(candles.map((c: OHLCV) => ({ time: c.time, value: c.close })));
    } else {
      mainSeries = chart.addSeries(AreaSeries, {
        topColor: "rgba(99, 102, 241, 0.4)",
        bottomColor: "rgba(99, 102, 241, 0.0)",
        lineColor: "#6366f1",
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 5,
        crosshairMarkerBackgroundColor: "#818cf8",
        crosshairMarkerBorderColor: "#0a0a0f",
      });
      mainSeries.setData(candles.map((c: OHLCV) => ({ time: c.time, value: c.close })));
    }

    mainSeriesRef.current = mainSeries;

    // Markers (news/events)
    createSeriesMarkers(
      mainSeries,
      markers.map((m) => ({
        time: m.time,
        position: m.position,
        color: m.color,
        shape: m.shape,
        text: m.label,
      }))
    );

    // Volume histogram
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeries.setData(
      candles.map((c) => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)",
      }))
    );
    volumeSeriesRef.current = volumeSeries;

    // Set initial OHLC from last candle
    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    setOhlc({
      o: last.open,
      h: last.high,
      l: last.low,
      c: last.close,
      v: last.volume,
      change: ((last.close - prev.close) / prev.close) * 100,
    });

    // Crosshair move → update OHLC header
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        const last2 = candles[candles.length - 1];
        const prev2 = candles[candles.length - 2];
        setOhlc({
          o: last2.open, h: last2.high, l: last2.low, c: last2.close, v: last2.volume,
          change: ((last2.close - prev2.close) / prev2.close) * 100,
        });
        return;
      }
      const data = param.seriesData.get(mainSeries) as Record<string, number> | undefined;
      if (!data) return;

      const volData = param.seriesData.get(volumeSeries) as Record<string, number> | undefined;

      if ("open" in data) {
        const idx = candles.findIndex((c) => c.time === param.time);
        const prevC = idx > 0 ? candles[idx - 1] : candles[0];
        setOhlc({
          o: data.open, h: data.high, l: data.low, c: data.close,
          v: volData?.value || 0,
          change: ((data.close - prevC.close) / prevC.close) * 100,
        });
      } else if ("value" in data) {
        const idx = candles.findIndex((c) => c.time === param.time);
        const candle = candles[idx] || candles[candles.length - 1];
        const prevC = idx > 0 ? candles[idx - 1] : candles[0];
        setOhlc({
          o: candle.open, h: candle.high, l: candle.low, c: candle.close,
          v: candle.volume,
          change: ((candle.close - prevC.close) / prevC.close) * 100,
        });
      }
    });

    // Resize
    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    chart.timeScale().fitContent();

    return () => {
      window.removeEventListener("resize", handleResize);
      try { chart.remove(); } catch { /* already disposed */ }
    };
  }, [range, mode]);

  const changeColor = ohlc && ohlc.change >= 0 ? "text-green" : "text-red";

  return (
    <div>
      {/* OHLC Header */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 mb-2 text-xs">
        <span className="text-muted font-medium">Portfolio</span>
        {ohlc && (
          <>
            <span className="text-muted">O <span className="text-foreground">{ohlc.o.toLocaleString("es-ES")}</span></span>
            <span className="text-muted">H <span className="text-foreground">{ohlc.h.toLocaleString("es-ES")}</span></span>
            <span className="text-muted">L <span className="text-foreground">{ohlc.l.toLocaleString("es-ES")}</span></span>
            <span className="text-muted">C <span className="text-foreground font-medium">{ohlc.c.toLocaleString("es-ES")}</span></span>
            <span className={changeColor}>
              {ohlc.change >= 0 ? "+" : ""}{ohlc.change.toFixed(2)}%
            </span>
            <span className="text-muted">Vol <span className="text-foreground">{ohlc.v.toLocaleString("es-ES")}</span></span>
          </>
        )}
      </div>

      {/* Chart container */}
      <div ref={containerRef} className="rounded-lg overflow-hidden border border-card-border" />

      {/* Controls */}
      <div className="flex items-center justify-between mt-3">
        {/* Chart type selector */}
        <div className="flex items-center gap-1 bg-card border border-card-border rounded-lg p-0.5">
          <button
            onClick={() => setMode("candle")}
            className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${mode === "candle" ? "bg-accent/20 text-accent-light" : "text-muted hover:text-foreground"}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline mr-1">
              <line x1="4" y1="1" x2="4" y2="15" stroke="currentColor" strokeWidth="1" />
              <rect x="2" y="4" width="4" height="6" fill={mode === "candle" ? "#22c55e" : "currentColor"} rx="0.5" />
              <line x1="12" y1="2" x2="12" y2="14" stroke="currentColor" strokeWidth="1" />
              <rect x="10" y="5" width="4" height="5" fill={mode === "candle" ? "#ef4444" : "currentColor"} rx="0.5" />
            </svg>
            Velas
          </button>
          <button
            onClick={() => setMode("line")}
            className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${mode === "line" ? "bg-accent/20 text-accent-light" : "text-muted hover:text-foreground"}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline mr-1">
              <polyline points="1,12 5,7 9,9 13,3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Linea
          </button>
          <button
            onClick={() => setMode("area")}
            className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${mode === "area" ? "bg-accent/20 text-accent-light" : "text-muted hover:text-foreground"}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline mr-1">
              <polygon points="1,14 1,12 5,7 9,9 13,3 15,5 15,14" fill="currentColor" opacity="0.3" />
              <polyline points="1,12 5,7 9,9 13,3 15,5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Area
          </button>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1">
          {timeRanges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                range === r
                  ? "bg-accent/20 text-accent-light font-medium"
                  : "text-muted hover:text-foreground hover:bg-white/[0.03]"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
