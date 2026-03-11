"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { insertDashboardMainRole } from "@/actions/admin/dashboard/action";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// ✅ 1. Zod Schema
const formSchema = z.object({
  name: z
    .string()
    .min(3, "Role name must be at least 3 characters")
    .max(50, "Role name must not exceed 50 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddMainRoleDialog({
  open,
  setOpen,
  dashboardId,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  dashboardId: string;
}) {

  const router = useRouter()

  // ✅ 2. Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  // ✅ 3. Submit Handler
  const onSubmit = async (data: FormValues) => {
    try {
      const res = await insertDashboardMainRole(dashboardId, data.name);
      toast.success(res.message || "Main role added successfully");
      setOpen(false);
      reset();
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message || "Failed to add main role");
    }
  };
  const onCancel = () => {
    setOpen(false)
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isSubmitting) {
          setOpen(v);
        }
      }}
    >
      <DialogContent className="max-w-xl w-full rounded-2xl overflow-visible">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Dashboard Main Role
          </DialogTitle>
        </DialogHeader>

        <Separator className="my-2" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Role Name</label>

            <Input placeholder="Enter role name" {...register("name")} />

            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Main Role"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
