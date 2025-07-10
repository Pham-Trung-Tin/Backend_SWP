// Utility to ensure all required tables exist on backend startup
import { ensureTablesExist as ensureAuthTables } from './controllers/authController.js';
import { ensurePackageTable } from './models/Package.js';
import { ensureMembershipTables } from './models/Membership.js';
import { ensurePaymentsTable } from './models/Payment.js';
import { ensurePaymentTransactionsTable } from './models/PaymentTransaction.js';
import { ensureCoachTables } from './models/CoachTables.js';

const ensureAllTables = async () => {
  await ensureAuthTables();
  await ensurePackageTable();
  await ensureMembershipTables();
  await ensurePaymentsTable();
  await ensurePaymentTransactionsTable();
  await ensureCoachTables();
};

export default ensureAllTables;
