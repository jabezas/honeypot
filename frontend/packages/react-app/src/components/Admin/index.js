import React from "react"
import { ethers } from "ethers"
import styled from "styled-components"

import Header from "../Header/index.js"
import Footer from "../Footer/index.js"
import artifacts from "../../artifacts.json"

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

const Page = styled.div`
  padding: 5rem 10rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
`

const Label = styled.label`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1rem;

  span {
    margin-bottom: 0.4rem;
  }
`

const Button = styled.button`
  max-width: 200px;
`
class Admin extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      appNetwork: "31337", // TODO change once deployed
      userNetwork: "",
      address: "",
      isOwner: false,
      balance: "",
      provider: {},
      gameCount: "",
      // form data
      newGameMaxBids: "",
      newGameBidCost: "",
      newGameMinBidValue: "",
      newGameMaxBidValue: "",
    }
  }

  async componentDidMount() {
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

    const owner = await contract.owner()
    const isOwner = address === owner.toLowerCase()

    const gameCountBN = await contract.getGameCount()
    const gameCount = gameCountBN.toNumber()

    this.setState({
      address,
      isOwner,
      balance,
      provider,
      gameCount,
      contract,
      userNetwork,
    })
  }

  async createGame() {
    let tx

    try {
      tx = await this.state.contract.createGame(
        this.state.newGameMaxBids,
        ethers.utils.parseEther(this.state.newGameBidCost),
        this.state.newGameMinBidValue,
        this.state.newGameMaxBidValue
      )
    } catch (e) {
      // TODO toast notification(?)
      if (e.data && e.data.message) {
        const revertMessage = e.data.message.replace(
          "VM Exception while processing transaction: revert ",
          ""
        )
        console.error(e)
        console.error(revertMessage)
      }
      this.setState({
        ...this.state,
        newGameMaxBids: "",
        newGameBidCost: "",
        newGameMinBidValue: "",
        newGameMaxBidValue: "",
      })
      return
    }

    // TODO add pending/loading state
    // Wait until tx is mined
    await tx.wait()

    // TODO should we be saving contract in state? Or instantiate when needed?
    const gameCountBN = await this.state.contract.getGameCount()
    const gameCount = gameCountBN.toNumber()

    this.setState({
      ...this.state,
      gameCount,
      newGameMaxBids: "",
      newGameBidCost: "",
      newGameMinBidValue: "",
      newGameMaxBidValue: "",
    })
  }

  handleInputChange = event => {
    const target = event.target
    this.setState({ ...this.state, [target.name]: target.value })
  }

  handleSubmit = event => {
    event.preventDefault()
    this.createGame()
  }

  render() {
    if (!isMetaMaskInstalled()) {
      return (
        <Page>
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
        </Page>
      )
    }
    if (
      this.state.userNetwork &&
      this.state.userNetwork !== this.state.appNetwork
    ) {
      return (
        <Page>
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
        </Page>
      )
    }
    if (!this.state.isOwner) {
      return (
        <Page>
          <section>
            <h1>Access denied.</h1>
          </section>
        </Page>
      )
    }

    const isFormValid =
      this.state.newGameMaxBids &&
      this.state.newGameBidCost &&
      this.state.newGameMinBidValue &&
      this.state.newGameMaxBidValue

    return (
      <div className="App">
        <Header />
        <Page>
          <section>
            <h1>Admin page</h1>

            <h3>User address:</h3>
            {this.state.address}

            <h3>User balance:</h3>
            {this.state.balance}

            <h3>Game count:</h3>
            {this.state.gameCount}

            <h3>Create new game</h3>
            <Form onSubmit={this.handleSubmit}>
              <Label>
                <span>Number of bids:</span>
                <input
                  type="text"
                  name="newGameMaxBids"
                  value={this.state.newGameMaxBids}
                  onChange={this.handleInputChange}
                  placeholder="Max bids..."
                ></input>
              </Label>
              <Label>
                <span>Bid cost (ETH):</span>
                <input
                  type="text"
                  name="newGameBidCost"
                  value={this.state.newGameBidCost}
                  onChange={this.handleInputChange}
                  placeholder="Bid cost..."
                ></input>
              </Label>
              <Label>
                <span>Minimum bid value:</span>
                <input
                  type="text"
                  name="newGameMinBidValue"
                  value={this.state.newGameMinBidValue}
                  onChange={this.handleInputChange}
                  placeholder="Min bid value..."
                ></input>
              </Label>

              <Label>
                <span>Maximum bid value:</span>
                <input
                  type="text"
                  name="newGameMaxBidValue"
                  value={this.state.newGameMaxBidValue}
                  onChange={this.handleInputChange}
                  placeholder="Max bid value..."
                ></input>
              </Label>
              <Button disabled={!isFormValid}>Create</Button>
            </Form>
          </section>
        </Page>
        <Footer />
      </div>
    )
  }
}

export default Admin
