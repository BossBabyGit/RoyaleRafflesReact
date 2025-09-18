export default function Privacy() {
  return (
    <div className="py-10 space-y-6 max-w-4xl mx-auto">
      <header className="glass rounded-3xl p-8 border border-white/10 space-y-3">
        <h1 className="text-3xl font-extrabold">Privacy Policy (Test Environment)</h1>
        <p className="text-white/70 text-sm">
          Northedge Group Ltd is committed to protecting customer data. This staging site operates with anonymised test
          accounts so that payment partners can review the customer experience without exposing real personal data.
        </p>
      </header>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="text-2xl font-semibold">1. Data We Collect</h2>
        <ul className="list-disc list-inside text-white/70 text-sm space-y-2">
          <li>Account details such as username, password (hashed in production), email address and avatar.</li>
          <li>Transaction history including ticket purchases, deposits and free-entry claims.</li>
          <li>Device information (browser, IP address) captured for fraud prevention once the platform is live.</li>
        </ul>
      </section>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="text-2xl font-semibold">2. How We Use Data</h2>
        <p className="text-white/70 text-sm">
          Customer data is used to operate competitions, verify eligibility, process payments and notify winners. In the
          live environment data may also be shared with payment processors, identity verification partners and regulators
          where required by law.
        </p>
      </section>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="text-2xl font-semibold">3. Data Retention</h2>
        <p className="text-white/70 text-sm">
          Competition and transaction records are retained for a minimum of six years in accordance with UK gambling and
          anti-money laundering guidance. Test-mode data can be reset at any time by contacting Northedge Group Ltd.
        </p>
      </section>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="text-2xl font-semibold">4. Your Rights</h2>
        <p className="text-white/70 text-sm">
          In production environments customers can request access, correction or deletion of their personal data and may
          object to marketing communications at any time. Requests are handled within 30 days by the Northedge Group Ltd
          compliance team.
        </p>
      </section>

      <section className="glass rounded-2xl p-6 space-y-3">
        <h2 className="text-2xl font-semibold">5. Contact</h2>
        <p className="text-white/70 text-sm">
          Data Protection Officer<br />
          Northedge Group Ltd, 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ<br />
          Email: <a href="mailto:privacy@northedgegroup.co.uk" className="text-blue-light underline">privacy@northedgegroup.co.uk</a>
        </p>
      </section>
    </div>
  )
}
