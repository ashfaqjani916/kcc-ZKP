'use client'

import { useContract, useContractRead } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'
import { getIPFSUrl } from '@/lib/ipfs'

export default function ViewDocuments({ farmerAddress }: { farmerAddress: string }) {
  const { contract } = useContract(CONTRACTS.KCCLoanManager)
  const { data: docs, isLoading } = useContractRead(contract, 'getFarmerDocuments', [farmerAddress])

  if (isLoading) return <p>Loading documents...</p>

  if (!docs || !docs.aadhaarHash) {
    return <p className="text-gray-600">No documents uploaded</p>
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-black">
        <strong>Status:</strong> {docs.isVerified ? '✅ Verified' : '⏳ Pending Verification'}
      </p>
      <div className="space-y-1">
        <a href={getIPFSUrl(docs.aadhaarHash)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm block">
          📄 View Aadhaar Document
        </a>
        <a href={getIPFSUrl(docs.landDocHash)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm block">
          📄 View Land Document
        </a>
        <a href={getIPFSUrl(docs.incomeProofHash)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm block">
          📄 View Income Proof
        </a>
      </div>
      <p className="text-xs text-gray-500">Uploaded: {new Date(docs.uploadedAt * 1000).toLocaleString()}</p>
    </div>
  )
}
