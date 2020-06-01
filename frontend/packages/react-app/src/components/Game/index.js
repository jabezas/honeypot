import React from "react"
import { withRouter } from "react-router-dom"
import { ethers } from "ethers"

import { Section } from "../SharedStyledComponents"

class Game extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      gameId: this.props.match.params.id, // from react-router
      bidCost: "",
      maxBids: "",
      bidCount: "",
      remainingBids: "",
      minBidValue: "",
      maxBidValue: "",
      userBids: [],
      bid: "",
    }
  }

  async componentDidMount() {
    // TODO error catch for if game doesn't exist
    const gameData = await this.props.contract.getGameData(this.state.gameId)

    const bidCount = gameData.bidCount.toNumber()
    const maxBids = gameData.maxBids.toNumber()
    const remainingBids = maxBids - bidCount

    const bidCost = ethers.utils.formatEther(gameData.bidCost)
    const minBidValue = gameData.minBidValue.toNumber()
    const maxBidValue = gameData.maxBidValue.toNumber()

    // TODO check if winner is not zero address
    // but should probably handle this logic elsewhere
    // to establish if game is already complete

    const userBidsRaw = await this.props.contract.getGameUserBids(
      this.state.gameId
    )
    const userBids = userBidsRaw
      .map(bid => bid.toNumber())
      .filter(bid => bid !== 0)

    // TODO subscribe to bid submission
    // Any bid submission from user address
    // const filter = contract.filters.SubmitBid(null, null)
    // contract.on(filter, async (bid, address, amount) => {
    //   // TODO need amount? Can't convert toNumber()
    //   console.log("BidSumit event: ", bid.toNumber(), address, amount)
    //   // TODO fetch bidCount
    //   const bidCountBN = await contract.getBidCount()
    //   const bidCount = bidCountBN.toNumber()
    //   this.setState({ ...this.state, bidCount })
    // })

    this.setState({
      bidCost,
      bidCount,
      minBidValue,
      maxBidValue,
      maxBids,
      remainingBids,
      userBids,
    })
  }

  async submitBid() {
    let tx

    try {
      tx = await this.props.contract.submitBid(
        this.state.gameId,
        this.state.bid,
        {
          value: ethers.utils.parseEther("1.0"),
        }
      )
    } catch (e) {
      // TODO toast notification(?) that auction is closed?
      // OR just disable bid submission functionality once remainingBids === 0?
      if (e.data && e.data.message) {
        const revertMessage = e.data.message.replace(
          "VM Exception while processing transaction: revert ",
          ""
        )
        console.error(e)
        console.error(revertMessage)
      }
      this.setState({ ...this.state, bid: "" })
      return
    }

    // TODO add pending/loading state
    // Wait until tx is mined
    await tx.wait()

    // TODO should we be saving contract in state? Or instantiate when needed?
    const gameData = await this.props.contract.getGameData(this.state.gameId)

    const bidCount = gameData.bidCount.toNumber()
    const remainingBids = this.state.maxBids - bidCount

    // TODO best way fetch this?
    const userBidsRaw = await this.props.contract.getGameUserBids(
      this.state.gameId
    )
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
    return (
      <Section>
        <h1>Welcome to game #{this.state.gameId}</h1>
        <h3>Bid cost:</h3>
        {this.state.bidCost}
        <h3>Min bid value:</h3>
        {this.state.minBidValue}
        <h3>Max bid value:</h3>
        {this.state.maxBidValue}
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
      </Section>
    )
  }
}

export default withRouter(Game)
