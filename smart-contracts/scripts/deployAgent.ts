import {ethers} from "hardhat";

const AGENT_PROMPT = "you are a professional sentiment analyzer";

async function main() {
  const oracleAddress: string = "0x4168668812C94a3167FCd41D12014c5498D74d7e"
  console.log()

  await deployAgent(oracleAddress);
  console.log()

}


async function deployAgent(oracleAddress: string) {
  const agent = await ethers.deployContract(
    "Agent",
    [
      oracleAddress,
      AGENT_PROMPT
    ], {});

  await agent.waitForDeployment();

  console.log(
    `Agent deployed to ${agent.target}`
  );
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
