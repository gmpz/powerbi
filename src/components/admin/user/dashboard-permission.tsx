import React from 'react'
import DashboardPermissionTable from './dashboard-permission-table'
import { getUserPermissionDashboard } from '@/actions/admin/user_dashboard/action';

const DashboardPermission = async ({userId} : { userId : string}) => {
    const dashboards = await getUserPermissionDashboard(userId);

  return (
    <DashboardPermissionTable userId={userId} dashboards={dashboards}/>
  )
}

export default DashboardPermission