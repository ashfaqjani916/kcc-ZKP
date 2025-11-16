'use client'

import { useState } from 'react'
import WalletConnect from '@/components/WalletConnect'
import { useContract, useContractWrite, useContractRead, useAddress } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'
import Link from 'next/link'

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

  // Fetch farmers list directly from contract
  const { data: farmersData, isLoading: farmersLoading } = useContractRead(contract, 'getAllFarmersWithDocuments')

  // Convert to typed array
  const farmersList = (farmersData as string[]) || []

  // Fetch document data for selected farmer
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-black">Farmer Documents Verification</h2>
      <p className="text-sm text-gray-600 mb-4">View and verify documents uploaded by farmers</p>

      {farmersLoading ? (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-600">Loading farmers...</p>
        </div>
      ) : farmersList.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">📋 No farmers have uploaded documents yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Farmer Selection Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2 text-black">Select Farmer ({farmersList.length} total)</label>
            <select value={selectedFarmer} onChange={(e) => setSelectedFarmer(e.target.value)} className="w-full p-3 border rounded-lg text-black bg-white">
              <option value="">-- Choose a farmer --</option>
              {farmersList.map((farmer) => (
                <option key={farmer} value={farmer}>
                  {farmer}
                </option>
              ))}
            </select>
          </div>

          {/* Document Details */}
          {selectedFarmer && typedDocuments && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-600">Farmer Address</p>
                  <p className="font-mono text-xs text-black break-all">{selectedFarmer}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded ${typedDocuments.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {typedDocuments.isVerified ? '✅ Verified' : '⏳ Pending'}
                </span>
              </div>

              {typedDocuments.aadhaarHash && typedDocuments.aadhaarHash.length > 0 ? (
                <>
                  <div className="space-y-3 mb-4">
                    {/* Aadhaar Document */}
                    <div className="p-3 bg-white rounded border">
                      <p className="text-sm font-medium text-black mb-2">📄 Aadhaar Document</p>
                      <p className="text-xs font-mono text-gray-600 break-all mb-2">{typedDocuments.aadhaarHash}</p>
                      <a
                        href={getIPFSUrl(typedDocuments.aadhaarHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                      >
                        View Document →
                      </a>
                    </div>

                    {/* Land Document */}
                    <div className="p-3 bg-white rounded border">
                      <p className="text-sm font-medium text-black mb-2">📄 Land Ownership Document</p>
                      <p className="text-xs font-mono text-gray-600 break-all mb-2">{typedDocuments.landDocHash}</p>
                      <a
                        href={getIPFSUrl(typedDocuments.landDocHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                      >
                        View Document →
                      </a>
                    </div>

                    {/* Income Proof */}
                    <div className="p-3 bg-white rounded border">
                      <p className="text-sm font-medium text-black mb-2">📄 Income Certificate</p>
                      <p className="text-xs font-mono text-gray-600 break-all mb-2">{typedDocuments.incomeProofHash}</p>
                      <a
                        href={getIPFSUrl(typedDocuments.incomeProofHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                      >
                        View Document →
                      </a>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 mb-4 bg-white p-2 rounded">
                    <p>📅 Uploaded: {new Date(Number(typedDocuments.uploadedAt) * 1000).toLocaleString()}</p>
                  </div>

                  {/* Verify and Issue Button */}
                  {!typedDocuments.isVerified && (
                    <button onClick={handleVerifyAndIssue} disabled={verifying} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold">
                      {verifying ? 'Processing...' : '✅ Verify Documents & Issue Credential'}
                    </button>
                  )}

                  {typedDocuments.isVerified && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <p className="text-green-800 font-medium">✅ Documents verified and credential issued</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-gray-600 text-sm text-center">No documents uploaded by this farmer</p>
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

  // Contract write functions
  // const { mutateAsync: issueCredential } = useContractWrite(contract, 'issueCredential')
  // const { mutateAsync: revokeCredential } = useContractWrite(contract, 'revokeCredential')
  const { mutateAsync: setBankOfficer } = useContractWrite(contract, 'setBankOfficer')
  const { mutateAsync: setAuditor } = useContractWrite(contract, 'setAuditor')

  // Read current roles
  const { data: currentIssuer } = useContractRead(contract, 'issuer')
  const { data: currentBankOfficer } = useContractRead(contract, 'bankOfficer')
  const { data: currentAuditor } = useContractRead(contract, 'auditor')

  // State for forms
  // const [farmerAddress, setFarmerAddress] = useState('')
  const [checkAddress, setCheckAddress] = useState('')
  const [bankOfficerAddress, setBankOfficerAddress] = useState('')
  const [auditorAddress, setAuditorAddress] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  // Read credential status for checking
  const { data: credentialData, refetch: refetchCredential } = useContractRead(contract, 'farmerCredentials', [checkAddress])

  const typedCredentialData = credentialData as CredentialData | undefined

  // const handleIssueCredential = async () => {
  //   if (!farmerAddress) {
  //     alert('Please enter farmer address')
  //     return
  //   }

  //   setLoading('issue')
  //   try {
  //     await issueCredential({ args: [farmerAddress] })
  //     alert('Credential issued successfully!')
  //     setFarmerAddress('')
  //   } catch (error) {
  //     console.error(error)
  //     const errorMessage = error instanceof Error ? error.message : 'Failed to issue credential'
  //     alert(`Error: ${errorMessage}`)
  //   } finally {
  //     setLoading(null)
  //   }
  // }

  // const handleRevokeCredential = async () => {
  //   if (!farmerAddress) {
  //     alert('Please enter farmer address')
  //     return
  //   }

  //   setLoading('revoke')
  //   try {
  //     await revokeCredential({ args: [farmerAddress] })
  //     alert('Credential revoked successfully!')
  //     setFarmerAddress('')
  //   } catch (error) {
  //     console.error(error)
  //     const errorMessage = error instanceof Error ? error.message : 'Failed to revoke credential'
  //     alert(`Error: ${errorMessage}`)
  //   } finally {
  //     setLoading(null)
  //   }
  // }

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

  // Check if connected wallet is the issuer
  const isIssuer = address && currentIssuer && address.toLowerCase() === (currentIssuer as string).toLowerCase()

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-black">Issuer Dashboard</h2>
          <p className="text-gray-600 mb-4">Please connect your wallet to continue</p>
          <WalletConnect />
        </div>
      </div>
    )
  }

  if (!isIssuer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 p-8 rounded-lg shadow-md max-w-md border border-red-200">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2 text-red-800">Access Denied</h2>
          <p className="text-gray-700 mb-4">You are not authorized as an issuer. Only the issuer wallet can access this dashboard.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              ← Back
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Issuer Dashboard</h1>
              <p className="text-sm text-gray-600">Manage credentials and system roles</p>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Current Roles Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Current System Roles</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Issuer</p>
              <p className="text-xs font-mono break-all text-black">{(currentIssuer as string) || 'Not set'}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Bank Officer</p>
              <p className="text-xs font-mono break-all text-black">{(currentBankOfficer as string) || 'Not set'}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Auditor</p>
              <p className="text-xs font-mono break-all text-black">{(currentAuditor as string) || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* Farmer Documents Verification Section */}
        <FarmerDocumentsViewer />

        {/* Credential Management */}
        {/* <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Manual Credential Management</h2>
          <p className="text-sm text-gray-600 mb-4">Issue or revoke farmer credentials manually (without document verification)</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">Farmer Wallet Address</label>
              <input type="text" placeholder="0x..." value={farmerAddress} onChange={(e) => setFarmerAddress(e.target.value)} className="w-full p-3 border rounded-lg text-black" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button onClick={handleIssueCredential} disabled={loading === 'issue'} className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold">
                {loading === 'issue' ? 'Processing...' : 'Issue Credential'}
              </button>

              <button onClick={handleRevokeCredential} disabled={loading === 'revoke'} className="bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold">
                {loading === 'revoke' ? 'Processing...' : 'Revoke Credential'}
              </button>
            </div>
          </div>
        </div> */}

        {/* Check Credential Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Check Credential Status</h2>
          <p className="text-sm text-gray-600 mb-4">Verify if a farmer has an active credential</p>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter farmer address to check"
                value={checkAddress}
                onChange={(e) => setCheckAddress(e.target.value)}
                className="flex-1 p-3 border rounded-lg text-black"
              />
              <button onClick={handleCheckCredential} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
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
        </div>

        {/* Set Bank Officer */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Set Bank Officer</h2>
          <p className="text-sm text-gray-600 mb-4">Assign a wallet address as the bank officer who can review and sanction loans</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">Bank Officer Address</label>
              <input type="text" placeholder="0x..." value={bankOfficerAddress} onChange={(e) => setBankOfficerAddress(e.target.value)} className="w-full p-3 border rounded-lg text-black" />
            </div>

            <button onClick={handleSetBankOfficer} disabled={loading === 'bank'} className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-semibold">
              {loading === 'bank' ? 'Processing...' : 'Set Bank Officer'}
            </button>
          </div>
        </div>

        {/* Set Auditor */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Set Auditor</h2>
          <p className="text-sm text-gray-600 mb-4">Assign a wallet address as the auditor who can disburse funds based on bills</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">Auditor Address</label>
              <input type="text" placeholder="0x..." value={auditorAddress} onChange={(e) => setAuditorAddress(e.target.value)} className="w-full p-3 border rounded-lg text-black" />
            </div>

            <button onClick={handleSetAuditor} disabled={loading === 'auditor'} className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 font-semibold">
              {loading === 'auditor' ? 'Processing...' : 'Set Auditor'}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">Issuer Responsibilities</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>View and verify farmer documents uploaded to IPFS</li>
            <li>Verify farmer documents before issuing credentials</li>
            <li>Issue credentials only to eligible farmers</li>
            <li>Revoke credentials if farmer violates terms</li>
            <li>Set bank officer and auditor addresses for system operation</li>
            <li>Only the issuer wallet can perform these actions</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
