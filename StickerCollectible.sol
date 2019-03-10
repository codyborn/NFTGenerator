pragma solidity ^0.5.0;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721MetadataMintable.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

/**
 * @title Sticker Collectible
 * Sticker NFT - a contract for non-fungible stickers.
 */
contract StickerCollectible is ERC721Metadata("CryptoStickers", "CS"), Ownable, ERC721MetadataMintable {
}