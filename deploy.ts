import { ContractFactory, JsonRpcProvider, Wallet } from 'ethers';
import { strict } from 'assert';
import { readFile } from 'fs/promises';
import 'dotenv/config';

const provider = new JsonRpcProvider('http://127.0.0.1:8545/');

const main = async () => {
  strict(process.env.PRIVATE_KEY, 'must set PRIVATE_KEY');

  const deployer = new Wallet(process.env.PRIVATE_KEY, provider);

  const [abi, binary] = await Promise.all([
    readFile('./SimpleStorage_sol_SimpleStorage.abi', 'utf8'),
    readFile('./SimpleStorage_sol_SimpleStorage.bin', 'utf8'),
  ]);

  const contractFactory = new ContractFactory(abi, binary, deployer);

  const contract = await contractFactory.deploy();
  console.log(contract);
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
