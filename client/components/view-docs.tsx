// import { CONTRACTS } from '@/lib/contracts'
// import { useContract, useContractRead, useContractWrite } from '@thirdweb-dev/react'
// import { useState } from 'react'

// // ✅ Component to view and verify farmer documents
// function FarmerDocumentsViewer() {
//   const { contract } = useContract(CONTRACTS.KCCLoanManager)
//   const [selectedFarmer, setSelectedFarmer] = useState<string>('')
//   const [verifying, setVerifying] = useState(false)

//   // ✅ UPDATED: Fetch farmers list directly from contract
//   const { data: farmersData, isLoading: farmersLoading } = useContractRead(contract, 'getAllFarmersWithDocuments')

//   // Convert to typed array
//   const farmersList = (farmersData as string[]) || []

//   console.log('Farmers from contract:', farmersList)

//   // ✅ Fetch document data for selected farmer
//   const { data: documents, refetch: refetchDocs } = useContractRead(contract, 'getFarmerDocuments', [selectedFarmer])

//   const { mutateAsync: verifyAndIssue } = useContractWrite(contract, 'verifyDocumentsAndIssueCredential')

//   const handleVerifyAndIssue = async () => {
//     if (!selectedFarmer) return

//     setVerifying(true)
//     try {
//       await verifyAndIssue({ args: [selectedFarmer] })
//       alert('Documents verified and credential issued successfully!')
//       refetchDocs()
//     } catch (error) {
//       console.error(error)
//       const errorMessage = error instanceof Error ? error.message : 'Failed to verify'
//       alert(`Error: ${errorMessage}`)
//     } finally {
//       setVerifying(false)
//     }
//   }

//   const getIPFSUrl = (hash: string) => `https://ipfs.io/ipfs/${hash}`

//   const typedDocuments = documents as FarmerDocuments | undefined

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-xl font-bold mb-4 text-black">Farmer Documents Verification</h2>
//       <p className="text-sm text-gray-600 mb-4">View and verify documents uploaded by farmers</p>

//       {farmersLoading ? (
//         <div className="bg-gray-50 rounded-lg p-4">
//           <p className="text-gray-600">Loading farmers...</p>
//         </div>
//       ) : farmersList.length === 0 ? (
//         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//           <p className="text-yellow-800 text-sm">📋 No farmers have uploaded documents yet</p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {/* Farmer Selection Dropdown */}
//           <div>
//             <label className="block text-sm font-medium mb-2 text-black">Select Farmer ({farmersList.length} total)</label>
//             <select value={selectedFarmer} onChange={(e) => setSelectedFarmer(e.target.value)} className="w-full p-3 border rounded-lg text-black bg-white">
//               <option value="">-- Choose a farmer --</option>
//               {farmersList.map((farmer) => (
//                 <option key={farmer} value={farmer}>
//                   {farmer}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Document Details */}
//           {selectedFarmer && typedDocuments && (
//             <div className="border rounded-lg p-4 bg-gray-50">
//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <p className="text-sm text-gray-600">Farmer Address</p>
//                   <p className="font-mono text-xs text-black break-all">{selectedFarmer}</p>
//                 </div>
//                 <span className={`text-xs font-semibold px-3 py-1 rounded ${typedDocuments.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
//                   {typedDocuments.isVerified ? '✅ Verified' : '⏳ Pending'}
//                 </span>
//               </div>

//               {typedDocuments.aadhaarHash && typedDocuments.aadhaarHash.length > 0 ? (
//                 <>
//                   <div className="space-y-3 mb-4">
//                     {/* Aadhaar Document */}
//                     <div className="p-3 bg-white rounded border">
//                       <p className="text-sm font-medium text-black mb-2">📄 Aadhaar Document</p>
//                       <p className="text-xs font-mono text-gray-600 break-all mb-2">{typedDocuments.aadhaarHash}</p>
//                       <a
//                         href={getIPFSUrl(typedDocuments.aadhaarHash)}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
//                       >
//                         View Document →
//                       </a>
//                     </div>

//                     {/* Land Document */}
//                     <div className="p-3 bg-white rounded border">
//                       <p className="text-sm font-medium text-black mb-2">📄 Land Ownership Document</p>
//                       <p className="text-xs font-mono text-gray-600 break-all mb-2">{typedDocuments.landDocHash}</p>
//                       <a
//                         href={getIPFSUrl(typedDocuments.landDocHash)}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
//                       >
//                         View Document →
//                       </a>
//                     </div>

//                     {/* Income Proof */}
//                     <div className="p-3 bg-white rounded border">
//                       <p className="text-sm font-medium text-black mb-2">📄 Income Certificate</p>
//                       <p className="text-xs font-mono text-gray-600 break-all mb-2">{typedDocuments.incomeProofHash}</p>
//                       <a
//                         href={getIPFSUrl(typedDocuments.incomeProofHash)}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
//                       >
//                         View Document →
//                       </a>
//                     </div>
//                   </div>

//                   <div className="text-xs text-gray-600 mb-4 bg-white p-2 rounded">
//                     <p>📅 Uploaded: {new Date(Number(typedDocuments.uploadedAt) * 1000).toLocaleString()}</p>
//                   </div>

//                   {/* Verify and Issue Button */}
//                   {!typedDocuments.isVerified && (
//                     <button onClick={handleVerifyAndIssue} disabled={verifying} className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold">
//                       {verifying ? 'Processing...' : '✅ Verify Documents & Issue Credential'}
//                     </button>
//                   )}

//                   {typedDocuments.isVerified && (
//                     <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
//                       <p className="text-green-800 font-medium">✅ Documents verified and credential issued</p>
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <div className="bg-gray-100 rounded-lg p-4">
//                   <p className="text-gray-600 text-sm text-center">No documents uploaded by this farmer</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }
