// components/CryptoCard.jsx — Individual cryptocurrency card
// This component is responsible for displaying the data of ONE coin only
// It's called multiple times by CryptoList, once for each item in the array

import './css/CryptoCard.css'

// Utility function: formats large numbers with suffixes (T, B, M, K)
// Lives here because it's only used in this component
function formatLargeNumber(num) {
  if (!num) return '—'       // if null/undefined, return a dash
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`   // trillions
  if (num >= 1e9)  return `$${(num / 1e9).toFixed(2)}B`    // billions
  if (num >= 1e6)  return `$${(num / 1e6).toFixed(2)}M`    // millions
  if (num >= 1e3)  return `$${(num / 1e3).toFixed(2)}K`    // thousands
  return `$${num.toFixed(2)}`
}

// Utility function: formats price respecting the appropriate number of decimals
// Cheap coins (e.g. $0.00001) need more decimals than expensive ones (e.g. $60,000)
function formatPrice(price) {
  if (!price) return '$0.00'
  if (price < 0.01) return `$${price.toFixed(6)}`   // e.g. $0.000053
  if (price < 1)    return `$${price.toFixed(4)}`   // e.g. $0.4231
  if (price < 1000) return `$${price.toFixed(2)}`   // e.g. $45.23
  // Intl.NumberFormat formats with thousand separators (e.g. 60,123.45)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price)
}

// Props:
// coin    → object with all coin data (coming from the CoinGecko API)
// rank    → ranking position
// onClick → function to open the modal when clicked
function CryptoCard({ coin, rank, onClick }) {
  // Destructuring the fields we'll use from the coin object
  const {
    name,                              // "Bitcoin"
    symbol,                            // "btc"
    image,                             // URL of the coin logo
    current_price,                     // current price in USD
    price_change_percentage_24h,       // % change in the last 24h
    market_cap,                        // market capitalization
    total_volume,                      // 24h trading volume
    market_cap_rank                    // global ranking position
  } = coin

  // Determines if the change is positive or negative to apply the right color
  const isPositive = price_change_percentage_24h > 0

  // Formats the change with sign and 2 decimal places
  // Optional chaining (?.) prevents errors if price_change_percentage_24h is null
  const changeText = price_change_percentage_24h
    ? `${isPositive ? '+' : ''}${price_change_percentage_24h.toFixed(2)}%`
    : '—'

  return (
    // The entire card is clickable — calls onClick to open the modal
    <div
      className="crypto-card"
      onClick={onClick}
      // Accessibility: allows keyboard navigation (Tab + Enter)
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      // aria-label describes the button for screen readers
      aria-label={`View chart for ${name}`}
    >
      {/* Ranking position */}
      <span className="card-rank">
        {rank < 10 ? `0${rank}` : rank}
      </span>

      {/* Coin name + icon */}
      <div className="card-name">
        <img
          src={image}
          alt={name}
          className="card-icon"
          // onError: if the image fails to load, hide it (avoids broken icon)
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div className="card-labels">
          <span className="card-symbol">{symbol.toUpperCase()}</span>
          <span className="card-fullname">{name}</span>
        </div>
      </div>

      {/* Current price */}
      <span className="card-price">{formatPrice(current_price)}</span>

      {/* 24h change — className switches between "positive" and "negative" */}
      <span className={`card-change ${isPositive ? 'positive' : 'negative'}`}>
        {changeText}
      </span>

      {/* Market cap and volume — hidden on mobile via CSS */}
      <span className="card-cap">{formatLargeNumber(market_cap)}</span>
      <span className="card-vol">{formatLargeNumber(total_volume)}</span>
    </div>
  )
}

export default CryptoCard
