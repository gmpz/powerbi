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

import { insertDashboard } from "@/actions/admin/dashboard/action";
import { useRouter } from "next/navigation";

type Dashboard = {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  reportId: string;
  rbac: "ACTIVE" | "INACTIVE";
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
  color: string | null; // ✅ เพิ่ม color ถ้ามีใน DB
};

/* ===================== ZOD SCHEMA ===================== */

const dashboardSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Dashboard name must be at least 3 characters")
    .max(100),

  description: z.string().trim().max(500, "Description too long").optional(),

  workspaceId: z.string().min(1, "Workspace ID is required"),

  reportId: z.string().min(1, "Report ID is required"),

  status: z.enum(["ACTIVE", "INACTIVE"]),
  rbac: z.enum(["ACTIVE", "INACTIVE"]),

  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid color format"),
});

type FormValues = z.infer<typeof dashboardSchema>;

/* ===================== PRESET COLORS ===================== */

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

/* ===================== COMPONENT ===================== */

export default function DashboardCreate() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(dashboardSchema),
    defaultValues: {
      name: "",
      description: "",
      workspaceId: "",
      reportId: "",
      rbac: "ACTIVE",
      status: "ACTIVE",
      color: "#2563EB",
    },
  });
  const router = useRouter();

  const selectedColor = watch("color");
  const statusValue = watch("status");
  const rbacValue = watch("rbac");

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await insertDashboard(data);
      toast.success(res.message || "Main role added successfully");
      reset();
      router.push(`/admin/dashboard/setting/${res.dashboard.id}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to add main role");
    }
  };

  return (
    <Card className="shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle>Dashboard Create</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm font-medium">Dashboard Name</label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Dashboard Description</label>
            <Textarea {...register("description")} />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Color Picker */}
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
            <label className="text-sm font-medium">Workspace ID</label>
            <Input {...register("workspaceId")} />
            {errors.workspaceId && (
              <p className="text-sm text-red-500 mt-1">
                {errors.workspaceId.message}
              </p>
            )}
          </div>

          {/* Report */}
          <div>
            <label className="text-sm font-medium">Report ID</label>
            <Input {...register("reportId")} />
            {errors.reportId && (
              <p className="text-sm text-red-500 mt-1">
                {errors.reportId.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium">
              Role-Base Access Control
            </label>
            <Select
              value={rbacValue}
              onValueChange={(value) =>
                setValue("rbac", value as "ACTIVE" | "INACTIVE", {
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
            <label className="text-sm font-medium">Status</label>
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

          {/* Actions */}
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
              {isSubmitting ? "Creating..." : "Create Dashboard"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
