'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WalletConnect from '@/components/WalletConnect'
import { useContract, useContractWrite, useContractRead, useAddress } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
  Filter,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Loader2,
  Info,
} from 'lucide-react'

const STATUS_MAP = ['IN_PROGRESS', 'UNDER_REVIEW', 'SANCTIONED', 'REJECTED']
const STATUS_COLORS = {
  0: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: Clock },
  1: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: FileCheck },
  2: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: CheckCircle2 },
  3: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: XCircle },
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

  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null)
  const [sanctionAmount, setSanctionAmount] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<number | null>(null)

  const isBankOfficer = address && currentBankOfficer && address.toLowerCase() === currentBankOfficer.toLowerCase()

  const handleReviewLoan = async (loanId: number) => {
    setLoading(`review-${loanId}`)
    try {
      await reviewLoan({ args: [loanId] })
      alert(`Loan #${loanId} moved to UNDER_REVIEW`)
      setSelectedLoanId(null)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error)
        alert(`Error: ${error.message}`)
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error)
        alert(`Error: ${error.message}`)
      }
    } finally {
      setLoading(null)
    }
  }

  const handleRejectLoan = async (loanId: number) => {
    if (!confirm(`Are you sure you want to reject Loan #${loanId}?`)) {
      return
    }

    setLoading(`reject-${loanId}`)
    try {
      await rejectLoan({ args: [loanId] })
      alert(`Loan #${loanId} rejected`)
      setSelectedLoanId(null)
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error)
        alert(`Error: ${error.message}`)
      }
    } finally {
      setLoading(null)
    }
  }

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-green-100"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-green-600/30"
          >
            <Building2 className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 text-center">Bank Officer Dashboard</h2>
          <p className="text-gray-600 mb-6 text-center text-sm">Connect your wallet to continue</p>
          <WalletConnect />
        </motion.div>
      </div>
    )
  }

  if (!isBankOfficer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-red-200"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-red-600/30"
          >
            <AlertCircle className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2 text-red-800 text-center">Access Denied</h2>
          <p className="text-gray-700 mb-4 text-center">You are not authorized as a bank officer</p>
          <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-200">
            <p className="text-xs text-gray-600 mb-2 text-center">Current Bank Officer:</p>
            <p className="font-mono text-xs text-gray-900 break-all text-center">{currentBankOfficer || 'Not set'}</p>
          </div>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </motion.button>
          </Link>
        </motion.div>
      </div>
    )
  }

  const totalLoans = loanCounter ? (typeof loanCounter === 'object' && 'toNumber' in loanCounter && typeof loanCounter.toNumber === 'function' ? loanCounter.toNumber() : Number(loanCounter)) : 0

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05, x: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-all border border-green-200 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Back</span>
                </motion.button>
              </Link>

              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/30"
                >
                  <Building2 className="w-6 h-6 text-white" />
                </motion.div>

                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-green-800 bg-clip-text text-transparent">
                    Bank Officer Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Review, sanction, or reject applications
                  </p>
                </div>
              </div>
            </div>

            <WalletConnect />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Loans', value: totalLoans, icon: Users, bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' },
              { label: 'In Progress', value: '--', icon: Clock, bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
              { label: 'Under Review', value: '--', icon: FileCheck, bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
              { label: 'Sanctioned', value: '--', icon: CheckCircle2, bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className={`${stat.bgColor} rounded-2xl p-6 shadow-lg border ${stat.borderColor}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <p className={`text-3xl font-bold ${stat.textColor} mb-1`}>{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Filter Section */}
          <motion.div variants={itemVariants} whileHover={{ y: -2 }} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Filter Applications</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { label: 'All', value: null, color: 'gray' },
                { label: 'In Progress', value: 0, color: 'yellow' },
                { label: 'Under Review', value: 1, color: 'blue' },
                { label: 'Sanctioned', value: 2, color: 'green' },
                { label: 'Rejected', value: 3, color: 'red' },
              ].map((filter) => (
                <motion.button
                  key={filter.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterStatus(filter.value)}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${filterStatus === filter.value
                      ? `bg-gradient-to-r from-${filter.color}-600 to-${filter.color}-700 text-white shadow-lg`
                      : `bg-${filter.color}-50 text-${filter.color}-700 hover:bg-${filter.color}-100 border border-${filter.color}-200`
                    }`}
                >
                  {filter.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Loan List */}
          <motion.div variants={itemVariants} whileHover={{ y: -2 }} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                  <FileCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Loan Applications</h3>
                  <p className="text-xs text-gray-600">{totalLoans} total applications</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {totalLoans === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileCheck className="w-10 h-10 text-gray-400" />
                  </motion.div>
                  <p className="text-gray-600 font-medium">No loan applications yet</p>
                  <p className="text-sm text-gray-500 mt-2">Applications will appear here when farmers submit them</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: totalLoans }, (_, i) => i).map((loanId, index) => (
                    <motion.div key={loanId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.05 }}>
                      <LoanCard
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
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Guidelines */}
          <motion.div variants={itemVariants} className="bg-green-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-green-900 mb-2">Bank Officer Actions</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• <strong>Review:</strong> Move IN_PROGRESS loans to UNDER_REVIEW</li>
                  <li>• <strong>Sanction:</strong> Approve UNDER_REVIEW loans with sanctioned amount</li>
                  <li>• <strong>Reject:</strong> Reject any loan at any stage</li>
                  <li>• Farmers cannot apply for loans without credentials</li>
                  <li>• ZK-Proofs ensure privacy while proving eligibility</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="relative z-10 mt-16 bg-white border-t border-gray-200 py-6"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            Secured by{' '}
            <span className="font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Zero-Knowledge Proof Technology
            </span>
          </p>
        </div>
      </motion.footer>
    </div>
  )
}

