import { useState } from 'react'

const PLACEHOLDER = '/placeholder-watch.svg'

/**
 * Drop-in replacement for <img> that never leaves a broken hole:
 * - falls back to a local SVG placeholder on load error (once, no loop)
 * - shows a subtle shimmer skeleton until the image paints
 *
 * Pass-through className lands on the <img> exactly like a native one,
 * so existing utilities (object-cover, group-hover:scale-105, …) keep working.
 */
export function SmartImage({ src, alt = '', className = '', ...rest }) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const resolvedSrc = failed || !src ? PLACEHOLDER : src

  function handleError() {
    if (!failed) setFailed(true)
    setLoaded(true)
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={handleError}
      className={`${className} ${loaded ? '' : 'img-skeleton'}`.trim()}
      {...rest}
    />
  )
}
