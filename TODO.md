# Smart contract

- Allow smart contract to hold a list of smart contracts
- Figure out how to trigger reveal phase / winner
  - Make it a bounty
  - Have script that pings it every x minutes
  - Have final bid trigger it
- Listen for events
  - New bids
  - Game completions
- Query for state
  - Total number of bids
  - All bids by a given address
  - All games associated with a given address
- Integrate privacy layer - Enigma? - ZKtards?

# Front End -> Smart Contract

First screen: Connect wallet & game explanation

- Connect wallet

  - handle diff network & connect instruction

- Submit bid
- View games by address
- View bids by address
- View bids by game
  Front End
- Connect wallet
- Enter bid
  - Number picker
- Pick from previous games
- Animation states
  - Default game state (showing existing bids)
  - Bid being selected
  - Reveal phase
