import DashboardList from "@/components/dashboard/dashboard-list";
import { Suspense } from "react";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div >
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-100 rounded-2xl">
            <LayoutDashboard className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              My Dashboards
            </h1>
            <p className="text-sm text-gray-500">
              Manage and access your dashboards
            </p>
          </div>
        </div>

        {/* Content */}
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardList />
        </Suspense>

      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border bg-card p-6 shadow-sm animate-pulse"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-muted rounded-md" />
            <div className="h-10 w-10 rounded-xl bg-muted" />
          </div>

          {/* Description */}
          <div className="mt-3 space-y-2">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded" />
          </div>

          {/* Footer link */}
          <div className="mt-4">
            <div className="h-4 w-28 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}