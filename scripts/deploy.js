async function main() {
  const PiNFT = await ethers.getContractFactory("PiNFT");
  const PiNFTInstance = await PiNFT.deploy();
  await PiNFTInstance.deployed();

  console.log("PiNFT deployed to:", PiNFTInstance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
