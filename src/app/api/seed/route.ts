import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/server/database';
import { encodePassword } from '@/lib/password';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const dataSource = await ensureDatabaseInitialized();

    // Create test organization - check if exists first
    let orgResult = await dataSource.query(
      `SELECT id FROM organizations WHERE slug = $1 LIMIT 1`,
      ['test-org']
    );
    
    let orgId: string;
    if (orgResult.length === 0) {
      const insertResult = await dataSource.query(
        `INSERT INTO organizations (id, name, slug, created_at) 
         VALUES ($1, $2, $3, NOW())
         RETURNING id`,
        ['02c70e6b-ae37-472e-81b9-ea40577ed3f7', 'Test Organization', 'test-org']
      );
      orgId = insertResult[0].id;
    } else {
      orgId = orgResult[0].id;
    }

    // Create test users
    const userIds: string[] = [];
    const userData = [
      { name: 'Ali Khan', email: 'ali@example.com' },
      { name: 'Umer Malik', email: 'umer@example.com' },
      { name: 'Fatima Ahmed', email: 'fatima@example.com' },
      { name: 'Hassan Ali', email: 'hassan@example.com' },
    ];

    const encodedPassword = encodePassword('Test@1234');

    for (const user of userData) {
      // Check if user exists
      let userCheck = await dataSource.query(
        `SELECT id FROM users WHERE email = $1 AND organization_id = $2 LIMIT 1`,
        [user.email, orgId]
      );

      if (userCheck.length === 0) {
        const result = await dataSource.query(
          `INSERT INTO users (id, name, email, password, role, organization_id, created_at) 
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
           RETURNING id`,
          [user.name, user.email, encodedPassword, 'member', orgId]
        );
        userIds.push(result[0].id);
      } else {
        userIds.push(userCheck[0].id);
      }
    }

    // Create test customers
    const customerData = [
      { name: 'Muhammad Umer Mukhtiar Mukhtiar Ahmed', email: 'user@gmail.com', phone: '03058671653' },
      { name: 'Muhammad Umer Mukhtiar', email: 'omerjhon5004@gmail.com', phone: '03058671653' },
      { name: 'Ahmed Hassan', email: 'ahmed.hassan@example.com', phone: '03001234567' },
      { name: 'Zainab Khan', email: 'zainab.khan@example.com', phone: '03009876543' },
      { name: 'Bilal Ahmed', email: 'bilal.ahmed@example.com', phone: '03102345678' },
      { name: 'Ayesha Ali', email: 'ayesha.ali@example.com', phone: '03119876543' },
      { name: 'Omar Farooq', email: 'omar.farooq@example.com', phone: '03121234567' },
      { name: 'Noor Malik', email: 'noor.malik@example.com', phone: '03215678901' },
      { name: 'Samir Khan', email: 'samir.khan@example.com', phone: '03009876543' },
      { name: 'Layla Ahmed', email: 'layla.ahmed@example.com', phone: '03101234567' },
    ];

    let customersCreated = 0;
    for (const customer of customerData) {
      // Check if customer exists
      let custCheck = await dataSource.query(
        `SELECT id FROM customers WHERE email = $1 AND organization_id = $2 LIMIT 1`,
        [customer.email, orgId]
      );

      if (custCheck.length === 0) {
        await dataSource.query(
          `INSERT INTO customers (id, name, email, phone, organization_id, assigned_to_id, created_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
          [
            customer.name,
            customer.email,
            customer.phone,
            orgId,
            // Distribute customers among users
            Math.random() > 0.5 ? userIds[Math.floor(Math.random() * userIds.length)] : null,
          ]
        );
        customersCreated++;
      }
    }

    // Create test notes
    const notesData = [
      'Customer prefers email communication',
      'Follow up next week about renewal',
      'Key contact: direct line 555-1234',
      'Excellent payment history',
      'Interested in upgrading to premium plan',
    ];

    const customers = await dataSource.query(
      `SELECT id FROM customers WHERE organization_id = $1 LIMIT 5`,
      [orgId]
    );

    let notesCreated = 0;
    for (let i = 0; i < customers.length; i++) {
      const customerId = customers[i].id;
      const noteCount = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < noteCount; j++) {
        const noteContent = notesData[Math.floor(Math.random() * notesData.length)];
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        const userName = userData[userIds.indexOf(userId)].name;

        await dataSource.query(
          `INSERT INTO notes (id, content, customer_id, organization_id, created_by_user_id, created_by_name, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())`,
          [noteContent, customerId, orgId, userId, userName]
        );
        notesCreated++;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Test data seeded successfully',
        data: {
          organizationId: orgId,
          usersCreated: userIds.length,
          customersCreated,
          notesCreated,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Seed error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
