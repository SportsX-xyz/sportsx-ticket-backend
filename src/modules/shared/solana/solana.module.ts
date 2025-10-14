import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Connection } from '@solana/web3.js'
import { SolanaService } from './solana.service'
import { SOLANA_CONNECTION } from './solana.constants'

@Global()
@Module({
  providers: [
    SolanaService,
    {
      provide: SOLANA_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const rpcUrl = configService.get<string>('SOLANA_RPC_URL')
        if (!rpcUrl) {
          throw new Error('SOLANA_RPC_URL is not defined in .env')
        }
        return new Connection(rpcUrl, 'confirmed')
      },
      inject: [ConfigService],
    },
  ],
  exports: [SolanaService],
})
export class SolanaModule {}
