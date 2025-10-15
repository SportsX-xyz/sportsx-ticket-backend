import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Connection } from '@solana/web3.js'
import { SolanaService } from './solana.service'
import { SOLANA_CONNECTION } from './solana.constants'
import * as anchor from '@coral-xyz/anchor'

@Global()
@Module({
  providers: [
    SolanaService,
    {
      provide: SOLANA_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const connection = new anchor.web3.Connection(
          configService.get('ANCHOR_PROVIDER_URL'),
          'confirmed'
        )

        return connection
      },
      inject: [ConfigService],
    },
  ],
  exports: [SolanaService],
})
export class SolanaModule {}
