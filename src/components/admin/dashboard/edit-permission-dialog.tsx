"use client";

import { Button } from "@/components/ui/button";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectTrigger,SelectItem,SelectValue} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
const dashboards = [
  { value: "sales", label: "Sales Dashboard" },
  { value: "finance", label: "Finance Dashboard" },
  { value: "marketing", label: "Marketing Dashboard" },
];

const subRoles = [
  { code: "none", value: "NONE", label: "None" },
  { code: "export", value: "EXPORT", label: "Export" },
  { code: "edit", value: "EDIT_WIDGET", label: "Edit Widget" },
  { code: "delete", value: "DELETE", label: "Delete" },
];
export default function EditPermissionDialog({ permission,open,
  setOpen, }: any) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit {permission.dashboard}
          </DialogTitle>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-6">
          {/* 🔹 Row 1 — Dashboard (Full Width) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Dashboard Name
            </label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select dashboard" />
              </SelectTrigger>
              <SelectContent>
                {dashboards.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 🔹 Row 2 — Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Role */}
            <div className="space-y-2 min-w-0">
              <label className="text-sm font-medium">
                Main Role
              </label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select main role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sub Role (Combobox) */}
            <div className="space-y-2 min-w-0">
              <label className="text-sm font-medium">
                Sub Role
              </label>

              <div className="w-full">
                <Combobox items={subRoles} defaultValue={subRoles[0]}>
                  <ComboboxTrigger
                    render={
                      <Button
                        variant="outline"
                        className="w-full justify-between font-normal"
                      >
                        <ComboboxValue />
                      </Button>
                    }
                  />

                  <ComboboxContent className="z-50 w-full">
                    <ComboboxInput
                      showTrigger={false}
                      placeholder="Search sub role..."
                    />
                    <ComboboxEmpty>
                      No sub role found.
                    </ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem
                          key={item.code}
                          value={item}
                        >
                          {item.label}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>
          </div>

          <Separator />

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setOpen(false) }
            >
              Cancel
            </Button>
            <Button>
              Add Access
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}