import { DelMainRoleDashboard, DelSubRoleDashboard, DelUserDashboard } from "@/actions/admin/user_dashboard/action";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function DelMainRoleDialog({
  opens,
  setOpens,

  mainRole
}: {

    mainRole : any
  opens: boolean;
  setOpens: (v: boolean) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDel = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await DelMainRoleDashboard(mainRole.id);
      toast.success(res.message || "Update successfully");
      setOpens(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={opens} onOpenChange={setOpens}>
      <AlertDialogTrigger asChild>
        
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete "{mainRole?.name}" Role?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete access to this dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDel}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}