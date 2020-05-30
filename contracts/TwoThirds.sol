pragma solidity ^0.6.8;

// TODO lint on save

import "@nomiclabs/buidler/console.sol";

contract TwoThirds {
    event CreateGame(uint indexed _id, uint _maxBids, uint _bidCost, uint _minBidValue, uint _maxBidValue);
    event SubmitBid(uint indexed _gameId, uint indexed _bid, address indexed _bidder, uint amount);
    event CompleteGame(uint indexed _id, uint _maxBids, uint _bidCost, uint _minBidValue, uint _maxBidValue, address indexed _winner);

    struct Bid {
        uint bid;
        address payable bidder;
    }

    struct Game {
        uint id;
        mapping(uint256 => Bid) bids;
        uint bidCount;
        uint maxBids;
        uint bidCost;
        uint minBidValue;
        uint maxBidValue;
        address payable winner; // TODO add winningBid?
    }
    Game[] public games;

    address public owner;

    constructor() public {
        console.log("Deploying TwoThirds auction contract.");
        owner = msg.sender;
    }

    function createGame(uint _maxBids, uint _bidCost, uint _minBidValue, uint _maxBidValue) public payable {
        require(msg.sender == owner, "You don't have permisison to create a game.");

        console.log("Creating a game, id: ", games.length);

        games.push(Game({
            id: games.length,
            maxBids: _maxBids,
            bidCount: 0,
            bidCost: _bidCost,
            minBidValue: _minBidValue,
            maxBidValue: _maxBidValue,
            winner: address(0)
        }));

        emit CreateGame(games.length - 1, _maxBids, _bidCost, _minBidValue, _maxBidValue);
    }

    function submitBid(uint _gameId, uint _bid) public payable {
        require(games.length > _gameId, "Game doesn't exist.");
        Game storage game = games[_gameId];

        require(game.bidCount < game.maxBids, "Game is closed.");
        // TODO how to include game values in revert messages?
        require(msg.value >= game.bidCost, "You did not send enough ETH.");
        require(game.minBidValue <= _bid, "Bid is too low.");
        require(game.maxBidValue >= _bid, "Bid is too high.");

        console.log("Submitting a bid: ", _bid);
        console.log("Bid value: ", msg.value);

        game.bids[game.bidCount] = Bid({ bid: _bid, bidder: msg.sender });
        game.bidCount++;
        emit SubmitBid(_gameId, _bid, msg.sender, msg.value);
    }

    function calculateGameWinner(uint _gameId) public returns (address payable _winner) {
        Game storage game = games[_gameId];
        require(game.bidCount == game.maxBids, "Game is still open.");
        uint256 twoThirdsAverage = calculateGameTwoThirdsAverage(_gameId);

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
        emit CompleteGame(_gameId, game.maxBids, game.bidCost, game.minBidValue, game.maxBidValue, _winner);
        return _winner;
    }

    // VIEWS

    // TODO how to fetch games?
    // TODO how to fetch all games a user has bids in?

    function calculateGameTwoThirdsAverage(uint _gameId) public view returns (uint256 twoThirdsAverage) {
        Game storage game = games[_gameId];
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

    function getGameBidCount(uint _gameId) public view returns (uint bidCount) {
        return games[_gameId].bidCount;
    }

    function getGameWinner(uint _gameId) public view returns (address winner) {
        return games[_gameId].winner;
    }

    function getGameUserBids(uint _gameId) public view returns (uint[] memory) {
        Game storage game = games[_gameId];
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

    function getGames() public view returns (uint[] memory ids, address[] memory winners) {
        uint index = 0;
        address[] memory winners = new address[](games.length);
        uint[]    memory ids = new uint[](games.length);

        for (uint i = 0; i < games.length; i++) {
            if (games[i].bidCount == games[i].maxBids) {
                for (uint j = 0; j < games[i].bidCount; j++){
                    if (games[i].bids[j].bidder == msg.sender) {
                        winners[index] = games[i].winner;
                        ids[index] = games[i].id;
                        index++;
                        break;
                    }
                }
            }
        }
        return (ids, winners);
    }
}
