pragma solidity ^0.5.1;

import "@nomiclabs/buidler/console.sol";

contract TwoThirds {

    struct Bid {
        uint bid;
        address payable bidder;
    }
    Bid[] bids;

    address public owner;
    uint public bidCost = 1000000000000000000;
    uint public maxBids = 5;

    constructor() public {
        console.log("Deploying a TwoThirds auction");
        owner = msg.sender;
    }

    // TODO submit event
    function submitBid(uint _bid) public payable {
        require(bids.length < maxBids, "Auction is closed.");
        require(msg.value >= bidCost, "You must send at least 1 ETH.");

        console.log("Submitting a bid: ", _bid);
        console.log("Bid value: ", msg.value);
        bids.push(Bid({ bid: _bid, bidder: msg.sender }));
    }

    // VIEWS

    function getBidCount() public view returns (uint bidCount) {
        return bids.length;
    }

    // function getUserBids(address _user) public view returns (uint[] memory userBids) {
    //     for (uint i = 0; i < bids.length; i++) {
    //         if (bids[i].bidder == _user) {
    //             // TODO can't use push on memory arrays...
    //             // Member "push" is not available in uint256[] memory outside of storage.
    //             // https://ethereum.stackexchange.com/questions/7210/working-with-structure-arrays-in-solidity
    //             userBids.push(bids[i].bid);
    //         }
    //     }
    //     return userBids;
    // }
}
