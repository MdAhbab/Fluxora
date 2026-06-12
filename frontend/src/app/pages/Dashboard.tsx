import { Navigate, useParams } from 'react-router';
import { useAuth } from '../../lib/auth';
import { ROLE_MODULES } from '../../lib/roles';
import { Shell } from '../components/shared/Shell';

// admin
import AdminOverview from '../modules/admin/Overview';
import AdminFinance from '../modules/admin/Finance';
import AdminOperations from '../modules/admin/Operations';
import AdminSecurity from '../modules/admin/Security';
import AdminCommunity from '../modules/admin/Community';
import AdminEstate from '../modules/admin/Estate';

// committee
import CommitteeOverview from '../modules/committee/Overview';
import CommitteeApprovals from '../modules/committee/Approvals';
import CommitteeFinance from '../modules/committee/Finance';
import CommitteeCommunity from '../modules/committee/Community';
import CommitteeEstate from '../modules/committee/Estate';

// resident
import ResHome from '../modules/resident/Home';
import ResBilling from '../modules/resident/Billing';
import ResServices from '../modules/resident/Services';
import ResVisitors from '../modules/resident/Visitors';
import ResCommunity from '../modules/resident/Community';
import ResMarketplace from '../modules/resident/Marketplace';

// guard
import GuardGatehouse from '../modules/guard/Gatehouse';
import GuardExpected from '../modules/guard/Expected';
import GuardLogs from '../modules/guard/Logs';
import GuardIncidents from '../modules/guard/Incidents';

// staff
import StaffTasks from '../modules/staff/Tasks';
import StaffAttendance from '../modules/staff/Attendance';
import StaffPayroll from '../modules/staff/Payroll';
import StaffNoticeboard from '../modules/staff/Noticeboard';

const REGISTRY: Record<string, Record<string, React.FC>> = {
  admin: { overview: AdminOverview, finance: AdminFinance, operations: AdminOperations, security: AdminSecurity, community: AdminCommunity, estate: AdminEstate },
  committee: { overview: CommitteeOverview, approvals: CommitteeApprovals, finance: CommitteeFinance, community: CommitteeCommunity, estate: CommitteeEstate },
  resident: { home: ResHome, billing: ResBilling, services: ResServices, visitors: ResVisitors, community: ResCommunity, marketplace: ResMarketplace },
  guard: { gatehouse: GuardGatehouse, expected: GuardExpected, logs: GuardLogs, incidents: GuardIncidents },
  staff: { tasks: StaffTasks, attendance: StaffAttendance, payroll: StaffPayroll, noticeboard: StaffNoticeboard },
};

export function Dashboard() {
  const { session } = useAuth();
  const { activeModule } = useParams();
  if (!session) return <Navigate to="/login" replace />;
  const cfg = ROLE_MODULES[session.role];
  const Mod = REGISTRY[session.role]?.[activeModule || ''];
  if (!Mod) return <Navigate to={`/dashboard/${cfg.defaultModule}`} replace />;
  return <Shell><Mod /></Shell>;
}
