import json
import os
from solcx import compile_standard, install_solc

# 1. Install Solidity
install_solc('0.8.19')

# 2. Read All Contract Files
# Make sure these files exist in the same folder!
files = {
    "KCCLoanManager.sol": "",
    "Groth16Verifier.sol": "",
    "MockToken.sol": ""
}

for filename in files:
    try:
        with open(filename, 'r') as f:
            files[filename] = f.read()
    except FileNotFoundError:
        print(f"Error: {filename} not found!")
        exit(1)

# 3. Compile
print("Compiling all contracts...")
compiled_sol = compile_standard(
    {
        "language": "Solidity",
        "sources": {name: {"content": content} for name, content in files.items()},
        "settings": {
            "optimizer": {"enabled": True, "runs": 200},
            "outputSelection": {"*": {"*": ["abi", "evm.bytecode"]}}
        }
    },
    solc_version='0.8.19',
    allow_paths=[os.getcwd()]
)

# 4. Save Artifacts
def save_artifact(file_name, contract_name):
    try:
        data = compiled_sol['contracts'][file_name][contract_name]
        with open(f'{contract_name}_abi.json', 'w') as f: json.dump(data['abi'], f)
        with open(f'{contract_name}_bytecode.txt', 'w') as f: f.write(data['evm']['bytecode']['object'])
        print(f"✓ Saved {contract_name}")
    except KeyError:
        print(f"❌ Error saving {contract_name} (Check contract name in file)")

# Save using the exact class names found in your .sol files
save_artifact('KCCLoanManager.sol', 'KCCLoanManager')
save_artifact('Groth16Verifier.sol', 'Groth16Verifier')
save_artifact('MockToken.sol', 'MockCreditToken') # Note: Class name is MockCreditToken inside MockToken.sol

print("Compilation process finished.")
