import React from 'react'
import DashboardMainRoleTable from './dashboard-main-role-table copy'
import { get } from 'http'
import { getDashboardMainRole } from '@/actions/admin/dashboard/action';

const DashboardMainRole = async({ dashboardId }: { dashboardId: string }) => {
const mainRole = await getDashboardMainRole(dashboardId);
  return (
    <DashboardMainRoleTable dashboardId={dashboardId} mainRoles={mainRole} />
  )
}

export default DashboardMainRole