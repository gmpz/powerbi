"use client";

import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, TextField } from "@mui/material";
import { red } from "@mui/material/colors";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CloudSyncIcon, EditIcon, FolderSync, Trash2Icon } from "lucide-react";
import { DelDefualtRoleDialog } from "./del-default-role-dialog";
import AddDefualtRoleDialog from "./add-defualt-role-dialog";
import { Param } from "@prisma/client/runtime/library";
import EditDefaultRoleDialog from "./edit-default-role-dialog";
import { syncUserDashboard } from "@/actions/admin/user_permission/action";
import { Badge } from "@/components/ui/badge";

type UserDefaultRole = {
  id: string;
  username: string;
  displayName: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  provider_id: string;

  defaultRoles: {
    mainRole: {
      id: string;
      name: string;
    } | null;

    subRole: {
      id: string;
      name: string;
    } | null;
  }[];
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

export default function UserDefaultRoleTable({
  users,
  currentUser,
}: {
  users: UserDefaultRole[];
  currentUser: User;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const router = useRouter();

  const [openDel, setOpenDel] = React.useState(false);
  const [selectedDelRow, setSelectedDelRow] = React.useState<UserDefaultRole>();

  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);

  const [selectedRow, setSelectedRow] = React.useState<any>(null);

  const [syncing, setSyncing] = React.useState(false);

  const columns: GridColDef[] = [
    { field: "no", headerName: "No", width: 90 },
    { field: "username", headerName: "Username",flex: 1, minWidth: 200},
    { field: "displayName", headerName: "Display Name", flex: 1, minWidth: 250 },

    { field: "role", headerName: "Role",flex: 1, minWidth: 120 },
    {
      field: "mainRole",
      headerName: "mainRole",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        return (
          <span>
            {params.row.defaultRoles[0].mainRole?.name
              ? params.row.defaultRoles[0].mainRole?.name
              : "-"}
          </span>
        );
      },
    },
    {
      field: "subRole",
      headerName: "subRole",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        return (
          <span>
            {params.row.defaultRoles[0].subRole?.name
              ? params.row.defaultRoles[0].subRole?.name
              : "-"}
          </span>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      renderCell: (params) => (
        <Badge variant="secondary">
          <span
            className={`${params.row.defaultRoles[0].status == "ACTIVE" ? "text-green-700" : "text-gray-400"}`}
          >
            {params.row.defaultRoles[0].status}
          </span>
        </Badge>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 150,
      renderCell: (params) => {
        return (
          <div className="flex items-center justify-center space-x-1 w-full h-full">
            <Button
              variant={"outline"}
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
              disabled={currentUser.role == "SUPER_ADMIN" ? false : true}
              onClick={() => {
                if (currentUser.role != "SUPER_ADMIN") return;
                setSelectedDelRow(params.row);
                setOpenDel(true);
              }}
            >
              <Trash2Icon className="text-sm" />
            </Button>
          </div>
        );
      },
    },
  ];

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // 👈 ป้องกัน SSR crash

  const filteredRows = users.filter(
    (row) =>
      (row.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (row.displayName || "").toLowerCase().includes(search.toLowerCase()) ||
      (row.role || "").toLowerCase().includes(search.toLowerCase()),
  );
  const rowsWithIndex = filteredRows.map((row, index) => ({
    ...row,
    no: index + 1, // 👈 สร้างลำดับ
  }));
  const handleSync = async () => {
    try {
      setSyncing(true);

      // 👇 ยิง API (แก้ path ตามของจริง)
      const res = await syncUserDashboard();

      if (!res.success) throw new Error("Sync failed");

      // 👇 refresh data
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        <TextField
          label="Search"
          size="small"
          fullWidth
          className="sm:max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-4 justify-center items-center">
          <Button variant={"outline"} onClick={handleSync} disabled={syncing}>
            <CloudSyncIcon className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing..." : "Sync Dashboard"}
          </Button>
          <Button variant={"outline"} onClick={() => setOpenAdd(true)}>
            + Default Role's User
          </Button>
        </div>
      </div>

      {/* responsive container */}
      
        <DataGrid
          rows={rowsWithIndex}
          columns={columns}
          pageSizeOptions={[10, 20]}
          sx={{
            width: "100%",
            "& .MuiDataGrid-main": {
              overflowX: "auto", // 👈 scroll อยู่แค่ตาราง
            },
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
        />

        <EditDefaultRoleDialog
          dash={selectedRow}
          open={openEdit}
          setOpen={setOpenEdit}
        />

        <AddDefualtRoleDialog open={openAdd} setOpen={setOpenAdd} />
      

      {syncing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 🔮 Glass background */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          {/* 🧊 Glass card */}
          <div
            className="relative flex flex-col items-center gap-3 px-6 py-5 
                    rounded-2xl 
                    bg-white/20 backdrop-blur-xl 
                    border border-white/30 
                    shadow-xl"
          >
            {/* 🔄 Spinner */}
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />

            {/* 📝 Text */}
            <p className="text-white text-sm font-medium tracking-wide">
              Syncing dashboard...
            </p>
          </div>
        </div>
      )}

      <DelDefualtRoleDialog
        open={openDel}
        setOpen={setOpenDel}
        user={selectedDelRow}
      />
    </Box>
  );
}
