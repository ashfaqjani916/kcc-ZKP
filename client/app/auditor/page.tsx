'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WalletConnect from '@/components/WalletConnect'
import { useContract, useContractWrite, useContractRead, useAddress } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'
import Link from 'next/link'
import {
  ArrowLeft,
  UserCheck,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
  Shield,
  Loader2,
  Info,
  Upload,
  Receipt,
} from 'lucide-react'

const STATUS_MAP = ['IN_PROGRESS', 'UNDER_REVIEW', 'SANCTIONED', 'REJECTED']

type BigNumberish = {
  toNumber?: () => number
  toString?: () => string
}

export default function AuditorDashboard() {
  const address = useAddress()
  const { contract } = useContract(CONTRACTS.KCCLoanManager)

  const { data: currentAuditor } = useContractRead(contract, 'auditor')
  const { data: loanCounter } = useContractRead(contract, 'loanCounter')

  const { mutateAsync: disburseFunds } = useContractWrite(contract, 'disburseFunds')

  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null)
  const [disburseAmount, setDisburseAmount] = useState('')
  const [billHash, setBillHash] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const isAuditor = address && currentAuditor && address.toLowerCase() === currentAuditor.toLowerCase()

  const handleDisburseFunds = async (loanId: number) => {
    if (!disburseAmount || !billHash) {
      alert('Please enter disbursement amount and bill hash')
      return
    }

    setLoading(`disburse-${loanId}`)
    try {
      await disburseFunds({ args: [loanId, disburseAmount, billHash] })
      alert(`₹${disburseAmount} disbursed for Loan #${loanId}`)
      setSelectedLoanId(null)
      setDisburseAmount('')
      setBillHash('')
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
            <UserCheck className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 text-center">Auditor Dashboard</h2>
          <p className="text-gray-600 mb-6 text-center text-sm">Connect your wallet to continue</p>
          <WalletConnect />
        </motion.div>
      </div>
    )
  }

  if (!isAuditor) {
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
          <p className="text-gray-700 mb-4 text-center">You are not authorized as an auditor</p>
          <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-200">
            <p className="text-xs text-gray-600 mb-2 text-center">Current Auditor:</p>
            <p className="font-mono text-xs text-gray-900 break-all text-center">{currentAuditor || 'Not set'}</p>
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

  const totalLoans = loanCounter ? (typeof loanCounter === 'object' && 'toNumber' in loanCounter ? loanCounter.toNumber?.() ?? 0 : Number(loanCounter)) : 0

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
                  <UserCheck className="w-6 h-6 text-white" />
                </motion.div>

                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-green-800 bg-clip-text text-transparent">
                    Auditor Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Verify bills and disburse funds
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
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Loans', value: totalLoans, icon: FileText, bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' },
              { label: 'Sanctioned Loans', value: '--', icon: CheckCircle2, bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
              { label: 'Total Disbursed', value: '₹--', icon: DollarSign, bgColor: 'bg-teal-50', textColor: 'text-teal-700', borderColor: 'border-teal-200' },
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

          {/* Sanctioned Loans */}
          <motion.div variants={itemVariants} whileHover={{ y: -2 }} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Sanctioned Loans</h3>
                  <p className="text-xs text-gray-600">Ready for disbursement after bill verification</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {totalLoans === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </motion.div>
                  <p className="text-gray-600 font-medium">No loan applications yet</p>
                  <p className="text-sm text-gray-500 mt-2">Sanctioned loans will appear here for disbursement</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: totalLoans }, (_, i) => i).map((loanId, index) => (
                    <motion.div key={loanId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.05 }}>
                      <LoanCard
                        loanId={loanId}
                        selectedLoanId={selectedLoanId}
                        setSelectedLoanId={setSelectedLoanId}
                        disburseAmount={disburseAmount}
                        setDisburseAmount={setDisburseAmount}
                        billHash={billHash}
                        setBillHash={setBillHash}
                        loading={loading}
                        onDisburse={handleDisburseFunds}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div variants={itemVariants} className="bg-green-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-green-900 mb-3">Auditor Responsibilities</h4>
                <ul className="text-sm text-green-800 space-y-2">
                  <li>• <strong>Verify Bills:</strong> Check authenticity of farmer's purchase bills/invoices</li>
                  <li>• <strong>Disburse Funds:</strong> Release funds only after bill verification</li>
                  <li>• <strong>Amount Check:</strong> Ensure disbursement doesn't exceed sanctioned amount</li>
                  <li>• <strong>Partial Disbursement:</strong> You can disburse in multiple installments</li>
                  <li>• <strong>Bill Hash:</strong> Use IPFS hash or any permanent storage reference</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Bill Verification Process */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-sm">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Bill Verification Process</h3>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'Farmer Submits Bill', desc: 'Farmer uploads bill/invoice for agricultural purchase', color: 'from-yellow-500 to-amber-600' },
                { step: '2', title: 'Auditor Verifies', desc: 'You verify the bill is legitimate and matches loan category', color: 'from-blue-500 to-cyan-600' },
                { step: '3', title: 'Enter Bill Hash', desc: 'Store bill on IPFS and enter the hash (e.g., ipfs://Qm...)', color: 'from-purple-500 to-pink-600' },
                { step: '4', title: 'Disburse Funds', desc: "Release funds to farmer's wallet for verified amount", color: 'from-green-500 to-emerald-600' },
              ].map((item) => (
                <motion.div
                  key={item.step}
                  whileHover={{ y: -4 }}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white font-bold text-xl mb-3 shadow-lg`}>
                    {item.step}
                  </div>
                  <p className="font-semibold text-gray-900 mb-1 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </motion.div>
              ))}
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
  selectedLoanId,
  setSelectedLoanId,
  disburseAmount,
  setDisburseAmount,
  billHash,
  setBillHash,
  loading,
  onDisburse,
}: {
  loanId: number
  selectedLoanId: number | null
  setSelectedLoanId: (id: number | null) => void
  disburseAmount: string
  setDisburseAmount: (amount: string) => void
  billHash: string
  setBillHash: (hash: string) => void
  loading: string | null
  onDisburse: (loanId: number) => void
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
  if (loan.status !== 2) return null

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
  const remainingAmount = Number(sanctionedAmount) - Number(disbursedAmount)
  const status = STATUS_MAP[loan.status]

  const isExpanded = selectedLoanId === loanId
  const isFullyDisbursed = Number(disbursedAmount) >= Number(sanctionedAmount)
  const progressPercentage = (Number(disbursedAmount) / Number(sanctionedAmount)) * 100

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      className={`rounded-2xl border-2 overflow-hidden shadow-lg hover:shadow-xl transition-all ${isFullyDisbursed ? 'bg-gray-50 border-gray-300' : 'bg-green-50 border-green-200'
        }`}
    >
      {/* Card Header */}
      <motion.div
        className="p-6 cursor-pointer"
        onClick={() => setSelectedLoanId(isExpanded ? null : loanId)}
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4 flex-1">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className={`w-12 h-12 ${isFullyDisbursed ? 'bg-gray-200' : 'bg-white'} rounded-xl flex items-center justify-center shadow-md ${isFullyDisbursed ? 'text-gray-500' : 'text-green-600'
                }`}
            >
              {isFullyDisbursed ? <CheckCircle2 className="w-6 h-6" /> : <DollarSign className="w-6 h-6" />}
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-xl text-gray-900">Loan #{loanId}</p>
                <motion.span whileHover={{ scale: 1.05 }} className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-sm">
                  {status}
                </motion.span>
              </div>
              <p className="text-xs font-mono text-gray-600 mb-2 break-all">{loan.farmer}</p>
              <p className="text-sm font-medium text-gray-900">{loan.loanCategory}</p>
            </div>
          </div>

          <div className="text-right ml-4">
            {isFullyDisbursed ? (
              <span className="text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">Fully Disbursed</span>
            ) : (
              <span className="text-sm font-semibold text-orange-700 bg-orange-100 px-3 py-1 rounded-full">Pending</span>
            )}
          </div>
        </div>

        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }} className="text-gray-600 flex justify-center mt-4">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </motion.div>
      </motion.div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t-2 border-white/50 bg-white"
          >
            <div className="p-6 space-y-6">
              {/* Amount Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600 font-medium">Requested</span>
                    <span className="font-bold text-gray-900">₹{requestedAmount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <span className="text-sm text-gray-600 font-medium">Sanctioned</span>
                    <span className="font-bold text-green-700">₹{sanctionedAmount}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <span className="text-sm text-gray-600 font-medium">Already Disbursed</span>
                    <span className="font-bold text-blue-700">₹{disbursedAmount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                    <span className="text-sm text-gray-600 font-medium">Remaining</span>
                    <span className="font-bold text-emerald-700 text-lg">₹{remainingAmount}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span className="font-medium">Disbursement Progress</span>
                  <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 h-3 rounded-full"
                  />
                </div>
              </div>

              {/* Disbursement Form */}
              {!isFullyDisbursed && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Disburse Funds</h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Disbursement Amount (₹)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder={`Max: ₹${remainingAmount}`}
                        value={disburseAmount}
                        onChange={(e) => setDisburseAmount(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full pl-12 pr-4 py-3 border-2 border-green-200 rounded-xl text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Maximum: ₹{remainingAmount}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900">Bill/Invoice Hash</label>
                    <input
                      type="text"
                      placeholder="ipfs://Qm... or any storage reference"
                      value={billHash}
                      onChange={(e) => setBillHash(e.target.value)}
                      className="w-full p-3 border-2 border-green-200 rounded-xl text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">Permanent reference to the verified bill</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onDisburse(loanId)}
                    disabled={loading === `disburse-${loanId}` || !disburseAmount || !billHash || Number(disburseAmount) > remainingAmount}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:from-gray-400 disabled:to-gray-500 flex items-center justify-center gap-2"
                  >
                    {loading === `disburse-${loanId}` ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Disburse Funds
                      </>
                    )}
                  </motion.button>

                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-800">
                        <strong>Important:</strong> Verify the bill authenticity before disbursing funds. This action is recorded on the blockchain and cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Fully Disbursed */}
              {isFullyDisbursed && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-50 p-6 rounded-xl border-2 border-green-200 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-green-800 font-bold text-lg">Loan Fully Disbursed</p>
                  <p className="text-green-600 text-sm mt-1">All funds have been released to the farmer</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
