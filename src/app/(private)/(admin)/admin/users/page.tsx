import { Suspense } from "react";
import { getCurrentUser, getUser, getUserById } from "@/actions/admin/user/action";
import UserTable from "@/components/admin/user/user-table";
import { Skeleton } from "@/components/ui/skeleton";
import { User2Icon } from "lucide-react";
async function UserContent() {
  const users = await getUser();
  const userid = await getCurrentUser();
  const user = await getUserById(userid);
  return <UserTable users={users || []}  currentUser={user!} />;
}

export default function Page() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <User2Icon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              User Management
            </h1>
            <p className="text-sm text-gray-500">
              Manage and access users
            </p>
          </div>
        </div>
      <Suspense fallback={<Loading />}>
        <UserContent />
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