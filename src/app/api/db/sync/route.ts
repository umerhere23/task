import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseInitialized, AppDataSource } from '@/server/database';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('Starting database synchronization...');
    
    // Force database initialization
    const dataSource = await ensureDatabaseInitialized();
    
    if (!dataSource.isInitialized) {
      throw new Error('Database not initialized');
    }

    // Run synchronization to create new tables
    await dataSource.synchronize(true);
    
    console.log('Database synchronization completed successfully');
    
    // Check if our new tables exist
    const noteTableExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notes'
      );
    `);
    
    const activityLogTableExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'activity_logs'
      );
    `);

    return NextResponse.json({
      success: true,
      message: 'Database synchronized successfully',
      tables: {
        notes: noteTableExists[0].exists,
        activity_logs: activityLogTableExists[0].exists,
      },
      entities: dataSource.entityMetadatas.map(meta => meta.tableName)
    });
  } catch (error) {
    console.error('Database synchronization failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
