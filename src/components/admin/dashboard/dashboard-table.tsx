"use client";

import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, TextField } from "@mui/material";

import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditIcon, Trash2Icon } from "lucide-react";
import { DelDashboard } from "./del-dashboard";

type Dashboard = {
  id: string;
  name: string | null;
  color: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  accessCtrl: "ACTIVE" | "INACTIVE";
  _count: {
    users: number;
  };
};

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

export default function DashboardTable({
  dashboards,
  user,
}: {
  dashboards: Dashboard[];
  user: User;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const router = useRouter();
  const [openDel, setOpenDel] = React.useState(false);
  const [selectedDel, setSelectedDel] = React.useState(null);

  const handleEdit = (row: Dashboard) => {
    redirect(`/admin/dashboard/setting/${row.id}`); // ตัวอย่างการ route ไปหน้า edit
    // จะเปิด dialog ก็ได้
    // หรือ route ไปหน้า edit ก็ได้
  };

  const columns: GridColDef[] = [
    { field: "no", headerName: "No", width: 90 },
    {
      field: "name",
      headerName: "Dashboard Name",
      flex: 1,
      renderCell: (params) => (
        <span className="inline-flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: params.row.color || "#ccc" }}
          />
          {params.value}
        </span>
      ),
    },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "userCount",
      headerName: "Used",
      width: 120,
      renderCell: (params) => params.row._count.users,
    },
    {
      field: "accessCtrl",
      headerName: "Access Control",
      width: 120,
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
      field: "status",
      headerName: "Status",
      width: 120,
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
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <div className="flex items-center justify-center space-x-1 w-full h-full">
          <Button variant={"outline"} onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </Button>
          {user.role === "SUPER_ADMIN" && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                setSelectedDel(params.row);
                setOpenDel(true);
              }}
            >
              <Trash2Icon className="text-sm" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // 👈 ป้องกัน SSR crash

  const filteredRows = dashboards.filter(
    (row) =>
      (row.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (row.description || "").toLowerCase().includes(search.toLowerCase()),
  );
  const rowsWithIndex = filteredRows.map((row, index) => ({
    ...row,
    no: index + 1, // 👈 สร้างลำดับ
  }));

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        <TextField
          label="Search"
          size="small"
          fullWidth
          className="sm:max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button
          className="w-full sm:w-auto"
          variant={"outline"}
          onClick={() => {
            router.push(`/admin/dashboard/create`);
          }}
        >
          + New Dashboard
        </Button>
      </div>

      <DataGrid
        rows={rowsWithIndex}
        columns={columns}
        pageSizeOptions={[5, 10]}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5, page: 0 },
          },
        }}
      />

      <DelDashboard
        open={openDel}
        setOpen={setOpenDel}
        dashboard={selectedDel}
      />
    </Box>
  );
}
