require('dotenv').config();
const ethers = require('ethers');
const fs = require('fs')

const API_KEY = process.env.API_KEY;

const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/" + API_KEY);

const contract = require("../artifacts/contracts/PiNFT.sol/PiNFT.json");

const privateKey = process.env.PRIVATE_KEY
const owner_wallet = new ethers.Wallet(privateKey, provider)

const privateKey2 = process.env.PRIVATE_KEY2
const client_wallet = new ethers.Wallet(privateKey2)

const abi = contract.abi
const contractAddress = process.env.CONTRACT_ADDRESS

const piNftContract = new ethers.Contract(contractAddress, abi, owner_wallet)

const mintNFT = async () => {
    const imageBuffer = fs.readFileSync('scripts/snorlax.jpeg') //replace with your own image
    const imageBase64String = imageBuffer.toString('base64')
    const msgHash = ethers.utils.hashMessage(imageBase64String)
    const client_signature = await client_wallet.signMessage(imageBase64String)

    const owner_signature = await owner_wallet.signMessage(imageBase64String)
    

    let nftTxn = await piNftContract.preMint(client_wallet.address, msgHash, client_signature, owner_signature)
    await nftTxn.wait()
    console.log(`NFT Minted! Check it out at: https://sepolia.etherscan.io/tx/${nftTxn.hash}`)
}

mintNFT()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });