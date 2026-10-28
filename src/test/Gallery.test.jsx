import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Gallery from '../components/Gallery.jsx'
import { PHOTOS_URL } from '../hooks/useFetchPhotos.js'
import { STORAGE_KEY } from '../reducers/favouritesReducer.js'

const photos = [
  { id: '0', author: 'Alejandro Escamilla' },
  { id: '10', author: 'Paul Jarvis' },
  { id: '11', author: 'Paul Jarvis' },
]

function mockPhotos() {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => photos })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('assignment behaviours', () => {
  it('shows loading until the API resolves, then renders photos and author names', async () => {
    let resolveFetch
    vi.stubGlobal('fetch', vi.fn(() => new Promise(resolve => { resolveFetch = resolve })))
    render(<Gallery />)
    expect(screen.getByText('Loading photographs…')).toBeInTheDocument()
    await act(async () => resolveFetch({ ok: true, json: async () => photos }))
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(screen.getByText('Alejandro Escamilla')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith(PHOTOS_URL, expect.objectContaining({ signal: expect.any(AbortSignal) }))
  })

  it('filters authors case-insensitively without fetching again and handles no matches', async () => {
    const fetchMock = mockPhotos()
    const user = userEvent.setup()
    render(<Gallery />)
    await screen.findByText('Alejandro Escamilla')
    const search = screen.getByRole('searchbox', { name: 'Find a photographer' })
    await user.type(search, '  pAuL  ')
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.queryByText('Alejandro Escamilla')).not.toBeInTheDocument()
    await user.clear(search)
    await user.type(search, 'nobody')
    expect(screen.getByText('No matching photographers.')).toBeInTheDocument()
    await user.clear(search)
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('toggles independent favourites, persists them, restores after remount, and persists removal', async () => {
    mockPhotos()
    const user = userEvent.setup()
    const first = render(<Gallery />)
    await user.click(await screen.findByRole('button', { name: 'Add photo 0 to favourites' }))
    await user.click(screen.getByRole('button', { name: 'Add photo 10 to favourites' }))
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual(['0', '10'])
    first.unmount()
    render(<Gallery />)
    const saved = await screen.findByRole('button', { name: 'Remove photo 0 from favourites' })
    expect(saved).toHaveAttribute('aria-pressed', 'true')
    await user.click(saved)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual(['10'])
    expect(screen.getByRole('button', { name: 'Remove photo 10 from favourites' })).toHaveAttribute('aria-pressed', 'true')
  })

  it.each(['network', 'http', 'malformed'])('shows a useful error for %s failures', async kind => {
    vi.stubGlobal('fetch', kind === 'network'
      ? vi.fn().mockRejectedValue(new Error('Network unavailable'))
      : vi.fn().mockResolvedValue(kind === 'http'
        ? { ok: false, status: 503 }
        : { ok: true, json: async () => ({ invalid: true }) }))
    render(<Gallery />)
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load the photographs.')
    expect(screen.queryByText('Loading photographs…')).not.toBeInTheDocument()
  })

  it('recovers from malformed saved favourites', async () => {
    mockPhotos()
    localStorage.setItem(STORAGE_KEY, '{broken json')
    render(<Gallery />)
    expect(await screen.findByRole('button', { name: 'Add photo 0 to favourites' })).toHaveAttribute('aria-pressed', 'false')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('[]')
  })

  it('keeps favourites usable when storage writes fail and explains the limitation', async () => {
    mockPhotos()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked') })
    const user = userEvent.setup()
    render(<Gallery />)
    await user.click(await screen.findByRole('button', { name: 'Add photo 0 to favourites' }))
    expect(screen.getByRole('button', { name: 'Remove photo 0 from favourites' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Your browser couldn’t save favourites.')
  })

  it('aborts the request on unmount', async () => {
    const fetchMock = vi.fn(() => new Promise(() => {}))
    vi.stubGlobal('fetch', fetchMock)
    const view = render(<Gallery />)
    const signal = fetchMock.mock.calls[0][1].signal
    expect(signal.aborted).toBe(false)
    view.unmount()
    expect(signal.aborted).toBe(true)
  })

  it('shows a fallback when an individual image fails', async () => {
    mockPhotos()
    render(<Gallery />)
    fireEvent.error(await screen.findByAltText('Photograph by Alejandro Escamilla'))
    await waitFor(() => expect(screen.getByRole('img', { name: 'Photograph by Alejandro Escamilla unavailable' })).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Add photo 0 to favourites' })).toBeEnabled()
  })
})
