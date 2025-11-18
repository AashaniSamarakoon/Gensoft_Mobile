const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const modules = [
  { name: 'employee', displayName: 'Employee', description: 'Employee management and HR operations', sortOrder: 1 },
  { name: 'accounts', displayName: 'Accounts', description: 'Financial accounting and bookkeeping', sortOrder: 2 },
  { name: 'crm', displayName: 'CRM', description: 'Customer relationship management', sortOrder: 3 },
  { name: 'sea_import', displayName: 'Sea Import', description: 'Sea freight import operations', sortOrder: 4 },
  { name: 'sea_export', displayName: 'Sea Export', description: 'Sea freight export operations', sortOrder: 5 },
  { name: 'nvocc', displayName: 'NVOCC', description: 'Non-Vessel Operating Common Carrier operations', sortOrder: 6 },
  { name: 'home', displayName: 'Home', description: 'Dashboard and home operations', sortOrder: 7 },
  { name: 'agent', displayName: 'Agent', description: 'Agent management and operations', sortOrder: 8 },
  { name: 'mir', displayName: 'MIR', description: 'Material Inspection Report', sortOrder: 9 },
  { name: 'air_import', displayName: 'Air Import', description: 'Air freight import operations', sortOrder: 10 },
  { name: 'air_export', displayName: 'Air Export', description: 'Air freight export operations', sortOrder: 11 },
  { name: 'transshipment', displayName: 'Transshipment', description: 'Transshipment operations', sortOrder: 12 },
  { name: 'cross_trade', displayName: 'Cross Trade', description: 'Cross trade operations', sortOrder: 13 },
  { name: 'other_jobs', displayName: 'Other Jobs', description: 'Miscellaneous job operations', sortOrder: 14 },
  { name: 'clearing_forwarding', displayName: 'Clearing and Forwarding', description: 'Customs clearing and forwarding', sortOrder: 15 },
  { name: 'switch_bl', displayName: 'Switch BL', description: 'Bill of Lading switching operations', sortOrder: 16 },
  { name: 'iou', displayName: 'IOU', description: 'I Owe You management', sortOrder: 17 },
  { name: 'domestic_inbound', displayName: 'Domestic Inbound', description: 'Domestic inbound logistics', sortOrder: 18 },
  { name: 'domestic_outbound', displayName: 'Domestic Outbound', description: 'Domestic outbound logistics', sortOrder: 19 },
  { name: 'fcl_extension', displayName: 'FCL Extension', description: 'Full Container Load extensions', sortOrder: 20 },
  { name: 'transport', displayName: 'Transport', description: 'Transportation management', sortOrder: 21 },
  { name: 'packing', displayName: 'Packing', description: 'Cargo packing operations', sortOrder: 22 },
  { name: 'ship_agency', displayName: 'Ship Agency', description: 'Ship agency services', sortOrder: 23 },
  { name: 'warehouse', displayName: 'Warehouse', description: 'Warehouse management', sortOrder: 24 },
  { name: 'equipment_controlling', displayName: 'Equipment Controlling', description: 'Equipment control and tracking', sortOrder: 25 },
  { name: 'masters', displayName: 'Masters', description: 'Master data management', sortOrder: 26 },
  { name: 'liner_inward', displayName: 'Liner Inward', description: 'Liner service inward operations', sortOrder: 27 },
  { name: 'liner_outward', displayName: 'Liner Outward', description: 'Liner service outward operations', sortOrder: 28 },
  { name: 'liner_finance', displayName: 'Liner Finance', description: 'Liner service financial operations', sortOrder: 29 },
  { name: 'document_management', displayName: 'Document Management', description: 'Document management system', sortOrder: 30 }
];

async function main() {
  console.log('🌱 Seeding modules...');
  
  for (const moduleData of modules) {
    try {
      const existingModule = await prisma.module.findUnique({
        where: { name: moduleData.name }
      });
      
      if (existingModule) {
        console.log(`✅ Module "${moduleData.displayName}" already exists, updating...`);
        await prisma.module.update({
          where: { name: moduleData.name },
          data: {
            displayName: moduleData.displayName,
            description: moduleData.description,
            sortOrder: moduleData.sortOrder
          }
        });
      } else {
        console.log(`➕ Creating module "${moduleData.displayName}"...`);
        await prisma.module.create({
          data: moduleData
        });
      }
    } catch (error) {
      console.error(`❌ Error processing module "${moduleData.displayName}":`, error.message);
    }
  }
  
  console.log('✅ Modules seeded successfully!');
  
  // Create some sample approvals for testing
  console.log('🔄 Creating sample approvals...');
  
  try {
    const iouModule = await prisma.module.findUnique({ where: { name: 'iou' } });
    const seaImportModule = await prisma.module.findUnique({ where: { name: 'sea_import' } });
    const accountsModule = await prisma.module.findUnique({ where: { name: 'accounts' } });
    
    const sampleApprovals = [
      {
        itemType: 'iou',
        itemId: 'sample-iou-1',
        moduleId: iouModule?.id,
        title: 'IOU Approval Request - Office Supplies',
        description: 'Approval needed for office supplies purchase',
        amount: 250.00,
        requestedBy: 'john.doe@company.com',
        assignedTo: 'manager@company.com',
        status: 'PENDING',
        priority: 'MEDIUM',
        jobNumber: 'JOB001',
        customerPayee: 'Office Depot',
        refNo: 'REF001'
      },
      {
        itemType: 'settlement',
        itemId: 'sample-settlement-1',
        moduleId: seaImportModule?.id,
        title: 'Sea Import Settlement - Container Handling',
        description: 'Settlement approval for container handling charges',
        amount: 1500.00,
        requestedBy: 'jane.smith@company.com',
        assignedTo: 'supervisor@company.com',
        status: 'PENDING',
        priority: 'HIGH',
        jobNumber: 'SI2024001',
        customerPayee: 'ABC Shipping Lines',
        refNo: 'SI-REF-001',
        blNo: 'BL123456',
        invNo: 'INV-2024-001'
      },
      {
        itemType: 'proof',
        itemId: 'sample-proof-1',
        moduleId: accountsModule?.id,
        title: 'Expense Proof - Client Entertainment',
        description: 'Proof of expenses for client entertainment',
        amount: 450.00,
        requestedBy: 'sales@company.com',
        assignedTo: 'finance@company.com',
        status: 'APPROVED',
        priority: 'LOW',
        jobNumber: 'ACC2024001',
        customerPayee: 'Restaurant XYZ',
        refNo: 'EXP-001'
      }
    ];
    
    for (const approval of sampleApprovals) {
      const existingApproval = await prisma.approval.findFirst({
        where: { itemId: approval.itemId }
      });
      
      if (!existingApproval) {
        await prisma.approval.create({ data: approval });
        console.log(`✅ Created sample approval: ${approval.title}`);
      }
    }
    
  } catch (error) {
    console.warn('⚠️ Could not create sample approvals (likely due to schema not being applied yet):', error.message);
  }
  
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });