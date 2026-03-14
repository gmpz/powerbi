"use client";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  updateDashboardMainRole,
  updateDashboardSubRole,
} from "@/actions/admin/user_dashboard/action";

/* ---------------- Schema ---------------- */

const schema = z.object({
  name: z.string().min(1, "Role name is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type FormValues = z.infer<typeof schema>;

export default function EditSubRoleDialog({ subRole, open, setOpen }: any) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      status: "ACTIVE",
    },
  });
  const router = useRouter();

  const status = watch("status");

  /* ---------------- Load Default Values ---------------- */

  useEffect(() => {
    if (!open) return;

    reset({
      name: subRole.name,
      status: subRole.status,
    });
  }, [open]);

  /* ---------------- Submit ---------------- */

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await updateDashboardSubRole(subRole.id, data);
      toast.success(res.message || "Main role added successfully");
      setOpen(false);
      reset();
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add main role");
    }
  };

  /* ---------------- Cancel ---------------- */

  const onCancel = () => {
    reset({
      name: subRole.name,
      status: subRole.status,
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild></DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit</DialogTitle>
        </DialogHeader>

        <Separator className="my-2" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Name */}
          <div className="">
            <label className="text-sm font-medium">Main Role</label>

            <Input
              placeholder="Enter role name"
              defaultValue={subRole?.mainRole?.name}
              disabled
            />
          </div>
          <div className="">
            <label className="text-sm font-medium">Sub Role Code</label>

            <Input
              placeholder="Enter role name"
              defaultValue={
                subRole?.code != null
                  ? subRole.code.toString().padStart(5, "0")
                  : ""
              }
              disabled
            />
          </div>
          <div className="">
            <label className="text-sm font-medium">Sub Role Name</label>

            <Input placeholder="Enter role name" {...register("name")} />

            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Status */}

          <div>
            <label className="text-sm">Status</label>

            <Select
              value={status}
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

            {errors.status && (
              <p className="text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>

          <Separator />

          {/* Footer */}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>

            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
