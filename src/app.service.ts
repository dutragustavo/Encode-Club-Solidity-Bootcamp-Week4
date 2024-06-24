import { Injectable } from '@nestjs/common';
import { Address, createPublicClient, createWalletClient, formatUnits, http } from 'viem';
import { sepolia } from 'viem/chains';
import * as tokenJson from './assets/MyToken.json'
import { ConfigService } from '@nestjs/config';
import { privateKeyToAccount } from 'viem/accounts';


@Injectable()
export class AppService {
  publicClient;
  walletClient;
  constructor(private configService: ConfigService) {
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(this.configService.get<string>('RPC_ENDPOINT_URL')),
    });

    this.walletClient = createWalletClient({
        account: privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`),
        chain: sepolia,
        transport: http(this.configService.get<string>('RPC_ENDPOINT_URL')),
    });
  }

  getHello(): string {
    return 'Hello World!';
  }

  getContractAddress(): Address {
    return `0x${process.env.TOKEN_ADDRESS}`;
  }

  async getTokenName(): Promise<any> {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(process.env.RPC_ENDPOINT_URL),
    });
    const name = await publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: "name"
    });
    return name;
  }

  async getTotalSupply() {
    const supply = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'totalSupply',
    });

    const symbol = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'symbol'
    })

    const decimals = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'decimals'
    })

    const supplyString = `${formatUnits(supply, decimals)} ${symbol}`;
    return supplyString;
  }

  async getTokenBalance(address: string) {
    const balance = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'balanceOf',
      args: [address],
    });

    const symbol = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'symbol'
    })

    const decimals = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'decimals'
    })

    const balanceString = `${formatUnits(balance, decimals)} ${symbol}`;
    return balanceString;    
  }
  
  getTransactionReceipt(hash: string) {
    return this.publicClient.getTransactionReceipt(hash);
  }

  getServerWalletAddress() {
    return this.walletClient.wallet.address;
  }

  async checkMinterRole(address: string) {
    const MINTER_ROLE = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'MINTER_ROLE',
    });

    const hasRole = await this.publicClient.readContract({
    address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'hasRole',
      args: [MINTER_ROLE, address]
    });

    return hasRole
    ? `Address ${address} has Minter Role`
    : `Address ${address} does not have Minter Role`;
  }

  mintTokens(address: any) {
    throw new Error('Method not implemented.');
  }


}
