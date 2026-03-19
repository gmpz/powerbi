"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Badge } from "@/components/ui/badge";
import AddPermissionDialog from "./add-permission-dialog";
import EditPermissionDialog from "./edit-permission-dialog";

import { useState } from "react";
import { EditIcon, Trash2Icon } from "lucide-react";
import { DelPermissionDialog } from "./del-permission-dialog";

export default function DashboardPermissionTable({
  userId,
  dashboards,
}: {
  userId: string;
  dashboards: any;
}) {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDel, setOpenDel] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [selectedDelRow, setSelectedDelRow] = useState<any>(null);

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
      field: "dashboard",
      headerName: "Dashboard",
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <span className="inline-flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: params.value.color }}
          />
          {params.value.name}
        </span>
      ),
    },

    {
      field: "mainRole",
      headerName: "Main Role",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => <span>{params.value?.name == null ? "-" : params.value.name}</span>
    },

    {
      field: "subRole",
      headerName: "Sub Role",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <span>{params.value?.code != null ? "[" + params.value?.code.toString().padStart(5, "0") + "]" : "-"}</span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
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
              setSelectedRow(params.row);
              setOpenEdit(true);
            }}
          >
            <EditIcon />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setSelectedDelRow(params.row);
              setOpenDel(true);
            }}
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
  <CardTitle className="text-base sm:text-lg">
    Dashboard Access
  </CardTitle>

  <Button
    variant="outline"
    className="w-full sm:w-auto"
    onClick={() => setOpenAdd(true)}
  >
    + Add Dashboard
  </Button>
</CardHeader>

      <CardContent style={{ height: 400 }}>
        <DataGrid
          rows={dashboards}
          columns={columns}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
          sx={{
            width: "100%",
            "& .MuiDataGrid-main": {
              overflowX: "auto", // 👈 scroll อยู่แค่ตาราง
            },
          }}
        />
      </CardContent>

      <AddPermissionDialog
        userId={userId}
        open={openAdd}
        setOpen={setOpenAdd}
      />

      <EditPermissionDialog
        dash={selectedRow}
        userId={userId}
        open={openEdit}
        setOpen={setOpenEdit}
      />

      <DelPermissionDialog open={openDel} setOpen={setOpenDel} dash={selectedDelRow} userId={userId}/>
    </Card>
  );
}
