// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.19;

import { ERC721 } from "../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import { ERC721Enumerable } from "../lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import { Base64 } from "../lib/openzeppelin-contracts/contracts/utils/Base64.sol";
import { Strings } from "../lib/openzeppelin-contracts/contracts/utils/Strings.sol";
import { ITerminus } from "../lib/web3/contracts/interfaces/ITerminus.sol";

contract BeerLeagueBallers is ERC721Enumerable {
    mapping(uint256 => string) public ProfileImages;
    uint256 public NumProfileImages;

    mapping(uint256 => string) public Name;
    mapping(uint256 => uint256) public ImageIndex;

    address adminTerminus;
    uint256 adminPoolID;

    constructor(address _adminTerminus, uint256 _adminPoolID) ERC721("Beer League Ballers", "BLB") {
        adminTerminus = _adminTerminus;
        adminPoolID = _adminPoolID;

        ProfileImages[0] = "https://static.fullcount.xyz/Beer_League_Ballers/p0.png";
        ProfileImages[1] = "https://static.fullcount.xyz/Beer_League_Ballers/p1.png";
        ProfileImages[2] = "https://static.fullcount.xyz/Beer_League_Ballers/p2.png";
        ProfileImages[3] = "https://static.fullcount.xyz/Beer_League_Ballers/p3.png";
        ProfileImages[4] = "https://static.fullcount.xyz/Beer_League_Ballers/p4.png";
        ProfileImages[5] = "https://static.fullcount.xyz/Beer_League_Ballers/p5.png";
        ProfileImages[6] = "https://static.fullcount.xyz/Beer_League_Ballers/p6.png";
        ProfileImages[7] = "https://static.fullcount.xyz/Beer_League_Ballers/p7.png";
        NumProfileImages = 8;
    }

    function _enforceIsAdmin() internal view {
        ITerminus terminus = ITerminus(address(adminTerminus));
        require(terminus.balanceOf(msg.sender, adminPoolID) > 0, "BeerLeagueBallers._enforceIsAdmin: not admin");
    }

    function addProfileImage(string memory newImage) public {
        _enforceIsAdmin();

        ProfileImages[NumProfileImages] = newImage;
        NumProfileImages++;
    }

    function updateProfileImage(uint256 index, string memory newImage) public {
        _enforceIsAdmin();

        ProfileImages[index] = newImage;
    }

    function setTokenNames(uint256[] memory tokenIDList, string[] memory newNameList) public {
        _enforceIsAdmin();

        require(
            tokenIDList.length == newNameList.length,
            "BeerLeagueBallers.setTokenNames: tokenIDList and newNameList length mismatch"
        );

        for (uint256 i = 0; i < tokenIDList.length; i++) {
            Name[tokenIDList[i]] = newNameList[i];
        }
    }

    function setTokenImages(uint256[] memory tokenIDList, uint256[] memory imageIndexList) public {
        _enforceIsAdmin();

        require(
            tokenIDList.length == imageIndexList.length,
            "BeerLeagueBallers.setTokenImages: tokenIDList and imageIndexList length mismatch"
        );

        for (uint256 i = 0; i < tokenIDList.length; i++) {
            ImageIndex[tokenIDList[i]] = imageIndexList[i];
        }
    }

    function mint(string memory name, uint256 imageIndex) public returns (uint256) {
        require(imageIndex < NumProfileImages, "BLB.mint: invalid image index");
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
