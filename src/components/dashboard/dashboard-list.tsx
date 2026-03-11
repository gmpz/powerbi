import { getUserDashboards } from "@/actions/dashboard/action";


import { LayoutDashboard } from "lucide-react";


const DashboardList = async () => {
  const dashboards = await getUserDashboards();
  

  if (dashboards.length === 0) {
    return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      
      <div className="p-5 rounded-3xl bg-indigo-50 mb-6">
        <LayoutDashboard className="w-10 h-10 text-indigo-600" />
      </div>

      <h2 className="text-xl font-semibold text-gray-800">
        No dashboards yet
      </h2>

      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
        You don’t have access to any dashboards at the moment.
        Once assigned, they will appear here.
      </p>

    </div>
  );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
      {/* Dashboard List */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Card 1 */}
        {dashboards.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center  font-bold`} style={{ color: item.color || "#000", backgroundColor: `${item.color || "#000"}20` }}>
                {item.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-3">
              {item.description || "No description provided."}
            </p>

            <div className={`mt-4 text-sm font-medium  group-hover:underline`} style={{ color: item.color || "#000" }}>
              <a href={`/dashboard/${item.id}`}>View Dashboard →</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardList;
