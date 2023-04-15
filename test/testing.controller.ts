import { Controller, Delete } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ApiExcludeController } from '@nestjs/swagger';
import { cleanDb } from './utils/clean-db';

@ApiExcludeController()
@Controller()
export class TestingController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  @Delete('delete-all-data')
  async deleteAllData() {
    cleanDb({ dataSource: this.dataSource });
  }
}
