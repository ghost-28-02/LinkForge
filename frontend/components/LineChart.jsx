'use client';

import { useId, useMemo, useState } from 'react';

// Format a 'YYYY-MM-DD' string to a short, locale-free label like "Jun 20".
function shortLabel(day) {
  const [y, m, d] = day.split('-').map(Number);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  if (!m) return day;
  return `${months[m - 1]} ${d}`;
}

// Round a max value up to a "nice" axis ceiling.
function niceMax(value) {
  if (value <= 5) return 5;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  return Math.ceil(value / pow) * pow;
}

// Build a smooth (Catmull-Rom → Bézier) path through the points.
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

export default function LineChart({ data }) {
  const uid = useId().replace(/:/g, '');
  const [hover, setHover] = useState(null);

  const W = 720;
  const H = 260;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const { points, gridLines, max, xLabels } = useMemo(() => {
    const max = niceMax(Math.max(1, ...data.map((d) => d.count)));
    const n = data.length;
    const points = data.map((d, i) => ({
      ...d,
      x: padL + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW),
      y: padT + innerH - (d.count / max) * innerH,
    }));

    const ticks = 4;
    const gridLines = Array.from({ length: ticks + 1 }, (_, i) => {
      const value = Math.round((max / ticks) * i);
      const y = padT + innerH - (value / max) * innerH;
      return { value, y };
    });

    // Show at most ~6 x-axis labels to avoid crowding.
    const step = Math.max(1, Math.ceil(n / 6));
    const xLabels = points.filter(
      (_, i) => i % step === 0 || i === n - 1
    );

    return { points, gridLines, max, xLabels };
  }, [data, innerH, innerW]);

  const linePath = smoothPath(points);
  const areaPath = linePath
    ? `${linePath} L ${points[points.length - 1].x},${padT + innerH} L ${points[0].x},${padT + innerH} Z`
    : '';

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Clicks over time line chart"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`area-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid + y labels */}
        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={padL}
              y1={g.y}
              x2={W - padR}
              y2={g.y}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={i === 0 ? '0' : '4 4'}
            />
            <text
              x={padL - 8}
              y={g.y + 4}
              textAnchor="end"
              className="fill-slate-400"
              fontSize="11"
            >
              {g.value}
            </text>
          </g>
        ))}

        {/* Area + line */}
        {areaPath && <path d={areaPath} fill={`url(#area-${uid})`} />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* X labels */}
        {xLabels.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={H - 10}
            textAnchor="middle"
            className="fill-slate-400"
            fontSize="11"
          >
            {shortLabel(p.day)}
          </text>
        ))}

        {/* Hover hit areas + dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="#fff"
              stroke="#4f46e5"
              strokeWidth="2"
              className={
                hover === i ? 'opacity-100' : 'opacity-0 sm:opacity-100'
              }
            />
            <rect
              x={p.x - (innerW / Math.max(points.length, 1)) / 2}
              y={padT}
              width={Math.max(innerW / Math.max(points.length, 1), 8)}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          </g>
        ))}

        {/* Hover marker */}
        {hover !== null && points[hover] && (
          <g>
            <line
              x1={points[hover].x}
              y1={padT}
              x2={points[hover].x}
              y2={padT + innerH}
              stroke="#c7d2fe"
              strokeWidth="1.5"
            />
            <circle
              cx={points[hover].x}
              cy={points[hover].y}
              r="5"
              fill="#4f46e5"
              stroke="#fff"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {/* Tooltip */}
      {hover !== null && points[hover] && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
          style={{
            left: `${(points[hover].x / W) * 100}%`,
            top: `${(points[hover].y / H) * 100}%`,
          }}
        >
          <div className="font-semibold">{points[hover].count} clicks</div>
          <div className="text-slate-300">{shortLabel(points[hover].day)}</div>
        </div>
      )}
    </div>
  );
}
