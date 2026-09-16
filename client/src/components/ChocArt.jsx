export default function ChocArt({ product, size = "45g", className = "" }) {
  const accent = product?.accent || "#2C1F16";
  const isBar = size === "45g";
  const segments = isBar ? 4 : 2;
  const gradId = `choc-${product?.id || "x"}-${size}`;

  return (
    <svg className={className} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img"
      aria-label={`${product?.name || "ProfuelX"} ${size} illustration`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor="#1C130D" />
        </linearGradient>
      </defs>
      <g transform="rotate(-6 100 100)">
        <rect x={isBar ? 30 : 55} y="75" width={isBar ? 140 : 90} height="60" rx="14" fill={`url(#${gradId})`} />
        {Array.from({ length: segments - 1 }).map((_, i) => (
          <line
            key={i}
            x1={(isBar ? 30 : 55) + ((isBar ? 140 : 90) / segments) * (i + 1)}
            y1="78"
            x2={(isBar ? 30 : 55) + ((isBar ? 140 : 90) / segments) * (i + 1)}
            y2="132"
            stroke="rgba(0,0,0,.25)"
            strokeWidth="1.5"
          />
        ))}
        <rect x={isBar ? 30 : 55} y="75" width={isBar ? 140 : 90} height="60" rx="14" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="1.5" />
        <rect x={(isBar ? 30 : 55) + 8} y="80" width={(isBar ? 140 : 90) - 16} height="10" rx="5" fill="rgba(255,255,255,.25)" />
      </g>
    </svg>
  );
}
