import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTypeOrmConfig = (
  configService: ConfigService
): TypeOrmModuleOptions => {
  const ssl = configService.get('NODE_ENV') === 'production';

  return {
    type: "postgres",
    host: configService.get("HOST"),
    port: configService.get("PORT"),
    username: configService.get("DATABASEUSERNAME"),
    password: configService.get("PASSWORD"),
    database: configService.get("DATABASE"),
    autoLoadEntities: true,
    synchronize: true,
    ssl,
  };
};
