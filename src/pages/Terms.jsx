export default function Terms() {
  return (
    <div className="py-10 space-y-6 max-w-4xl mx-auto">
      <header className="glass rounded-3xl p-8 border border-white/10 space-y-3">
        <h1 className="text-3xl font-extrabold">Terms &amp; Conditions (Test Environment)</h1>
        <p className="text-white/70 text-sm">
          Royale Raffles is a trading name of Northedge Group Ltd (Company No. 16579252). These terms outline how the
          staging site operates ahead of final payment processor approval. The live service terms are materially the
          same, with the exception that all transactions here are simulated.
        </p>
      </header>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="text-2xl font-semibold">1. Eligibility</h2>
        <ul className="list-disc list-inside text-white/70 text-sm space-y-2">
          <li>Entrants must be UK residents aged 18 or over. ID verification is required before prizes are fulfilled.</li>
          <li>Employees and directors of Northedge Group Ltd and their household members are excluded.</li>
          <li>One free postal entry is accepted per raffle per person, in addition to paid entries.</li>
        </ul>
      </section>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="text-2xl font-semibold">2. Free Postal Entry</h2>
        <p className="text-white/70 text-sm">
          To enter without purchase send your name, email, contact number, chosen raffle name and confirmation of your
          eligibility to the Royale Raffles free entry team. The full postal address will be confirmed ahead of launch and is available on request from{' '}
          <a href="mailto:support@northedgegroup.co.uk" className="text-blue-light underline">support@northedgegroup.co.uk</a>.
          Postal entries must be received before the raffle closes. Illegible or incomplete entries will be rejected.
        </p>
      </section>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="text-2xl font-semibold">3. Ticket Purchases &amp; Test Mode</h2>
        <p className="text-white/70 text-sm">
          All on-site purchases in this environment are processed in Test Mode. No funds leave your account and all
          balances reset on request. The production platform uses PCI-compliant payment providers with 3-D Secure.
        </p>
      </section>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="text-2xl font-semibold">4. Winner Selection</h2>
        <p className="text-white/70 text-sm">
          Winners are chosen at random via the RANDOM.ORG verified draw service. Draw logs are retained for a minimum
          of three years and can be provided to regulators or payment partners on request. Northedge Group Ltd reserves
          the right to void entries that breach these terms or exceed the ticket purchase cap (50% of available tickets).
        </p>
      </section>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="text-2xl font-semibold">5. Responsible Play</h2>
        <p className="text-white/70 text-sm">
          Royale Raffles promotes responsible participation. Self-exclusion and spend controls are available in the
          production environment. Contact <a href="mailto:support@northedgegroup.co.uk" className="text-blue-light underline">support@northedgegroup.co.uk</a>
          for assistance or to request account limits.
        </p>
      </section>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="text-2xl font-semibold">6. Contact</h2>
        <p className="text-white/70 text-sm">
          Northedge Group Ltd Compliance Team<br />
          Email: <a href="mailto:compliance@northedgegroup.co.uk" className="text-blue-light underline">compliance@northedgegroup.co.uk</a>
        </p>
      </section>
    </div>
  )
}
