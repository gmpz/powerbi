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

import { useRouter } from "next/navigation";
import { CreateUser } from "@/actions/admin/user/action";

/* ===================== ZOD SCHEMA ===================== */

const userSchema = z.object({
  provider_id: z
    .string()
    .trim()
    .length(13, "Provider ID must be exactly 13 characters"),
  username: z.string().trim().min(3),
  displayName: z.string().trim().min(3),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().optional(),
  role: z.enum(["ANONYMOUS", "VIEWER", "EXECUTIVE", "ADMIN", "SUPER_ADMIN"]),
});

type FormValues = z.infer<typeof userSchema>;

/* ===================== COMPONENT ===================== */

export default function UserCreate() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      provider_id: "",
      username: "",
      displayName: "",
      email: "",
      password: "",
      role: "VIEWER",
    },
  });

  const roleValue = watch("role");

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await CreateUser(data);
      toast.success(res.message || "User added successfully");
      reset();
      //   router.push(`/admin/users`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create user");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="rounded-2xl shadow-sm border">
        <CardHeader>
          <CardTitle className="text-xl">Create New User</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add a new user to the system
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Provider ID */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Provider ID</label>
                <Input maxLength={13} {...register("provider_id")} />

                {errors.provider_id && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.provider_id.message}
                  </p>
                )}
              </div>
            </div>

            {/* Username + Password */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input {...register("username")} />
                {errors.username && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Password</label>
                <Input type="password" {...register("password")} />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* DisplayName + Email */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Display Name</label>
                <Input {...register("displayName")} />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="text-sm font-medium">User Role</label>

              <Select
                value={roleValue}
                onValueChange={(value) =>
                  setValue(
                    "role",
                    value as
                      | "ANONYMOUS"
                      | "VIEWER"
                      | "EXECUTIVE"
                      | "ADMIN"
                      | "SUPER_ADMIN",
                    { shouldDirty: true },
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ANONYMOUS">Anonymous</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                  <SelectItem value="EXECUTIVE">Executive</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                disabled={!isDirty || isSubmitting}
                onClick={() => reset()}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={!isDirty || isSubmitting}>
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
