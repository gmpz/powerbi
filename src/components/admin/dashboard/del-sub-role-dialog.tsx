import { DelSubRoleDashboard, DelUserDashboard } from "@/actions/admin/user_dashboard/action";
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

export function DelSubRoleDialog({
  open,
  setOpen,
  subRole,

}: {
  subRole: any;

  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDel = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await DelSubRoleDashboard(subRole.id);
      toast.success(res.message || "Update successfully");
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete "{subRole?.name}" Role?</AlertDialogTitle>
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