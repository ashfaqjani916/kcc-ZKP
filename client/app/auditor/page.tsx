'use client'
import { useState } from 'react'
import WalletConnect from '@/components/WalletConnect'
import { useContract, useContractWrite, useContractRead, useAddress } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'
import Link from 'next/link'

type BigNumberish = {
  toNumber?: () => number
  toString?: () => string
}

interface BillDocument {
  billHash: string
  amount: BigNumberish
  uploadedAt: BigNumberish
  isApproved: boolean
  disbursedAmount: BigNumberish
}

export default function AuditorDashboard() {
  const address = useAddress()
  const { contract } = useContract(CONTRACTS.KCCLoanManager)
  const { data: currentAuditor } = useContractRead(contract, 'auditor')
  const { data: loansWithBills } = useContractRead(contract, 'getAllLoansWithBills')
  // const { mutateAsync: mintTokens } = useContractWrite(contract, 'mintTokens')

  const isAuditor = address && currentAuditor && address.toLowerCase() === currentAuditor.toLowerCase()

  const loanIdsWithBills = (loansWithBills as BigNumberish[]) || []
  const totalLoansWithBills = loanIdsWithBills.length

  // const [mintAmount, setMintAmount] = useState('')
  // const [minting, setMinting] = useState(false)

  if (!address) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Auditor Dashboard</h2>
          <p className="text-slate-600 mb-4">Please connect your wallet to continue</p>
          <WalletConnect />
        </div>
      </div>
    )
  }

  if (!isAuditor) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md border border-red-200 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2 text-red-700">Access Denied</h2>
          <p className="text-slate-700 mb-4">Only the authorized auditor wallet can access this dashboard.</p>
          <p className="text-sm text-slate-600 mb-4">
            Current Auditor:
            <br />
            <span className="font-mono text-xs text-black">{currentAuditor || 'Not set'}</span>
          </p>
          <Link href="/" className="text-green-700 font-medium hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-200">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-green-700 hover:text-green-800">
              ← Back
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Auditor Dashboard</h1>
              <p className="text-sm text-slate-600">Review bills and approve disbursements</p>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <p className="text-sm text-slate-600">Loans with Bills</p>
            <p className="text-3xl font-bold text-green-700">{totalLoansWithBills}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <p className="text-sm text-slate-600">Pending Review</p>
            <p className="text-3xl font-bold text-slate-700">--</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <p className="text-sm text-slate-600">Approved Bills</p>
            <p className="text-3xl font-bold text-slate-700">--</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-900">Pending Bills for Review ({totalLoansWithBills})</h2>
          <p className="text-sm text-slate-600 mb-4">Review farmer-submitted bills and approve disbursements</p>

          {totalLoansWithBills === 0 ? (
            <div className="bg-green-50 rounded-lg p-8 text-center">
              <p className="text-slate-600">No bills submitted yet</p>
              <p className="text-sm text-slate-500 mt-2">Bills will appear here once farmers upload them</p>
            </div>
          ) : (
            <div className="space-y-4">
              {loanIdsWithBills.map((loanId: BigNumberish, index: number) => {
                const id = typeof loanId === 'object' && loanId.toNumber ? loanId.toNumber() : Number(loanId)
                return <LoanWithBillsCard key={index} loanId={id} />
              })}
            </div>
          )}
        </div>

        {/* {isAuditor && (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-2 text-slate-900">Mint Tokens To Self</h2>
            <p className="text-sm text-slate-600 mb-4">Mint credit tokens for disbursement or testing.</p>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!mintAmount || Number(mintAmount) <= 0) {
                  alert('Please enter a valid amount')
                  return
                }
                setMinting(true)
                try {
                  await mintTokens({ args: [address, mintAmount] })
                  setMintAmount('')
                  alert(`Minted ${mintAmount} tokens successfully`)
                } catch {
                  alert('Minting failed')
                } finally {
                  setMinting(false)
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-900">Amount to Mint</label>
                <input type="number" min={1} value={mintAmount} onChange={(e) => setMintAmount(e.target.value)} required className="w-full p-2 border rounded text-slate-900" />
              </div>

              <button type="submit" disabled={minting} className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 disabled:bg-slate-400 font-semibold">
                {minting ? 'Minting...' : 'Mint Tokens'}
              </button>
            </form>
          </div>
        )} */}

        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h3 className="font-bold text-green-900 mb-3">Auditor Workflow</h3>

          <div className="space-y-3 text-sm text-green-800">
            <Workflow step="1️⃣" title="Review Bill" text="Open & inspect the uploaded bill." />
            <Workflow step="2️⃣" title="Verify Authenticity" text="Ensure the bill is legitimate." />
            <Workflow step="3️⃣" title="Approve Amount" text="Enter an amount ≤ requested." />
            <Workflow step="4️⃣" title="Disburse Funds" text="Funds release instantly to the farmer." />
          </div>
        </div>
      </main>
    </div>
  )
}

function Workflow({ step, title, text }: { step: string; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-2xl">{step}</span>
      <div>
        <p className="font-semibold">{title}</p>
        <p>{text}</p>
      </div>
    </div>
  )
}

