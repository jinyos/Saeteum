import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, MeModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
