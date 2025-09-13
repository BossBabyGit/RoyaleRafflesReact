import { useEffect, useRef } from 'react'

export default function PrizeDiorama({ src, className = '' }) {
  const containerRef = useRef(null)

  useEffect(() => {
    let anim
    async function load() {
      if (!src || !containerRef.current) return
      try {
        const [lottie, data] = await Promise.all([
          import('lottie-web'),
          fetch(src).then(r => r.json())
        ])
        anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: data
        })
      } catch (err) {
        console.error('Failed to load diorama', err)
      }
    }
    load()
    return () => {
      if (anim) anim.destroy()
    }
  }, [src])

  return <div ref={containerRef} className={className} />
}
