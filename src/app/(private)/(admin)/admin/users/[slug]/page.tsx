

import UserProfile from "@/components/admin/user/user-profile";
import DashboardPermission from "@/components/admin/user/dashboard-permission";

export default async function UserDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  
  return (
    <div className="p-0 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">User Management</h1>
        <p className="text-muted-foreground text-sm">
          Manage user profile and dashboard permissions
        </p>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left */}
        <div className="xl:col-span-1">
          <UserProfile userId={slug}/>
        </div>

        {/* Right */}
        <div className="xl:col-span-2">
          <DashboardPermission userId={slug}/>
        </div>
      </div>
    </div>
  );
}