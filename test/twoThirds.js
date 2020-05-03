const { expect } = require("chai")
// TODO why doesn't this work?
// import { expect } from "chai"

describe("TwoThirds contract", () => {
  it("should deploy correctly", async () => {
    const TwoThirds = await ethers.getContractFactory("TwoThirds")
    const game = await TwoThirds.deploy()

    expect(await game.owner()).to.equal(
      "0xc783df8a850f42e7F7e57013759C285caa701eB6"
    )
  })

  // TODO test bidding with value too low fails
  it("should allow bid submission", async () => {
    const TwoThirds = await ethers.getContractFactory("TwoThirds")
    const game = await TwoThirds.deploy()

    const [firstAccount] = await ethers.getSigners()
    let contractWithSigner = game.connect(firstAccount)

    await contractWithSigner.submitBid("3", {
      value: ethers.utils.parseEther("1.0"),
    })

    const contractBalance = await ethers.provider.getBalance(game.address)
    expect(ethers.utils.formatEther(contractBalance)).to.equal("1.0")

    const bidCount = await contractWithSigner.getBidCount()
    expect(bidCount).to.equal(1)

    const getUserBids = await contractWithSigner.getUserBids()
    expect(getUserBids[0]).to.equal(3)
  })

  // TODO write test for multiple particpants

  it.only("should complete auction", async () => {
    const TwoThirds = await ethers.getContractFactory("TwoThirds")
    const game = await TwoThirds.deploy()

    const [firstAccount] = await ethers.getSigners()
    let contractWithSigner = game.connect(firstAccount)

    await contractWithSigner.submitBid("3", {
      value: ethers.utils.parseEther("1.0"),
    })
    await contractWithSigner.submitBid("3", {
      value: ethers.utils.parseEther("1.0"),
    })
    await contractWithSigner.submitBid("3", {
      value: ethers.utils.parseEther("1.0"),
    })
    await contractWithSigner.submitBid("3", {
      value: ethers.utils.parseEther("1.0"),
    })
    await contractWithSigner.submitBid("3", {
      value: ethers.utils.parseEther("1.0"),
    })

    expect(
      ethers.utils.formatEther(await ethers.provider.getBalance(game.address))
    ).to.equal("5.0")

    const twoThirdsAvg = await contractWithSigner.calculateTwoThirdsAverage()
    expect(twoThirdsAvg.toNumber()).to.equal(2.0)

    const winner = await contractWithSigner.calculateWinner()
    expect(winner).to.equal(firstAccount._address)
  })
})
