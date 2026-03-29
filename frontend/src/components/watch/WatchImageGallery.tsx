import { useState } from 'react'

interface WatchImageGalleryProps {
  images: string[]
  alt: string
}

export function WatchImageGallery({ images, alt }: WatchImageGalleryProps) {
  const [active, setActive] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="aspect-watch overflow-hidden bg-smoke">
        <img
          src={images[active]}
          alt={alt}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>

      {/* Thumbnails — only shown when more than 1 image */}
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-16 h-16 overflow-hidden bg-smoke flex-shrink-0 transition-all duration-300 ${
                active === i ? 'ring-2 ring-gold ring-offset-2' : 'opacity-50 hover:opacity-80'
              }`}
            >
              <img src={src} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
