import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent } from 'typeorm';

export interface IOrgScopedEntity {
  orgId?: string;
}

@EventSubscriber()
export class OrgScopeSubscriber implements EntitySubscriberInterface<IOrgScopedEntity> {
  listenTo(): string | Function {
    return 'all';
  }

  beforeInsert(event: InsertEvent<IOrgScopedEntity>): void {
    if (event.entity && event.entity.orgId === undefined) {
      const orgId = this.getCurrentOrgId();
      if (orgId) {
        event.entity.orgId = orgId;
      }
    }
  }

  beforeUpdate(event: UpdateEvent<IOrgScopedEntity>): void {
    if (event.entity && event.entity.orgId !== undefined) {
      const orgId = this.getCurrentOrgId();
      if (orgId && event.entity.orgId !== orgId) {
        throw new Error('Cannot update entity from another organization');
      }
    }
  }

  beforeRemove(event: RemoveEvent<IOrgScopedEntity>): void {
    if (event.entity && event.entity.orgId !== undefined) {
      const orgId = this.getCurrentOrgId();
      if (orgId && event.entity.orgId !== orgId) {
        throw new Error('Cannot remove entity from another organization');
      }
    }
  }

  private getCurrentOrgId(): string | null {
    return null;
  }
}