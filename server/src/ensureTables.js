// Utility to ensure all required tables exist on backend startup
import { ensureTablesExist } from './controllers/authController.js';
import createQuitPlanTable from './utils/createQuitPlanTable.js';
import createProgressTable from './utils/createProgressTable.js';
import migrateProgressTable from './utils/migrateProgressTable.js';
// import { ensurePackageTable } from './models/Package.js';
import Package from './models/Package.js';
import { ensureMembershipTables } from './models/Membership.js';
// import { ensurePaymentsTable } from './models/Payment.js';
// import { ensureCoachTables } from './models/CoachTables.js';
// import fixMessageTable from './scripts/fix-message-table.js';
// import { ensureTablesExist as ensureAuthTables } from './controllers/authController.js';

const ensureAllTablesExist = async () => {
    await ensureTablesExist();
    await createQuitPlanTable();
    await createProgressTable();
    // Migrate existing tables if needed
    await migrateProgressTable();
    // await ensureAuthTables();
  // await ensurePackageTable();
  await Package.ensureDefaultPackages();
  await ensureMembershipTables();
  // await ensurePaymentsTable();
  // await ensureCoachTables();
  // await fixMessageTable();
    
    console.log('✅ All tables checked, created, and migrated if needed');
}
export default ensureAllTablesExist;
