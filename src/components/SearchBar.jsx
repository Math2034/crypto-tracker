// components/SearchBar.jsx — Search and filter bar
// Controlled component: the input value is managed by React state (not the DOM)
// This means React is always the "source of truth" for what's typed

import './css/SearchBar.css'

// Props received:
// value    → current search text (comes from the "search" state in App.jsx)
// onChange → function to update that state when the user types
function SearchBar({ value, onChange }) {
  return (
    <div className="searchbar-wrapper">
      {/* Decorative terminal-style search icon */}
      <span className="searchbar-icon">⌕</span>

      <input
        type="text"
        className="searchbar-input"
        placeholder="SEARCH ASSET... (e.g. bitcoin, eth)"
        value={value}
        // onChange fires on every keystroke
        // e.target.value = the current text in the input
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}      // disables spell check (doesn't make sense for ticker symbols)
        autoComplete="off"      // disables browser autocomplete suggestions
      />

      {/* Clear button — only appears when something is typed */}
      {value && (
        <button
          className="searchbar-clear"
          onClick={() => onChange('')}   // clears by passing an empty string
          aria-label="Clear search"      // accessibility: describes the button for screen readers
        >
          ✕
        </button>
      )}

      {/* Hint text — only appears when there's text in the search bar */}
      {value && (
        <span className="searchbar-hint">FILTERING...</span>
      )}
    </div>
  )
}

export default SearchBar
