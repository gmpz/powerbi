// app/(admin)/users/[id]/page.tsx



import { getDashboardById } from "@/actions/admin/dashboard/action";
import { getCurrentUser, getUserById } from "@/actions/admin/user/action";
import DashboardDetailCard from "@/components/admin/dashboard/dashboard-detail-card";
import DashboardMainRole from "@/components/admin/dashboard/dashboard-main-role";
import DashboardSubRole from "@/components/admin/dashboard/dashboard-sub-role";




export default async function DasboardDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const dashboard = await getDashboardById(slug);
  const userId = await getCurrentUser();
  const user = await getUserById(userId);

  
  if (!dashboard) {
  return <div>Dashboard not found</div>;
}
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard Management</h1>
        <p className="text-muted-foreground text-sm">
          Manage dashboard profile and permissions
        </p>
      </div>

      {/* 2 Column Layout */}
<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
  
  {/* Left */}
  <div>
    <DashboardDetailCard dashboard={dashboard} />
  </div>

  {/* Right */}
  <div className="flex flex-col gap-6">
    <DashboardMainRole dashboardId={dashboard.id} userRole={user!.role} />
    <DashboardSubRole dashboardId={dashboard.id} userRole={user!.role}/>
  </div>

</div>
    </div>
  );
}