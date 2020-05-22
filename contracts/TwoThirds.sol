pragma solidity ^0.6.8;

import "@nomiclabs/buidler/console.sol";

contract TwoThirds {
    event CreateGame(uint indexed _index, uint _maxBids, uint _bidCost, uint _minBidValue, uint _maxBid);
    event SubmitBid(uint indexed _bid, address indexed _bidder, uint amount); // need amount?
    event CompleteGame(uint indexed _index, uint _maxBids, uint _bidCost, uint _minBidValue, uint _maxBid, address indexed _winner);

    struct Bid {
        uint bid;
        address payable bidder;
    }

    struct Game {
        // TODO `bids` better as an array?
        // couldn't figure out how to create a game with empty bids
        mapping(uint => Bid) bids;
        uint bidCount;
        uint maxBids;
        uint bidCost;
        uint minBidValue;
        uint maxBidValue;
        address payable winner; // TODO add winningBid?
    }
    Game[] games;

    address public owner;

    constructor() public {
        console.log("Deploying TwoThirds auction contract.");
        owner = msg.sender;
    }

    function createGame(uint _maxBids, uint _bidCost, uint _minBidValue, uint _maxBidValue) public payable {
        require(msg.sender == owner, "You don't have permisison to create a game.");

        console.log("Creating a game, index: ", games.length);

        games.push(Game({
            maxBids: _maxBids,
            bidCount: 0,
            bidCost: _bidCost,
            minBidValue: _minBidValue,
            maxBidValue: _maxBidValue,
            winner: address(0)
        }));
        emit CreateGame(games.length - 1, _maxBids, _bidCost, _minBidValue, _maxBidValue);
    }

    function submitBid(uint _gameIndex, uint _bid) public payable {
        require(games.length > _gameIndex, "Game doesn't exist.");
        Game storage game = games[_gameIndex];

        require(game.bidCount < game.maxBids, "Game is closed.");
        // TODO how to include game values in revert messages?
        require(msg.value >= game.bidCost, "You did not send enough ETH.");
        require(game.minBidValue <= _bid, "Bid is too low.");
        require(game.maxBidValue >= _bid, "Bid is too high.");

        console.log("Submitting a bid: ", _bid);
        console.log("Bid value: ", msg.value);

        game.bids[game.bidCount] = Bid({ bid: _bid, bidder: msg.sender });
        game.bidCount++;
        emit SubmitBid(_bid, msg.sender, msg.value);
    }

    function calculateGameWinner(uint _gameIndex) public returns (address payable _winner) {
        Game storage game = games[_gameIndex];
        require(game.bidCount == game.maxBids, "Game is still open.");
        uint256 twoThirdsAverage = calculateGameTwoThirdsAverage(_gameIndex);

        int256 lowestDifference = int256(game.maxBidValue);

        for (uint i = 0; i < game.bidCount; i++) {
            int256 diff = int256(game.bids[i].bid - twoThirdsAverage);
            if (diff < 0) {
                diff = diff * -1; // get absolute diff - is there a better way?
            }
            if (diff < lowestDifference) {
                lowestDifference = diff;
                _winner = game.bids[i].bidder;
            }
        }
        game.winner = _winner;
        return _winner;
    }

    // VIEWS

    // TODO how to fetch games?
    // TODO how to fetch all games a user has bids in?

    function calculateGameTwoThirdsAverage(uint _gameIndex) public view returns (uint256 twoThirdsAverage) {
        Game storage game = games[_gameIndex];
        require(game.bidCount == game.maxBids, "Game is still open.");

        uint total;
        for (uint i = 0; i < game.bidCount; i++) {
            total += game.bids[i].bid;
        }
        uint256 average = total / game.bidCount;
        return average * 2 / 3;
    }

    function getGameCount() public view returns (uint gameCount) {
        return games.length;
    }

    function getGameBidCount(uint _gameIndex) public view returns (uint bidCount) {
        return games[_gameIndex].bidCount;
    }

    function getGameWinner(uint _gameIndex) public view returns (address winner) {
        return games[_gameIndex].winner;
    }

    function getGameUserBids(uint _gameIndex) public view returns (uint[] memory) {
        Game storage game = games[_gameIndex];
        uint[] memory userBids = new uint[](game.bidCount);

        uint index = 0;
        for (uint i = 0; i < game.bidCount; i++) {
            if (game.bids[i].bidder == msg.sender) {
                userBids[index] = game.bids[i].bid;
                index++;
            }
        }
        return userBids;
    }
}
