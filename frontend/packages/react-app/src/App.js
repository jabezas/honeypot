import React from "react"
import { ethers } from "ethers"

import Header from "./components/Header/index.js"
import "./App.css"
import artifacts from "./artifacts.json"

const isMetaMaskInstalled = () => {
  const { ethereum } = window
  return Boolean(ethereum && ethereum.isMetaMask)
}

const networkMap = {
  "1": "Main Ethereum Network",
  "2": "Morden Test network",
  "3": "Ropsten Test Network",
  "4": "Rinkeby Test Network",
  "5": "Goerli Test Network",
  "42": "Kovan Test Network",
  "31337": "Localhost 8545",
}
class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      appNetwork: "31337", // TODO change once deployed
      userNetwork: "",
      address: "",
      bidCount: "",
      maxBids: "",
      remainingBids: "",
      userBids: [],
      bid: "",
      balance: "",
      provider: {},
    }
  }

  async componentDidMount() {
    // TODO fail gracefully if contract not deployed

    const { ethereum } = window
    if (ethereum === undefined) {
      return
    }

    // I believe we want to `ethereum`for this? Looks like window.web3 will stop being injected by 8/31/20:
    // https://github.com/MetaMask/metamask-extension/issues/8077#issuecomment-622191567
    // const provider = await new ethers.providers.Web3Provider(ethereum)
    const provider = await new ethers.providers.Web3Provider(
      window.web3.currentProvider
    )

    // TODO when do we want to display this? After onboarding?
    // TODO updated, this is deprecated:
    // https://docs.metamask.io/guide/ethereum-provider.html#methods-new-api
    await ethereum.enable()

    // Check user's Ethereum network
    // TODO update, this is deprecated:
    // https://docs.metamask.io/guide/ethereum-provider.html#ethereum-networkversion-deprecated
    // Changing network will no longer reload the page
    // Use `chainChanged`? OR ether.js's getNetwork()?
    const userNetwork = ethereum.networkVersion
    if (userNetwork !== this.state.appNetwork) {
      this.setState({ ...this.state, userNetwork })
      return
    }

    // TODO update, this is deprecated: https://docs.metamask.io/guide/ethereum-provider.html#ethereum-selectedaddress-deprecated
    // Use provider.getSigner().getAddress() ?
    const address = ethereum.selectedAddress
    let balance = await provider.getBalance(address)
    balance = ethers.utils.formatEther(balance)

    // connect the contract with a signer, which allows update methods
    // vs. connecting via a Provider, which provides read-only access
    const contract = new ethers.Contract(
      artifacts.TwoThirds.address,
      artifacts.TwoThirds.abi,
      provider.getSigner()
    )

    const bidCountBN = await contract.getBidCount()
    const bidCount = bidCountBN.toNumber()

    const maxBidsBN = await contract.maxBids()
    const maxBids = maxBidsBN.toNumber()

    const remainingBids = maxBids - bidCount

    const userBidsRaw = await contract.getUserBids()
    const userBids = userBidsRaw
      .map(bid => bid.toNumber())
      .filter(bid => bid !== 0)

    // Any bid submission from user address
    const filter = contract.filters.SubmitBid(null, null)
    contract.on(filter, async (bid, address, amount) => {
      // TODO need amount? Can't convert toNumber()
      console.log("BidSumit event: ", bid.toNumber(), address, amount)
      // TODO fetch bidCount
      const bidCountBN = await contract.getBidCount()
      const bidCount = bidCountBN.toNumber()
      this.setState({ ...this.state, bidCount })
    })

    this.setState({
      address,
      balance,
      provider,
      bidCount,
      maxBids,
      remainingBids,
      userBids,
      contract,
      userNetwork,
    })
  }

  async submitBid() {
    let tx

    try {
      tx = await this.state.contract.submitBid(this.state.bid, {
        value: ethers.utils.parseEther("1.0"),
      })
    } catch (e) {
      // TODO toast notification(?) that auction is closed?
      // OR just disable bid submission functionality once remainingBids === 0?
      let revertMessage = e
      if (e.data && e.data.message) {
        revertMessage = e.data.message.replace(
          "VM Exception while processing transaction: revert ",
          ""
        )
      }
      this.setState({ ...this.state, bid: "" })
      return
    }

    // TODO add pending/loading state
    // Wait until tx is mined
    await tx.wait()

    // TODO should we be saving contract in state? Or instantiate when needed?
    const bidCountBN = await this.state.contract.getBidCount()
    const bidCount = bidCountBN.toNumber()

    const remainingBids = this.state.maxBids - bidCount

    // TODO best way fetch this?
    const userBidsRaw = await this.state.contract.getUserBids()
    const userBids = userBidsRaw
      .map(bid => bid.toNumber())
      .filter(bid => bid !== 0)

    this.setState({ ...this.state, bidCount, remainingBids, userBids, bid: "" })
  }

  // TODO only accept integer inputs
  handleInputChange = event => {
    this.setState({ ...this.state, bid: event.target.value })
  }

  handleSubmit = event => {
    event.preventDefault()
    this.submitBid()
  }

  render() {
    if (!isMetaMaskInstalled()) {
      return (
        <div className="App">
          <section>
            <h1>Hey there!</h1>
            <h1>
              You need to{" "}
              <a
                href="https://metamask.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                install MetaMask
              </a>{" "}
              to use this app.
            </h1>
          </section>
        </div>
      )
    }
    if (
      this.state.userNetwork &&
      this.state.userNetwork !== this.state.appNetwork
    ) {
      return (
        <div className="App">
          <section>
            <h1>Hey there!</h1>
            <h2>
              Your Ethereum network is currently set to the "
              {networkMap[this.state.userNetwork]}".
            </h2>
            <h2>
              You must change your network to "
              {networkMap[this.state.appNetwork]}" in order to use this app.
            </h2>
          </section>
        </div>
      )
    }
    return (
      <div className="App">
        <Header />
        <section>
          <h1>Welcome to Honeypot!</h1>
          <h3>User address:</h3>
          {this.state.address}
          <h3>User balance:</h3>
          {this.state.balance}
          <h3>Max bids:</h3>
          {this.state.maxBids}
          <h3>Bid count:</h3>
          {this.state.bidCount}
          <h3>Remaining bids:</h3>
          {this.state.remainingBids}
          <h3>User bids:</h3>
          <ul
            style={{
              display: `flex`,
              flexDirection: `column`,
              alignItems: `center`,
            }}
          >
            {this.state.userBids.map((bid, i) => {
              return <li key={i}>{bid}</li>
            })}
          </ul>

          <h3>Submit bid</h3>
          <form onSubmit={this.handleSubmit}>
            <input
              type="text"
              value={this.state.bid}
              onChange={this.handleInputChange}
              placeholder="New bid..."
            ></input>

            <button>Set</button>
          </form>
        </section>
      </div>
    )
  }
}

export default App
