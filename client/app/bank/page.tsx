'use client'

import { useState } from 'react'
import WalletConnect from '@/components/WalletConnect'
import { useContract, useContractWrite, useContractRead, useAddress } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'
import Link from 'next/link'

const STATUS_MAP = ['IN_PROGRESS', 'UNDER_REVIEW', 'SANCTIONED', 'REJECTED']
const STATUS_COLORS = {
  0: 'bg-green-100 text-green-800 border-green-200',
  1: 'bg-green-200 text-green-900 border-green-300',
  2: 'bg-green-300 text-green-900 border-green-400',
  3: 'bg-red-100 text-red-800 border-red-200',
}

type BigNumberish = {
  toNumber?: () => number
  toString?: () => string
}

export default function BankDashboard() {
  const address = useAddress()
  const { contract } = useContract(CONTRACTS.KCCLoanManager)

  const { data: currentBankOfficer } = useContractRead(contract, 'bankOfficer')
  const { data: loanCounter } = useContractRead(contract, 'loanCounter')

  const { mutateAsync: reviewLoan } = useContractWrite(contract, 'reviewLoan')
  const { mutateAsync: sanctionLoan } = useContractWrite(contract, 'sanctionLoan')
  const { mutateAsync: rejectLoan } = useContractWrite(contract, 'rejectLoan')
  const { mutateAsync: disburseAmount } = useContractWrite(contract, 'disburseAmount')

  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null)
  const [sanctionAmount, setSanctionAmount] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<number | null>(null)
  const [disbursedLoans, setDisbursedLoans] = useState<number[]>([])

  const isBankOfficer = address && currentBankOfficer && address.toLowerCase() === currentBankOfficer.toLowerCase()

  const handleReviewLoan = async (loanId: number) => {
    setLoading(`review-${loanId}`)
    try {
      await reviewLoan({ args: [loanId] })
      alert(`Loan #${loanId} moved to UNDER_REVIEW`)
      setSelectedLoanId(null)
    } finally {
      setLoading(null)
    }
  }

  const handleSanctionLoan = async (loanId: number) => {
    if (!sanctionAmount) {
      alert('Please enter sanction amount')
      return
    }

    setLoading(`sanction-${loanId}`)
    try {
      await sanctionLoan({ args: [loanId, sanctionAmount] })
      alert(`Loan #${loanId} sanctioned with amount ₹${sanctionAmount}`)
      setSelectedLoanId(null)
      setSanctionAmount('')
    } finally {
      setLoading(null)
    }
  }

  const handleRejectLoan = async (loanId: number) => {
    if (!confirm(`Reject Loan #${loanId}?`)) return

    setLoading(`reject-${loanId}`)
    try {
      await rejectLoan({ args: [loanId] })
      alert(`Loan #${loanId} rejected`)
      setSelectedLoanId(null)
    } finally {
      setLoading(null)
    }
  }

  const handleDisburseAmount = async (loanId: number, amount: string, farmerAddress: string) => {
    if (!confirm(`Burn ${amount} tokens for Loan #${loanId}?`)) return

    setLoading(`disburse-${loanId}`)
    try {
      await disburseAmount({ args: [amount, farmerAddress, loanId] })
      alert(`Burned ${amount} tokens for Loan #${loanId}`)
      setDisbursedLoans((prev) => [...prev, loanId])
    } finally {
      setLoading(null)
    }
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Bank Officer Dashboard</h2>
          <p className="text-slate-600 mb-4">Please connect your wallet to continue</p>
          <WalletConnect />
        </div>
      </div>
    )
  }

  if (!isBankOfficer) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md border border-red-200 text-center">
          <div className="text-4xl mb-4 text-red-600">⚠</div>
          <h2 className="text-2xl font-bold mb-2 text-red-700">Access Denied</h2>
          <p className="text-slate-700 mb-4">Only the bank officer wallet can access this dashboard.</p>
          <p className="text-sm text-slate-600 mb-4">
            Current Bank Officer:
            <br />
            <span className="font-mono text-xs text-black">{currentBankOfficer || 'Not set'}</span>
          </p>
          <Link href="/" className="text-green-700 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const totalLoans = loanCounter && typeof loanCounter === 'object' && 'toNumber' in loanCounter && typeof loanCounter.toNumber === 'function' ? loanCounter.toNumber() : Number(loanCounter || 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-200">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-green-700 hover:text-green-800">
              ← Back
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Bank Officer Dashboard</h1>
              <p className="text-sm text-slate-600">Review, sanction, or reject loan applications</p>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-sm text-slate-600">Total Loans</p>
            <p className="text-3xl font-bold text-green-700">{totalLoans}</p>
          </div>

          <div className="bg-green-50 p-6 rounded-xl shadow text-center border border-green-200">
            <p className="text-sm text-green-700">In Progress</p>
            <p className="text-3xl font-bold text-green-800">--</p>
          </div>

          <div className="bg-green-100 p-6 rounded-xl shadow text-center border border-green-300">
            <p className="text-sm text-green-700">Under Review</p>
            <p className="text-3xl font-bold text-green-900">--</p>
          </div>

          <div className="bg-green-200 p-6 rounded-xl shadow text-center border border-green-300">
            <p className="text-sm text-green-800">Sanctioned</p>
            <p className="text-3xl font-bold text-green-900">--</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium text-slate-900">Filter by status:</span>

            <button onClick={() => setFilterStatus(null)} className={`px-3 py-1 rounded text-sm ${filterStatus === null ? 'bg-green-700 text-white' : 'bg-green-100 text-green-800'}`}>
              All
            </button>

            <button onClick={() => setFilterStatus(0)} className={`px-3 py-1 rounded text-sm ${filterStatus === 0 ? 'bg-green-700 text-white' : 'bg-green-100 text-green-800'}`}>
              In Progress
            </button>

            <button onClick={() => setFilterStatus(1)} className={`px-3 py-1 rounded text-sm ${filterStatus === 1 ? 'bg-green-700 text-white' : 'bg-green-200 text-green-900'}`}>
              Under Review
            </button>

            <button onClick={() => setFilterStatus(2)} className={`px-3 py-1 rounded text-sm ${filterStatus === 2 ? 'bg-green-700 text-white' : 'bg-green-300 text-green-900'}`}>
              Sanctioned
            </button>

            <button onClick={() => setFilterStatus(3)} className={`px-3 py-1 rounded text-sm ${filterStatus === 3 ? 'bg-red-700 text-white' : 'bg-red-100 text-red-800'}`}>
              Rejected
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Loan Applications</h2>

            {totalLoans === 0 ? (
              <p className="text-slate-600 text-center py-8">No loan applications yet</p>
            ) : (
              <div className="space-y-4">
                {Array.from({ length: totalLoans }, (_, i) => i).map((loanId) => (
                  <LoanCard
                    key={loanId}
                    loanId={loanId}
                    filterStatus={filterStatus}
                    selectedLoanId={selectedLoanId}
                    setSelectedLoanId={setSelectedLoanId}
                    sanctionAmount={sanctionAmount}
                    setSanctionAmount={setSanctionAmount}
                    loading={loading}
                    onReview={handleReviewLoan}
                    onSanction={handleSanctionLoan}
                    onReject={handleRejectLoan}
                    onDisburse={handleDisburseAmount}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-6 h-fit">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Disbursed Loans (Burned)</h2>

            {disbursedLoans.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No loans disbursed yet</p>
            ) : (
              <ul className="space-y-2">
                {disbursedLoans.map((id) => (
                  <li key={id} className="flex justify-between items-center p-3 bg-orange-50 rounded border border-orange-100">
                    <span className="font-medium text-orange-900">Loan #{id}</span>
                    <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">Burned 🔥</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h3 className="font-bold text-green-900 mb-2">Bank Officer Actions</h3>
          <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
            <li>
              <strong>Review:</strong> Move IN_PROGRESS loans to UNDER_REVIEW
            </li>
            <li>
              <strong>Sanction:</strong> Approve UNDER_REVIEW loans with sanctioned amount
            </li>
            <li>
              <strong>Reject:</strong> Reject any loan at any stage
            </li>
            <li>
              <strong>Disburse:</strong> Burn tokens for sanctioned loans
            </li>
            <li>Farmers must have credentials to apply</li>
            <li>ZK-Proofs ensure privacy and secure verification</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

function LoanCard({
  loanId,
  filterStatus,
  selectedLoanId,
  setSelectedLoanId,
  sanctionAmount,
  setSanctionAmount,
  loading,
  onReview,
  onSanction,
  onReject,
  onDisburse,
}: {
  loanId: number
  filterStatus: number | null
  selectedLoanId: number | null
  setSelectedLoanId: (id: number | null) => void
  sanctionAmount: string
  setSanctionAmount: (amount: string) => void
  loading: string | null
  onReview: (loanId: number) => Promise<void>
  onSanction: (loanId: number) => Promise<void>
  onReject: (loanId: number) => Promise<void>
  onDisburse: (loanId: number, amount: string, farmerAddress: string) => Promise<void>
}) {
  const { contract } = useContract(CONTRACTS.KCCLoanManager)
  const { data: loan, isLoading } = useContractRead(contract, 'loanApplications', [loanId])

  if (isLoading) {
    return <div className="p-4 border rounded-lg bg-green-50 text-slate-900">Loading loan #{loanId}...</div>
  }

  if (!loan) return null

  if (filterStatus !== null && loan.status !== filterStatus) {
    return null
  }

  const toBigNumberString = (value: BigNumberish | undefined) => (value && typeof value === 'object' && value.toString ? value.toString() : String(value || '0'))

  const requestedAmount = toBigNumberString(loan.requestedAmount)
  const sanctionedAmountStr = toBigNumberString(loan.sanctionedAmount)
  const disbursedAmountStr = toBigNumberString(loan.disbursedAmount)

  const status = STATUS_MAP[loan.status]
  const statusColor = STATUS_COLORS[loan.status as keyof typeof STATUS_COLORS] || 'bg-green-100'
  const isOpen = selectedLoanId === loanId

  return (
    <div className={`border rounded-lg ${statusColor}`}>
      <div className="p-4 cursor-pointer" onClick={() => setSelectedLoanId(isOpen ? null : loanId)}>
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-lg text-slate-900">Loan #{loanId}</p>
            <p className="text-sm font-mono text-slate-700">{loan.farmer}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold px-3 py-1 rounded bg-white text-green-900 border">{status}</span>
            <p className="text-sm mt-1 text-slate-900">₹{requestedAmount}</p>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-700 font-medium">{loan.loanCategory}</p>
      </div>

      {isOpen && (
        <div className="border-t p-4 bg-white">
          <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
            <div className="space-y-2">
              <p className="text-slate-900">
                <strong>Requested:</strong> ₹{requestedAmount}
              </p>
              <p className="text-slate-900">
                <strong>Sanctioned:</strong> ₹{sanctionedAmountStr}
              </p>
              <p className="text-slate-900">
                <strong>Disbursed:</strong> ₹{disbursedAmountStr}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-slate-900">
                <strong>Category:</strong> {loan.loanCategory}
              </p>
              <p className="text-slate-900">
                <strong>Status:</strong> {status}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {loan.status === 0 && (
              <button
                onClick={() => onReview(loanId)}
                disabled={loading === `review-${loanId}`}
                className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 disabled:bg-slate-400 font-semibold"
              >
                {loading === `review-${loanId}` ? 'Processing...' : 'Move to Under Review'}
              </button>
            )}

            {loan.status === 1 && (
              <>
                <input
                  type="text"
                  placeholder="Enter sanctioned amount (₹)"
                  value={sanctionAmount}
                  onChange={(e) => setSanctionAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full p-2 border rounded text-slate-900"
                />
                <button
                  onClick={() => onSanction(loanId)}
                  disabled={loading === `sanction-${loanId}`}
                  className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 disabled:bg-slate-400 font-semibold"
                >
                  {loading === `sanction-${loanId}` ? 'Processing...' : 'Sanction Loan'}
                </button>
              </>
            )}

            {loan.status === 2 && (
              <div className="pt-2 border-t mt-2">
                <p className="text-xs text-slate-600 mb-2">Disburse Funds (Burn Tokens)</p>
                <button
                  onClick={() => onDisburse(loanId, disbursedAmountStr !== '0' ? disbursedAmountStr : sanctionedAmountStr, loan.farmer)}
                  disabled={loading === `disburse-${loanId}`}
                  className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 disabled:bg-slate-400 font-semibold flex items-center justify-center gap-2"
                >
                  <span>🔥</span>
                  {loading === `disburse-${loanId}` ? 'Burning...' : 'Burn Tokens'}
                </button>
              </div>
            )}

            {loan.status !== 3 && (
              <button
                onClick={() => onReject(loanId)}
                disabled={loading === `reject-${loanId}`}
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:bg-slate-400 font-semibold"
              >
                {loading === `reject-${loanId}` ? 'Processing...' : 'Reject Loan'}
              </button>
            )}

            {loan.status === 3 && <div className="text-center text-sm text-slate-600 py-2">No actions available for {status} loans</div>}
          </div>
        </div>
      )}
    </div>
  )
}
