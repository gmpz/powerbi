import { getDashboardById } from "@/actions/dashboard/action";
import DashboardDetail from "@/components/dashboard/dashboard-detail";

import { Suspense } from "react";
interface Props {
  params: { slug: string };
}


export default async function Page({ params }: Props) {
  const { slug } = await params;
  const dashboard = await getDashboardById(slug);
  if (!dashboard) {
    return <div className="p-4">Dashboard not found or you don't have access.</div>;
  }
  return (
    <Suspense fallback={DashboardLoading()}>
      <DashboardDetail {...dashboard} />
    </Suspense>

  );
}

export function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        
        <div className="h-10 w-10 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
        
        <p className="text-sm">Loading dashboard...</p>

      </div>
    </div>
  );
}