function LoanWithBillsCard({ loanId }: { loanId: number }) {
  const { contract } = useContract(CONTRACTS.KCCLoanManager)
  const { mutateAsync: disburseFunds } = useContractWrite(contract, 'disburseFunds')
  const { data: loan } = useContractRead(contract, 'loanApplications', [loanId])
  const { data: bills, refetch: refetchBills } = useContractRead(contract, 'getLoanBills', [loanId])

  const [expandedBill, setExpandedBill] = useState<number | null>(null)
  const [approvedAmount, setApprovedAmount] = useState<{ [key: number]: string }>({})
  const [processing, setProcessing] = useState<number | null>(null)

  if (!loan) return null

  const toBigNumberString = (value: BigNumberish | undefined) => {
    if (!value) return '0'
    if (typeof value === 'object' && value.toString) return value.toString()
    return String(value)
  }

  const sanctionedAmount = toBigNumberString(loan.sanctionedAmount as BigNumberish)
  const disbursedAmount = toBigNumberString(loan.disbursedAmount as BigNumberish)
  const remainingAmount = Number(sanctionedAmount) - Number(disbursedAmount)

  const typedBills = (bills as BillDocument[]) || []
  const pendingBills = typedBills.filter((bill) => !bill.isApproved)

  if (pendingBills.length === 0) return null

  const handleApproveBill = async (billIndex: number, requestedAmount: string) => {
    const amount = approvedAmount[billIndex] || requestedAmount

    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (Number(amount) > Number(requestedAmount)) {
      alert('Approved amount cannot exceed requested amount')
      return
    }

    if (Number(amount) > remainingAmount) {
      alert('Approved amount exceeds remaining loan balance')
      return
    }

    setProcessing(billIndex)
    try {
      await disburseFunds({
        args: [loanId, billIndex, amount],
      })
      alert(`₹${amount} approved and disbursed for Bill #${billIndex + 1}`)
      setApprovedAmount((prev) => ({ ...prev, [billIndex]: '' }))
      setExpandedBill(null)
      refetchBills()
    } catch (error) {
      alert('Error approving bill')
      console.log(error)
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="p-4 bg-green-100 border-b rounded-t-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-lg text-slate-900">Loan #{loanId}</p>
            <p className="text-xs font-mono text-slate-700 mt-1">{loan.farmer}</p>
            <p className="text-sm text-slate-700 mt-1">
              Category: <span className="font-medium text-slate-900">{loan.loanCategory}</span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-600">Remaining Balance</p>
            <p className="text-xl font-bold text-green-700">₹{remainingAmount}</p>
            <p className="text-xs text-slate-500 mt-1">
              ₹{disbursedAmount} / ₹{sanctionedAmount}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-slate-900">Pending Bills ({pendingBills.length})</h3>

        {pendingBills.map((bill) => {
          const billIndex = typedBills.findIndex((b) => b === bill)
          const isExpanded = expandedBill === billIndex
          const requestedAmount = toBigNumberString(bill.amount)

          return (
            <div key={billIndex} className="border rounded-lg bg-green-50 border-green-200">
              <div className="p-3 cursor-pointer" onClick={() => setExpandedBill(isExpanded ? null : billIndex)}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-900">Bill #{billIndex + 1}</p>
                    <p className="text-sm text-slate-700 mt-1">Requested Amount: ₹{requestedAmount}</p>
                    <p className="text-xs text-slate-600 mt-1">Uploaded: {new Date(Number(bill.uploadedAt) * 1000).toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded bg-green-700 text-white">Pending</span>
                    <span className="text-slate-500">{isExpanded ? '▼' : '▶'}</span>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t p-4 bg-white space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-2">Bill Document</p>
                    <div className="p-3 bg-green-50 rounded border">
                      <p className="text-xs font-mono text-slate-700 break-all mb-2">{bill.billHash}</p>
                      <a
                        href={`https://ipfs.io/ipfs/${bill.billHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-green-700 text-white px-4 py-2 rounded text-sm hover:bg-green-800"
                      >
                        📄 View Bill →
                      </a>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-slate-900 mb-3">Approve Disbursement</p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-900">Approved Amount (₹)</label>
                        <input
                          type="number"
                          value={approvedAmount[billIndex] || requestedAmount}
                          onChange={(e) => setApprovedAmount((prev) => ({ ...prev, [billIndex]: e.target.value }))}
                          className="w-full p-2 border rounded text-slate-900"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Requested: ₹{requestedAmount} | Loan Balance: ₹{remainingAmount}
                        </p>
                      </div>

                      <button
                        onClick={() => handleApproveBill(billIndex, requestedAmount)}
                        disabled={processing === billIndex}
                        className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 disabled:bg-slate-400 font-semibold"
                      >
                        {processing === billIndex ? 'Processing...' : 'Approve & Disburse'}
                      </button>

                      <div className="bg-orange-50 p-3 rounded border border-orange-200">
                        <p className="text-xs text-orange-800">⚠️ Once approved, funds will be immediately disbursed.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
