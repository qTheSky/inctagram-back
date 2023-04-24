import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../classes/base.entity';

@Entity('audit_logs')
export class AuditLogEntity extends BaseEntity {
  //todo add IP and DEVICE NAME( user-agent )
  @Column({ nullable: true })
  userId: string;
  @Column()
  endPoint: string;
  @Column()
  method: string;
  @Column({ type: 'json' })
  data: any;

  static create(
    userId: string | null,
    endPoint: string,
    method: string,
    data: any
  ): AuditLogEntity {
    const log = new AuditLogEntity();

    log.userId = userId;
    log.endPoint = endPoint;
    log.method = method;
    log.data = data;

    return log;
  }
}
