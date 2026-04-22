'use client'

export default function SubscribePage() {
  const handleCheckout = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
    })

    const { url } = await res.json()

    if (!url) return alert('Payment failed')

    window.location.href = url
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900 text-white p-6">
      
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">

        <h1 className="text-3xl font-bold mb-2">
          Play. Win. Give Back.
        </h1>

        <p className="text-gray-400 mb-6">
          Enter monthly draws, track performance, and support charity.
        </p>

        <p className="text-5xl font-bold mb-2">$5</p>
        <p className="text-gray-400 mb-6 text-sm">per month</p>

        <div className="text-left text-sm text-gray-300 space-y-2 mb-6">
          <p>✔ Track your last 5 scores</p>
          <p>✔ Participate in monthly draws</p>
          <p>✔ Win rewards</p>
          <p>✔ Support charity</p>
        </div>

        <button
          onClick={handleCheckout}
          className="w-full py-3 rounded-lg bg-green-500 text-black font-semibold hover:scale-105 transition"
        >
          Pay Now
        </button>

        <p className="text-xs text-gray-400 mt-4">
          10% goes to charity ❤️
        </p>

      </div>
    </div>
  )
}