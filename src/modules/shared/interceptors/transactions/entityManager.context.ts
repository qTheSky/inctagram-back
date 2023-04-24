import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EntityManagerContext {
  public manager: EntityManager;
}
