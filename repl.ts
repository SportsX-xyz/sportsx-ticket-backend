import { repl } from '@nestjs/core'
import { Module } from '@nestjs/common'
import { AppModule } from './src/app.module'

// Create a simple module that just imports AppModule
@Module({
  imports: [AppModule],
})
class ReplModule {}

async function bootstrap() {
  console.log('Starting REPL with cron jobs disabled...')

  // Start the REPL with our module
  const replServer = await repl(ReplModule)
  replServer.setupHistory('.nestjs_repl_history', (err) => {
    if (err) {
      console.error('Error setting up REPL history:', err)
    }
  })
}

bootstrap()
