// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IKCCVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[3] memory input
    ) external view returns (bool);
}

contract KCCLoanManager {
    IKCCVerifier public verifier;

    enum LoanStatus {
        IN_PROGRESS,
        UNDER_REVIEW,
        SANCTIONED,
        REJECTED
    }

    struct LoanApplication {
        address farmer;
        uint256 requestedAmount;
        string loanCategory;
        LoanStatus status;
        uint256 sanctionedAmount;
        uint256 disbursedAmount;
        uint256 timestamp;
    }

    struct Credential {
        bool isIssued;
        bool isRevoked;
        uint256 issuedAt;
        address issuer;
    }

    struct FarmerDocuments {
        string aadhaarHash;
        string landDocHash;
        string incomeProofHash;
        uint256 uploadedAt;
        bool isVerified;
    }

    struct BillDocument {
        string billHash;
        uint256 amount;
        uint256 uploadedAt;
        bool isApproved;
        uint256 disbursedAmount;
    }

    mapping(address => Credential) public farmerCredentials;
    mapping(uint256 => LoanApplication) public loanApplications;
    mapping(address => uint256[]) public farmerLoans;
    mapping(address => FarmerDocuments) public farmerDocuments;
    mapping(uint256 => BillDocument[]) public loanBills;

    // ✅ Track farmers who uploaded KYC documents
    address[] private farmersWithDocuments;
    mapping(address => bool) private hasFarmerUploaded;

    // ✅ NEW: Track loans with bills uploaded
    uint256[] private loansWithBills;
    mapping(uint256 => bool) private hasLoanBills;

    uint256 public loanCounter;

    address public issuer;
    address public bankOfficer;
    address public auditor;

    event CredentialIssued(
        address indexed farmer,
        address indexed issuer,
        uint256 timestamp
    );
    event CredentialRevoked(address indexed farmer, uint256 timestamp);
    event LoanApplied(
        uint256 indexed loanId,
        address indexed farmer,
        uint256 amount
    );
    event LoanStatusUpdated(uint256 indexed loanId, LoanStatus status);
    event FundsDisbursed(
        uint256 indexed loanId,
        uint256 billIndex,
        uint256 amount,
        string billHash
    );
    event BillUploaded(
        uint256 indexed loanId,
        uint256 billIndex,
        string billHash,
        uint256 amount,
        uint256 timestamp
    );
    event DocumentsUploaded(
        address indexed farmer,
        string aadhaarHash,
        string landDocHash,
        string incomeProofHash,
        uint256 timestamp
    );
    event DocumentsVerified(address indexed farmer, uint256 timestamp);

    modifier onlyIssuer() {
        require(msg.sender == issuer, "Only issuer");
        _;
    }

    modifier onlyBankOfficer() {
        require(msg.sender == bankOfficer, "Only bank officer");
        _;
    }

    modifier onlyAuditor() {
        require(msg.sender == auditor, "Only auditor");
        _;
    }

    constructor(address _verifierAddress) {
        verifier = IKCCVerifier(_verifierAddress);
        issuer = msg.sender;
    }

    function setBankOfficer(address _bankOfficer) external onlyIssuer {
        bankOfficer = _bankOfficer;
    }

    function setAuditor(address _auditor) external onlyIssuer {
        auditor = _auditor;
    }

    function issueCredential(address farmer) external onlyIssuer {
        require(!farmerCredentials[farmer].isIssued, "Already issued");

        farmerCredentials[farmer] = Credential({
            isIssued: true,
            isRevoked: false,
            issuedAt: block.timestamp,
            issuer: msg.sender
        });

        emit CredentialIssued(farmer, msg.sender, block.timestamp);
    }

    function revokeCredential(address farmer) external onlyIssuer {
        require(farmerCredentials[farmer].isIssued, "Not issued");
        require(!farmerCredentials[farmer].isRevoked, "Already revoked");

        farmerCredentials[farmer].isRevoked = true;
        emit CredentialRevoked(farmer, block.timestamp);
    }

    function uploadDocuments(
        string memory _aadhaarHash,
        string memory _landDocHash,
        string memory _incomeProofHash
    ) external {
        require(bytes(_aadhaarHash).length > 0, "Aadhaar hash required");
        require(bytes(_landDocHash).length > 0, "Land doc hash required");
        require(
            bytes(_incomeProofHash).length > 0,
            "Income proof hash required"
        );

        farmerDocuments[msg.sender] = FarmerDocuments({
            aadhaarHash: _aadhaarHash,
            landDocHash: _landDocHash,
            incomeProofHash: _incomeProofHash,
            uploadedAt: block.timestamp,
            isVerified: false
        });

        if (!hasFarmerUploaded[msg.sender]) {
            farmersWithDocuments.push(msg.sender);
            hasFarmerUploaded[msg.sender] = true;
        }

        emit DocumentsUploaded(
            msg.sender,
            _aadhaarHash,
            _landDocHash,
            _incomeProofHash,
            block.timestamp
        );
    }

    function verifyDocumentsAndIssueCredential(
        address farmer
    ) external onlyIssuer {
        require(
            bytes(farmerDocuments[farmer].aadhaarHash).length > 0,
            "No documents uploaded"
        );
        require(!farmerDocuments[farmer].isVerified, "Already verified");
        require(
            !farmerCredentials[farmer].isIssued,
            "Credential already issued"
        );

        farmerDocuments[farmer].isVerified = true;

        farmerCredentials[farmer] = Credential({
            isIssued: true,
            isRevoked: false,
            issuedAt: block.timestamp,
            issuer: msg.sender
        });

        emit DocumentsVerified(farmer, block.timestamp);
        emit CredentialIssued(farmer, msg.sender, block.timestamp);
    }

    // ✅ KYC Document queries
    function getAllFarmersWithDocuments()
        external
        view
        returns (address[] memory)
    {
        return farmersWithDocuments;
    }

    function getFarmersCount() external view returns (uint256) {
        return farmersWithDocuments.length;
    }

    function getFarmersPaginated(
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory) {
        require(offset < farmersWithDocuments.length, "Offset out of bounds");

        uint256 end = offset + limit;
        if (end > farmersWithDocuments.length) {
            end = farmersWithDocuments.length;
        }

        address[] memory result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = farmersWithDocuments[i];
        }

        return result;
    }

    function getFarmerDocuments(
        address farmer
    ) external view returns (FarmerDocuments memory) {
        return farmerDocuments[farmer];
    }

    function applyForLoan(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[3] memory input,
        uint256 requestedAmount,
        string memory loanCategory
    ) external returns (uint256) {
        require(farmerCredentials[msg.sender].isIssued, "No credential");
        require(!farmerCredentials[msg.sender].isRevoked, "Revoked");

        require(verifier.verifyProof(a, b, c, input), "Invalid proof");

        uint256 loanId = loanCounter++;

        loanApplications[loanId] = LoanApplication({
            farmer: msg.sender,
            requestedAmount: requestedAmount,
            loanCategory: loanCategory,
            status: LoanStatus.IN_PROGRESS,
            sanctionedAmount: 0,
            disbursedAmount: 0,
            timestamp: block.timestamp
        });

        farmerLoans[msg.sender].push(loanId);

        emit LoanApplied(loanId, msg.sender, requestedAmount);
        return loanId;
    }

    function reviewLoan(uint256 loanId) external onlyBankOfficer {
        require(
            loanApplications[loanId].status == LoanStatus.IN_PROGRESS,
            "Invalid status"
        );

        loanApplications[loanId].status = LoanStatus.UNDER_REVIEW;
        emit LoanStatusUpdated(loanId, LoanStatus.UNDER_REVIEW);
    }

    function sanctionLoan(
        uint256 loanId,
        uint256 sanctionedAmount
    ) external onlyBankOfficer {
        require(
            loanApplications[loanId].status == LoanStatus.UNDER_REVIEW,
            "Not under review"
        );

        loanApplications[loanId].status = LoanStatus.SANCTIONED;
        loanApplications[loanId].sanctionedAmount = sanctionedAmount;

        emit LoanStatusUpdated(loanId, LoanStatus.SANCTIONED);
    }

    function rejectLoan(uint256 loanId) external onlyBankOfficer {
        loanApplications[loanId].status = LoanStatus.REJECTED;
        emit LoanStatusUpdated(loanId, LoanStatus.REJECTED);
    }

    // ✅ Farmer uploads bill
    function uploadBill(
        uint256 loanId,
        string memory billHash,
        uint256 requestedAmount
    ) external {
        LoanApplication storage loan = loanApplications[loanId];
        require(loan.farmer == msg.sender, "Not loan owner");
        require(loan.status == LoanStatus.SANCTIONED, "Loan not sanctioned");
        require(bytes(billHash).length > 0, "Bill hash required");
        require(requestedAmount > 0, "Amount must be > 0");
        require(
            loan.disbursedAmount + requestedAmount <= loan.sanctionedAmount,
            "Exceeds sanctioned amount"
        );

        loanBills[loanId].push(
            BillDocument({
                billHash: billHash,
                amount: requestedAmount,
                uploadedAt: block.timestamp,
                isApproved: false,
                disbursedAmount: 0
            })
        );

        // ✅ Track this loan if first bill
        if (!hasLoanBills[loanId]) {
            loansWithBills.push(loanId);
            hasLoanBills[loanId] = true;
        }

        uint256 billIndex = loanBills[loanId].length - 1;
        emit BillUploaded(
            loanId,
            billIndex,
            billHash,
            requestedAmount,
            block.timestamp
        );
    }

    function disburseFunds(
        uint256 loanId,
        uint256 billIndex,
        uint256 amount
    ) external onlyAuditor {
        LoanApplication storage loan = loanApplications[loanId];
        require(loan.status == LoanStatus.SANCTIONED, "Not sanctioned");
        require(billIndex < loanBills[loanId].length, "Invalid bill index");

        BillDocument storage bill = loanBills[loanId][billIndex];
        require(!bill.isApproved, "Bill already processed");
        require(amount <= bill.amount, "Amount exceeds bill request");
        require(
            loan.disbursedAmount + amount <= loan.sanctionedAmount,
            "Exceeds sanctioned limit"
        );

        bill.isApproved = true;
        bill.disbursedAmount = amount;
        loan.disbursedAmount += amount;

        emit FundsDisbursed(loanId, billIndex, amount, bill.billHash);
    }

    // ✅ Bill document queries
    function getLoanBills(
        uint256 loanId
    ) external view returns (BillDocument[] memory) {
        return loanBills[loanId];
    }

    function getBillDetails(
        uint256 loanId,
        uint256 billIndex
    ) external view returns (BillDocument memory) {
        require(billIndex < loanBills[loanId].length, "Invalid bill index");
        return loanBills[loanId][billIndex];
    }

    function getBillCount(uint256 loanId) external view returns (uint256) {
        return loanBills[loanId].length;
    }

    // ✅ NEW: Get all loans that have bills uploaded
    function getAllLoansWithBills() external view returns (uint256[] memory) {
        return loansWithBills;
    }

    // ✅ NEW: Get count of loans with bills
    function getLoansWithBillsCount() external view returns (uint256) {
        return loansWithBills.length;
    }

    // ✅ NEW: Pagination for loans with bills
    function getLoansWithBillsPaginated(
        uint256 offset,
        uint256 limit
    ) external view returns (uint256[] memory) {
        require(offset < loansWithBills.length, "Offset out of bounds");

        uint256 end = offset + limit;
        if (end > loansWithBills.length) {
            end = loansWithBills.length;
        }

        uint256[] memory result = new uint256[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = loansWithBills[i];
        }

        return result;
    }

    function getFarmerLoans(
        address farmer
    ) external view returns (uint256[] memory) {
        return farmerLoans[farmer];
    }
}
