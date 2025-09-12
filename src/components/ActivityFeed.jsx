import { useEffect, useRef, useState } from 'react';
import { useNotify } from '../context/NotificationContext';
import { useRaffles } from '../context/RaffleContext';

export default function ActivityFeed() {
  const { activity } = useNotify();
  const { raffles } = useRaffles();
  const [items, setItems] = useState([]);
  const processed = useRef(new Set());

  useEffect(() => {
    const relevant = activity
      .filter((a) => ['purchase', 'raffle_end', 'topup'].includes(a.type))
      .filter((a) => !processed.current.has(a.id));

    relevant.forEach((ev) => {
      processed.current.add(ev.id);
      const entry = { ...ev, show: false };
      setItems((prev) => {
        const next = [...prev, entry];
        if (next.length > 10) {
          const removed = next.shift();
          processed.current.delete(removed.id);
        }
        return next;
      });
      // trigger enter animation
      setTimeout(() => {
        setItems((prev) => prev.map((it) => (it.id === ev.id ? { ...it, show: true } : it)));
      }, 50);
      // schedule removal
      setTimeout(() => {
        setItems((prev) => prev.map((it) => (it.id === ev.id ? { ...it, show: false } : it)));
        setTimeout(() => {
          setItems((prev) => prev.filter((it) => it.id !== ev.id));
          processed.current.delete(ev.id);
        }, 500);
      }, 30000);
    });
  }, [activity]);

  if (items.length === 0) return null;

  const getTitle = (id) => raffles.find((r) => r.id === id)?.title || `Raffle #${id}`;

  const renderText = (e) => {
    if (e.type === 'purchase') {
      return `${e.user} bought ${e.count} ticket${e.count > 1 ? 's' : ''} for ${getTitle(e.raffleId)}`;
    }
    if (e.type === 'topup') {
      return `${e.user} added $${e.amount.toFixed(2)} to their balance`;
    }
    if (e.type === 'raffle_end') {
      return `${e.winner} won the ${getTitle(e.raffleId)} raffle 🎉`;
    }
    return '';
  };

  return (
    <div className="fixed bottom-4 left-0 w-full flex justify-center z-50 px-4 pointer-events-none">
      <div className="pointer-events-auto bg-black/40 backdrop-blur-md rounded-xl shadow-glow overflow-hidden">
        <ul className="flex gap-4 py-2 px-4">
          {items.map((e) => (
            <li
              key={e.id}
              className={`flex items-center gap-2 text-xs sm:text-sm min-w-max transition-all duration-500 ${
                e.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-darker ${
                  e.type === 'raffle_end' ? 'bg-claret-light' : 'bg-blue-light'
                }`}
              >
                {(e.type === 'raffle_end' ? e.winner : e.user)?.[0]?.toUpperCase()}
              </div>
              <span className="truncate max-w-[200px] sm:max-w-xs">
                {e.type === 'purchase' ? '🎟️' : e.type === 'topup' ? '💰' : '🏆'} {renderText(e)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
