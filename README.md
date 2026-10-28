# Celebrare Photo Gallery

A React photo gallery built for the Celebrare frontend internship assignment. It loads 30 Picsum photos, filters them by author, and saves favourites in the current browser.

## Run locally

Use Node.js 22 LTS and npm. From the project folder:

```sh
npm ci
npm run dev
```

Open the localhost address printed in the terminal. The photo API needs an internet connection. No API key or environment variables are needed.

```sh
npm test          # Run the automated behaviour tests
npm run build    # Build the production app into dist/
npm run preview  # Preview the production build
```

## Assignment requirements

| Requirement | Implementation |
| --- | --- |
| React + Vite + Tailwind, no UI libraries | `package.json`, `vite.config.js`, `src/index.css` |
| Fetch 30 photos, loading spinner, failure state | `src/hooks/useFetchPhotos.js`, `src/components/Gallery.jsx` |
| Responsive grid: 1 / 2 / 4 columns | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` in `Gallery.jsx` |
| Live author search without another API request | `handleSearch` and `filteredPhotos` in `Gallery.jsx` |
| Favourites with useReducer + localStorage | `src/reducers/favouritesReducer.js`, persistence effect in `Gallery.jsx` |
| Custom hook returning photos, loading, error | `useFetchPhotos` |
| useCallback + useMemo | Stable search handler and memoized local filtering in `Gallery.jsx` |

Mobile is below 640px, tablet is 640px through 1023px, and desktop is 1024px and above. Each photo has an author label and an accessible heart toggle with `aria-pressed`.

## Code map

```text
src/
  main.jsx                       React entry point with StrictMode
  index.css                      Tailwind import and theme tokens
  components/
    Gallery.jsx                  App state, filtering, persistence, layout
    SearchInput.jsx              Memoized controlled search input
    PhotoCard.jsx                Photo, author, favourite button
    Icons.jsx                    Small inline SVG icons (no UI library)
  hooks/useFetchPhotos.js        API lifecycle and cleanup
  reducers/favouritesReducer.js  Pure favourite toggle and storage initializer
  test/                         Behaviour tests and setup
```

## Decisions to understand

- **One list request on mount:** the hook requests `https://picsum.photos/v2/list?limit=30`. Search operates on the fetched array. React StrictMode may start and cancel an extra request during development; cleanup handles this correctly.
- **Sized images:** the card uses Picsum's `/id/{id}/640/480` endpoint, keeping the same photo while avoiding the full-resolution download. Below-the-fold images are lazy-loaded.
- **Favourites are photo IDs:** IDs are stable and small. Two photographs by the same author remain independent favourites.
- **Reducer is pure:** `TOGGLE_FAVOURITE` returns a new array. Browser storage is read by a lazy initializer and written by an effect, never inside the reducer.
- **Storage failures:** corrupt saved JSON falls back to an empty list; blocked writes show a message while favourites remain usable in memory. This is local storage, so it does not sync across browsers or devices.
- **useCallback:** keeps `handleSearch`'s function identity stable. Combined with `memo(SearchInput)`, this avoids rerendering the search input solely because favourites changed.
- **useMemo:** recomputes the filtered array only when `photos` or `search` changes. Favouriting a photo does not rerun the filter. For 30 photos the performance benefit is small; these hooks are included to demonstrate the required concepts. Removing either would not break functionality.
- **Fetch errors:** non-2xx responses and malformed data are treated as failures. AbortController cancels obsolete requests, and aborted requests do not update the UI.

## Verification

Ten automated tests cover loading, API parameters, local case-insensitive search, no matches, favourite persistence and removal, network/HTTP/invalid-data errors, corrupt storage, blocked storage, request cancellation, and broken-image fallback. Tests use mocked API responses to remain deterministic.

The live app was also checked with Picsum: 30 photos loaded, mixed-case author search worked, and a favourite remained selected after refresh. The 1/2/4-column layout was checked at mobile, tablet, and desktop widths without horizontal overflow.

## References

- [Picsum API](https://picsum.photos/)
- [Vite guide](https://vite.dev/guide/)
- [Tailwind with Vite](https://tailwindcss.com/docs/installation/using-vite)

Photos are supplied remotely by Picsum. This project does not claim ownership of them.
