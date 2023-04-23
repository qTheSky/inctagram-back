import { Injectable, Scope } from '@nestjs/common';
import { EntityManager } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class EntityManagerContext {
  private entityManager: EntityManager | null = null;

  setEntityManager(entityManager: EntityManager) {
    this.entityManager = entityManager;
  }

  getEntityManager(): EntityManager | null {
    return this.entityManager;
  }
}
