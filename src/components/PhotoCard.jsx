import { useState } from 'react'
import { HeartIcon } from './Icons.jsx'

export default function PhotoCard({ photo, isFavourite, onToggle, priority }) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <article className="min-w-0">
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-line/50">
        {imageFailed ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted" role="img" aria-label={`Photograph by ${photo.author} unavailable`}>
            This photograph is unavailable.
          </div>
        ) : (
          <img src={`https://picsum.photos/id/${encodeURIComponent(photo.id)}/640/480`} alt={`Photograph by ${photo.author}`} width="640" height="480" loading={priority ? 'eager' : 'lazy'} decoding="async" onError={() => setImageFailed(true)} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="flex items-center justify-between gap-3 py-3">
        <h2 className="min-w-0 text-sm font-medium leading-6 [overflow-wrap:anywhere]">{photo.author}</h2>
        <button type="button" aria-label={`${isFavourite ? 'Remove' : 'Add'} photo ${photo.id} ${isFavourite ? 'from' : 'to'} favourites`} aria-pressed={isFavourite} onClick={() => onToggle(photo.id)} className={`flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none ${isFavourite ? 'bg-soft text-accent hover:bg-accent/20' : 'text-muted hover:bg-soft hover:text-accent'}`}>
          <HeartIcon filled={isFavourite} />
        </button>
      </div>
    </article>
  )
}
