import { ContractFactory, JsonRpcProvider, Wallet } from 'ethers';
import { strict } from 'assert';
import { readFile } from 'fs/promises';
import 'dotenv/config';
import abi from './SimpleStorage_sol_SimpleStorage.json';

// local hardhat network
// const provider = new JsonRpcProvider('http://127.0.0.1:8545/');

// infura sepolia testnet
const provider = new JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`);

const main = async () => {
  strict(process.env.PRIVATE_KEY, 'must set PRIVATE_KEY');

  // for more robust security
  // Wallet.fromEncryptedJson can be used
  const deployer = new Wallet(process.env.PRIVATE_KEY, provider);

  const binary = await readFile(
    './SimpleStorage_sol_SimpleStorage.bin',
    'utf8'
  );

  /**
   * Deploying using contract factory
   */

  const contractFactory = new ContractFactory<typeof abi>(
    abi,
    binary,
    deployer
  );

  const contract = await contractFactory.deploy();
  console.log('contract', contract);

  // wait for 1 block to confirm
  const deploymentReceipt = await contract.deploymentTransaction()?.wait(1);
  console.log('deploymentReceipt', deploymentReceipt);

  // /**
  //  * Deploying using only the tx data
  //  */

  // const [nonce, network] = await Promise.all([
  //   deployer.getNonce(),
  //   provider.getNetwork(),
  // ]);

  // const txParams = {
  //   nonce,
  //   gasPrice: 1522031607n,
  //   gasLimit: 1e6,
  //   to: null,
  //   value: 0,
  //   data: `0x${binary}`,
  //   chainId: network.chainId,
  // };

  // console.log('TX params:', txParams);

  // // also signing behind the scene
  // const txResponse = await deployer.sendTransaction(txParams);
  // console.log('TX response:', txResponse);

  // const txReceipt = await txResponse.wait();
  // console.log('TX receipt:', txReceipt);

  /**
   * Interacting with the contract
   *
   * p.s. for some reason, autocomplete by TypeScript is not working
   */

  const currentFavoriteNumber = await (contract as any).retrieve();
  console.log('currentFavoriteNumber', currentFavoriteNumber);

  const storeTxResponse = await (contract as any).store(50n);
  const storeTxReceipt = await storeTxResponse.wait(1);

  const newFavoriteNumber = await (contract as any).retrieve();
  console.log('newFavoriteNumber', newFavoriteNumber);
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
