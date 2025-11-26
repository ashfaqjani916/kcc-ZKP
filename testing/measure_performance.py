from web3 import Web3
import json
import time
import os

# --- CONFIGURATION ---
ITERATIONS = 10
LOG_DIR = os.path.join(os.getcwd(), "logs")

# 1. Connect
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545"))
if not w3.is_connected(): raise Exception("Check Ganache")

# 2. Accounts
deployer = w3.eth.accounts[0]
bank_officer = w3.eth.accounts[1]
auditor = w3.eth.accounts[2]
farmer = w3.eth.accounts[3]
farmer2 = w3.eth.accounts[4]

# Initialize Logs
performance_logs = {}

if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

def load_artifact(name):
    with open(f'{name}_abi.json') as f: abi = json.load(f)
    with open(f'{name}_bytecode.txt') as f: bytecode = f.read()
    return abi, bytecode

def log_metrics(func_name, duration_sec, gas_used):
    # Convert seconds to milliseconds
    duration_ms = duration_sec * 1000
    
    if func_name not in performance_logs:
        performance_logs[func_name] = {"times_ms": [], "gas": []}
    
    performance_logs[func_name]["times_ms"].append(duration_ms)
    performance_logs[func_name]["gas"].append(gas_used)

def measure_tx(name, func_call, tx_params):
    try:
        start = time.time()
        tx_hash = func_call.transact(tx_params)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        duration = time.time() - start
        
        gas_used = receipt.gasUsed
        log_metrics(name, duration, gas_used)
        
        print(f"  ✓ {name}: {duration*1000:.2f} ms | Gas: {gas_used}")
        return receipt
    except Exception as e:
        print(f"  ❌ {name} FAILED: {e}")
        return None

def measure_call(name, func_call):
    try:
        start = time.time()
        func_call.call()
        duration = time.time() - start
        
        try:
            gas_estimate = func_call.estimate_gas()
        except:
            gas_estimate = 0
            
        log_metrics(name, duration, gas_estimate)
        print(f"  ✓ {name} (View): {duration*1000:.2f} ms | Est. Gas: {gas_estimate}")
    except Exception as e:
        print(f"  ❌ {name} FAILED: {e}")

def save_logs():
    print(f"\n💾 Saving consolidated logs to '{LOG_DIR}/'...")
    
    # 1. Save JSON Data (Machine Readable)
    json_path = os.path.join(LOG_DIR, "benchmark_results.json")
    
    # Calculate Averages
    final_results = {}
    for func, data in performance_logs.items():
        times = data["times_ms"]
        gases = data["gas"]
        final_results[func] = {
            "avg_time_ms": sum(times) / len(times) if times else 0,
            "avg_gas": sum(gases) / len(gases) if gases else 0,
            "raw_times_ms": times,
            "raw_gas": gases
        }
        
    with open(json_path, 'w') as f:
        json.dump(final_results, f, indent=4)
        
    # 2. Save Text Report (Human Readable with Comments)
    txt_path = os.path.join(LOG_DIR, "benchmark_report.txt")
    with open(txt_path, 'w') as f:
        f.write("==================================================\n")
        f.write("         KCC CONTRACT PERFORMANCE REPORT          \n")
        f.write(f"         Iterations per function: {ITERATIONS}    \n")
        f.write("==================================================\n\n")
        
        for func, data in final_results.items():
            f.write(f"--- Function: {func} ---\n")
            f.write(f"Average Time: {data['avg_time_ms']:.2f} ms\n")
            f.write(f"Average Gas:  {data['avg_gas']:.0f}\n")
            f.write(f"Raw Times (ms): {data['raw_times_ms']}\n")
            f.write("\n")
            
    print("  ✓ Saved 'benchmark_results.json' (Data)")
    print("  ✓ Saved 'benchmark_report.txt' (Readable Report)")

# ==========================================
#        MAIN BENCHMARK LOOP
# ==========================================

print(f"🚀 Starting Benchmark: {ITERATIONS} Iterations")

