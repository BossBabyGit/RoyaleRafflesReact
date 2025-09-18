import { Link } from 'react-router-dom'

export default function HowItWorks() {
  return (
    <div className="py-10 space-y-8 max-w-4xl mx-auto">
      <header className="glass rounded-3xl p-8 border border-white/10 space-y-3">
        <h1 className="text-3xl font-extrabold">How Royale Raffles Works</h1>
        <p className="text-white/70 text-sm">
          This staging site demonstrates the full Royale Raffles customer journey. The steps below mirror our
          live service, from selecting a prize through to drawing and verifying winners. Everything you see here
          operates in <strong>Test Mode</strong>, so no real payments or raffles are processed.
        </p>
      </header>

      <section className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold">1. Browse Example Prizes</h2>
        <p className="text-white/70 text-sm">
          Explore our curated list of example prizes on the <Link to="/raffles" className="text-blue-light underline">Competitions page</Link>.
          Each listing shows the total prize value in pounds sterling, ticket price, closing time and the number of tickets available.
          Customers can purchase entries instantly or claim one free entry by completing the postal route detailed on every prize page.
        </p>
      </section>

      <section className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold">2. How Raffles Are Drawn</h2>
        <ul className="list-disc list-inside text-white/70 text-sm space-y-2">
          <li>When the countdown ends or all tickets sell out, entries are locked and exported for the draw.</li>
          <li>An independently verified random number generator selects the winning ticket.</li>
          <li>Our compliance team double-checks eligibility (18+ UK resident, entry limits, free-entry submissions).</li>
          <li>The winner is contacted immediately and announced on the Winners Hub with their anonymised initials.</li>
        </ul>
      </section>

      <section className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold">3. Fairness &amp; Verification</h2>
        <p className="text-white/70 text-sm">
          Royale Raffles is operated by Northedge Group Ltd. Every draw is logged, auditable and accompanied by an
          independent draw certificate. Customers and regulators can request the certificate, entry list and RNG seed
          values for any competition. Postal entries are treated exactly the same as paid entries and are recorded in the
          same draw system.
        </p>
        <p className="text-white/70 text-sm">
          Need further detail? Our compliance pack, RNG methodology and responsible play policy are available on request from{' '}
          <a href="mailto:compliance@northedgegroup.co.uk" className="text-blue-light underline">compliance@northedgegroup.co.uk</a>.
        </p>
      </section>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="text-2xl font-semibold">Key Assurances</h2>
        <ul className="list-disc list-inside text-white/70 text-sm space-y-2">
          <li>UK residents aged 18+ only. ID verification is required before prizes are fulfilled.</li>
          <li>No purchase necessary. A free postal entry route is provided for every competition.</li>
          <li>Secure payment processing with 3-D Secure authentication in production environments.</li>
          <li>Transparent reporting for payment partners, including total ticket sales and prize liability.</li>
        </ul>
        <p className="text-white/70 text-sm">
          If you need anything else before onboarding, contact the Northedge Group compliance team. We are happy to supply
          additional documentation for payment processor review.
        </p>
      </section>
    </div>
  )
}
