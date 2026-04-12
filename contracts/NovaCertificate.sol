// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NovaCertificate
 * @dev NFT-based certificate system for LearnNova platform
 * Deployed on Polygon for low-cost, verifiable credentials
 *
 * Certificate Flow:
 * 1. Student completes 100% of a course (validated by backend)
 * 2. Backend calls mintCertificate() with completion proof
 * 3. NFT is minted to student's wallet
 * 4. Certificate data is stored on-chain for public verification
 * 5. Anyone can verify via getCertificateData() or verifyCertificate()
 */
contract NovaCertificate is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct CertificateData {
        string courseName;
        string studentName;
        string studentEmail;
        uint256 completionDate;
        uint256 score;
        bytes32 completionHash; // Hash of completion proof
        bool verified;
    }

    // Token ID => Certificate Data
    mapping(uint256 => CertificateData) public certificatesData;
    
    // Student address => Course name => Token ID (prevent duplicate certs)
    mapping(address => mapping(string => uint256)) public studentCourseCert;
    
    // Course name => minimum score required (0 = no minimum)
    mapping(string => uint256) public courseMinScore;

    // Events
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed student,
        string courseName,
        uint256 score,
        bytes32 completionHash,
        uint256 timestamp
    );

    event CertificateVerified(
        uint256 indexed tokenId,
        address verifier,
        uint256 timestamp
    );

    constructor() ERC721("LearnNova Certificate", "LNC") Ownable(msg.sender) {}

    /**
     * @dev Mint a certificate NFT to a student
     * @param student Address of the student
     * @param courseName Name of the completed course
     * @param studentName Display name of the student
     * @param studentEmail Email for identity reference
     * @param score Final score (0-100)
     * @param completionHash Hash proving 100% completion
     * @param tokenURI IPFS/metadata URI for NFT display
     */
    function mintCertificate(
        address student,
        string memory courseName,
        string memory studentName,
        string memory studentEmail,
        uint256 score,
        bytes32 completionHash,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        // Prevent duplicate certificates for same student + course
        require(
            studentCourseCert[student][courseName] == 0 || 
            _ownerOf(studentCourseCert[student][courseName]) == address(0),
            "Certificate already issued for this course"
        );

        // Enforce minimum score if set
        if (courseMinScore[courseName] > 0) {
            require(score >= courseMinScore[courseName], "Score below minimum threshold");
        }

        // Verify completion hash is not empty
        require(completionHash != bytes32(0), "Invalid completion proof");

        uint256 tokenId = _nextTokenId++;
        _safeMint(student, tokenId);
        _setTokenURI(tokenId, tokenURI);

        certificatesData[tokenId] = CertificateData({
            courseName: courseName,
            studentName: studentName,
            studentEmail: studentEmail,
            completionDate: block.timestamp,
            score: score,
            completionHash: completionHash,
            verified: true
        });

        // Record the mapping
        studentCourseCert[student][courseName] = tokenId;

        emit CertificateMinted(
            tokenId,
            student,
            courseName,
            score,
            completionHash,
            block.timestamp
        );

        return tokenId;
    }

    /**
     * @dev Get certificate data for verification
     */
    function getCertificateData(uint256 tokenId) public view returns (CertificateData memory) {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        return certificatesData[tokenId];
    }

    /**
     * @dev Verify a certificate is authentic and valid
     * Returns true if the certificate exists and matches the provided completion hash
     */
    function verifyCertificate(
        uint256 tokenId,
        bytes32 completionHash
    ) public view returns (bool isValid, CertificateData memory data) {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        data = certificatesData[tokenId];
        isValid = data.verified && data.completionHash == completionHash;
        return (isValid, data);
    }

    /**
     * @dev Check if a student has a certificate for a specific course
     */
    function hasCertificate(
        address student,
        string memory courseName
    ) public view returns (bool) {
        uint256 tokenId = studentCourseCert[student][courseName];
        return _ownerOf(tokenId) == student;
    }

    /**
     * @dev Set minimum score for a course (owner only)
     */
    function setCourseMinScore(
        string memory courseName,
        uint256 minScore
    ) public onlyOwner {
        require(minScore <= 100, "Score must be 0-100");
        courseMinScore[courseName] = minScore;
    }

    /**
     * @dev Get total certificates minted
     */
    function totalCertificates() public view returns (uint256) {
        return _nextTokenId;
    }

    /**
     * @dev Generate a completion hash from course data
     * Used by backend to create verifiable proof
     */
    function generateCompletionHash(
        address student,
        string memory courseName,
        uint256 score,
        uint256 completionTimestamp
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(student, courseName, score, completionTimestamp));
    }
}
