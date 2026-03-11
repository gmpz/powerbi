"use client";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getMainRoles,
  getSubRoles,
  updateDashboardPermission,
} from "@/actions/admin/user_dashboard/action";

/* ---------------- Schema ---------------- */

const schema = z.object({
  dashboardId: z.string().min(1, "Please select dashboard"),
  mainRoleId: z.string().min(1, "Please select main role"),
  subRoleId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type FormValues = z.infer<typeof schema>;

/* ---------------- Types ---------------- */

type Dashboard = {
  id: string;
  name: string;
};

type MainRole = {
  id: string;
  name: string;
};

type SubRole = {
  id: string;
  name: string;
};

export default function EditPermissionDialog({
  open,
  setOpen,
  userId,
  dash,
}: {
  dash: any;
  userId: string;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [mainRoles, setMainRoles] = useState<MainRole[]>([]);
  const [subRoles, setSubRoles] = useState<SubRole[]>([]);
  const [initialValues, setInitialValues] = useState<FormValues | null>(null);

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
      status: "ACTIVE",
    },
  });

  /* ---------------- Watch ---------------- */

  const dashboardId = watch("dashboardId");
  const mainRoleId = watch("mainRoleId");
  const subRoleId = watch("subRoleId");
  const status = watch("status");

  /* ---------------- Check Change ---------------- */

  const isChanged =
    initialValues &&
    (dashboardId !== initialValues.dashboardId ||
      mainRoleId !== initialValues.mainRoleId ||
      subRoleId !== initialValues.subRoleId ||
      status !== initialValues.status);

  const canSubmit = !!dashboardId && !!mainRoleId && isChanged;

  /* ---------------- Load Data ---------------- */

  useEffect(() => {
    if (!open || !dash) return;

    const loadData = async () => {
      setDashboards([
        {
          id: dash.dashboard.id,
          name: dash.dashboard.name,
        },
      ]);
      

      const roles = await getMainRoles(dash.dashboardId);
      setMainRoles([
        {
          id: dash.mainRole.id,
          name: dash.mainRole.name,
        },
        ...roles.filter((r) => r.id !== dash.mainRole.id),
      ]);
      

      const subs = await getSubRoles(dash.mainRoleId);
      setSubRoles([
        {
          id: dash.mainRole.id,
          name: dash.mainRole.name,
        },
        ...roles.filter((r) => r.id !== dash.mainRole.id),
      ]);

      const defaultData: FormValues = {
        dashboardId: dash.dashboardId,
        mainRoleId: dash.mainRoleId,
        subRoleId: dash.subRoleId ?? "",
        status: dash.status,
      };
      

      reset(defaultData);
      setInitialValues(defaultData);
    };

    loadData();
  }, [open, dash, reset]);

  /* ---------------- Dashboard Change ---------------- */

  const handleDashboardChange = async (id: string) => {
    setValue("dashboardId", id, { shouldDirty: true });

    setValue("mainRoleId", "");
    setValue("subRoleId", "");

    setSubRoles([]);

    const roles = await getMainRoles(id);
    setMainRoles(roles);
  };

  /* ---------------- Main Role Change ---------------- */

  const handleMainRoleChange = async (id: string) => {
    setValue("mainRoleId", id, { shouldDirty: true });

    setValue("subRoleId", "");

    const subs = await getSubRoles(id);
    setSubRoles(subs);
  };

  const handleSubRoleChange = (id: string) => {
    setValue("subRoleId", id, { shouldDirty: true });
  };

  /* ---------------- Submit ---------------- */

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await updateDashboardPermission(dash.id, data);

      toast.success(res.message || "Update successfully");

      setOpen(false);
      reset();

      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update");
    }
  };

  /* ---------------- Cancel ---------------- */

  const onCancel = () => {
    if (initialValues) {
      reset(initialValues);
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Permission</DialogTitle>
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

                <SelectContent>
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

            {/* Sub Role */}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Sub Role (optional)
              </label>

              <Select
                value={subRoleId}
                onValueChange={handleSubRoleChange}
                disabled={!mainRoleId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select sub role" />
                </SelectTrigger>

                <SelectContent>
                  {subRoles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>

            <Select
              value={status}
              onValueChange={(value) =>
                setValue("status", value as "ACTIVE" | "INACTIVE", {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>

          <Separator />

          {/* Buttons */}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>

            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}