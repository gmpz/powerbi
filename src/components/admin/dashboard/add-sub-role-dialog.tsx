"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { insertDashboardSubRole } from "@/actions/admin/dashboard/action";
import { Loader2 } from "lucide-react";

type MainRoleType = {
  id: string;
  name: string;
  dashboardId: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
};

/* -------------------- ZOD SCHEMA -------------------- */

const formSchema = z.object({
  mainRoleId: z.string().min(1, "Please select main role"),

  subRoleCode: z
  .string()
  .length(5, "HosCode must be exactly 5 digits")
  .regex(/^\d+$/, "HosCode must be numbers only")
  .refine((val) => Number(val) > 0, {
  message: "HosCode must be greater than 00000",
}),

  subRoleName: z
    .string()
    .min(1, "Sub-role must be at least 1 characters")
    .max(190),
});

type FormValues = z.infer<typeof formSchema>;

/* -------------------- COMPONENT -------------------- */

export default function AddSubRoleDialog({
  open,
  setOpen,
  mainRole,
  dashboardId,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  mainRole: MainRoleType[]; // ✅ FIX: ต้องเป็น array
  dashboardId: string;
}) {
  const router = useRouter();
  const {
  register,
  handleSubmit,
  setValue,
  formState: { errors, isSubmitting },
  reset,
} = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  mode: "onChange",
});

  const subRoleCodeField = register("subRoleCode");

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await insertDashboardSubRole(
        dashboardId,
        data.subRoleCode,
        data.subRoleName,
        data.mainRoleId,
      );
      toast.success(res.message || "Sub role added successfully");
      setOpen(false);
      reset();
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add sub role");
    }
  };
  const onCancel = () => {
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogContent className="max-w-xl w-full rounded-2xl overflow-visible">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add Dashboard Access
          </DialogTitle>
        </DialogHeader>

        <Separator className="my-4" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 🔹 Main Role */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Main-Role Select</label>

            <Select
              onValueChange={(value) =>
                setValue("mainRoleId", value, { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select main role" />
              </SelectTrigger>

              <SelectContent>
                {mainRole.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
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

          {/* 🔹 Sub Role Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sub-Role Code</label>

            <Input
              type="text"
              placeholder="Enter sub role code"
              maxLength={5}
              pattern="\d{5}"
              inputMode="numeric"
              {...subRoleCodeField}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 5);
                e.target.value = value;
                subRoleCodeField.onChange(e);
              }}
            />

            {errors.subRoleCode && (
              <p className="text-sm text-red-500">
                {errors.subRoleCode.message}
              </p>
            )}
          </div>

          {/* 🔹 Sub Role Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sub-Role Name</label>

            <Input
              type="text"
              {...register("subRoleName")}
              placeholder="Enter sub role name"
            />

            {errors.subRoleName && (
              <p className="text-sm text-red-500">
                {errors.subRoleName.message}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Access"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
