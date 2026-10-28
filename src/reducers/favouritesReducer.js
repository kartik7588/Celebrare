export const STORAGE_KEY = 'celebrare:favourites'

export function readFavourites() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(saved)
      ? [...new Set(saved.filter(id => typeof id === 'string'))]
      : []
  } catch {
    // Missing, corrupt, or blocked storage should never stop the gallery opening.
    return []
  }
}

export function favouritesReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_FAVOURITE':
      return state.includes(action.id)
        ? state.filter(id => id !== action.id)
        : [...state, action.id]
    default:
      return state
  }
}
