'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import WalletConnect from '@/components/WalletConnect'
import { useContract, useContractWrite, useContractRead, useAddress } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'
import Link from 'next/link'
import {
  ArrowLeft,
  Shield,
  FileCheck,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  UserCheck,
  Eye,
  ExternalLink,
  Loader2,
  Clock,
  Info,
  Settings,
  FileText,
  Search,
  Award,
} from 'lucide-react'

// Type definitions
interface FarmerDocuments {
  aadhaarHash: string
  landDocHash: string
  incomeProofHash: string
  uploadedAt: bigint
  isVerified: boolean
}

interface CredentialData {
  isIssued: boolean
  isRevoked: boolean
  issuedAt: bigint
  issuer: string
}

// Component to view and verify farmer documents
function FarmerDocumentsViewer() {
  const { contract } = useContract(CONTRACTS.KCCLoanManager)
  const [selectedFarmer, setSelectedFarmer] = useState<string>('')
  const [verifying, setVerifying] = useState(false)

  const { data: farmersData, isLoading: farmersLoading } = useContractRead(contract, 'getAllFarmersWithDocuments')
  const farmersList = (farmersData as string[]) || []

  const { data: documents, refetch: refetchDocs } = useContractRead(contract, 'getFarmerDocuments', [selectedFarmer])
  const { mutateAsync: verifyAndIssue } = useContractWrite(contract, 'verifyDocumentsAndIssueCredential')

  const handleVerifyAndIssue = async () => {
    if (!selectedFarmer) return

    setVerifying(true)
    try {
      await verifyAndIssue({ args: [selectedFarmer] })
      alert('Documents verified and credential issued successfully!')
      refetchDocs()
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify'
      alert(`Error: ${errorMessage}`)
    } finally {
      setVerifying(false)
    }
  }

  const getIPFSUrl = (hash: string) => `https://ipfs.io/ipfs/${hash}`
  const typedDocuments = documents as FarmerDocuments | undefined

  const documentTypes = [
    { key: 'aadhaarHash', label: 'Aadhaar Document', icon: FileText, color: 'from-blue-500 to-cyan-600' },
    { key: 'landDocHash', label: 'Land Ownership', icon: FileCheck, color: 'from-green-500 to-emerald-600' },
    { key: 'incomeProofHash', label: 'Income Certificate', icon: Award, color: 'from-purple-500 to-pink-600' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
    >
      <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-sm">
            <FileCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Document Verification</h3>
            <p className="text-xs text-gray-600">Review and verify uploaded farmer documents</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {farmersLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-3 text-gray-600">Loading farmers...</span>
          </motion.div>
        ) : farmersList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-amber-50 border-2 border-amber-200 rounded-xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <p className="text-amber-800 font-medium">No farmers have uploaded documents yet</p>
            <p className="text-sm text-amber-600 mt-2">Check back once farmers submit their verification documents</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Farmer Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Select Farmer ({farmersList.length} pending)
              </label>
              <div className="relative">
                <select
                  value={selectedFarmer}
                  onChange={(e) => setSelectedFarmer(e.target.value)}
                  className="w-full p-4 pl-12 border-2 border-purple-200 rounded-xl text-gray-900 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- Choose a farmer to verify --</option>
                  {farmersList.map((farmer) => (
                    <option key={farmer} value={farmer}>
                      {farmer}
                    </option>
                  ))}
                </select>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
              </div>
            </div>

            {/* Document Details */}
            <AnimatePresence mode="wait">
              {selectedFarmer && typedDocuments && (
                <motion.div
                  key={selectedFarmer}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Farmer Info Header */}
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 mb-1">Farmer Address</p>
                        <p className="font-mono text-sm text-gray-900 break-all">{selectedFarmer}</p>
                      </div>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-2 ${typedDocuments.isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                          }`}
                      >
                        {typedDocuments.isVerified ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Verified
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4" />
                            Pending
                          </>
                        )}
                      </motion.span>
                    </div>
                  </div>

                  {/* Documents Grid */}
                  {typedDocuments.aadhaarHash && typedDocuments.aadhaarHash.length > 0 ? (
                    <>
                      <div className="grid gap-4">
                        {documentTypes.map((docType, index) => {
                          const Icon = docType.icon
                          const hash = typedDocuments[docType.key as keyof FarmerDocuments] as string

                          return (
                            <motion.div
                              key={docType.key}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-purple-300 transition-all shadow-sm hover:shadow-md"
                            >
                              <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 bg-gradient-to-br ${docType.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                                  <Icon className="w-6 h-6 text-white" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-gray-900 mb-2">{docType.label}</p>
                                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                    <p className="text-xs font-mono text-gray-600 break-all">{hash}</p>
                                  </div>
                                  <a
                                    href={getIPFSUrl(hash)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View Document
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>

                      {/* Upload Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>
                          Uploaded on {new Date(Number(typedDocuments.uploadedAt) * 1000).toLocaleString()}
                        </span>
                      </div>

                      {/* Verify Button */}
                      {!typedDocuments.isVerified && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleVerifyAndIssue}
                          disabled={verifying}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:from-gray-400 disabled:to-gray-500 flex items-center justify-center gap-2"
                        >
                          {verifying ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-5 h-5" />
                              Verify Documents & Issue Credential
                            </>
                          )}
                        </motion.button>
                      )}

                      {typedDocuments.isVerified && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center"
                        >
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                          </div>
                          <p className="text-green-800 font-bold text-lg">Documents Verified</p>
                          <p className="text-green-600 text-sm mt-1">Credential has been issued to this farmer</p>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300"
                    >
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No documents uploaded by this farmer</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function IssuerDashboard() {
  const address = useAddress()
  const { contract } = useContract(CONTRACTS.KCCLoanManager)

  const { mutateAsync: setBankOfficer } = useContractWrite(contract, 'setBankOfficer')
  const { mutateAsync: setAuditor } = useContractWrite(contract, 'setAuditor')

  const { data: currentIssuer } = useContractRead(contract, 'issuer')
  const { data: currentBankOfficer } = useContractRead(contract, 'bankOfficer')
  const { data: currentAuditor } = useContractRead(contract, 'auditor')

  const [checkAddress, setCheckAddress] = useState('')
  const [bankOfficerAddress, setBankOfficerAddress] = useState('')
  const [auditorAddress, setAuditorAddress] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const { data: credentialData, refetch: refetchCredential } = useContractRead(contract, 'farmerCredentials', [checkAddress])
  const typedCredentialData = credentialData as CredentialData | undefined

  const handleSetBankOfficer = async () => {
    if (!bankOfficerAddress) {
      alert('Please enter bank officer address')
      return
    }

    setLoading('bank')
    try {
      await setBankOfficer({ args: [bankOfficerAddress] })
      alert('Bank officer set successfully!')
      setBankOfficerAddress('')
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to set bank officer'
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(null)
    }
  }

  const handleSetAuditor = async () => {
    if (!auditorAddress) {
      alert('Please enter auditor address')
      return
    }

    setLoading('auditor')
    try {
      await setAuditor({ args: [auditorAddress] })
      alert('Auditor set successfully!')
      setAuditorAddress('')
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to set auditor'
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(null)
    }
  }

  const handleCheckCredential = () => {
    if (!checkAddress) {
      alert('Please enter address to check')
      return
    }
    refetchCredential()
  }

  const isIssuer = address && currentIssuer && address.toLowerCase() === (currentIssuer as string).toLowerCase()

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-purple-100"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-purple-600/30"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 text-center">Issuer Dashboard</h2>
          <p className="text-gray-600 mb-6 text-center text-sm">Connect your wallet to manage credentials</p>
          <WalletConnect />
        </motion.div>
      </div>
    )
  }

  if (!isIssuer) {
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
          <p className="text-gray-700 mb-4 text-center">You are not authorized as an issuer</p>
          <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-200">
            <p className="text-xs text-gray-600 mb-2 text-center">Current Issuer:</p>
            <p className="font-mono text-xs text-gray-900 break-all text-center">{(currentIssuer as string) || 'Not set'}</p>
          </div>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </motion.button>
          </Link>
        </motion.div>
      </div>
    )
  }

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

  const roles = [
    { label: 'Issuer', value: currentIssuer, icon: Shield, gradient: 'from-purple-500 to-pink-600', bgColor: 'bg-purple-50' },
    { label: 'Bank Officer', value: currentBankOfficer, icon: Building2, gradient: 'from-blue-500 to-cyan-600', bgColor: 'bg-blue-50' },
    { label: 'Auditor', value: currentAuditor, icon: UserCheck, gradient: 'from-orange-500 to-amber-600', bgColor: 'bg-orange-50' },
  ]

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
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all border border-purple-200 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Back</span>
                </motion.button>
              </Link>

              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/30"
                >
                  <Shield className="w-6 h-6 text-white" />
                </motion.div>

                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-800 bg-clip-text text-transparent">
                    Issuer Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                    <Settings className="w-3 h-3" />
                    Manage credentials and system roles
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
          {/* Current Roles */}
          <motion.div variants={itemVariants} className="grid sm:grid-cols-3 gap-4">
            {roles.map((role, index) => {
              const Icon = role.icon
              return (
                <motion.div
                  key={role.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className={`${role.bgColor} rounded-2xl p-6 shadow-lg border border-gray-200`}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${role.gradient} rounded-xl flex items-center justify-center shadow-lg mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium mb-2">{role.label}</p>
                  <p className="text-xs font-mono text-gray-900 break-all">{(role.value as string) || 'Not set'}</p>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Document Verification */}
          <FarmerDocumentsViewer />

          {/* Check Credential */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Check Credential Status</h3>
                  <p className="text-xs text-gray-600">Verify farmer credential status</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter farmer address..."
                  value={checkAddress}
                  onChange={(e) => setCheckAddress(e.target.value)}
                  className="flex-1 p-4 border-2 border-blue-200 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCheckCredential}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Check
                </motion.button>
              </div>

              <AnimatePresence>
                {typedCredentialData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-6 rounded-xl border-2 ${typedCredentialData.isIssued && !typedCredentialData.isRevoked
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${typedCredentialData.isIssued && !typedCredentialData.isRevoked ? 'bg-green-100' : 'bg-red-100'
                          }`}
                      >
                        {typedCredentialData.isIssued && !typedCredentialData.isRevoked ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="font-bold text-gray-900">
                          Status: {typedCredentialData.isIssued ? (typedCredentialData.isRevoked ? 'Revoked' : 'Active') : 'Not Issued'}
                        </p>
                        {typedCredentialData.isIssued && (
                          <>
                            <p className="text-sm text-gray-700">
                              <strong>Issued:</strong> {new Date(Number(typedCredentialData.issuedAt) * 1000).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600 font-mono break-all">
                              <strong>By:</strong> {typedCredentialData.issuer}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Set Bank Officer */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Set Bank Officer</h3>
                  <p className="text-xs text-gray-600">Assign wallet for loan review and sanction</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="0x..."
                value={bankOfficerAddress}
                onChange={(e) => setBankOfficerAddress(e.target.value)}
                className="w-full p-4 border-2 border-indigo-200 rounded-xl text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSetBankOfficer}
                disabled={loading === 'bank'}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:from-gray-400 disabled:to-gray-500 flex items-center justify-center gap-2"
              >
                {loading === 'bank' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Building2 className="w-5 h-5" />
                    Set Bank Officer
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Set Auditor */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="bg-orange-50 px-6 py-4 border-b border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-sm">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Set Auditor</h3>
                  <p className="text-xs text-gray-600">Assign wallet for fund disbursement</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="0x..."
                value={auditorAddress}
                onChange={(e) => setAuditorAddress(e.target.value)}
                className="w-full p-4 border-2 border-orange-200 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSetAuditor}
                disabled={loading === 'auditor'}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:from-gray-400 disabled:to-gray-500 flex items-center justify-center gap-2"
              >
                {loading === 'auditor' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-5 h-5" />
                    Set Auditor
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Guidelines */}
          <motion.div
            variants={itemVariants}
            className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-bold text-indigo-900 mb-2">Issuer Responsibilities</h4>
                <ul className="text-sm text-indigo-800 space-y-1">
                  <li>• View and verify farmer documents uploaded to IPFS</li>
                  <li>• Issue credentials only to eligible farmers after verification</li>
                  <li>• Set bank officer and auditor addresses for system operation</li>
                  <li>• Monitor credential status and revoke if necessary</li>
                  <li>• Only the issuer wallet can perform these actions</li>
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
            Powered by{' '}
            <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Zero-Knowledge Proof Technology
            </span>
          </p>
        </div>
      </motion.footer>
    </div>
  )
}
