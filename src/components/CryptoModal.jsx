// components/CryptoModal.jsx — Modal with historical price chart
// Modal = a window that appears on top of the main content
// Here we use the CoinGecko API to fetch historical data and draw
// a chart using pure SVG (no external library!)

import { useState, useEffect } from 'react'
import './css/CryptoModal.css'

// ── UTILITY FUNCTIONS ──────────────────────────────────────────────────────────

// Same price formatter as CryptoCard
function formatPrice(price) {
  if (!price) return '$0.00'
  if (price < 0.01) return `$${price.toFixed(6)}`
  if (price < 1)    return `$${price.toFixed(4)}`
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
}

// Props:
// coin    → the selected coin object
// onClose → function from App.jsx to close the modal (sets selected back to null)
function CryptoModal({ coin, onClose }) {
  const [chartData, setChartData]       = useState([])      // array of chart data points
  const [loadingChart, setLoadingChart] = useState(true)
  const [days, setDays]                 = useState(7)       // selected period (7, 30, 90 days)
  const [hovered, setHovered]           = useState(null)    // chart point currently hovered

  // Fetch historical data whenever the coin or the period changes
  useEffect(() => {
    fetchChartData()
  }, [coin.id, days]) // [coin.id, days] = runs whenever either of these changes

  const fetchChartData = async () => {
    setLoadingChart(true)
    try {
      // CoinGecko API: /coins/{id}/market_chart
      // vs_currency=usd, days=7/30/90
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=${days}`
      )
      const data = await res.json()

      // data.prices is an array of [timestamp, price]
      // .map() transforms each pair into an object with date and price
      const points = data.prices.map(([timestamp, price]) => ({
        date: new Date(timestamp),   // converts Unix timestamp → Date object
        price
      }))

      setChartData(points)
    } catch (err) {
      console.error('Error fetching chart:', err)
    } finally {
      // finally = always runs, whether the request succeeded or failed
      setLoadingChart(false)
    }
  }

  // ── SVG CHART ───────────────────────────────────────────────────────────────
  // SVG (Scalable Vector Graphics) lets us draw scalable graphics in the browser
  // No external library! Pure math to map data values into SVG coordinates

  const renderChart = () => {
    if (chartData.length === 0) return null

    const W = 800   // SVG width (viewBox)
    const H = 300   // SVG height (viewBox)
    const PAD = { top: 20, right: 20, bottom: 40, left: 60 } // internal margins

    // Usable chart area (after subtracting margins)
    const chartW = W - PAD.left - PAD.right
    const chartH = H - PAD.top  - PAD.bottom

    // Find the min and max price values
    const prices  = chartData.map(d => d.price)
    const minP    = Math.min(...prices)
    const maxP    = Math.max(...prices)
    const rangeP  = maxP - minP || 1   // avoid division by zero

    // Scale functions: convert data values into SVG coordinates
    // scaleX: horizontal position based on point index
    const scaleX = (i) => PAD.left + (i / (chartData.length - 1)) * chartW
    // scaleY: vertical position, inverted (SVG Y grows downward)
    const scaleY = (p) => PAD.top  + chartH - ((p - minP) / rangeP) * chartH

    // Build the SVG path string for the chart line
    // M = moveTo (starting point), L = lineTo (continue the line)
    const linePath = chartData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(1)},${scaleY(d.price).toFixed(1)}`)
      .join(' ')

    // Filled area below the line (gradient fill)
    // Copies the line path and closes it at the bottom
    const areaPath = `${linePath} L ${scaleX(chartData.length - 1)},${H - PAD.bottom} L ${PAD.left},${H - PAD.bottom} Z`
    // Z = closes the path (connects back to the start)

    // Determine chart color: green if price went up, red if it went down
    const priceChange = chartData[chartData.length - 1]?.price - chartData[0]?.price
    const lineColor   = priceChange >= 0 ? '#00ff88' : '#ff4466'
    const gradientId  = `grad-${coin.id}` // unique gradient ID (avoids conflicts between modals)

    // Y-axis labels (prices)
    const yLabels = 5 // number of horizontal grid lines
    const yStep   = chartH / (yLabels - 1)

    // X-axis labels (dates)
    const xLabelCount = days === 7 ? 7 : days === 30 ? 6 : 5
    const xLabelIndices = Array.from({ length: xLabelCount }, (_, i) =>
      Math.round(i * (chartData.length - 1) / (xLabelCount - 1))
    )
    // Array.from({ length: N }, fn) creates an array of N elements with the return values of fn

    return (
      // viewBox defines the internal coordinate system of the SVG
      // preserveAspectRatio="none" makes the chart stretch to fill the container
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" preserveAspectRatio="none"
           onMouseLeave={() => setHovered(null)}>

        {/* Reusable definitions (gradients) */}
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            {/* Vertical gradient: starts with color and fades to transparent */}
            <stop offset="0%"   stopColor={lineColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {Array.from({ length: yLabels }).map((_, i) => {
          const y = PAD.top + i * yStep
          const price = maxP - (i / (yLabels - 1)) * rangeP
          return (
            <g key={i}>
              {/* Dashed line */}
              <line
                x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke="rgba(26,46,31,0.8)" strokeWidth="1" strokeDasharray="4,4"
              />
              {/* Price label on Y-axis */}
              <text
                x={PAD.left - 8} y={y + 4}
                textAnchor="end" fontSize="9" fill="#4a6b52" fontFamily="Syne Mono, monospace"
              >
                {price >= 1000
                  ? `$${(price / 1000).toFixed(1)}k`
                  : price < 1 ? `$${price.toFixed(4)}` : `$${price.toFixed(0)}`
                }
              </text>
            </g>
          )
        })}

        {/* X-axis labels (dates) */}
        {xLabelIndices.map((idx, i) => {
          const x = scaleX(idx)
          const d = chartData[idx]?.date
          const label = d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
          return (
            <text
              key={i}
              x={x} y={H - PAD.bottom + 20}
              textAnchor="middle" fontSize="9" fill="#4a6b52" fontFamily="Syne Mono, monospace"
            >
              {label}
            </text>
          )
        })}

        {/* Area fill below the line */}
        <path d={areaPath} fill={`url(#${gradientId})`} />

        {/* Main chart line */}
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round" />

        {/* Invisible hover area — captures mouse events across the full chart width */}
        {chartData.map((d, i) => (
          <rect
            key={i}
            x={scaleX(i) - chartW / chartData.length / 2}
            y={PAD.top}
            width={chartW / chartData.length}
            height={chartH}
            fill="transparent"
            onMouseEnter={() => setHovered({ ...d, x: scaleX(i), y: scaleY(d.price) })}
          />
        ))}

        {/* Tooltip: dot and vertical line on hover */}
        {hovered && (
          <g>
            {/* Dashed vertical line */}
            <line
              x1={hovered.x} y1={PAD.top}
              x2={hovered.x} y2={H - PAD.bottom}
              stroke={lineColor} strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.6"
            />
            {/* Circle at the data point */}
            <circle
              cx={hovered.x} cy={hovered.y} r="4"
              fill={lineColor} stroke="var(--bg-primary)" strokeWidth="2"
            />
          </g>
        )}
      </svg>
    )
  }

  // Period price change
  const firstPrice = chartData[0]?.price
  const lastPrice  = chartData[chartData.length - 1]?.price
  const periodChange = firstPrice && lastPrice
    ? ((lastPrice - firstPrice) / firstPrice * 100).toFixed(2)
    : null
  const isUp = periodChange > 0

  return (
    // Dark overlay behind the modal — clicking outside closes it
    <div className="modal-overlay" onClick={onClose}>
      {/* stopPropagation prevents clicks inside the modal from closing it */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* ── MODAL HEADER ───────────────────────────────────────────────── */}
        <div className="modal-header">
          <div className="modal-title-group">
            <img src={coin.image} alt={coin.name} className="modal-icon" />
            <div>
              <h2 className="modal-title">{coin.symbol.toUpperCase()}</h2>
              <p className="modal-subtitle">{coin.name}</p>
            </div>
          </div>

          <div className="modal-stats">
            <div className="modal-price">{formatPrice(coin.current_price)}</div>
            {periodChange && (
              <div className={`modal-period-change ${isUp ? 'up' : 'down'}`}>
                {isUp ? '▲' : '▼'} {Math.abs(periodChange)}% ({days}d)
              </div>
            )}
          </div>

          {/* Close button */}
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── PERIOD SELECTOR ────────────────────────────────────────────── */}
        <div className="period-selector">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              className={`period-btn ${days === d ? 'active' : ''}`}
              onClick={() => setDays(d)}
            >
              {d}D
            </button>
          ))}
        </div>

        {/* ── CHART ──────────────────────────────────────────────────────── */}
        <div className="chart-container">
          {loadingChart ? (
            <div className="chart-loading">
              <span className="blink">█</span> LOADING CHART...
            </div>
          ) : (
            renderChart()
          )}
        </div>

        {/* Hovered price info */}
        {hovered && (
          <div className="hover-info">
            <span>{hovered.date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            <span className="hover-price">{formatPrice(hovered.price)}</span>
          </div>
        )}

        {/* ── FOOTER STATS ───────────────────────────────────────────────── */}
        <div className="modal-footer">
          {[
            { label: 'RANK',      value: `#${coin.market_cap_rank}` },
            { label: '24H CHANGE', value: `${coin.price_change_percentage_24h?.toFixed(2)}%`,
              className: coin.price_change_percentage_24h > 0 ? 'up' : 'down' },
            { label: '24H HIGH',  value: formatPrice(coin.high_24h) },
            { label: '24H LOW',   value: formatPrice(coin.low_24h) },
          ].map(({ label, value, className }) => (
            <div key={label} className="footer-stat">
              <span className="footer-label">{label}</span>
              <span className={`footer-value ${className || ''}`}>{value}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default CryptoModal
