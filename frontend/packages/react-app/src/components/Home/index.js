import React from "react"
import { Link } from "react-router-dom"

import { Section } from "../SharedStyledComponents"

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      games: [],
    }
  }

  async componentDidMount() {
    const [gameIds, winners] = await this.props.contract.getAllGames()
    const games = gameIds.map(id => {
      return {
        id: id.toNumber(),
        winner: winners[id],
      }
    })

    this.setState({
      games,
    })
  }

  render() {
    return (
      <Section>
        <h1>Welcome to Honeypot!</h1>
        <p>We're glad to have you here, {this.props.userAddress}</p>
        <h3>Games:</h3>
        <ul>
          {this.state.games.map(game => {
            return (
              <li key={game.id}>
                <Link to={`/${game.id}`}>Game #{game.id}</Link>
              </li>
            )
          })}
        </ul>
      </Section>
    )
  }
}

export default Home