for i in range(1, ITERATIONS + 1):
    print(f"\n=== ITERATION {i}/{ITERATIONS} ===")
    
    try:
        # --- A. DEPLOY ---
        v_abi, v_code = load_artifact('Groth16Verifier')
        receipt = measure_tx("Deploy_Verifier", w3.eth.contract(abi=v_abi, bytecode=v_code).constructor(), {'from': deployer})
        if not receipt: continue
        verifier_address = receipt.contractAddress

        t_abi, t_code = load_artifact('MockCreditToken')
        receipt = measure_tx("Deploy_Token", w3.eth.contract(abi=t_abi, bytecode=t_code).constructor(), {'from': deployer})
        if not receipt: continue
        token_address = receipt.contractAddress

        kcc_abi, kcc_code = load_artifact('KCCLoanManager')
        receipt = measure_tx("Deploy_KCCManager", w3.eth.contract(abi=kcc_abi, bytecode=kcc_code).constructor(verifier_address, token_address), {'from': deployer})
        if not receipt: continue
        kcc_address = receipt.contractAddress

        contract = w3.eth.contract(address=kcc_address, abi=kcc_abi)
        token_contract = w3.eth.contract(address=token_address, abi=t_abi)

        # --- B. EXECUTE ---
        measure_tx("setBankOfficer", contract.functions.setBankOfficer(bank_officer), {'from': deployer})
        measure_tx("setAuditor", contract.functions.setAuditor(auditor), {'from': deployer})

        measure_tx("issueCredential", contract.functions.issueCredential(farmer), {'from': deployer})
        measure_tx("revokeCredential", contract.functions.revokeCredential(farmer), {'from': deployer})
        measure_tx("issueCredential_F2", contract.functions.issueCredential(farmer2), {'from': deployer})

        measure_tx("uploadDocuments", contract.functions.uploadDocuments("h1", "h2", "h3"), {'from': farmer2})

        measure_call("getFarmersCount", contract.functions.getFarmersCount())
        measure_call("getAllFarmersWithDocuments", contract.functions.getAllFarmersWithDocuments())
        measure_call("getFarmerDocuments", contract.functions.getFarmerDocuments(farmer2))

        dummy_args = ([0,0], [[0,0],[0,0]], [0,0], [0,0,0])
        
        measure_tx("applyForLoan", contract.functions.applyForLoan(*dummy_args, 50000, "Agri"), {'from': farmer2})
        loan_id = 0

        measure_tx("reviewLoan", contract.functions.reviewLoan(loan_id), {'from': bank_officer})
        measure_tx("sanctionLoan", contract.functions.sanctionLoan(loan_id, 50000), {'from': bank_officer})

        token_contract.functions.mintTo(kcc_address, 100000).transact({'from': deployer}) 

        measure_tx("uploadBill", contract.functions.uploadBill(loan_id, "BillHash1", 10000), {'from': farmer2})
        measure_tx("disburseFunds", contract.functions.disburseFunds(loan_id, 0, 10000), {'from': auditor})

        measure_tx("applyForLoan_Rejection", contract.functions.applyForLoan(*dummy_args, 20000, "Equip"), {'from': farmer2})
        loan_id_reject = 1
        measure_tx("rejectLoan", contract.functions.rejectLoan(loan_id_reject), {'from': bank_officer})

        measure_tx("uploadBill_Advanced", contract.functions.uploadBill(loan_id, "BillHash2", 5000), {'from': farmer2})
        
        token_contract.functions.mintTo(auditor, 50000).transact({'from': deployer})
        token_contract.functions.approve(kcc_address, 50000).transact({'from': auditor})

        measure_tx("disburseFundsFrom", contract.functions.disburseFundsFrom(loan_id, 1, 5000, auditor), {'from': auditor})

        measure_tx("mintTokens", contract.functions.mintTokens(farmer2, 1000), {'from': auditor})
        measure_tx("disburseAmount", contract.functions.disburseAmount(500, farmer2, loan_id), {'from': bank_officer})
        measure_call("getTokenBalance", contract.functions.getTokenBalance(farmer2))

        # Save Progress
        save_logs()

    except Exception as e:
        print(f"⚠️ CRITICAL ERROR IN LOOP {i}: {e}")

print("\n🎉 Benchmark Complete! Check logs/benchmark_report.txt")
