export interface DbTimestamped {
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeletable {
  deletedAt?: string | null;
}
