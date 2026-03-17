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
import { Loader2 } from "lucide-react";
import { getDefaultMainRoles, updateDefualtRole } from "@/actions/admin/user_permission/action";

/* ---------------- Schema ---------------- */

const schema = z.object({
  dashboardId: z.string().min(1, "Please select dashboard"),
  mainRoleId: z.string().min(1, "Please select main role"),
  subRoleId: z.string(),
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
  code: string;
  name: string;
};

type SubRole = {
  id: string;
  code: number;
  name: string;
};

export default function EditDefaultRoleDialog({
  open,
  setOpen,

  dash,
}: {
  dash: any;

  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const router = useRouter();

  

  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [mainRoles, setMainRoles] = useState<MainRole[]>([]);
  const [subRoles, setSubRoles] = useState<SubRole[]>([]);
  const [initialValues, setInitialValues] = useState<FormValues | null>(null);
  
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

  /* ---------------- Change Detection ---------------- */

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

    const load = async () => {
      setDashboards([
        {
          id: dash.id,
          name: dash.displayName,
        },
      ]);

      /* main roles */

      const roles = await getDefaultMainRoles();

      const newMainRoles = [
        ...(dash.defaultRoles[0].mainRole
          ? [
              {
                id: dash.defaultRoles[0].mainRole.id,
                code: dash.defaultRoles[0].mainRole.code,
                name: dash.defaultRoles[0].mainRole.name,
              },
            ]
          : []),
        ...roles.filter((r: any) => r.id !== dash.defaultRoles[0].mainRole?.id),
      ];

      setMainRoles(newMainRoles);

      /* sub roles */
      if (dash.defaultRoles[0].mainRole !== null) {
        const subs = await getSubRoles(dash.defaultRoles[0].mainRoleId);

        const newSubRoles = [
          ...(dash.defaultRoles[0].subRole
            ? [
                {
                  id: dash.defaultRoles[0].subRole.id,
                  code: dash.defaultRoles[0].subRole.code,
                  name: dash.defaultRoles[0].subRole.name,
                },
              ]
            : []),
          ...subs.filter((r: any) => r.id !== dash.defaultRoles[0].subRole?.id),
        ];

        setSubRoles(newSubRoles);
      }

      /* default values */

      const defaultData: FormValues = {
        dashboardId: dash.id,
        mainRoleId: dash.defaultRoles[0].mainRoleId,
        subRoleId: dash.defaultRoles[0].subRoleId ?? "",
        status: dash.defaultRoles[0].status,
      };

      reset(defaultData);
      setInitialValues(defaultData);
    };

    load();
  }, [open, dash, reset]);

  /* ---------------- Dashboard Change ---------------- */

  const handleDashboardChange = async (id: string) => {
    setValue("dashboardId", id, { shouldDirty: true });

    setValue("mainRoleId", "", { shouldDirty: true });
    setValue("subRoleId", "", { shouldDirty: true });

    setSubRoles([]);

    const roles = await getMainRoles(id);
    setMainRoles(roles);
  };

  /* ---------------- Main Role Change ---------------- */

  const handleMainRoleChange = async (id: string) => {
    setValue("mainRoleId", id, { shouldDirty: true });

    setValue("subRoleId", "", { shouldDirty: true });

    const subs = await getSubRoles(id);
    setSubRoles(subs);
  };

  /* ---------------- Sub Role Change ---------------- */

  const handleSubRoleChange = (id: string) => {
    setValue("subRoleId", id, { shouldDirty: true });
  };

  /* ---------------- Submit ---------------- */

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await updateDefualtRole(dash?.defaultRoles[0].id, data);

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
    if (initialValues) reset(initialValues);
    setOpen(false);
  };

  /* ---------------- UI ---------------- */

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
            <label className="text-sm font-medium">Dashboard</label>

            <Select
              value={dashboardId || ""}
              onValueChange={handleDashboardChange}
            >
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
                value={mainRoleId || ""}
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
              <label className="text-sm font-medium">Sub Role (optional)</label>

              <Select
                key={subRoleId}
                value={subRoleId || ""}
                onValueChange={handleSubRoleChange}
                disabled={!mainRoleId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select sub role" />
                </SelectTrigger>

                <SelectContent>
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

          {/* Status */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>

            <Select
              value={status}
              onValueChange={(v) =>
                setValue("status", v as "ACTIVE" | "INACTIVE", {
                  shouldDirty: true,
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
          </div>

          <Separator />

          {/* Buttons */}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>

            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
