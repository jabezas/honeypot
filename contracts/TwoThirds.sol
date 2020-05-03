pragma solidity ^0.5.1;

import "@nomiclabs/buidler/console.sol";

contract TwoThirds {
    event SubmitBid(uint indexed _bid, address indexed _bidder, uint amount); // need amount?

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

    function submitBid(uint _bid) public payable {
        require(bids.length < maxBids, "Auction is closed.");
        require(msg.value >= bidCost, "You must send at least 1 ETH.");

        console.log("Submitting a bid: ", _bid);
        console.log("Bid value: ", msg.value);
        bids.push(Bid({ bid: _bid, bidder: msg.sender }));
        emit SubmitBid(_bid, msg.sender, msg.value);
    }

    function calculateTwoThirdsAverage() public view returns (uint256 twoThirdsAverage) {
        require(bids.length == maxBids, "Auction is still open");
        uint total;
        for (uint i = 0; i < bids.length; i++) {
            total += bids[i].bid;
        }
        uint256 average = total / bids.length;
        return average * 2 / 3;
    }

    function calculateWinner() public view returns (address winner) {
        require(bids.length == maxBids, "Auction is still open");
        uint256 twoThirdsAverage = calculateTwoThirdsAverage();
        int256 lowestDifference = 100.0;

        for (uint i = 0; i < bids.length; i++) {
            int256 diff = int256(bids[i].bid - twoThirdsAverage);
            if (diff < 0) {
                diff = diff * -1;
            }
            if (diff < lowestDifference) {
                lowestDifference = diff;
                winner = bids[i].bidder;
            }
        }
        return winner;
    }

    // VIEWS

    function getBidCount() public view returns (uint bidCount) {
        return bids.length;
    }

    function getUserBids() public view returns (uint[100] memory userBids) {
        uint index = 0;
        for (uint i = 0; i < bids.length; i++) {
            if (bids[i].bidder == msg.sender) {
                userBids[index] = bids[i].bid;
                index++;
            }
        }
        return userBids;
    }
}
