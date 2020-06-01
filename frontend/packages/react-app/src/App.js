import React from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import styled from "styled-components"
import { ethers } from "ethers"

import Home from "./components/Home"
import Admin from "./components/Admin"
import Game from "./components/Game"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { Section } from "./components/SharedStyledComponents"

import artifacts from "./artifacts.json"

const Page = styled.div`
  padding: 5rem 10rem;
  display: flex;
`

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
      userAddress: "",
      userBalance: "",
      provider: {},
      contract: {},
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
    const userAddress = ethereum.selectedAddress
    let userBalance = await provider.getBalance(userAddress)
    userBalance = ethers.utils.formatEther(userBalance)

    // connect the contract with a signer, which allows update methods
    // vs. connecting via a Provider, which provides read-only access
    const contract = new ethers.Contract(
      artifacts.TwoThirds.address,
      artifacts.TwoThirds.abi,
      provider.getSigner()
    )

    this.setState({
      userNetwork,
      userAddress,
      userBalance,
      provider,
      contract,
    })
  }

  render() {
    if (!isMetaMaskInstalled()) {
      return (
        <Section>
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
        </Section>
      )
    }
    if (
      this.state.userNetwork &&
      this.state.userNetwork !== this.state.appNetwork
    ) {
      return (
        <Section>
          <h1>Hey there!</h1>
          <h2>
            Your Ethereum network is currently set to the "
            {networkMap[this.state.userNetwork]}".
          </h2>
          <h2>
            You must change your network to "{networkMap[this.state.appNetwork]}
            " in order to use this app.
          </h2>
        </Section>
      )
    }
    // Loading until contract is initialized
    // TODO this is held up on fetching user balance... move that to header
    if (Object.keys(this.state.contract).length === 0) {
      return (
        <Section>
          <h1>Initializing...</h1>
        </Section>
      )
    }

    return (
      <Router>
        <Header
          userAddress={this.state.userAddress}
          userBalance={this.state.userBalance}
        />
        <Page>
          <Switch>
            <Route path="/admin">
              <Admin
                contract={this.state.contract}
                userAddress={this.state.userAddress}
              />
            </Route>
            <Route
              path="/:id"
              children={<Game contract={this.state.contract} />}
            />
            <Route path="/">
              <Home
                contract={this.state.contract}
                userAddress={this.state.userAddress}
              />
            </Route>
          </Switch>
        </Page>
        <Footer />
      </Router>
    )
  }
}

export default App
