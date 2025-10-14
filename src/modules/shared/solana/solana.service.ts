// src/solana/solana.service.ts
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import { SOLANA_CONNECTION } from './solana.constants'

@Injectable()
export class SolanaService {
  private readonly contractAddress: PublicKey

  constructor(
    @Inject(SOLANA_CONNECTION) private readonly connection: Connection,
    private readonly configService: ConfigService
  ) {
    const contractAddress = this.configService.get<string>(
      'SOLANA_CONTRACT_ADDRESS'
    )
    if (!contractAddress) {
      throw new Error('SOLANA_CONTRACT_ADDRESS is not defined in .env')
    }
    this.contractAddress = new PublicKey(contractAddress)
  }

  /**
   * 获取 Solana 连接实例
   */
  getConnection(): Connection {
    return this.connection
  }

  /**
   * 获取合约地址
   */
  getContractAddress(): PublicKey {
    return this.contractAddress
  }

  /**
   * 测试与 Solana 网络的连接
   */
  async testConnection(): Promise<string> {
    try {
      const version = await this.connection.getVersion()
      return `Successfully connected to Solana network. Version: ${version['solana-core']}`
    } catch (error) {
      throw new Error(`Failed to connect to Solana network: ${error.message}`)
    }
  }

  /**
   * 示例方法：获取账户余额
   * @param publicKey 账户的公钥
   */
  async getBalance(publicKey: string): Promise<number> {
    try {
      const pubKey = new PublicKey(publicKey)
      const balance = await this.connection.getBalance(pubKey)
      return balance / 1e9 // 转换为 SOL 单位（1 SOL = 10^9 lamports）
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.message}`)
    }
  }

  /**
   * 示例方法：发送 SOL 交易
   * @param toPublicKey 接收方的公钥
   * @param amount 要发送的 SOL 数量
   */
  async sendSol(toPublicKey: string, amount: number): Promise<string> {
    const privateKey = this.configService.get<string>('SOLANA_PRIVATE_KEY')
    if (!privateKey) {
      throw new Error('SOLANA_PRIVATE_KEY is not defined in .env')
    }

    try {
      const fromKeypair = Keypair.fromSecretKey(
        Buffer.from(privateKey, 'base64')
      )
      const toPubKey = new PublicKey(toPublicKey)
      const lamports = amount * 1e9 // 转换为 lamports

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toPubKey,
          lamports,
        })
      )

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [fromKeypair]
      )
      return signature
    } catch (error) {
      throw new Error(`Failed to send SOL: ${error.message}`)
    }
  }

  // TODO: 添加与你的 Solana 合约交互的具体方法
  // async callContractMethod(params: any): Promise<any> {
  //   // 在这里实现与你的 Solana 程序（合约）的交互逻辑
  //   // 使用 @solana/web3.js 和你的程序 IDL
  // }
}
