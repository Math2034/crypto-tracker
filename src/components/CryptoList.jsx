// components/CryptoList.jsx — Full list of cryptocurrencies
// This component receives the coins array and renders a CryptoCard for each one
// Very common React pattern: parent component controls data,
// child components handle the visual presentation

import CryptoCard from './CryptoCard'
import './css/CryptoList.css'

// Props:
// cryptos  → array of objects with data for each cryptocurrency
// onSelect → function passed down from the parent (App.jsx) for when a coin is clicked
function CryptoList({ cryptos, onSelect }) {
  // Handle empty search results
  if (cryptos.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">◈</span>
        <p>NO ASSETS FOUND</p>
        <span className="empty-sub">Check your search term</span>
      </div>
    )
  }

  return (
    <div className="crypto-list">
      {/* Column headers — works like a table thead */}
      <div className="list-header">
        <span className="col-rank">#</span>
        <span className="col-name">ASSET</span>
        <span className="col-price">PRICE</span>
        <span className="col-change">24H</span>
        <span className="col-cap">MARKET CAP</span>
        <span className="col-vol">VOLUME</span>
      </div>

      {/* .map() = iterates over each array item and returns a JSX element
          It's the React way of doing a "for loop" inside markup
          The "key" prop is mandatory — helps React identify which item changed */}
      {cryptos.map((coin, index) => (
        <CryptoCard
          key={coin.id}           // unique id per coin (e.g. "bitcoin")
          coin={coin}             // all data for this coin
          rank={index + 1}        // ranking position (starts at 1, not 0)
          onClick={() => onSelect(coin)}  // on click, passes this coin up to App.jsx
        />
      ))}
    </div>
  )
}

export default CryptoList
