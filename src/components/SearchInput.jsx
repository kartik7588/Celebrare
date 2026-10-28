import { memo } from 'react'
import { SearchIcon } from './Icons.jsx'

const SearchInput = memo(function SearchInput({ value, onChange }) {
  return (
    <div className="w-full sm:max-w-sm">
      <label htmlFor="author-search" className="mb-2 block text-sm font-medium">Find a photographer</label>
      <div className="flex items-center gap-3 rounded-lg border border-line bg-white px-4 text-muted focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
        <SearchIcon />
        <input id="author-search" type="search" placeholder="Search by author name…" value={value} onChange={onChange} className="min-w-0 flex-1 bg-transparent py-3 text-base text-ink caret-accent outline-none placeholder:text-muted" />
      </div>
    </div>
  )
})

export default SearchInput
