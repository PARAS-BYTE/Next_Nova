import { ethers } from "ethers";

const ABI = [
  "function mintCertificate(address student, string memory courseName, string memory studentName, uint256 score, string memory tokenURI) public returns (uint256)",
  "function getCertificateData(uint256 tokenId) public view returns (tuple(string courseName, string studentName, uint256 completionDate, uint256 score))"
];

class BlockchainService {
  constructor() {
    this.rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    this.privateKey = process.env.SERVER_PRIVATE_KEY;
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.isDevelopment = !this.privateKey || this.privateKey.includes('123456');
  }

  async mintCertificate(studentWalletAddress, courseData) {
    if (this.isDevelopment) {
      console.log("🛠️ Blockchain Simulation: Minting NFT Certificate...");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      return {
        tokenId: Math.floor(Math.random() * 1000000),
        transactionHash: "0x" + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join(""),
        status: "simulated"
      };
    }

    try {
      const provider = new ethers.JsonRpcProvider(this.rpcUrl);
      const wallet = new ethers.Wallet(this.privateKey, provider);
      const contract = new ethers.Contract(this.contractAddress, ABI, wallet);

      const tx = await contract.mintCertificate(
        studentWalletAddress,
        courseData.courseTitle,
        courseData.studentName,
        courseData.score || 100,
        `https://learnnova.vercel.app/api/certificates/metadata/${Date.now()}` // Dynamic metadata URL
      );

      const receipt = await tx.wait();
      // Extract tokenId from event if needed, or assume it worked
      return {
        tokenId: 1, // Simplified for now
        transactionHash: receipt.hash,
        status: "success"
      };
    } catch (error) {
      console.error("❌ Blockchain Minting Error:", error);
      throw error;
    }
  }
}

export default new BlockchainService();
