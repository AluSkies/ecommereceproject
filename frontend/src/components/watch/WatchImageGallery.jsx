import { useState } from 'react'
import { SmartImage } from '@/components/ui/SmartImage'

export function WatchImageGallery({ images, alt }) {
  const [active, setActive] = useState(0)

  // Guard: never index into an empty/undefined array — SmartImage will show
  // its local placeholder when the src is falsy.
  const list = Array.isArray(images) && images.length > 0 ? images : [undefined]
  const current = list[Math.min(active, list.length - 1)]

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="aspect-watch overflow-hidden bg-smoke">
        <SmartImage
          src={current}
          alt={alt}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>

      {/* Thumbnails — only shown when more than 1 image */}
      {list.length > 1 && (
        <div className="flex gap-3">
          {list.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-16 h-16 overflow-hidden bg-smoke flex-shrink-0 transition-all duration-300 ${
                active === i ? 'ring-2 ring-gold ring-offset-2' : 'opacity-50 hover:opacity-80'
              }`}
            >
              <SmartImage src={src} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
