
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 text-white/60 text-sm flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} RoyaleRaffles — Demo Project</p>
        <p>Built with React, Vite & Tailwind</p>
      </div>
    </footer>
  )
}
