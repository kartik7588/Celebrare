import { useEffect, useState } from 'react'

export const PHOTOS_URL = 'https://picsum.photos/v2/list?limit=30'

export default function useFetchPhotos() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchPhotos() {
      try {
        const response = await fetch(PHOTOS_URL, { signal: controller.signal })
        if (!response.ok) throw new Error(`Request failed (${response.status}).`)

        const data = await response.json()
        if (!Array.isArray(data) || data.some(photo =>
          typeof photo.id !== 'string' || typeof photo.author !== 'string'
        )) {
          throw new Error('The photo service returned an unexpected response.')
        }
        if (!controller.signal.aborted) setPhotos(data)
      } catch (err) {
        // Cancelling an unmounted component's request is not a user-facing error.
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unable to fetch photos.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchPhotos()
    return () => controller.abort()
  }, [])

  return { photos, loading, error }
}
