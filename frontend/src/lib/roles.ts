export type Role = 'admin' | 'committee' | 'resident' | 'guard' | 'staff' | 'software';

export type ModuleDef = { id: string; label: string; num: string };

export const ROLE_MODULES: Record<Role, { defaultModule: string; modules: ModuleDef[] }> = {
  admin: {
    defaultModule: 'overview',
    modules: [
      { id: 'overview', label: 'Command', num: '00' },
      { id: 'finance', label: 'Finance', num: '01' },
      { id: 'operations', label: 'Operations', num: '02' },
      { id: 'security', label: 'Security', num: '03' },
      { id: 'community', label: 'Community', num: '04' },
      { id: 'estate', label: 'Real Estate', num: '05' },
    ],
  },
  committee: {
    defaultModule: 'overview',
    modules: [
      { id: 'overview', label: 'Boardroom', num: '00' },
      { id: 'approvals', label: 'Approvals', num: '01' },
      { id: 'finance', label: 'Finance', num: '02' },
      { id: 'community', label: 'Community', num: '03' },
      { id: 'estate', label: 'Estate', num: '04' },
    ],
  },
  resident: {
    defaultModule: 'home',
    modules: [
      { id: 'home', label: 'My Residence', num: '00' },
      { id: 'billing', label: 'Billing', num: '01' },
      { id: 'services', label: 'Services', num: '02' },
      { id: 'visitors', label: 'Visitors', num: '03' },
      { id: 'community', label: 'Community', num: '04' },
      { id: 'marketplace', label: 'Marketplace', num: '05' },
    ],
  },
  guard: {
    defaultModule: 'gatehouse',
    modules: [
      { id: 'gatehouse', label: 'Gatehouse', num: '00' },
      { id: 'expected', label: 'Expected', num: '01' },
      { id: 'logs', label: 'Gate Logs', num: '02' },
      { id: 'incidents', label: 'Incidents', num: '03' },
    ],
  },
  staff: {
    defaultModule: 'tasks',
    modules: [
      { id: 'tasks', label: 'My Tasks', num: '00' },
      { id: 'attendance', label: 'Attendance', num: '01' },
      { id: 'payroll', label: 'Payroll', num: '02' },
      { id: 'noticeboard', label: 'Noticeboard', num: '03' },
    ],
  },
  software: {
    defaultModule: 'tenants',
    modules: [
      { id: 'tenants', label: 'Tenants', num: '00' },
      { id: 'billing', label: 'Revenue', num: '01' },
      { id: 'health', label: 'Health', num: '02' },
      { id: 'ai', label: 'AI Console', num: '03' },
      { id: 'audit', label: 'Audit Log', num: '04' },
    ],
  },
};

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Building Admin',
  committee: 'Committee',
  resident: 'Resident',
  guard: 'Gate Officer',
  staff: 'Staff',
  software: 'Software Admin',
};
