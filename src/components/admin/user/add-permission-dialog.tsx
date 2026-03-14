"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";

import { useEffect, useState } from "react";

import {
  getAvailableDashboards,
  getMainRoles,
  getSubRoles,
  insertDashboardPermission,
} from "@/actions/admin/user_dashboard/action";

import { useForm } from "react-hook-form";

import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/* ---------------- Schema ---------------- */

const schema = z.object({
  dashboardId: z.string().min(1, "Please select dashboard"),
  mainRoleId: z.string().min(1, "Please select main role"),
  subRoleId: z.string().optional(), // ⭐ ว่างได้
});

type FormValues = z.infer<typeof schema>;

/* ---------------- Types ---------------- */

type Dashboard = {
  id: string;
  name: string;
};

type MainRole = {
  id: string;
  code: string;
  name: string;
};

type SubRole = {
  id: string;
  code: number;
  name: string;
};

/* ================================================= */

export default function AddPermissionDialog({
  open,
  setOpen,
  userId,
}: {
  userId: string;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [mainRoles, setMainRoles] = useState<MainRole[]>([]);
  const [subRoles, setSubRoles] = useState<SubRole[]>([]);

  /* ---------------- React Hook Form ---------------- */
  const router = useRouter();
  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      dashboardId: "",
      mainRoleId: "",
      subRoleId: "",
    },
  });

  const dashboardId = watch("dashboardId");
  const mainRoleId = watch("mainRoleId");
  const subRoleId = watch("subRoleId");

  /* ⭐ ใช้เช็คว่าเลือกอะไรแล้วหรือยัง */

  const canSubmit = dashboardId && mainRoleId;

  /* ---------------- Load Dashboard ---------------- */

  useEffect(() => {
    if (!open) return;

    const loadDashboards = async () => {
      const data = await getAvailableDashboards(userId);
      setDashboards(data);
    };

    loadDashboards();
  }, [open, userId]);

  /* ---------------- Dashboard Change ---------------- */

  const handleDashboardChange = async (id: string) => {
    setValue("dashboardId", id);

    setValue("mainRoleId", "");
    setValue("subRoleId", "");

    setSubRoles([]);

    const roles = await getMainRoles(id);
    setMainRoles(roles);
  };

  /* ---------------- MainRole Change ---------------- */

  const handleMainRoleChange = async (id: string) => {
    setValue("mainRoleId", id);
    setValue("subRoleId", "");

    const subs = await getSubRoles(id);
    setSubRoles(subs);
  };

  const handleSubRoleChange = async (id: string) => {
    setValue("subRoleId", id);
  };

  /* ---------------- Submit ---------------- */

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await insertDashboardPermission(userId, data);
      toast.success(res.message || "Main role added successfully");
      setOpen(false);
      reset();
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add main role");
    }
  };

  const onCancel = () => {
    setOpen(false);
    reset();
  };

  /* ================================================= */

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogContent className="max-w-xl w-full rounded-2xl overflow-visible">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Dashboard Access
          </DialogTitle>
        </DialogHeader>

        <Separator className="my-4" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dashboard */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Dashboard Name</label>

            <Select value={dashboardId} onValueChange={handleDashboardChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select dashboard" />
              </SelectTrigger>

              <SelectContent>
                {dashboards.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.dashboardId && (
              <p className="text-sm text-red-500">
                {errors.dashboardId.message}
              </p>
            )}
          </div>

          {/* Roles */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Role */}

            <div className="space-y-2">
              <label className="text-sm font-medium">Main Role</label>

              <Select
                value={mainRoleId}
                onValueChange={handleMainRoleChange}
                disabled={!dashboardId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select main role" />
                </SelectTrigger>

                <SelectContent className="">
                  {mainRoles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.mainRoleId && (
                <p className="text-sm text-red-500">
                  {errors.mainRoleId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sub Role</label>

              <Select
                value={subRoleId}
                onValueChange={handleSubRoleChange}
                disabled={!mainRoleId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select sub role" />
                </SelectTrigger>

                <SelectContent className="">
                  {subRoles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      [
                      {r?.code != null
                        ? r.code.toString().padStart(5, "0")
                        : ""}
                      ] {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Footer */}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>

            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Access"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
