"use client";

import { toast } from "sonner";
import * as React from "react";
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

import { updateUser } from "@/actions/admin/user/action";
import { Loader2 } from "lucide-react";

type User = {
  id: string;
  username: string;
  displayName: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  provider_id: string;
};

/* ---------------- ZOD ---------------- */

const formSchema = z.object({
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(50, "Display name must be less than 50 characters"),

  role: z.enum(["ANONYMOUS", "VIEWER", "ADMIN", "SUPER_ADMIN"]),
});

type FormValues = z.infer<typeof formSchema>;

/* ---------------- COMPONENT ---------------- */

export default function UserProfileCard({
  user,
  currentUserId,
}: {
  user: User;
  currentUserId: string;
}) {
  const isSelf = user.id === currentUserId;
  const isAdmin = user.role === "ADMIN";
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: user.displayName ?? "",
      role: user.role as FormValues["role"],
    },
  });

  const roleValue = watch("role");

  const onSubmit = async (data: FormValues) => {
  // 🚨 SUPER ADMIN ห้ามลดตัวเอง
  if (isSelf && isSuperAdmin && data.role !== "SUPER_ADMIN") {
    toast.error("Super Admin cannot downgrade their own role.");
    return;
  }

  // 🚨 ADMIN ห้ามเปลี่ยน role ตัวเอง
  if (isSelf && isAdmin && data.role !== "ADMIN") {
    toast.error("Admin cannot change their own role.");
    return;
  }

  try {
    const res = await updateUser(user.id, data.displayName, data.role);
    toast.success(res.message || "Update successfully");

    reset(data);
  } catch (err: any) {
    toast.error(err?.message || "Failed to update");
  }
};

  const handleCancel = () => {
    reset();
  };

  return (
    <Card className="shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm">Username</label>
            <Input value={user.username} disabled />
          </div>

          <div>
            <label className="text-sm">Display Name</label>

            <Input
              {...register("displayName")}
              placeholder="Enter display name"
            />

            {errors.displayName && (
              <p className="text-sm text-red-500 mt-1">
                {errors.displayName.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm">Role</label>

            <Select
              value={roleValue}
              onValueChange={(value) =>
                setValue("role", value as FormValues["role"], {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
  <SelectItem
    value="ANONYMOUS"
    disabled={isSelf && (isAdmin || isSuperAdmin)}
  >
    Anonymous
  </SelectItem>

  <SelectItem
    value="VIEWER"
    disabled={isSelf && (isAdmin || isSuperAdmin)}
  >
    Viewer
  </SelectItem>

  <SelectItem
    value="ADMIN"
    disabled={isSelf && isSuperAdmin}
  >
    Admin
  </SelectItem>

  <SelectItem
    value="SUPER_ADMIN"
    disabled={isSelf && isAdmin}
  >
    Super Admin
  </SelectItem>
</SelectContent>
            </Select>

            {errors.role && (
              <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
            )}

            {isSelf && isAdmin && (
              <p className="text-xs text-muted-foreground mt-1">
                You cannot change your own role.
              </p>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1 pt-2">
            <p>Created: {new Date(user.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(user.updatedAt).toLocaleString()}</p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              disabled={!isDirty || isSubmitting}
              onClick={handleCancel}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
