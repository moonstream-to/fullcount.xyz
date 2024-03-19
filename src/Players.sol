// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.19;

import { ERC721 } from "../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import { ERC721Enumerable } from "../lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import { Base64 } from "../lib/openzeppelin-contracts/contracts/utils/Base64.sol";
import { Strings } from "../lib/openzeppelin-contracts/contracts/utils/Strings.sol";
import { ITerminus } from "../lib/web3/contracts/interfaces/ITerminus.sol";

contract BeerLeagueBallers is ERC721Enumerable {
    string[] public ProfileImages = [
        "https://badges.moonstream.to/blb/p0.png",
        "https://badges.moonstream.to/blb/p1.png",
        "https://badges.moonstream.to/blb/p2.png",
        "https://badges.moonstream.to/blb/p3.png",
        "https://badges.moonstream.to/blb/p4.png",
        "https://badges.moonstream.to/blb/p5.png",
        "https://badges.moonstream.to/blb/p6.png",
        "https://badges.moonstream.to/blb/p7.png"
    ];

    mapping(uint256 => string) public Name;
    mapping(uint256 => uint256) public ImageIndex;

    address adminTerminus;
    uint256 adminPoolID;

    constructor(address _adminTerminus, uint256 _adminPoolID) ERC721("Beer League Ballers", "BLB") {
        adminTerminus = _adminTerminus;
        adminPoolID = _adminPoolID;
    }

    function _enforceIsAdmin() internal view {
        ITerminus terminus = ITerminus(address(adminTerminus));
        require(terminus.balanceOf(msg.sender, adminPoolID) > 0, "BeerLeagueBallers._enforceIsAdmin: not admin");
    }

    function getProfileImageCount() external view returns (uint256) {
        return ProfileImages.length;
    }

    function addProfileImage(string memory newImage) public {
        _enforceIsAdmin();

        ProfileImages.push(newImage);
    }

    function setProfileImage(uint256 index, string memory newImage) public {
        _enforceIsAdmin();

        ProfileImages[index] = newImage;
    }

    function setTokenName(uint256 tokenID, string memory newName) public {
        _enforceIsAdmin();

        Name[tokenID] = newName;
    }

    function mint(string memory name, uint256 imageIndex) public returns (uint256) {
        require(imageIndex < ProfileImages.length, "BLB.mint: invalid image index");
        uint256 tokenId = totalSupply() + 1;
        Name[tokenId] = name;
        ImageIndex[tokenId] = imageIndex;
        _safeMint(msg.sender, tokenId);
        return tokenId;
    }

    function burn(uint256 tokenId) public {
        require(msg.sender == ownerOf(tokenId), "BLB.burn: caller is not owner");
        _burn(tokenId);
    }

    function _metadata(uint256 tokenId) internal view returns (bytes memory json) {
        json = abi.encodePacked(
            '{"name":"',
            Name[tokenId],
            " - ",
            Strings.toString(tokenId),
            '", "image":"',
            ProfileImages[ImageIndex[tokenId]],
            '"}'
        );
    }

    function metadataJSON(uint256 tokenId) public view returns (string memory) {
        return string(_metadata(tokenId));
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(_metadata(tokenId))));
    }
}
