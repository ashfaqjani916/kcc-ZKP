'use client'

import { useState } from 'react'
import WalletConnect from '@/components/WalletConnect'
import { useContract, useContractWrite, useContractRead, useAddress } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'
import Link from 'next/link'

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
      alert('Documents verified and credential issued successfully')
      refetchDocs()
    } catch (error) {
      console.error(error)
      const msg = error instanceof Error ? error.message : 'Verification failed'
      alert(msg)
    } finally {
      setVerifying(false)
    }
  }

  const getIPFSUrl = (hash: string) => `https://ipfs.io/ipfs/${hash}`
  const typedDocuments = documents as FarmerDocuments | undefined

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-slate-900">Farmer Documents Verification</h2>
      <p className="text-sm text-slate-600 mb-4">View and verify documents uploaded by farmers</p>

      {farmersLoading ? (
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-slate-600">Loading farmers...</p>
        </div>
      ) : farmersList.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 text-sm">No farmers have uploaded documents yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-900">Select Farmer</label>
            <select value={selectedFarmer} onChange={(e) => setSelectedFarmer(e.target.value)} className="w-full p-3 border rounded-lg text-slate-900 bg-white">
              <option value="">-- Choose a farmer --</option>
              {farmersList.map((farmer) => (
                <option key={farmer} value={farmer}>
                  {farmer}
                </option>
              ))}
            </select>
          </div>

          {selectedFarmer && typedDocuments && (
            <div className="border rounded-lg p-4 bg-green-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-slate-600">Farmer Address</p>
                  <p className="font-mono text-xs text-black break-all">{selectedFarmer}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded ${typedDocuments.isVerified ? 'bg-green-600 text-white' : 'bg-yellow-500 text-white'}`}>
                  {typedDocuments.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>

              {typedDocuments.aadhaarHash ? (
                <>
                  <div className="space-y-4 mb-4">
                    <div className="p-3 bg-white rounded border">
                      <p className="text-sm font-medium text-slate-900 mb-2">Aadhaar Document</p>
                      <p className="text-xs font-mono text-slate-600 break-all mb-2">{typedDocuments.aadhaarHash}</p>
                      <a href={getIPFSUrl(typedDocuments.aadhaarHash)} target="_blank" className="inline-block bg-green-700 text-white px-4 py-2 rounded text-sm hover:bg-green-800">
                        View Document →
                      </a>
                    </div>

                    <div className="p-3 bg-white rounded border">
                      <p className="text-sm font-medium text-slate-900 mb-2">Land Ownership Document</p>
                      <p className="text-xs font-mono text-slate-600 break-all mb-2">{typedDocuments.landDocHash}</p>
                      <a href={getIPFSUrl(typedDocuments.landDocHash)} target="_blank" className="inline-block bg-green-700 text-white px-4 py-2 rounded text-sm hover:bg-green-800">
                        View Document →
                      </a>
                    </div>

                    <div className="p-3 bg-white rounded border">
                      <p className="text-sm font-medium text-slate-900 mb-2">Income Certificate</p>
                      <p className="text-xs font-mono text-slate-600 break-all mb-2">{typedDocuments.incomeProofHash}</p>
                      <a href={getIPFSUrl(typedDocuments.incomeProofHash)} target="_blank" className="inline-block bg-green-700 text-white px-4 py-2 rounded text-sm hover:bg-green-800">
                        View Document →
                      </a>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 mb-4 bg-white p-2 rounded">Uploaded: {new Date(Number(typedDocuments.uploadedAt) * 1000).toLocaleString()}</div>

                  {!typedDocuments.isVerified ? (
                    <button onClick={handleVerifyAndIssue} disabled={verifying} className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 disabled:bg-slate-400 font-semibold">
                      {verifying ? 'Processing...' : 'Verify & Issue Credential'}
                    </button>
                  ) : (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
                      <p className="text-green-800 font-medium">Credential already issued</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-lg p-4 text-center">
                  <p className="text-slate-600 text-sm">No documents uploaded by this farmer</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
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
      alert('Bank officer set successfully')
      setBankOfficerAddress('')
    } catch (error) {
      console.error(error)
      const msg = error instanceof Error ? error.message : 'Failed to set bank officer'
      alert(msg)
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
      alert('Auditor set successfully')
      setAuditorAddress('')
    } catch (error) {
      console.error(error)
      const msg = error instanceof Error ? error.message : 'Failed to set auditor'
      alert(msg)
    } finally {
      setLoading(null)
    }
  }

  const handleCheckCredential = () => {
    if (!checkAddress) {
      alert('Enter address to check')
      return
    }
    refetchCredential()
  }

  const isIssuer = address && currentIssuer && address.toLowerCase() === (currentIssuer as string).toLowerCase()

  if (!address) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Issuer Dashboard</h2>
          <p className="text-slate-600 mb-4">Please connect your wallet to continue</p>
          <WalletConnect />
        </div>
      </div>
    )
  }

  if (!isIssuer) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md border border-red-200 text-center">
          <div className="text-4xl mb-4 text-red-600">⚠️</div>
          <h2 className="text-2xl font-bold mb-2 text-red-700">Access Denied</h2>
          <p className="text-slate-700 mb-4">Only the authorized issuer wallet can access this dashboard.</p>
          <Link href="/" className="text-green-700 hover:underline">
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
              <h1 className="text-2xl font-bold text-slate-900">Issuer Dashboard</h1>
              <p className="text-sm text-slate-600">Manage credentials and system roles</p>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-900">Current System Roles</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-slate-600 mb-1">Issuer</p>
              <p className="text-xs font-mono break-all text-black">{(currentIssuer as string) || 'Not set'}</p>
            </div>

            <div className="p-4 bg-white rounded-lg border shadow-sm">
              <p className="text-sm text-slate-600 mb-1">Bank Officer</p>
              <p className="text-xs font-mono break-all text-black">{(currentBankOfficer as string) || 'Not set'}</p>
            </div>

            <div className="p-4 bg-white rounded-lg border shadow-sm">
              <p className="text-sm text-slate-600 mb-1">Auditor</p>
              <p className="text-xs font-mono break-all text-black">{(currentAuditor as string) || 'Not set'}</p>
            </div>
          </div>
        </div>

        <FarmerDocumentsViewer />

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-900">Check Credential Status</h2>

          <div className="flex gap-2 mb-4">
            <input type="text" placeholder="Enter farmer address" value={checkAddress} onChange={(e) => setCheckAddress(e.target.value)} className="flex-1 p-3 border rounded-lg text-slate-900" />
            <button onClick={handleCheckCredential} className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 font-semibold">
              Check
            </button>
          </div>

          {typedCredentialData && (
            <div className={`p-4 rounded-lg border ${typedCredentialData.isIssued && !typedCredentialData.isRevoked ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="space-y-2 text-sm">
                <p className="text-black">
                  <strong>Status:</strong> {typedCredentialData.isIssued ? (typedCredentialData.isRevoked ? 'Revoked' : 'Active') : 'Not Issued'}
                </p>

                {typedCredentialData.isIssued && (
                  <>
                    <p className="text-black">
                      <strong>Issued At:</strong> {new Date(Number(typedCredentialData.issuedAt) * 1000).toLocaleString()}
                    </p>
                    <p className="text-black">
                      <strong>Issuer:</strong> <span className="font-mono text-xs">{typedCredentialData.issuer}</span>
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-900">Set Bank Officer</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-900">Bank Officer Address</label>
              <input type="text" value={bankOfficerAddress} onChange={(e) => setBankOfficerAddress(e.target.value)} className="w-full p-3 border rounded-lg text-slate-900" />
            </div>

            <button onClick={handleSetBankOfficer} disabled={loading === 'bank'} className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 disabled:bg-gray-400 font-semibold">
              {loading === 'bank' ? 'Processing...' : 'Set Bank Officer'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-900">Set Auditor</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-900">Auditor Address</label>
              <input type="text" value={auditorAddress} onChange={(e) => setAuditorAddress(e.target.value)} className="w-full p-3 border rounded-lg text-slate-900" />
            </div>

            <button onClick={handleSetAuditor} disabled={loading === 'auditor'} className="w-full bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 disabled:bg-gray-400 font-semibold">
              {loading === 'auditor' ? 'Processing...' : 'Set Auditor'}
            </button>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h3 className="font-bold text-green-900 mb-2">Issuer Responsibilities</h3>
          <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
            <li>View and verify farmer documents uploaded to IPFS</li>
            <li>Verify documents before issuing credentials</li>
            <li>Issue credentials only to eligible farmers</li>
            <li>Revoke credentials if farmer violates terms</li>
            <li>Set bank officer and auditor addresses</li>
            <li>Only the issuer wallet can perform these actions</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
