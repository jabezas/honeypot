const { expect } = require("chai")

describe("Greeting contract", function () {
  xit("should deploy correctly", async function () {
    const Greeter = await ethers.getContractFactory("Greeter")

    const greeter = await Greeter.deploy("Hello world!")
    expect(await greeter.greet()).to.equal("Hello world!")
  })

  xit("should set greeting", async function () {
    // TODO are contracts destroyed before every test?
    const Greeter = await ethers.getContractFactory("Greeter")

    const greeter = await Greeter.deploy("Hello world!")
    expect(await greeter.greet()).to.equal("Hello world!")

    await greeter.setGreeting("Goodbye")
    expect(await greeter.greet()).to.equal("Goodbye")
  })
})
