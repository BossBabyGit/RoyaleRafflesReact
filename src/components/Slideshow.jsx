
import { useEffect, useState } from 'react'
import RaffleCard from './RaffleCard'

export default function Slideshow({ items, onPurchase }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(()=> setIdx(i => (i+1)%items.length), 3500)
    return () => clearInterval(t)
  }, [items.length])
  if (!items.length) return null
  const current = items[idx]
  return (
    <div className="relative">
      <div className="grid sm:grid-cols-2 gap-6 items-center">
        <div className="order-2 sm:order-1">
          <RaffleCard r={current} onPurchase={onPurchase} />
        </div>
        <div className="order-1 sm:order-2">
          <h3 className="text-2xl font-bold">Top Raffles</h3>
          <p className="text-white/70 mt-2">Spotlight on what's buzzing this week. These raffles are filling up fast!</p>
          <div className="flex gap-2 mt-4">
            {items.map((_,i)=>(
              <button key={i} onClick={()=>setIdx(i)} className={"w-3 h-3 rounded-full " + (i===idx?"bg-blue-light":"bg-white/30")}></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
