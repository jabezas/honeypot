import { ethers } from "@nomiclabs/buidler"
import { readArtifact } from "@nomiclabs/buidler/plugins"
import fs from "fs"

async function main() {
  const factory = await ethers.getContract("TwoThirds")
  const contract = await factory.deploy()

  // The address the Contract will have once mined
  console.log("Contract address: ", contract.address)

  // The transaction that was sent to the network to deploy the Contract
  console.log("Deploy transaction: ", contract.deployTransaction.hash)

  // Wait until the contract it is mined
  await contract.deployed()

  const projectDir = __dirname.split("/").slice(0, -1).join("/")
  const artifactsDir = projectDir + "/artifacts/"
  const artifact = await readArtifact(artifactsDir, "TwoThirds")

  // Save the address & abi to access it from the frontend
  fs.writeFileSync(
    __dirname + "/../frontend/packages/react-app/src/artifacts.json",
    JSON.stringify(
      { TwoThirds: { address: contract.address, abi: artifact.abi } },
      undefined,
      2
    )
  )
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error)
    process.exit(1)
  })
