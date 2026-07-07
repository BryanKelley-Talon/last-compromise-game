import { useState } from 'react'

// ============================================================
// ImageSlot — the cohesion mechanism.
//
// Renders any slot image under the uniform treatment layer (see
// styles/treatment.css) so mixed sources — a Gemini backdrop and an archival
// LOC photograph — composite as one world. All treatment lives in CSS; this
// component only wires variants, the accent, lazy-loading, and the graceful
// placeholder fallback.
//
// Props:
//   src      slot path relative to /public/images/ (e.g. 'backdrops/x.webp').
//            Falsy → the placeholder renders (art-pending), never a broken img.
//   alt      required alt text.
//   variant  'hero' | 'frontispiece' | 'portrait' | 'insert'.
//   accent   per-game hex; tints the amber glaze + scrim + rims.
//   caption  insert only — source credit shown beneath the card.
//   children hero/frontispiece only — overlay content (title text) above scrim.
// ============================================================

const IMAGE_BASE = '/images/'
const PLACEHOLDER = '/images/_placeholder.svg'

const SCRIM_VARIANTS = new Set(['hero', 'frontispiece'])

function resolve(src) {
  if (!src) return null
  // Absolute URLs and root-absolute paths pass through untouched.
  if (/^(https?:)?\/\//.test(src) || src.startsWith('/')) return src
  return IMAGE_BASE + src.replace(/^\.?\//, '')
}

export default function ImageSlot({
  src,
  alt = '',
  variant = 'frontispiece',
  accent = '#C17700',
  caption,
  children,
  className = '',
}) {
  const resolved = resolve(src)
  // `missing` covers both no-src-provided and runtime 404 (onError).
  const [missing, setMissing] = useState(!resolved)

  const isPlaceholder = missing || !resolved
  const imgSrc = isPlaceholder ? PLACEHOLDER : resolved
  const scrim = SCRIM_VARIANTS.has(variant)

  // Hero is above the fold and load-critical (school-wifi rule): eager.
  // Everything else lazy-loads.
  const loading = variant === 'hero' ? 'eager' : 'lazy'

  const classes = [
    'slot',
    `slot--${variant}`,
    scrim ? 'slot--scrim' : '',
    isPlaceholder ? 'slot--placeholder' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const slot = (
    <div className={classes} style={{ '--accent': accent }}>
      <img
        className="slot__img"
        src={imgSrc}
        alt={isPlaceholder ? '' : alt}
        aria-hidden={isPlaceholder ? 'true' : undefined}
        loading={loading}
        decoding="async"
        draggable="false"
        onError={() => setMissing(true)}
      />
      {scrim && <div className="slot__scrim" aria-hidden="true" />}
      {scrim && children ? <div className="slot__overlay">{children}</div> : null}
    </div>
  )

  // Inserts carry a caption slot beneath the card for the source credit.
  if (variant === 'insert') {
    return (
      <figure className="slot-figure" style={{ margin: 0 }}>
        {slot}
        {caption ? <figcaption className="slot-caption">{caption}</figcaption> : null}
      </figure>
    )
  }

  return slot
}
