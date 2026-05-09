import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/server/database';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    let organizationId = request.headers.get('x-org-id');
    
    // Fallback for development
    if (!organizationId && process.env.NODE_ENV === 'development') {
      organizationId = '02c70e6b-ae37-472e-81b9-ea40577ed3f7';
    }
    
    const dataSource = await ensureDatabaseInitialized();
    
    // Test simple query to activity_logs table
    const result = await dataSource.query(
      `SELECT table_name, column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'activity_logs' 
       ORDER BY ordinal_position`,
      []
    );
    
    // Test count query
    const countResult = await dataSource.query(
      `SELECT COUNT(*) as total FROM activity_logs`,
      []
    );
    
    return NextResponse.json({
      organizationId,
      tableColumns: result,
      totalCount: countResult[0].total,
      message: 'Debug activity logs working'
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      message: 'Debug activity logs failed'
    }, { status: 500 });
  }
}
