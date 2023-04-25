import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        password: 'rERa101Bsaq43APVZA36dtlEtyBrfrIs',
        url: 'redis-19081.c73.us-east-1-2.ec2.cloud.redislabs.com:19081',
      },
    }),
  ],
})
export class RedisCacheModule {}
