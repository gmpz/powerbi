"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Badge } from "@/components/ui/badge";

import { useState } from "react";
import AddMainRoleDialog from "./add-main-role-dialog";
import EditMainRoleDialog from "./edit-main-role-dialog";
import { DelMainRoleDialog } from "./del-main-role-dialog";
import { EditIcon, Trash2Icon } from "lucide-react";

type MainRoleType = {
  id: string;
  name: string;
  dashboardId: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
};

export default function DashboardMainRoleTable({
  dashboardId,
  mainRoles,
  userRole
}: {
  dashboardId: string;
  mainRoles: MainRoleType[];
  userRole:string;
}) {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDels, setOpenDels] = useState(false);
  const [selectedRole, setSelectedRole] = useState<MainRoleType | null>(null);
  const [selectedDelRole, setSelectedDelRole] = useState<MainRoleType | null>(null);

  const columns: GridColDef[] = [
    {
      field: "no",
      headerName: "No",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <span>
          {params.api.getRowIndexRelativeToVisibleRows(params.id) + 1}
        </span>
      ),
    },

    { field: "name", headerName: "Role Name", flex: 1 },

    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        
        <Badge variant="secondary">
          <span
            className={`${params.value == "ACTIVE" ? "text-green-700" : "text-gray-400"}`}
          >
            {params.value}
          </span>
        </Badge>
      ),
    },

    {
      field: "action",
      headerName: "Action",
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex items-center justify-center space-x-1 w-full h-full">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedRole(params.row);
            setOpenEdit(true);
          }}
        >
          <EditIcon />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            setSelectedDelRole(params.row);
            setOpenDels(true);
          }}
          disabled={params.row.type === "SYSTEM" && userRole !== "SUPER_ADMIN"}
        >
          <Trash2Icon className="text-sm" />
        </Button>

        </div>
      ),
    },
  ];

  return (
    <Card className="shadow-md rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Dashboard Main Roles</CardTitle>
        <Button variant="outline" onClick={() => setOpenAdd(true)}>
          + Add Main Role
        </Button>
      </CardHeader>

      <CardContent style={{ height: 400 }}>
        <DataGrid
          rows={mainRoles}
          columns={columns}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
          sx={{ width: "100%" }}
        />
      </CardContent>

      <AddMainRoleDialog
        open={openAdd}
        setOpen={setOpenAdd}
        dashboardId={dashboardId}
      />

      <EditMainRoleDialog
        mainRole={selectedRole}
        open={openEdit}
        setOpen={setOpenEdit}
      />

      <DelMainRoleDialog opens={openDels} setOpens={setOpenDels}  mainRole={selectedDelRole} />
    </Card>
  );
}
