# Smart contract

- How to manage new game creation?
  - Allow smart contract to hold a list of smart contracts?
  
- Figure out how to trigger reveal phase / winner
  - Make it a bounty
  - Have script that pings it every x minutes
  - Have final bid trigger it
- Params to set on new game creation?
  - Total # of bids allowed for the game
  - Cost per bid (i.e. set to something other than 1 ETH?)
  - Min & max bid (i.e. set to something other than 1 - 100?)
    - How to handle duplicate bids?
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

App routing
- Home page
  - List of all open games? Click into "game detail" view?
  - List of all games user had submitted bids
- Game page
  - Game details: # of total bids, # of bids submitted, cost per bid, min & max valid bid values
  - Form / UI interaction to submit a bid (triggering a MetaMask transaction)
- Admin page
  - Form to create new games (triggering a MetaMask transaction)
  - List of all games
  - List of all games that are completed & need to calculate a winner?


