import { getDatabaseStatus } from '@/lib/db';

export async function getDatabaseStatusModel() {
  return getDatabaseStatus();
}
