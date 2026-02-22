// App.jsx — Root component of the application
// In React, every project has a "root" component that wraps all others.
// This is where we define the main structure of the page.

import { useState, useEffect } from 'react'
// useState  → stores data that can change (e.g. crypto list, search text)
// useEffect → runs code when the component mounts or when something changes

import Header from './components/Header'
import SearchBar from './components/SearchBar'
import CryptoList from './components/CryptoList'
import CryptoModal from './components/CryptoModal'
import './App.css'

function App() {
  // ─── STATE (useState) ──────────────────────────────────────────────────────
  // State = a variable that, when changed, causes the UI to re-render automatically

  const [cryptos, setCryptos] = useState([])
  // cryptos  → array with all cryptocurrencies fetched from the API
  // setCryptos → function to update that array

  const [filtered, setFiltered] = useState([])
  // filtered → array with coins filtered by the user's search

  const [search, setSearch] = useState('')
  // search → text currently typed in the search bar

  const [selected, setSelected] = useState(null)
  // selected → the coin the user clicked to view the chart (or null if none)

  const [loading, setLoading] = useState(true)
  // loading → true while data hasn't arrived from the API yet

  const [error, setError] = useState(null)
  // error → holds the error message if the API call fails

  // ─── FETCH DATA FROM API ───────────────────────────────────────────────────
  // useEffect with an empty array [] = runs ONCE when the component first mounts
  useEffect(() => {
    fetchCryptos()

    // Auto-refresh every 60 seconds to keep prices up to date
    const interval = setInterval(fetchCryptos, 60000)

    // Cleanup: when the component unmounts, clear the interval to avoid memory leaks
    return () => clearInterval(interval)
  }, [])

  // Async function that fetches cryptocurrencies from the CoinGecko API (free, no key needed)
  const fetchCryptos = async () => {
    try {
      setError(null) // clear any previous error before retrying

      // fetch() is the browser's native function for making HTTP requests
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h'
      )
      // vs_currency=usd       → prices in US dollars
      // order=market_cap_desc → sorted by largest market cap first
      // per_page=50           → returns 50 coins
      // price_change_percentage=24h → includes 24h price change

      if (!response.ok) throw new Error('Failed to fetch data')
      // If response is not 200 OK, throw an error to be caught below

      const data = await response.json()
      // .json() parses the response (which arrives as text) into a JavaScript object

      setCryptos(data)    // save to the main state
      setFiltered(data)   // also save to the filter state (shows all coins initially)
      setLoading(false)   // turn off the loading state
    } catch (err) {
      setError('Failed to load data. Please try again.')
      setLoading(false)
    }
  }

  // ─── SEARCH FILTER ─────────────────────────────────────────────────────────
  // useEffect that runs EVERY TIME "search" or "cryptos" changes
  useEffect(() => {
    const term = search.toLowerCase() // convert to lowercase so the comparison is case-insensitive

    const result = cryptos.filter(coin =>
      coin.name.toLowerCase().includes(term) ||   // filter by name (e.g. "Bitcoin")
      coin.symbol.toLowerCase().includes(term)    // or by symbol (e.g. "btc")
    )

    setFiltered(result)
  }, [search, cryptos])
  // [search, cryptos] = this useEffect only runs when search or cryptos change

  // ─── RENDER ────────────────────────────────────────────────────────────────
  // The return defines what appears on screen — it's the component's "HTML"
  return (
    <div className="app">
      {/* Header component with title and asset counter */}
      <Header total={filtered.length} />

      {/* Search bar — receives the current value and the function to update it */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Conditional rendering: show loading, error, or the list */}
      {loading && (
        <div className="status-message">
          <span className="blink">█</span> LOADING MARKET DATA...
        </div>
      )}

      {error && (
        <div className="status-message error">
          ⚠ {error}
          <button onClick={fetchCryptos} className="retry-btn">TRY AGAIN</button>
        </div>
      )}

      {/* !loading && !error = only show the list if not loading and no error */}
      {!loading && !error && (
        <CryptoList
          cryptos={filtered}
          onSelect={setSelected}  // pass the function for when the user clicks a coin
        />
      )}

      {/* Chart modal — only appears if "selected" holds a coin */}
      {selected && (
        <CryptoModal
          coin={selected}
          onClose={() => setSelected(null)}  // on close, reset selected back to null
        />
      )}
    </div>
  )
}

export default App
// export default = exports this component so other files can import it

