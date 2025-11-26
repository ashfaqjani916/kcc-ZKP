'use client'

import { useContract, useAddress } from '@thirdweb-dev/react'
import { CONTRACTS } from '@/lib/contracts'
import { useEffect, useState } from 'react'

type Credential = {
  isIssued?: boolean
  isRevoked?: boolean
  issuedAt?: number | string
}

export default function CheckCredential() {
  const address = useAddress()
  const { contract } = useContract(CONTRACTS.KCCLoanManager)

  const [credential, setCredential] = useState<Credential | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!contract || !address) {
      setCredential(null)
      setIsLoading(false)
      return
    }

    let cancelled = false
    const fetchCredential = async () => {
      setIsLoading(true)
      const start = new Date()
      try {
        const data: Credential = await contract.call('farmerCredentials', [address])
        if (cancelled) return

        const end = new Date()
        setCredential(data)
        setIsLoading(false)

        // Calculate and log elapsed time
        const elapsed = (end.getTime() - start.getTime()) / 1000
        console.log(`[Timing] farmerCredentials took ${elapsed.toFixed(3)} seconds`)
      } catch (error) {
        console.error('Failed to fetch credential:', error)
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchCredential()

    return () => {
      cancelled = true
    }
  }, [contract, address])

  if (!address) {
    return (
      <div className="p-4 bg-gray-50 border rounded-lg">
        <p className="text-gray-600">Connect wallet to check credential status</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 border rounded-lg">
        <p className="text-gray-600">Loading credential status...</p>
      </div>
    )
  }

  return (
    <div className={`p-4 border rounded-lg ${credential?.isIssued ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <h3 className="font-bold mb-2 text-black">Credential Status</h3>
      <div className="space-y-1 text-sm">
        <p className="text-black">
          <strong>Issued:</strong> {credential?.isIssued ? 'Yes' : 'No'}
        </p>
        {credential?.isIssued && (
          <>
            <p className="text-black">
              <strong>Revoked:</strong> {credential?.isRevoked ? 'Yes' : 'No'}
            </p>
            <p className="text-xs text-gray-600">Issued at: {credential?.issuedAt ? new Date(Number(credential.issuedAt) * 1000).toLocaleString() : ''}</p>
          </>
        )}
      </div>
      {!credential?.isIssued && <p className="text-red-600 text-sm mt-2">You need a credential to apply for loans. Contact KCC authority.</p>}
    </div>
  )
}
