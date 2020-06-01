# Honeypot

## Installation

Ensure your development environment is ready. Follow [these instructions to check](https://buidler.dev/tutorial/setting-up-the-environment.html). We recommend node v10.19 (v12.14 didn't work w/ create-eth-app).

Clone this repository and run `yarn`. Also cd into `frontend` and run `yarn`.

## Development

This project uses [buidler](https://buidler.dev/). See available commands by running `npx buidler`.

### Local development

1. [Create a local Ethereum network](https://buidler.dev/buidler-evm/):

`yarn start:node`

2. Deploy contracts to the local network:

`yarn deploy:local`

3. Start the frontend app:

`yarn start:app`

4. In your browser, connect MetaMask to your local Ethereum network:

- Select `http://127.0.0.1:8545` from the MetaMask network dropdown

- Import an account generated by Buidler EVM (in step 1) using the private key (output from the terminal)

### Testing

Run `yarn test` to run the test suite.