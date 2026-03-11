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
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardDetail {...dashboard} />
    </Suspense>

    
  );
}
