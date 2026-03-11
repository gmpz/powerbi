// app/(admin)/users/[id]/page.tsx

import DashboardCreate from "@/components/admin/dashboard/dashboard-create";

export default async function DasboardDetailPage() {
  return (
    <div className="min-h-screen  px-2 sm:px-3 lg:px-4 py-5">
      
      

      {/* Centered Content */}
      <div className="max-w-3xl mx-auto">
        {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Dashboard Management
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Create new dashboards and manage existing ones
        </p>
      </div>
        <div className="">
          <DashboardCreate />
        </div>
      </div>

    </div>
  );
}