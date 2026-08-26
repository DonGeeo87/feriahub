import { ReactLenis } from 'lenis/react'

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ duration: 1.4, easing: (t: number) => 1 - Math.pow(2, -10 * t) }}>
      {children}
    </ReactLenis>
  )
}
