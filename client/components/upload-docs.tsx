'use client'

import { useState } from 'react'
import { useContract, useContractWrite, useAddress } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'
import { uploadMultipleToIPFS } from '@/lib/ipfs'

export default function UploadDocuments() {
  const address = useAddress()
  const { contract } = useContract(CONTRACTS.KCCLoanManager)
  const { mutateAsync: uploadDocuments } = useContractWrite(contract, 'uploadDocuments')

  const [files, setFiles] = useState<{
    aadhaar: File | null
    landDoc: File | null
    incomeProof: File | null
  }>({
    aadhaar: null,
    landDoc: null,
    incomeProof: null,
  })

  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docType: keyof typeof files) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Only JPG, PNG, or PDF files allowed')
        return
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size should not exceed 10MB')
        return
      }
      setFiles({ ...files, [docType]: selectedFile })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address) {
      alert('Please connect your wallet')
      return
    }

    if (!files.aadhaar || !files.landDoc || !files.incomeProof) {
      alert('Please upload all required documents')
      return
    }

    setUploading(true)
    setStatus('Uploading documents to IPFS...')

    try {
      const [aadhaarHash, landDocHash, incomeProofHash] = await uploadMultipleToIPFS([files.aadhaar, files.landDoc, files.incomeProof])

      console.log('IPFS Hashes:', { aadhaarHash, landDocHash, incomeProofHash })
      setStatus('Storing hashes on blockchain...')

      const start = new Date()
      await uploadDocuments({
        args: [aadhaarHash, landDocHash, incomeProofHash],
      })
      const end = new Date()
      const elapsed = (end.getTime() - start.getTime()) / 1000
      console.log(`[Timing] uploadDocuments took ${elapsed.toFixed(3)} seconds`)

      setStatus('Documents uploaded successfully!')
      alert('Documents uploaded successfully! Wait for issuer verification.')

      setFiles({ aadhaar: null, landDoc: null, incomeProof: null })
    } catch (error) {
      console.error('Error:', error)
      setStatus('Error uploading documents')
      alert('Error uploading documents')
    } finally {
      setUploading(false)
    }
  }

  if (!address) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Upload Documents</h2>
        <p className="text-slate-600">Connect your wallet to upload documents</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-slate-900">Upload KYC Documents</h2>
      <p className="text-sm text-slate-600 mb-6">Upload your documents to IPFS. These will be verified by the KCC issuer before you can apply for loans.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-slate-900">
            Aadhaar Card <span className="text-red-600">*</span>
          </label>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileChange(e, 'aadhaar')} className="w-full p-2 border rounded text-slate-900" required />
          {files.aadhaar && <p className="text-xs text-green-600 mt-1">✓ {files.aadhaar.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-900">
            Land Ownership Document <span className="text-red-600">*</span>
          </label>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileChange(e, 'landDoc')} className="w-full p-2 border rounded text-slate-900" required />
          {files.landDoc && <p className="text-xs text-green-600 mt-1">✓ {files.landDoc.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-900">
            Income Certificate <span className="text-red-600">*</span>
          </label>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileChange(e, 'incomeProof')} className="w-full p-2 border rounded text-slate-900" required />
          {files.incomeProof && <p className="text-xs text-green-600 mt-1">✓ {files.incomeProof.name}</p>}
        </div>

        <button type="submit" disabled={uploading} className="w-full bg-green-700 text-white p-3 rounded hover:bg-green-800 disabled:bg-slate-400 font-semibold">
          {uploading ? 'Uploading...' : 'Upload Documents to IPFS'}
        </button>

        {status && (
          <div className={`p-3 rounded text-sm ${status.includes('successfully') ? 'bg-green-50 text-green-800' : status.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
            {status}
          </div>
        )}
      </form>

      <div className="mt-4 text-xs text-slate-500 border-t pt-4">
        <p className="font-semibold text-slate-900">Note:</p>
        <ul className="list-disc list-inside ml-2 space-y-1">
          <li>Accepted formats: JPG, PNG, PDF</li>
          <li>Maximum file size: 10MB per document</li>
          <li>Documents are encrypted and stored on IPFS</li>
          <li>Only verified issuers can access your documents</li>
        </ul>
      </div>
    </div>
  )
}
