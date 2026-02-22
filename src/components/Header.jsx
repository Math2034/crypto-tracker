// components/Header.jsx — Application header
// "Dumb component" = only displays data, has no logic of its own
// Receives data via "props" (properties) from the parent component (App.jsx)

import './css/Header.css'

// { total } = props destructuring
// Instead of writing props.total everywhere, we grab only what we need directly
function Header({ total }) {
  // Get the current time to display in terminal style
  const now = new Date()

  // .toLocaleTimeString() formats the time according to the user's locale
  const time = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  })

  // .toLocaleDateString() formats the date
  const date = now.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  return (
    <header className="header">
      {/* Decorative top bar in terminal style */}
      <div className="header-topbar">
        <span className="topbar-left">CRYPTO_TRACKER v1.0.0</span>
        <span className="topbar-right">{date} · {time}</span>
      </div>

      {/* Main title area */}
      <div className="header-main">
        <div className="header-title-group">
          {/* Decorative symbol that sets the "data terminal" tone */}
          <span className="header-symbol">◈</span>
          <h1 className="header-title">CRYPTO<span className="title-accent">TRACKER</span></h1>
        </div>

        {/* Badge showing total coins currently displayed */}
        <div className="header-meta">
          <div className="meta-item">
            <span className="meta-label">ASSETS</span>
            {/* Template literal: inserts the value of "total" into the text */}
            <span className="meta-value">{total < 10 ? `0${total}` : total}</span>
            {/* If total is less than 10, pad with a zero (e.g. 09) */}
          </div>
          <div className="meta-item">
            <span className="meta-label">CURRENCY</span>
            <span className="meta-value">USD</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">UPDATE</span>
            <span className="meta-value live">● LIVE</span>
          </div>
        </div>
      </div>

      {/* Decorative divider line */}
      <div className="header-divider">
        <span className="divider-line" />
        <span className="divider-text">MARKET DATA</span>
        <span className="divider-line" />
      </div>
    </header>
  )
}

export default Header
