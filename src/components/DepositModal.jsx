import { useState } from 'react'
import { initiateDeposit, confirm3ds } from '../utils/paytriot'

export default function DepositModal({ amount, onClose, onSuccess }) {
  const [step, setStep] = useState('form')
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [tx, setTx] = useState(null)
  const [result, setResult] = useState(null)

  const handlePay = async () => {
    if (!card.number || !card.expiry || !card.cvc || !card.name) {
      setErr('Fill all fields')
      return
    }
    setErr('')
    setLoading(true)
    const res = await initiateDeposit(amount, card)
    setLoading(false)
    if (res.requires3ds) {
      setTx(res.transactionId)
      setStep('3ds')
    } else {
      setResult(res.success ? 'success' : 'fail')
      if (res.success) onSuccess(amount)
      setStep('result')
    }
  }

  const handle3ds = async (approved) => {
    setLoading(true)
    const res = await confirm3ds(tx, approved)
    setLoading(false)
    setResult(res.success ? 'success' : 'fail')
    if (res.success) onSuccess(amount)
    setStep('result')
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-md p-6 space-y-4">
        {step === 'form' && (
            <>
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-semibold">Add Funds</h3>
                <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-white/70">Amount: <b className="text-blue-light">${amount.toFixed(2)}</b></div>
                <label htmlFor="card-number" className="sr-only">Card Number</label>
                <input
                  id="card-number"
                  placeholder="Card Number"
                  value={card.number}
                  onChange={e => setCard({ ...card, number: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none"
                  aria-label="Card Number"
                />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label htmlFor="card-expiry" className="sr-only">Expiry date</label>
                  <input
                    id="card-expiry"
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={e => setCard({ ...card, expiry: e.target.value })}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none"
                    aria-label="Expiry date"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="card-cvc" className="sr-only">CVC</label>
                  <input
                    id="card-cvc"
                    placeholder="CVC"
                    value={card.cvc}
                    onChange={e => setCard({ ...card, cvc: e.target.value })}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none"
                    aria-label="CVC"
                  />
                </div>
              </div>
              <label htmlFor="card-name" className="sr-only">Name on Card</label>
              <input
                id="card-name"
                placeholder="Name on Card"
                value={card.name}
                onChange={e => setCard({ ...card, name: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 outline-none"
                aria-label="Name on Card"
              />
              {err && <div className="text-sm text-red-400">{err}</div>}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={onClose} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20">Cancel</button>
              <button
                onClick={handlePay}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-claret hover:bg-claret-light disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Pay'}
              </button>
            </div>
          </>
        )}

        {step === '3ds' && (
          <div className="text-center space-y-4">
            <div className="text-lg font-semibold">3-D Secure Challenge</div>
            <div className="text-sm text-white/70">Simulated verification for demo</div>
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={() => handle3ds(true)}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-blue hover:bg-blue-light disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handle3ds(false)}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="text-center space-y-4">
            {result === 'success' ? (
              <div>
                <div className="text-lg font-semibold text-green-400">Deposit Successful</div>
                <div className="text-sm text-white/70">${amount.toFixed(2)} added to your wallet.</div>
              </div>
            ) : (
              <div>
                <div className="text-lg font-semibold text-red-400">Deposit Failed</div>
                <div className="text-sm text-white/70">Please try again.</div>
              </div>
            )}
            <button onClick={onClose} className="mt-4 px-3 py-1.5 rounded-xl bg-blue hover:bg-blue-light">Close</button>
          </div>
        )}
      </div>
    </div>
  )
}