// Loan Card Component
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
}: {
  loanId: number
  filterStatus: number | null
  selectedLoanId: number | null
  setSelectedLoanId: (id: number | null) => void
  sanctionAmount: string
  setSanctionAmount: (amount: string) => void
  loading: string | null
  onReview: (loanId: number) => void
  onSanction: (loanId: number) => void
  onReject: (loanId: number) => void
}) {
  const { contract } = useContract(CONTRACTS.KCCLoanManager)
  const { data: loan, isLoading } = useContractRead(contract, 'loanApplications', [loanId])

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
        <div className="flex items-center gap-3">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full" />
          <span className="text-gray-600">Loading loan #{loanId}...</span>
        </div>
      </motion.div>
    )
  }

  if (!loan) return null

  if (filterStatus !== null && loan.status !== filterStatus) {
    return null
  }

  const toBigNumberString = (value: BigNumberish | undefined): string => {
    if (!value) return '0'
    if (typeof value === 'object' && value.toString) {
      return value.toString()
    }
    return String(value)
  }

  const requestedAmount = toBigNumberString(loan.requestedAmount as BigNumberish)
  const sanctionedAmount = toBigNumberString(loan.sanctionedAmount as BigNumberish)
  const disbursedAmount = toBigNumberString(loan.disbursedAmount as BigNumberish)
  const status = loan.status !== undefined ? STATUS_MAP[loan.status] : 'UNKNOWN'
  const statusConfig = STATUS_COLORS[loan.status as keyof typeof STATUS_COLORS] || STATUS_COLORS[0]
  const StatusIcon = statusConfig.icon

  const isExpanded = selectedLoanId === loanId

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      className={`${statusConfig.bg} rounded-2xl border-2 ${statusConfig.border} overflow-hidden shadow-lg hover:shadow-xl transition-all`}
    >
      {/* Card Header */}
      <motion.div
        className="p-6 cursor-pointer"
        onClick={() => setSelectedLoanId(isExpanded ? null : loanId)}
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }} className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md ${statusConfig.text}`}>
              <StatusIcon className="w-6 h-6" />
            </motion.div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-xl text-gray-900">Loan #{loanId}</p>
                <motion.span whileHover={{ scale: 1.05 }} className={`text-xs font-semibold px-3 py-1 rounded-full bg-white ${statusConfig.text} shadow-sm`}>
                  {status}
                </motion.span>
              </div>
              <p className="text-sm font-mono text-gray-600 mb-2">{loan.farmer}</p>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-900">₹{requestedAmount}</span>
                <span className="text-xs text-gray-500">• {loan.loanCategory}</span>
              </div>
            </div>
          </div>

          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }} className="text-gray-600">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </motion.div>
        </div>
      </motion.div>

      {/* Expanded Details & Actions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="border-t-2 border-white/50 bg-white">
            <div className="p-6 space-y-6">
              {/* Loan Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl shadow-sm">
                    <span className="text-sm text-gray-600 font-medium">Requested Amount</span>
                    <span className="font-bold text-gray-900">₹{requestedAmount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl shadow-sm">
                    <span className="text-sm text-gray-600 font-medium">Sanctioned Amount</span>
                    <span className="font-bold text-green-700">₹{sanctionedAmount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl shadow-sm">
                    <span className="text-sm text-gray-600 font-medium">Disbursed Amount</span>
                    <span className="font-bold text-blue-700">₹{disbursedAmount}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl shadow-sm">
                    <span className="text-sm text-gray-600 font-medium">Category</span>
                    <span className="font-bold text-gray-900">{loan.loanCategory}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl shadow-sm">
                    <span className="text-sm text-gray-600 font-medium">Status</span>
                    <span className={`font-bold ${statusConfig.text}`}>{status}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {loan.status === 0 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onReview(loanId)}
                    disabled={loading === `review-${loanId}`}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    {loading === `review-${loanId}` ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-5 h-5" />
                        Move to Under Review
                      </>
                    )}
                  </motion.button>
                )}

                {loan.status === 1 && (
                  <>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter sanctioned amount"
                        value={sanctionAmount}
                        onChange={(e) => setSanctionAmount(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSanction(loanId)}
                      disabled={loading === `sanction-${loanId}`}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      {loading === `sanction-${loanId}` ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Sanction Loan
                        </>
                      )}
                    </motion.button>
                  </>
                )}

                {loan.status !== 3 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onReject(loanId)}
                    disabled={loading === `reject-${loanId}`}
                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 rounded-xl hover:from-red-700 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    {loading === `reject-${loanId}` ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Reject Loan
                      </>
                    )}
                  </motion.button>
                )}

                {(loan.status === 2 || loan.status === 3) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4 bg-gray-50 rounded-xl shadow-sm border-2 border-gray-200">
                    <p className="text-sm text-gray-600">
                      No actions available for <span className="font-semibold">{status}</span> loans
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
