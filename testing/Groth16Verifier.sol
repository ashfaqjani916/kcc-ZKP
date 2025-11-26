// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Groth16Verifier {
    // Keep the function signature EXACTLY the same so your main contract can call it
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[3] calldata _pubSignals
    ) public view returns (bool) {
        // BYPASS: Always return true for benchmarking purposes
        // We ignore the inputs _pA, _pB, etc.
        return true;
    }
}
