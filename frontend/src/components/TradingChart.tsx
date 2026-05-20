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
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { useChartData } from "@/hooks/useMarketData";

type ChartMode = "candle" | "line" | "area";
const timeRanges = ["1S", "1M", "3M", "6M", "1A", "YTD"] as const;

export default function TradingChart({ ticker = "IWDA" }: { ticker?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<"Candlestick" | "Line" | "Area"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const [range, setRange] = useState<string>("6M");
  const [mode, setMode] = useState<ChartMode>("candle");
  const [ohlc, setOhlc] = useState<{ o: number; h: number; l: number; c: number; v: number; change: number } | null>(null);

  const { candles, loading } = useChartData(ticker, range);

  useEffect(() => {
    if (!containerRef.current || candles.length === 0) return;

    if (chartRef.current) {
      try { chartRef.current.remove(); } catch { /* already disposed */ }
      chartRef.current = null;
    }
    containerRef.current.innerHTML = "";

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 380,
      layout: {
        background: { type: ColorType.Solid, color: "#1d1d1f" },
        textColor: "#86868b",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#2d2d2d" },
        horzLines: { color: "#2d2d2d" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#f5f5f7", width: 1, style: LineStyle.Dashed, labelBackgroundColor: "#f5f5f7" },
        horzLine: { color: "#f5f5f7", width: 1, style: LineStyle.Dashed, labelBackgroundColor: "#f5f5f7" },
      },
      rightPriceScale: {
        borderColor: "#2d2d2d",
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: "#2d2d2d",
        timeVisible: false,
        rightOffset: 5,
        barSpacing: mode === "candle" ? 12 : 6,
      },
      handleScroll: { vertTouchDrag: false },
    });

    chartRef.current = chart;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mainSeries: any;

    if (mode === "candle") {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#30d158",
        downColor: "#ff453a",
        borderDownColor: "#ff453a",
        borderUpColor: "#30d158",
        wickDownColor: "#ff453a",
        wickUpColor: "#30d158",
      });
      mainSeries.setData(candles.map((c) => ({
        time: c.time, open: c.open, high: c.high, low: c.low, close: c.close,
      })));
    } else if (mode === "line") {
      mainSeries = chart.addSeries(LineSeries, {
        color: "#f5f5f7",
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 5,
        crosshairMarkerBackgroundColor: "#f5f5f7",
        crosshairMarkerBorderColor: "#000000",
      });
      mainSeries.setData(candles.map((c) => ({ time: c.time, value: c.close })));
    } else {
      mainSeries = chart.addSeries(AreaSeries, {
        topColor: "rgba(99, 102, 241, 0.4)",
        bottomColor: "rgba(99, 102, 241, 0.0)",
        lineColor: "#f5f5f7",
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 5,
        crosshairMarkerBackgroundColor: "#f5f5f7",
        crosshairMarkerBorderColor: "#000000",
      });
      mainSeries.setData(candles.map((c) => ({ time: c.time, value: c.close })));
    }

    mainSeriesRef.current = mainSeries;

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
    const prev = candles.length > 1 ? candles[candles.length - 2] : last;
    setOhlc({
      o: last.open, h: last.high, l: last.low, c: last.close, v: last.volume,
      change: ((last.close - prev.close) / prev.close) * 100,
    });

    // Crosshair move
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        const last2 = candles[candles.length - 1];
        const prev2 = candles.length > 1 ? candles[candles.length - 2] : last2;
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
  }, [range, mode, candles]);

  const changeColor = ohlc && ohlc.change >= 0 ? "text-green" : "text-red";

  return (
    <div>
      {/* OHLC Header */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 mb-2 text-xs">
        <span className="text-muted font-medium">{ticker}</span>
        {loading && <span className="text-muted animate-pulse">Cargando...</span>}
        {ohlc && !loading && (
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
      <div ref={containerRef} className="rounded-lg overflow-hidden border border-card-border" style={{ minHeight: 380 }} />

      {/* Controls */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1 bg-card border border-card-border rounded-lg p-0.5">
          <button
            onClick={() => setMode("candle")}
            className={`px-2.5 py-1.5 text-xs rounded-md transition-colors ${mode === "candle" ? "bg-accent/20 text-accent-light" : "text-muted hover:text-foreground"}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline mr-1">
              <line x1="4" y1="1" x2="4" y2="15" stroke="currentColor" strokeWidth="1" />
              <rect x="2" y="4" width="4" height="6" fill={mode === "candle" ? "#30d158" : "currentColor"} rx="0.5" />
              <line x1="12" y1="2" x2="12" y2="14" stroke="currentColor" strokeWidth="1" />
              <rect x="10" y="5" width="4" height="5" fill={mode === "candle" ? "#ff453a" : "currentColor"} rx="0.5" />
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
