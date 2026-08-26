// Reveal palabra por palabra atado al progreso (0-1).
// Cada palabra se revela al cruzar su fracción del progreso, con deslizamiento.
export default function WordReveal({ text, progress }: { text: string; progress: number }) {
  const words = text.split(' ')
  return (
    <span className="inline">
      {words.map((w, i) => {
        const start = i / words.length
        const end = (i + 1) / words.length
        // la palabra está "revelada" cuando progress superó su punto medio
        const reveal = Math.min(1, Math.max(0, (progress - start) / (end - start)))
        return (
          <span
            key={i}
            className="inline-block overflow-hidden align-bottom"
            style={{ paddingBottom: '0.12em', marginBottom: '-0.12em' }}
          >
            <span
              className="inline-block will-change-transform"
              style={{
                transform: `translateY(${(1 - reveal) * 110}%)`,
                opacity: reveal >= 1 ? 1 : 0.35,
                transition: 'transform 60ms linear, opacity 60ms linear',
              }}
            >
              {w}
              {i < words.length - 1 ? '\u00A0' : ''}
            </span>
          </span>
        )
      })}
    </span>
  )
}
