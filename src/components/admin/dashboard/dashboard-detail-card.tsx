"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { updateDashboard } from "@/actions/admin/dashboard/action";

type Dashboard = {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdBy: string | null;
  description: string | null;
  color: string | null;
  workspaceId: string;
  reportId: string;
  accessCtrl: "ACTIVE" | "INACTIVE";
};

type FormValues = {
  name: string;
  description: string;
  workspaceId: string;
  reportId: string;
  accessCtrl: "ACTIVE" | "INACTIVE";
  status: "ACTIVE" | "INACTIVE";
  color: string;
};

const dashboardSchema = z.object({
  name: z.string().min(1, "Dashboard name is required"),
  description: z.string(),
  workspaceId: z.string().min(1, "Workspace ID is required"),
  reportId: z.string().min(1, "Report ID is required"),
  accessCtrl: z.enum(["ACTIVE", "INACTIVE"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, "Invalid color"),
});

const presetColors = [
  "#2563EB",
  "#16A34A",
  "#DC2626",
  "#F59E0B",
  "#7C3AED",
  "#0891B2",
  "#DB2777",
  "#4B5563",
  "#0F766E",
  "#9333EA",
];

export default function DashboardDetailCard({
  dashboard,
}: {
  dashboard: Dashboard;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(dashboardSchema),
    defaultValues: {
      name: dashboard.name,
      description: dashboard.description ?? "",
      workspaceId: dashboard.workspaceId,
      reportId: dashboard.reportId,
      accessCtrl: dashboard.accessCtrl,
      status: dashboard.status,
      color: dashboard.color ?? "#2563EB",
    },
  });

  const statusValue = watch("status");
  const rbacValue = watch("accessCtrl");
  const selectedColor = watch("color");

  const onSubmit = async (data: FormValues) => {
    await toast.promise(updateDashboard(dashboard.id, data), {
      loading: "Saving changes...",
      success: "Dashboard updated successfully",
      error: "Failed to update dashboard",
    });

    reset(data);
  };

  return (
    <Card className="shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle>Dashboard Detail</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Dashboard ID */}
          <div>
            <label className="text-sm">Dashboard ID</label>
            <Input defaultValue={dashboard.id} disabled />
          </div>

          {/* Name */}
          <div>
            <label className="text-sm">Dashboard Name</label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm">Dashboard Description</label>
            <Textarea {...register("description")} />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Color */}

          <div>
            <label className="text-sm font-medium">Theme Color</label>

            {/* Preset */}
            <div className="flex flex-wrap gap-3 mt-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    setValue("color", color, { shouldDirty: true })
                  }
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor?.toLowerCase() === color.toLowerCase()
                      ? "border-black scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Custom Input */}
            <div className="mt-3 flex items-center gap-3">
              {/* Native Color Picker */}
              <input
                type="color"
                value={selectedColor}
                onChange={(e) =>
                  setValue("color", e.target.value, { shouldDirty: true })
                }
                className="w-8 h-8 cursor-pointer rounded-md border-0 p-0 overflow-hidden"
                style={{
                  appearance: "none",
                  WebkitAppearance: "none",
                }}
              />

              <style jsx>{`
                input[type="color"]::-webkit-color-swatch-wrapper {
                  padding: 0;
                }

                input[type="color"]::-webkit-color-swatch {
                  border: none;
                  border-radius: 6px;
                }
              `}</style>

              {/* Hex Input */}
              <Input
                value={selectedColor}
                placeholder="#2563EB"
                onChange={(e) =>
                  setValue("color", e.target.value, { shouldDirty: true })
                }
                className="w-40 font-mono"
              />
            </div>

            {errors.color && (
              <p className="text-sm text-red-500 mt-2">
                {errors.color.message}
              </p>
            )}
          </div>

          {/* Workspace */}
          <div>
            <label className="text-sm">Workspace ID</label>
            <Input {...register("workspaceId")} />
            {errors.workspaceId && (
              <p className="text-sm text-red-500">
                {errors.workspaceId.message}
              </p>
            )}
          </div>

          {/* Report */}
          <div>
            <label className="text-sm">Report ID</label>
            <Input {...register("reportId")} />
            {errors.reportId && (
              <p className="text-sm text-red-500">{errors.reportId.message}</p>
            )}
          </div>

          {/* RBAC */}
          <div>
            <label className="text-sm">Role-Base Access Control</label>
            <Select
              value={rbacValue}
              onValueChange={(value) =>
                setValue("accessCtrl", value as "ACTIVE" | "INACTIVE", {
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

          {/* Status */}
          <div>
            <label className="text-sm">Status</label>
            <Select
              value={statusValue}
              onValueChange={(value) =>
                setValue("status", value as "ACTIVE" | "INACTIVE", {
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

          {/* Metadata */}
          <div className="text-xs text-muted-foreground pt-2">
            <p>Created: {new Date(dashboard.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(dashboard.updatedAt).toLocaleString()}</p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              disabled={!isDirty || isSubmitting}
              onClick={() => reset()}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
