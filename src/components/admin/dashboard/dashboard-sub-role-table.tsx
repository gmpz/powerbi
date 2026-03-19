"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Badge } from "@/components/ui/badge";

import { useState } from "react";
import AddSubRoleDialog from "./add-sub-role-dialog";
import EditSubRoleDialog from "./edit-sub-role-dialog";
import { DelSubRoleDialog } from "./del-sub-role-dialog";
import { EditIcon, Trash2Icon } from "lucide-react";

type SubRoleType = {
  id: string;
  code: number;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
  type: "DASHBOARD" | "SYSTEM";
  mainRole: {
    id: string;
    name: string;
  };
};

type MainRoleType = {
  id: string;
  name: string;
  dashboardId: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
};

export default function DashboardSubRoleTable({
  dashboardId,
  subRoles,
  mainRole,
  userRole
}: {
  dashboardId: string;
  subRoles: SubRoleType[];
  mainRole: MainRoleType[];
  userRole: string;
}) {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDel, setOpenDel] = useState(false);
  const [selectedSubRole, setSelectedSubRole] = useState<SubRoleType | null>(
    null,
  );
  const [selectedDelRole, setSelectedDelRole] = useState<SubRoleType | null>(
    null,
  );

  const columns: GridColDef[] = [
    {
      field: "no",
      headerName: "No",
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <span>
          {params.api.getRowIndexRelativeToVisibleRows(params.id) + 1}
        </span>
      ),
    },

    {
      field: "mainRole",
      headerName: "Main Role",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Badge variant="secondary">{params.value.name}</Badge>
      ),
    },

    {
      field: "code",
      headerName: "Sub Code",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <span>
          [
          {params.value != null ? params.value.toString().padStart(5, "0") : ""}
          ]
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 150,
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
              setSelectedSubRole(params.row);
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
              setOpenDel(true);
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
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <CardTitle className="text-base sm:text-lg">Dashboard Sub Roles</CardTitle>
        <Button variant="outline"  className="w-full sm:w-auto" onClick={() => setOpenAdd(true)}>
          + Add Sub Role
        </Button>
      </CardHeader>

      <CardContent style={{ height: 400 }}>
        <DataGrid
          rows={subRoles}
          columns={columns}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          sx={{
            width: "100%",
            "& .MuiDataGrid-main": {
              overflowX: "auto", // 👈 scroll อยู่แค่ตาราง
            },
          }}
        />
      </CardContent>

      <AddSubRoleDialog
        open={openAdd}
        setOpen={setOpenAdd}
        dashboardId={dashboardId}
        mainRole={mainRole}
      />

      <EditSubRoleDialog
        subRole={selectedSubRole}
        open={openEdit}
        setOpen={setOpenEdit}
      />

      <DelSubRoleDialog
        open={openDel}
        setOpen={setOpenDel}
        subRole={selectedDelRole}
      />
    </Card>
  );
}
