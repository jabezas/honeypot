import React from "react"
import { ethers } from "ethers"
import styled from "styled-components"

import { Section } from "../SharedStyledComponents"

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
      isOwner: false,
      games: [],
      // form data
      newGameMaxBids: "",
      newGameBidCost: "",
      newGameMinBidValue: "",
      newGameMaxBidValue: "",
    }
  }

  async componentDidMount() {
    const owner = await this.props.contract.owner()
    const isOwner = this.props.userAddress === owner.toLowerCase()

    const gamesData = await this.props.contract.getAllGames()
    const [gameIds, winners] = gamesData
    const games = gameIds.map(id => {
      return {
        id: id.toNumber(),
        winner: winners[id],
      }
    })

    this.setState({
      isOwner,
      games,
    })
  }

  async createGame() {
    let tx

    try {
      tx = await this.props.contract.createGame(
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
    const gamesData = await this.props.contract.getAllGames()
    const [gameIds, winners] = gamesData
    const games = gameIds.map(id => {
      return {
        id: id.toNumber(),
        winner: winners[id],
      }
    })

    // TODO for each game, fetch gameData

    this.setState({
      ...this.state,
      games,
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
    if (!this.state.isOwner) {
      return (
        <Section>
          <h1>Access denied.</h1>
        </Section>
      )
    }

    const isFormValid =
      this.state.newGameMaxBids &&
      this.state.newGameBidCost &&
      this.state.newGameMinBidValue &&
      this.state.newGameMaxBidValue

    return (
      <div>
        <Section>
          <h1>Admin page</h1>

          <h3>Game count:</h3>
          {this.state.games.length}

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
        </Section>
        <Section>
          <h3>View games</h3>
          <ul>
            {this.state.games.map(game => {
              return (
                <li key={game.id}>
                  Game {game.id} winner: {game.winner}
                </li>
              )
            })}
          </ul>
        </Section>
      </div>
    )
  }
}

export default Admin
