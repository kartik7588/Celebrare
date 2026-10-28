import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import useFetchPhotos from '../hooks/useFetchPhotos.js'
import { favouritesReducer, readFavourites, STORAGE_KEY } from '../reducers/favouritesReducer.js'
import { HeartIcon } from './Icons.jsx'
import PhotoCard from './PhotoCard.jsx'
import SearchInput from './SearchInput.jsx'

export default function Gallery() {
  const { photos, loading, error } = useFetchPhotos()
  const [search, setSearch] = useState('')
  const [favourites, dispatch] = useReducer(favouritesReducer, undefined, readFavourites)
  const [storageError, setStorageError] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites))
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }, [favourites])

  // A stable prop lets the memoized search input skip unrelated favourites updates.
  const handleSearch = useCallback(event => setSearch(event.target.value), [])

  // Filter locally, and reuse the result when only favourites change.
  const filteredPhotos = useMemo(() => {
    const query = search.trim().toLowerCase()
    return photos.filter(photo => photo.author.toLowerCase().includes(query))
  }, [photos, search])

  function toggleFavourite(id) {
    dispatch({ type: 'TOGGLE_FAVOURITE', id })
  }

  return (
    <div className="min-h-screen bg-paper font-sans text-ink antialiased selection:bg-soft selection:text-accent">
      <a href="#gallery" className="sr-only z-10 rounded bg-white p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to photos</a>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
          <span className="font-display text-2xl tracking-tight">celebrare<span className="text-accent">.</span></span>
          <div className="flex items-center gap-2 text-sm text-muted" aria-live="polite" aria-atomic="true">
            <HeartIcon className="size-4 text-accent" filled={favourites.length > 0} />
            <span>{favourites.length} {favourites.length === 1 ? 'favourite' : 'favourites'}</span>
          </div>
        </div>
      </header>

      <main id="gallery" tabIndex={-1} className="mx-auto max-w-7xl px-5 pb-12 pt-10 outline-none sm:px-8 sm:pt-12 lg:px-10">
        <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end sm:gap-10">
          <div>
            <h1 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">A little perspective.</h1>
            <p className="mt-3 max-w-lg text-base leading-7 text-muted">Explore the collection. Keep what catches your eye.</p>
          </div>
          <SearchInput value={search} onChange={handleSearch} />
        </div>

        {storageError && <p role="alert" className="mt-6 rounded-lg bg-soft p-4 text-sm text-accent">Your browser couldn’t save favourites. They’ll work here, but may be lost after a refresh. Allow site storage to keep them.</p>}

        <div className="mb-6 mt-9 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4 text-sm">
          <p className="font-medium" role="status">{loading ? 'Opening the collection' : error ? 'Collection unavailable' : `${filteredPhotos.length} ${filteredPhotos.length === 1 ? 'photograph' : 'photographs'}${search.trim() ? ` of ${photos.length}` : ''}`}</p>
          <span className="text-muted">Photography from Picsum</span>
        </div>

        {loading ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-4 text-muted" role="status">
            <span className="size-8 animate-spin rounded-full border-2 border-line border-t-accent motion-reduce:animate-none" aria-hidden="true" />
            <p>Loading photographs…</p>
          </div>
        ) : error ? (
          <div role="alert" className="py-20 text-center">
            <h2 className="font-display text-2xl">We couldn’t load the photographs.</h2>
            <p className="mt-3 text-muted">Check your connection and refresh the page to try again.</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="py-20 text-center">
            <h2 className="font-display text-2xl">{photos.length === 0 ? 'The collection is empty.' : 'No matching photographers.'}</h2>
            <p className="mt-3 text-muted">{photos.length === 0 ? 'Please try again later.' : 'Try another name or clear your search to see every photograph.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Photo collection">
            {filteredPhotos.map((photo, index) => (
              <PhotoCard key={photo.id} photo={photo} isFavourite={favourites.includes(photo.id)} onToggle={toggleFavourite} priority={index < 4} />
            ))}
          </div>
        )}
      </main>

      <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-5 pb-7 text-xs leading-6 text-muted sm:px-8 lg:px-10">
        <span>Small moments. A different view.</span>
        <span>Favourites stay in this browser.</span>
      </footer>
    </div>
  )
}
