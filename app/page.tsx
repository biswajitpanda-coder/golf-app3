"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white">

      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold">Golf App</h1>

        <button
          onClick={() => router.push("/login")}
          className="bg-white text-black px-4 py-2 rounded-xl hover:opacity-80 transition"
        >
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <section className="text-center mt-20 px-6">
        <h2 className="text-5xl font-bold mb-6">
          Compete. Win. Give Back.
        </h2>

        <p className="text-gray-300 mb-8 max-w-xl mx-auto">
          Join the golf charity competition. Enter draws, climb the leaderboard,
          and support a good cause.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="bg-white text-black px-6 py-3 rounded-xl text-lg hover:opacity-80 transition"
        >
          Get Started
        </button>

        <div className="mt-4">
          <button
            onClick={() => router.push("/subscribe")}
            className="text-gray-300 underline"
          >
            View Subscription
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="mt-24 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6">
        <div className="bg-white text-black p-6 rounded-2xl shadow">
          <h3 className="font-bold text-lg mb-2">Enter Draws</h3>
          <p className="text-gray-600">
            Participate in exclusive golf draws and competitions.
          </p>
        </div>

        <div className="bg-white text-black p-6 rounded-2xl shadow">
          <h3 className="font-bold text-lg mb-2">Climb Leaderboard</h3>
          <p className="text-gray-600">
            Compete with others and track your ranking in real-time.
          </p>
        </div>

        <div className="bg-white text-black p-6 rounded-2xl shadow">
          <h3 className="font-bold text-lg mb-2">Support Charity</h3>
          <p className="text-gray-600">
            Every entry contributes to meaningful causes.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-400 mt-24 pb-10">
        © 2026 Golf Charity App
      </footer>

    </main>
  );
}
