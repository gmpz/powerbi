
import { getDashboardMainRole, getDashboardSubRole } from '@/actions/admin/dashboard/action';
import DashboardSubRoleTable from './dashboard-sub-role-table';

const DashboardMainRole = async({ dashboardId, userRole }: { dashboardId: string, userRole:string }) => {
const mainRole = await getDashboardMainRole(dashboardId);
const subRoles = await getDashboardSubRole(dashboardId);
  return (
    <DashboardSubRoleTable dashboardId={dashboardId} subRoles={subRoles} mainRole={mainRole} userRole={userRole} />
  )
}

export default DashboardMainRole