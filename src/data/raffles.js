
export default function seed() {
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  return [
    {
      id: 1,
      title: "iPhone 15 Pro Max (256GB)",
      image: "https://images.unsplash.com/photo-1692631165683-2966ac5e3e10?q=80&w=1200&auto=format&fit=crop",
      description: "Apple's 2024 flagship with the A17 Pro chip, titanium design and a 6.7\" Super Retina XDR display.",
      dioramaUrl: "/dioramas/sample.json",
      value: 1299,
      ticketPrice: 5.5,
      totalTickets: 180,
      sold: 68,
      endsAt: now + oneDay * 2.5,
      category: "Tech",
      entries: [
        { username: 'sofia', count: 18 },
        { username: 'marco', count: 24 },
        { username: 'leah', count: 26 },
      ],
      ended: false,
      winner: null,
    },
    {
      id: 2,
      title: "Rolex Submariner Date 41mm",
      image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200&auto=format&fit=crop",
      description: "Iconic Oystersteel Submariner with Cerachrom bezel, black dial and COSC-certified movement.",
      value: 10450,
      ticketPrice: 12.5,
      totalTickets: 350,
      sold: 142,
      endsAt: now + oneDay * 4.5,
      category: "Luxury",
      entries: [
        { username: 'dylan', count: 32 },
        { username: 'amira', count: 44 },
        { username: 'liam', count: 66 },
      ],
      ended: false,
      winner: null,
    },
    {
      id: 3,
      title: "Signed Premier League Match Shirt",
      image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
      description: "Official 2023/24 home shirt signed by the full first team and supplied with club-issued authentication.",
      value: 749,
      ticketPrice: 3.75,
      totalTickets: 260,
      sold: 84,
      endsAt: now + oneDay * 3.8,
      category: "Collectibles",
      entries: [
        { username: 'nina', count: 20 },
        { username: 'owen', count: 28 },
        { username: 'james', count: 36 },
      ],
      ended: false,
      winner: null,
    }
  ]
}
