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
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL,
  TransactionConfirmationStrategy,
} from '@solana/web3.js'
import { TicketingProgram } from './types/ticketing-program'
import { Program, BN } from '@coral-xyz/anchor'
import * as anchor from '@coral-xyz/anchor'
import { PrismaService } from '../prisma/prisma.service'
import { ApiException } from '../../../exceptions/api.exception'
import {
  ERROR_CUSTOMER_NOT_FOUND,
  ERROR_EVENT_NOT_FOUND,
  ERROR_EVENT_TICKET_NOT_FOUND,
} from '../../../constants/error-code'
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token'
import nacl from 'tweetnacl'
import bs58 from 'bs58'

@Injectable()
export class SolanaService {
  private readonly connection: Connection
  private readonly platformAuthority: PublicKey
  private readonly program: Program<TicketingProgram>
  private readonly provider: anchor.AnchorProvider
  private readonly platformConfigPDA: PublicKey
  private readonly backendAuthority: Keypair
  private readonly nonceTracker: PublicKey
  private readonly usdcMint: PublicKey

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    // For sign, 签名算法的思路暂时弃用
    // this.backendAuthority = Keypair.fromSecretKey(
    //   Buffer.from(
    //     this.configService.get<string>('TICKET_AUTHORITY_SECRET'),
    //     'base64'
    //   )
    // )

    this.usdcMint = new PublicKey(this.configService.get<string>('USDC_MINT'))

    this.provider = anchor.AnchorProvider.env()
    anchor.setProvider(this.provider)

    this.program = anchor.workspace
      .TicketingProgram as Program<TicketingProgram>
    this.connection = this.provider.connection
    this.platformAuthority = this.provider.wallet.publicKey

