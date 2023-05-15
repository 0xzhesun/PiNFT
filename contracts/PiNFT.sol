// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract PiNFT is ERC721, ERC721Enumerable, Pausable, Ownable, ERC721Burnable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    uint256 public MAX_NFTS_PER_ADDRESS = 10000;
    mapping(address => uint256) private _nftCount;

    constructor() ERC721("PiNFT", "PNFT") {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function preMint(address to, bytes32 msgHash, bytes memory client_signature, bytes memory owner_signature) public {
        require(ECDSA.recover(msgHash, owner_signature) == owner(), "Address is not allowlisted");
        require(ECDSA.recover(msgHash, client_signature) == to, "Invalid signature");
        require(_nftCount[to] < MAX_NFTS_PER_ADDRESS, "Maximum NFTs per address reached");

        safeMint(to);
    }

    function safeMint(address to) private {

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _nftCount[to] += 1;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}