import { Suspense } from "react";


import { Skeleton } from "@/components/ui/skeleton";
import DashboardTable from "@/components/admin/dashboard/dashboard-table";
import { getDashboard } from "@/actions/admin/dashboard/action";
import { LayoutDashboard } from "lucide-react";
import { getCurrentUser, getUserById } from "@/actions/admin/user/action";
async function DasboardContent() {
  const dashboards = await getDashboard();
  const userId = await getCurrentUser();
  const user = await getUserById(userId);

  

  return <DashboardTable dashboards={dashboards || []} user={user!} />;
}

export default function Page() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <LayoutDashboard className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Dashboard Setting
            </h1>
            <p className="text-sm text-gray-500">
              Manage and access dashboards
            </p>
          </div>
        </div>
      <Suspense fallback={<Loading />}>
        <DasboardContent />
      </Suspense>
    </div>
  );
}

function Loading() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-10 w-1/4" />

      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}