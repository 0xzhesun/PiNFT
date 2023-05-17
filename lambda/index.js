const AWS = require('aws-sdk');
const ethers = require('ethers');
const CONTRACT = require('./PiNFT.json');
const documentClient = new AWS.DynamoDB.DocumentClient({ region: 'us-west-2' });
const s3 = new AWS.S3({region: 'us-west-2'});

const NFT_TRANS_TABLE = 'nftTransactions'; 
const S3_BUCKET_NAME = 'nft-demo'; //replace with your own S3 bucket name

const API_KEY = process.env.API_KEY;
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

//mintNFT function takes in the encoded image, hash of the image, client signature and client wallet.
const mintNFT = async function(imageBase64String, imageHash, clientSignature, clientWalletAddress) {
    let provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/" + API_KEY);
    let ownerWallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    let abi = CONTRACT.abi;
    let piNftContract = new ethers.Contract(CONTRACT_ADDRESS, abi, ownerWallet);
    let ownerSignature = await ownerWallet.signMessage(imageBase64String);
    let nftTxn = await piNftContract.preMint(clientWalletAddress, imageHash, clientSignature, ownerSignature);
    await nftTxn.wait();
    let nftTxnHash = `https://sepolia.etherscan.io/tx/${nftTxn.hash}`;
    console.log(`NFT Minted! Check it out at: ${nftTxnHash}`);
    return nftTxnHash;
};

//upload encoded image to S3 bucket
const uploadImageToS3 = async function(encodedImage, imageHash) {
    const file_name = `${imageHash}.jpg`;
    let buff = new Buffer.from(encodedImage, 'base64');
    const params = {
        Bucket: S3_BUCKET_NAME,
        Key: file_name,
        Body: buff
    };
    const uploadedImage = await s3.upload(params).promise();
    const imageLocation = uploadedImage.Location;
    console.log(`Uploaded ${file_name} to ${S3_BUCKET_NAME}, location: ${imageLocation}`);
    return imageLocation;
};

//check if the image hash already exist in the DynamoDB table
const getNftTxnHashTransaction = async function(clientWalletAddress, imageHash) {
    let nftTxnHash = '';

    let queryParams = {
        TableName: NFT_TRANS_TABLE,
        KeyConditionExpression: 'clientWalletAddress = :clientWalletAddress and imageHash = :imageHash',
        ExpressionAttributeValues: {
            ':clientWalletAddress': clientWalletAddress,
            ':imageHash': imageHash
        }

    };
    let result = await documentClient.query(queryParams).promise();
    if (( result.Items.length > 0 ) && ( 'nftTxnHash' in result.Items[0] ))  {
        nftTxnHash = result.Items[0].nftTxnHash;
        console.log(`nftTxnHash already exist, ${clientWalletAddress} | ${imageHash} | ${nftTxnHash}`);
    } else {
        console.log(`nftTxnHash does not exist`);
    }
    return nftTxnHash;
};

const saveNftTxnHashTransaction = async function(clientWalletAddress, imageHash, nftTxnHash, imageLocation) {
    let params = {
        TableName: NFT_TRANS_TABLE,
        Item: {
            clientWalletAddress: clientWalletAddress,
            imageHash: imageHash,
            nftTxnHash: nftTxnHash,
            imageLocation: imageLocation
        }
    };
    await documentClient.put(params).promise();
    console.log(`Saved Transaction in DDB.`);
};

exports.handler = async function (event) {
    let result = {
        performedMint: false,
        nftTxnHash: ''
    };
    let encodedImage = event.encodedImage;
    let clientSignature = event.clientSignature;
    let clientWalletAddress = event.clientWalletAddress;
    let imageHash = ethers.utils.hashMessage(encodedImage);
    console.log(`encoded Image: ${encodedImage} \n signature: ${clientSignature} \n clientWalletAddress: ${clientWalletAddress}`)
;
//check if there is already an existing mint transaction for the image
    let nftTxnHash = await getNftTxnHashTransaction(clientWalletAddress, imageHash);
    result.nftTxnHash = nftTxnHash;
//if there is no existing mint transaction, mint the NFT, upload the image to S3, then save the transaction in DynamoDB
    if ( !nftTxnHash ) {
        let nftTxnHash = await mintNFT(encodedImage, imageHash, clientSignature, clientWalletAddress);
        console.log(nftTxnHash);
        const imageLocation = await uploadImageToS3(encodedImage, imageHash);
        await saveNftTxnHashTransaction(clientWalletAddress, imageHash, nftTxnHash, imageLocation);
        result.nftTxnHash = nftTxnHash;
        result.performedMint = true;

    }
    return result;
};