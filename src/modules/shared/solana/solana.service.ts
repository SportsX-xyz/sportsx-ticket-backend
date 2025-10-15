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
import { TicketingProgram } from './types/ticketing-program'
import { Program, BN } from '@coral-xyz/anchor'
import * as anchor from '@coral-xyz/anchor'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class SolanaService {
  private readonly connection: Connection
  private readonly platformAuthority: PublicKey
  private readonly program: Program<TicketingProgram>
  private readonly provider: anchor.AnchorProvider
  private readonly platformConfigPDA: PublicKey

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.provider = anchor.AnchorProvider.env()
    anchor.setProvider(this.provider)

    this.program = anchor.workspace
      .TicketingProgram as Program<TicketingProgram>
    this.connection = this.provider.connection
    this.platformAuthority = this.provider.wallet.publicKey

    // Derive platform config PDA
    const [platformConfigPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('PLATFORM_CONFIG')],
      this.program.programId
    )
    this.platformConfigPDA = platformConfigPDA
  }

  async createEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    })
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: event.customerId,
      },
    })
    const merchantPublicKey = new PublicKey(customer.walletId)
    console.log('1')
    const [eventPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('EVENT'), Buffer.from(eventId.replace(/-/g, ''))],
      this.program.programId
    )
    console.log('2')

    const tx = await this.program.methods
      .createEvent(
        eventId.replace(/-/g, ''),
        event.ipfsUri,
        merchantPublicKey,
        event.name,
        event.symbol,
        new BN(event.endTime.getTime() / 1000) // tomorrow
      )
      .accounts({
        payer: this.provider.wallet.publicKey,
        // @ts-ignore
        event: eventPDA,
        platformConfig: this.platformConfigPDA,
        platformAuthority: this.platformAuthority,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    console.log('3')
    if (tx) {
      return await this.prisma.event.update({
        where: {
          id: eventId,
        },
        data: {
          solanaTxHash: tx,
          solanaEventAddress: eventPDA.toBase58(),
        },
      })
    }
    return event

    // console.log('Event created:', tx)
    // console.log('eventPDA', eventPDA)
    // const eventInfo = await this.program.account.events.fetch(eventPDA)
    // console.log('Event created:', eventInfo)
  }

  /**
   * 获取 Solana 连接实例
   */
  getConnection(): Connection {
    return this.connection
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
}
