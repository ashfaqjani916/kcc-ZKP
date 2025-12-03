'use client'
import Link from 'next/link'
import WalletConnect from '@/components/WalletConnect'

export default function HomePage() {
  const roles = [
    {
      name: 'Farmer',
      description: 'Apply for KCC loans and track your applications',
      icon: '🌾',
      path: '/farmer',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      name: 'Issuer',
      description: 'Issue and manage farmer credentials',
      icon: '🏛️',
      path: '/issuer',
      color: 'bg-slate-700 hover:bg-slate-800',
    },
    {
      name: 'Bank Officer',
      description: 'Review and sanction loan applications',
      icon: '🏦',
      path: '/bank',
      color: 'bg-green-700 hover:bg-green-800',
    },
    {
      name: 'Auditor',
      description: 'Verify bills and disburse funds',
      icon: '📊',
      path: '/auditor',
      color: 'bg-slate-800 hover:bg-slate-900',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-200">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">KCC Loan System</h1>
            <p className="text-sm text-slate-600">Zero-Knowledge Proof Based Loan Management</p>
          </div>
          <WalletConnect />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Welcome to KCC Loan Portal</h2>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto">Privacy-preserving loan management powered by Zero-Knowledge Proofs and decentralized architecture</p>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-center mb-6 text-slate-800">Select Your Role</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role) => (
              <Link key={role.name} href={role.path} className={`${role.color} text-white rounded-xl p-6 shadow-lg transition-transform hover:scale-105 cursor-pointer`}>
                <div className="text-center">
                  <div className="text-6xl mb-4">{role.icon}</div>
                  <h4 className="text-xl font-bold mb-2">{role.name}</h4>
                  <p className="text-sm opacity-90">{role.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">🔐</div>
            <h4 className="font-bold text-lg mb-2 text-slate-800">Privacy First</h4>
            <p className="text-slate-600 text-sm">Prove eligibility without revealing personal data</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="font-bold text-lg mb-2 text-slate-800">Fast Processing</h4>
            <p className="text-slate-600 text-sm">Automated verification & faster decisions</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-3xl mb-3">🔗</div>
            <h4 className="font-bold text-lg mb-2 text-slate-800">Blockchain Secured</h4>
            <p className="text-slate-600 text-sm">Immutable and transparent recordkeeping</p>
          </div>
        </div>
      </main>

      <footer className="bg-white mt-16 py-6 border-t">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-sm">
          <p>© 2025 KCC Loan System - Secure by Zero-Knowledge Proofs</p>
        </div>
      </footer>
    </div>
  )
}
