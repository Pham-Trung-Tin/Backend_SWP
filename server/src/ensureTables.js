// Utility to ensure all required tables exist on backend startup
import { ensureTablesExist } from './controllers/authController.js';
import createQuitPlanTable from './utils/createQuitPlanTable.js';

const ensureAllTablesExist = async () => {
    await ensureTablesExist();
    await createQuitPlanTable();
    console.log('✅ All tables checked and created if needed');
};

export default ensureAllTablesExist;
