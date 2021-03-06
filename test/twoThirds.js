const { expect } = require("chai")
// TODO why doesn't this work?
// import { expect } from "chai"

// Reference:
// https://ethereum-waffle.readthedocs.io/en/latest/matchers.html

describe("TwoThirds contract", () => {
  it("should deploy correctly", async () => {
    const factory = await ethers.getContractFactory("TwoThirds")
    const contract = await factory.deploy()

    expect(await contract.owner()).to.equal(
      "0xc783df8a850f42e7F7e57013759C285caa701eB6"
    )
  })

  it("should allow game creation", async () => {
    const factory = await ethers.getContractFactory("TwoThirds")
    const contract = await factory.deploy()

    const [owner] = await ethers.getSigners()
    const contractWithSigner = contract.connect(owner)

    let gameCount = await contractWithSigner.getGameCount()
    expect(gameCount).to.equal(0)

    await contractWithSigner.createGame("5", "1000000000000000000", "1", "10")

    gameCount = await contractWithSigner.getGameCount()
    expect(gameCount).to.equal(1)

    await contractWithSigner.createGame("5", "1000000000000000000", "1", "10")

    gameCount = await contractWithSigner.getGameCount()
    expect(gameCount).to.equal(2)

    const gameData = await contractWithSigner.getUserGames()
    const [gameIds, winners] = gameData
    console.log({ gameIds, winners })
  })

  it("should allow bid submission", async () => {
    const factory = await ethers.getContractFactory("TwoThirds")
    const contract = await factory.deploy()

    const [owner, account] = await ethers.getSigners()
    const contractWithOwnerSigner = contract.connect(owner)
    const contractWithAccountSigner = contract.connect(account)

    await contractWithOwnerSigner.createGame(
      "5",
      "1000000000000000000",
      "1",
      "10"
    )

    expect(
      ethers.utils.formatEther(
        await ethers.provider.getBalance(contract.address)
      )
    ).to.equal("0.0")

    let gameBidCount = await contractWithAccountSigner.getGameBidCount("0")
    expect(gameBidCount).to.equal(0)

    await expect(
      contractWithAccountSigner.submitBid("0", "3", {
        value: ethers.utils.parseEther("1.0"),
      })
    )
      .to.emit(contract, "SubmitBid")
      .withArgs(0, 3, account._address, ethers.utils.parseEther("1.0"))

    gameBidCount = await contractWithAccountSigner.getGameBidCount("0")
    expect(gameBidCount).to.equal(1)

    expect(
      ethers.utils.formatEther(
        await ethers.provider.getBalance(contract.address)
      )
    ).to.equal("1.0")
  })

  it("should not allow bid: value too low", async () => {
    const factory = await ethers.getContractFactory("TwoThirds")
    const contract = await factory.deploy()

    const [owner, account] = await ethers.getSigners()
    const contractWithOwnerSigner = contract.connect(owner)
    const contractWithAccountSigner = contract.connect(account)

    await contractWithOwnerSigner.createGame(
      "5",
      "1000000000000000000",
      "1",
      "10"
    )

    let gameBidCount = await contractWithAccountSigner.getGameBidCount("0")
    expect(gameBidCount).to.equal(0)

    await expect(
      contractWithAccountSigner.submitBid("0", "1", {
        value: ethers.utils.parseEther("0.5"),
      })
    ).to.be.revertedWith(
      "VM Exception while processing transaction: revert You did not send enough ETH."
    )
  })

  it("should not allow bid: bid too low", async () => {
    const factory = await ethers.getContractFactory("TwoThirds")
    const contract = await factory.deploy()

    const [owner, account] = await ethers.getSigners()
    const contractWithOwnerSigner = contract.connect(owner)
    const contractWithAccountSigner = contract.connect(account)

    await contractWithOwnerSigner.createGame(
      "5",
      "1000000000000000000",
      "1",
      "10"
    )

    let gameBidCount = await contractWithAccountSigner.getGameBidCount("0")
    expect(gameBidCount).to.equal(0)

    await expect(
      contractWithAccountSigner.submitBid("0", "0", {
        value: ethers.utils.parseEther("1.0"),
      })
    ).to.be.revertedWith(
      "VM Exception while processing transaction: revert Bid is too low."
    )
  })

  it("should not allow bid: bid too high", async () => {
    const factory = await ethers.getContractFactory("TwoThirds")
    const contract = await factory.deploy()

    const [owner, account] = await ethers.getSigners()
    const contractWithOwnerSigner = contract.connect(owner)
    const contractWithAccountSigner = contract.connect(account)

    await contractWithOwnerSigner.createGame(
      "5",
      "1000000000000000000",
      "1",
      "10"
    )

    let gameBidCount = await contractWithAccountSigner.getGameBidCount("0")
    expect(gameBidCount).to.equal(0)

    await expect(
      contractWithAccountSigner.submitBid("0", "100", {
        value: ethers.utils.parseEther("1.0"),
      })
    ).to.be.revertedWith(
      "VM Exception while processing transaction: revert Bid is too high."
    )
  })

  it("should not allow bid: invalid game", async () => {
    const factory = await ethers.getContractFactory("TwoThirds")
    const contract = await factory.deploy()

    const [owner, account] = await ethers.getSigners()
    const contractWithOwnerSigner = contract.connect(owner)
    const contractWithAccountSigner = contract.connect(account)

    await contractWithOwnerSigner.createGame(
      "5",
      "1000000000000000000",
      "1",
      "10"
    )

    let gameBidCount = await contractWithAccountSigner.getGameBidCount("0")
    expect(gameBidCount).to.equal(0)

    await expect(
      contractWithAccountSigner.submitBid("1", "5", {
        value: ethers.utils.parseEther("1.0"),
      })
    ).to.be.revertedWith(
      "VM Exception while processing transaction: revert Game doesn't exist."
    )
  })

  it("should not allow bid: closed game", async () => {
    const factory = await ethers.getContractFactory("TwoThirds")
    const contract = await factory.deploy()

    const [owner, account] = await ethers.getSigners()
    const contractWithOwnerSigner = contract.connect(owner)
    const contractWithAccountSigner = contract.connect(account)

    await contractWithOwnerSigner.createGame(
      "2",
      "1000000000000000000",
      "1",
      "10"
    )

    let gameBidCount = await contractWithAccountSigner.getGameBidCount("0")
    expect(gameBidCount).to.equal(0)

    await contractWithAccountSigner.submitBid("0", "3", {
      value: ethers.utils.parseEther("1.0"),
    })
    await contractWithAccountSigner.submitBid("0", "3", {
      value: ethers.utils.parseEther("1.0"),
    })

    await expect(
      contractWithAccountSigner.submitBid("0", "3", {
        value: ethers.utils.parseEther("1.0"),
      })
    ).to.be.revertedWith(
      "VM Exception while processing transaction: revert Game is closed."
    )
  })

  it.only("should complete a game", async () => {
    const factory = await ethers.getContractFactory("TwoThirds")
    const contract = await factory.deploy()

    const [owner, account] = await ethers.getSigners()
    const contractWithOwnerSigner = contract.connect(owner)
    const contractWithAccountSigner = contract.connect(account)

    await contractWithOwnerSigner.createGame(
      "5",
      "1000000000000000000",
      "1",
      "10"
    )

    // Submit bids to game w/ gameId `0`
    await contractWithAccountSigner.submitBid("0", "3", {
      value: ethers.utils.parseEther("1.0"),
    })
    await contractWithAccountSigner.submitBid("0", "3", {
      value: ethers.utils.parseEther("1.0"),
    })
    await contractWithAccountSigner.submitBid("0", "3", {
      value: ethers.utils.parseEther("1.0"),
    })
    await contractWithAccountSigner.submitBid("0", "3", {
      value: ethers.utils.parseEther("1.0"),
    })
    await contractWithAccountSigner.submitBid("0", "3", {
      value: ethers.utils.parseEther("1.0"),
    })

    const userBids = await contractWithAccountSigner.getGameUserBids("0")
    expect(userBids.length).to.equal(5)

    expect(
      ethers.utils.formatEther(
        await ethers.provider.getBalance(contract.address)
      )
    ).to.equal("5.0")

    const twoThirdsAvg = await contractWithAccountSigner.calculateGameTwoThirdsAverage(
      "0"
    )
    expect(twoThirdsAvg.toNumber()).to.equal(2.0)

    await expect(contractWithAccountSigner.calculateGameWinner("0"))
      .to.emit(contract, "CompleteGame")
      .withArgs(0, 5, ethers.utils.parseEther("1.0"), 1, 10, account._address)
    const winner = await contractWithAccountSigner.getGameWinner("0")

    expect(winner).to.equal(account._address)

    // Query games
    const [gameIds, winners] = await contractWithAccountSigner.getUserGames()
    const games = []

    for (i = 0; i < gameIds.length; i++) {
      const game = {
        id: gameIds[i],
        winner: winners[i],
      }
      games.push(game)
    }

    expect(games[0].id.toNumber()).to.equal(0)
    expect(games[0].winner).to.equal(account._address)

    const gameData = await contractWithAccountSigner.getGameData("0")
    expect(gameData.bidCount.toNumber()).to.equal(5)
    expect(gameData.maxBids.toNumber()).to.equal(5)
    expect(ethers.utils.formatEther(gameData.bidCost)).to.equal("1.0")
    expect(gameData.minBidValue.toNumber()).to.equal(1)
    expect(gameData.maxBidValue.toNumber()).to.equal(10)
    expect(gameData.winner).to.equal(account._address)
  })
})