    // Derive platform config PDA
    const [platformConfigPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('platform_config')],
      this.program.programId
    )
    this.platformConfigPDA = platformConfigPDA

    // Derive nonce tracker PDA
    const [nonceTracker] = PublicKey.findProgramAddressSync(
      [Buffer.from('nonce_tracker')],
      this.program.programId
    )
    this.nonceTracker = nonceTracker
  }

  generateSolanaBase64KeyPairByJSONPrivateKey(jsonPrivateKey: string) {
    // 1. 将数字数组转换为 Buffer（字节序列）
    // Buffer.from() 可直接接收 Uint8Array 或数字数组作为参数
    const privateKeyBuffer = Buffer.from(jsonPrivateKey)

    // 2. 将 Buffer 转换为 Base64 编码字符串
    const privateKeyBase64 = privateKeyBuffer.toString('base64')

    return privateKeyBase64
  }

  generateSolanaKeypair() {
    // 生成新的 Solana 密钥对
    const keypair = Keypair.generate()

    // 获取私钥（64 字节）
    const secretKey = keypair.secretKey

    // 转换为 base64 编码
    const base64Secret = Buffer.from(secretKey).toString('base64')

    // 输出结果
    console.log('Public Key:', keypair.publicKey.toBase58())
    console.log('Base64 Secret Key:', base64Secret)
    console.log('Base64 Length:', base64Secret.length)

    return {
      publicKey: keypair.publicKey.toBase58(),
      secretKey: base64Secret,
    }
  }

  async mintPartialSign(userCustomerId: string, ticketId: string) {
    const userCustomer = await this.prisma.customer.findUnique({
      where: {
        id: userCustomerId,
      },
    })

    const ticket = await this.prisma.eventTicket.findUnique({
      where: {
        id: ticketId,
      },
      include: {
        event: true,
      },
    })
    if (!ticket) {
      throw new ApiException(ERROR_EVENT_TICKET_NOT_FOUND)
    }

    const userPublicKey = new PublicKey(userCustomer.walletId)

    const organizerCustomerId = ticket.event.customerId
    const organizerCustomer = await this.prisma.customer.findUnique({
      where: {
        id: organizerCustomerId,
      },
    })
    if (!organizerCustomer) {
      throw new ApiException(ERROR_CUSTOMER_NOT_FOUND)
    }

    const organizerPublicKey = new PublicKey(organizerCustomer.walletId)

    // Create USDC token accounts using getOrCreate to avoid duplicates
    const platformAta = await getOrCreateAssociatedTokenAccount(
      this.provider.connection,
      this.provider.wallet.payer,
      this.usdcMint,
      this.provider.wallet.publicKey
    )
    const platformUsdcAccount = platformAta.address

    // Create ATA for event organizer (deployer is the organizer in tests)
    const organizerAta = await getOrCreateAssociatedTokenAccount(
      this.provider.connection,
      this.provider.wallet.payer,
      this.usdcMint,
      organizerPublicKey // deployer is set as event.organizer in create_event
    )
    const organizerUsdcAccount = organizerAta.address

    // Create ATAs for buyers using getOrCreate to avoid duplicates
    const buyerAta = await getOrCreateAssociatedTokenAccount(
      this.provider.connection,
      this.provider.wallet.payer,
      this.usdcMint,
      userPublicKey
    )
    const buyerUsdcAccount = buyerAta.address

    const [eventPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('event'), Buffer.from(ticket.event.id.replace(/-/g, ''))],
      this.program.programId
    )

    const [ticketPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('ticket'),
        Buffer.from(ticket.event.id.replace(/-/g, '')),
        Buffer.from(ticketId.replace(/-/g, '')),
      ],
      this.program.programId
    )

    // 获取 recentBlockhash（重要：前端必须在有效期内使用）
    const { blockhash, lastValidBlockHeight } =
      await this.connection.getLatestBlockhash('confirmed')

    // 创建交易
    const tx = new Transaction()
    tx.recentBlockhash = blockhash
    tx.feePayer = userPublicKey

    const purchaseAndMintInstruction = await this.program.methods
      .purchaseTicket(
        ticket.event.id.replace(/-/g, ''),
        ticket.ticketTypeId.replace(/-/g, ''),
        ticket.id.replace(/-/g, ''),
        new BN(ticket.price.toNumber()),
        ticket.rowNumber, // row_number
        ticket.columnNumber // column_number
      )
      .accounts({
        // @ts-ignore
        platformConfig: this.platformConfigPDA,
        backendAuthority: this.provider.wallet.publicKey,
        event: eventPDA,
        ticket: ticketPDA,
        nonceTracker: this.nonceTracker,
        buyer: userPublicKey,
        buyerUsdcAccount: buyerUsdcAccount,
        platformUsdcAccount: platformUsdcAccount,
        organizerUsdcAccount: organizerUsdcAccount,
        usdcMint: this.usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction()

    tx.add(purchaseAndMintInstruction)

    tx.partialSign(this.provider.wallet.payer)

    // 序列化交易消息（不包含签名），供前端部分签名
    const serializedTx = tx
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString('base64')
    // const serializedBlockhash = blockhash
    // const lastValidBlockHeightNum = lastValidBlockHeight

    // 返回给前端的数据
    // const response = {
    //   serializedTransaction: serializedTx,
    //   blockhash: serializedBlockhash,
    //   lastValidBlockHeight: lastValidBlockHeightNum,
    //   usdtMint: usdtMint.toString(),
    //   ticketMint: ticketMint.toString(),
    // }

    return serializedTx
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
    const [eventPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('event'), Buffer.from(eventId.replace(/-/g, ''))],
      this.program.programId
    )

    const now = Math.floor(Date.now() / 1000)
    const tx = await this.program.methods
      .createEvent(
        eventId.replace(/-/g, ''),
        event.ipfsUri,
        new BN(event.startTime.getTime() / 1000),
        new BN(event.endTime.getTime() / 1000),
        new BN(now),
        new BN(event.stopSaleBefore * 60),
        event.resaleFeeRate,
        event.maxResaleTimes
      )
      .accounts({
        // @ts-ignore
        platformConfig: this.platformConfigPDA,
        event: eventPDA,
        organizer: this.platformAuthority,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

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

  async verifyTransaction(txHash: string) {
    const userAddress = 'DMM8kr6jQkGF4ff5sDSQ9bjyZCgERCtJPXTgvpsj9LCK'
    const tx = await this.connection.getTransaction(txHash, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    })

    const customerPubkey = new PublicKey(userAddress)
    console.log(tx.transaction.message.staticAccountKeys)
    const isSigner = tx.transaction.message.staticAccountKeys.some((key) =>
      key.equals(customerPubkey)
    )
    console.log('isSigner', isSigner)
    // return tx
  }

  signPurchaseAuthorization(
    buyerCustomerId: string,
    ticketTypeId: string,
    ticketUuid: string, // Backend-generated UUID (standard UUID format)
    maxPrice: bigint,
    validUntil: bigint,
    nonce: bigint,
    ticketPda?: string, // For resale, specify the ticket being purchased
    rowNumber: number = 0, // Seat row (0 for general admission)
    columnNumber: number = 0 // Seat column (0 for general admission)
  ) {
    const buyerPublicKey = new PublicKey(buyerCustomerId)
    // 序列化消息（必须与合约中的顺序完全一致）
    const parts: Buffer[] = [
      buyerPublicKey.toBuffer(), // 32 bytes
      Buffer.from(ticketTypeId), // variable
      Buffer.from(ticketUuid), // variable (36 bytes for standard UUID)
      Buffer.from(new BigUint64Array([maxPrice]).buffer), // 8 bytes LE
      Buffer.from(new BigInt64Array([validUntil]).buffer), // 8 bytes LE
      Buffer.from(new BigUint64Array([nonce]).buffer), // 8 bytes LE
    ]

    // Optional ticket_pda (for resale)
    if (ticketPda) {
      const ticketPdaPublicKey = new PublicKey(ticketPda)
      parts.push(Buffer.from([1])) // Option::Some
      parts.push(ticketPdaPublicKey.toBuffer()) // 32 bytes
    } else {
      parts.push(Buffer.from([0])) // Option::None
    }

    // Seat information
    parts.push(Buffer.from(new Uint16Array([rowNumber]).buffer)) // 2 bytes LE
    parts.push(Buffer.from(new Uint16Array([columnNumber]).buffer)) // 2 bytes LE

    const message = Buffer.concat(parts)

    // Ed25519签名
    const signature = nacl.sign.detached(
      message,
      this.backendAuthority.secretKey
    )

    return {
      signature: bs58.encode(signature),
      backendAuthority: this.backendAuthority.publicKey.toString(),
    }
  }
}
