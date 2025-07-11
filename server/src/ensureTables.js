// Utility to ensure all required tables exist on backend startup
import { ensureTablesExist } from './controllers/authController.js';
import createQuitPlanTable from './utils/createQuitPlanTable.js';
import createProgressTable from './utils/createProgressTable.js';
import migrateProgressTable from './utils/migrateProgressTable.js';

const ensureAllTablesExist = async () => {
    await ensureTablesExist();
    await createQuitPlanTable();
    await createProgressTable();
    // Migrate existing tables if needed
    await migrateProgressTable();
    console.log('✅ All tables checked, created, and migrated if needed');
};

export default ensureAllTablesExist;
