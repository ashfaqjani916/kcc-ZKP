'use client'

import { useState } from 'react'
import { useContract, useContractRead, useContractWrite, useAddress, useStorageUpload } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'

const STATUS_MAP = ['IN_PROGRESS', 'UNDER_REVIEW', 'SANCTIONED', 'REJECTED']

type BigNumberish = {
  toNumber?: () => number
  toString?: () => string
  _hex?: string
  _isBigNumber?: boolean
}

interface BillDocument {
  billHash: string
  amount: BigNumberish
  uploadedAt: BigNumberish
  isApproved: boolean
  disbursedAmount: BigNumberish
}

export default function MyLoans() {
  const address = useAddress()
  const { contract } = useContract(CONTRACTS.KCCLoanManager)

  const { data: loanIds, isLoading } = useContractRead(contract, 'getFarmerLoans', [address])

  if (!address) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">My Loans</h2>
        <p className="text-gray-600">Connect your wallet to view loans</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">My Loans</h2>
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!loanIds || loanIds.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-black">My Loans</h2>
        <p className="text-gray-600">No loans found</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-black">My Loans ({loanIds.length})</h2>
      <div className="space-y-4">
        {(loanIds as BigNumberish[]).map((loanId: BigNumberish, index: number) => {
          const id = typeof loanId === 'object' && loanId.toNumber ? loanId.toNumber() : Number(loanId)
          return <LoanCard key={index} loanId={id} />
        })}
      </div>
    </div>
  )
}

function LoanCard({ loanId }: { loanId: number }) {
  const { contract } = useContract(CONTRACTS.KCCLoanManager)
  const { mutateAsync: uploadBill } = useContractWrite(contract, 'uploadBill')
  const { mutateAsync: uploadToIPFS } = useStorageUpload()

  const { data: loan, isLoading } = useContractRead(contract, 'loanApplications', [loanId])
  const { data: bills, refetch: refetchBills } = useContractRead(contract, 'getLoanBills', [loanId])

  const [showUpload, setShowUpload] = useState(false)
  const [billFile, setBillFile] = useState<File | null>(null)
  const [billAmount, setBillAmount] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBillFile(e.target.files[0])
    }
  }

  const handleUploadBill = async () => {
    if (!billFile || !billAmount) {
      alert('Please select a file and enter amount')
      return
    }

    setUploading(true)
    try {
      // Upload to IPFS
      console.log('Uploading to IPFS...')
      const uploadResult = await uploadToIPFS({ data: [billFile] })
      const ipfsHash = uploadResult[0].replace('ipfs://', '')
      console.log('IPFS Hash:', ipfsHash)

      // Upload to blockchain
      console.log('Uploading to blockchain...')
      await uploadBill({
        args: [loanId, ipfsHash, billAmount],
      })

      alert('Bill uploaded successfully!')
      setBillFile(null)
      setBillAmount('')
      setShowUpload(false)
      refetchBills()
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload bill'
      alert(`Error: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="border rounded p-4 mb-4 bg-gray-50">
        <p className="text-black">Loading loan #{loanId}...</p>
      </div>
    )
  }

  if (!loan) return null

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
  const disbursedTokens = toBigNumberString(loan.disbursedTokens as BigNumberish)
  const status = loan.status !== undefined ? STATUS_MAP[loan.status] : 'UNKNOWN'

  const isSanctioned = status === 'SANCTIONED'
  const typedBills = (bills as BillDocument[]) || []

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="text-lg font-bold text-black">Loan #{loanId}</p>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            status === 'SANCTIONED'
              ? 'bg-green-100 text-green-800'
              : status === 'REJECTED'
              ? 'bg-red-100 text-red-800'
              : status === 'UNDER_REVIEW'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {status}
        </span>
      </div>

      <div className="space-y-1 text-sm mb-4">
        <p className="text-black">
          <strong>Category:</strong> {loan.loanCategory}
        </p>
        <p className="text-black">
          <strong>Requested Amount:</strong> ₹{requestedAmount}
        </p>
        <p className="text-black">
          <strong>Sanctioned Amount:</strong> ₹{sanctionedAmount}
        </p>
        <p className="text-black">
          <strong>Disbursed Amount:</strong> ₹{disbursedAmount}
        </p>
        <p className="text-black">
          <strong>Disbursed Tokens:</strong> ₹{disbursedTokens}
        </p>

        <p className="text-black">
          <strong>Remaining:</strong> ₹{Number(sanctionedAmount) - Number(disbursedAmount)}
        </p>
      </div>

      {/* Bills Section */}
      {typedBills.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold text-black mb-2">Uploaded Bills ({typedBills.length})</h3>
          <div className="space-y-2">
            {typedBills.map((bill, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded border text-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-black">
                      <strong>Bill #{index + 1}</strong>
                    </p>
                    <p className="text-gray-600 text-xs font-mono break-all mt-1">{bill.billHash}</p>
                    <p className="text-black mt-1">Amount: ₹{toBigNumberString(bill.amount)}</p>
                    <p className="text-black">Disbursed: ₹{toBigNumberString(bill.disbursedAmount)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ml-2 ${bill.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {bill.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <a href={`https://ipfs.io/ipfs/${bill.billHash}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-blue-600 hover:underline text-xs">
                  View Bill →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Bill Section */}
      {isSanctioned && (
        <>
          {!showUpload ? (
            <button onClick={() => setShowUpload(true)} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm">
              📄 Upload Bill
            </button>
          ) : (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-black mb-3">Upload New Bill</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Bill Document</label>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="w-full p-2 border rounded text-sm text-black" />
                  {billFile && <p className="text-xs text-gray-600 mt-1">Selected: {billFile.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Requested Amount (₹)</label>
                  <input type="number" value={billAmount} onChange={(e) => setBillAmount(e.target.value)} placeholder="Enter amount" className="w-full p-2 border rounded text-sm text-black" />
                </div>

                <div className="flex gap-2">
                  <button onClick={handleUploadBill} disabled={uploading} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold text-sm">
                    {uploading ? 'Uploading...' : 'Submit Bill'}
                  </button>
                  <button
                    onClick={() => {
                      setShowUpload(false)
                      setBillFile(null)
                      setBillAmount('')
                    }}
                    disabled={uploading}
                    className="px-4 bg-gray-300 text-black py-2 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 font-semibold text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {status === 'IN_PROGRESS' && <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">⏳ Loan is being processed by the bank</div>}

      {status === 'UNDER_REVIEW' && <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">🔍 Loan is under review by the bank officer</div>}

      {status === 'REJECTED' && <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">❌ Loan application was rejected</div>}
    </div>
  )
}
