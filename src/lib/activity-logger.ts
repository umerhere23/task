import { logActivityModel } from '@/server/models/activity-log.model';

export class ActivityLogger {
  static async logCustomerCreated(
    customerId: string,
    performedBy: string,
    performedByName: string,
    organizationId: string,
    customerData?: any
  ) {
    return logActivityModel(
      'customer',
      customerId,
      'created',
      performedBy,
      performedByName,
      organizationId,
      customerData ? { customer: customerData } : undefined
    );
  }

  static async logCustomerUpdated(
    customerId: string,
    performedBy: string,
    performedByName: string,
    organizationId: string,
    changes?: any
  ) {
    return logActivityModel(
      'customer',
      customerId,
      'updated',
      performedBy,
      performedByName,
      organizationId,
      changes ? { changes } : undefined
    );
  }

  static async logCustomerDeleted(
    customerId: string,
    performedBy: string,
    performedByName: string,
    organizationId: string,
    customerData?: any
  ) {
    return logActivityModel(
      'customer',
      customerId,
      'deleted',
      performedBy,
      performedByName,
      organizationId,
      customerData ? { customer: customerData } : undefined
    );
  }

  static async logCustomerRestored(
    customerId: string,
    performedBy: string,
    performedByName: string,
    organizationId: string
  ) {
    return logActivityModel(
      'customer',
      customerId,
      'restored',
      performedBy,
      performedByName,
      organizationId
    );
  }

  static async logCustomerAssigned(
    customerId: string,
    performedBy: string,
    performedByName: string,
    organizationId: string,
    assignedToUserId: string,
    assignedToUserName?: string
  ) {
    return logActivityModel(
      'customer',
      customerId,
      'assigned',
      performedBy,
      performedByName,
      organizationId,
      { assignedToUserId, assignedToUserName }
    );
  }

  static async logNoteAdded(
    noteId: string,
    customerId: string,
    performedBy: string,
    performedByName: string,
    organizationId: string,
    noteContent?: string
  ) {
    return logActivityModel(
      'note',
      noteId,
      'added',
      performedBy,
      performedByName,
      organizationId,
      { customerId, content: noteContent?.substring(0, 100) + '...' }
    );
  }

  static async logUserCreated(
    userId: string,
    performedBy: string,
    performedByName: string,
    organizationId: string,
    userData?: any
  ) {
    return logActivityModel(
      'user',
      userId,
      'created',
      performedBy,
      performedByName,
      organizationId,
      userData ? { user: userData } : undefined
    );
  }

  static async logUserUpdated(
    userId: string,
    performedBy: string,
    performedByName: string,
    organizationId: string,
    changes?: any
  ) {
    return logActivityModel(
      'user',
      userId,
      'updated',
      performedBy,
      performedByName,
      organizationId,
      changes ? { changes } : undefined
    );
  }
}
