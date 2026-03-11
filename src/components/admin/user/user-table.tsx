"use client";

import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, TextField } from "@mui/material";
import { red } from "@mui/material/colors";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EditIcon, Trash2Icon } from "lucide-react";
import { DelUserDialog } from "./del-user-dialog";

type User = {
    id: string,
    username: string,
    displayName: string | null,
    email: string | null,
    role: string,
    createdAt: Date,
    updatedAt: Date,
    provider_id: string,

};


export default function UserTable({ users, currentUser }: { users: User[], currentUser:User }) {
  const [mounted, setMounted] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const router = useRouter();

  const [openDel, setOpenDel] = React.useState(false);
  const [selectedDelRow, setSelectedDelRow] = React.useState<User>();

  const handleEdit = (row: User) => {

    router.push(`/admin/users/${row.id}`); // ตัวอย่างการ route ไปหน้า edit
    // จะเปิด dialog ก็ได้
    // หรือ route ไปหน้า edit ก็ได้
  };

  const roleLevel: Record<string, number> = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  VIEWER: 1,
};

const canDelete = (target: User) => {
  // ❌ ห้ามลบตัวเอง
  if (currentUser.id === target.id) return false;

  const currentLevel = roleLevel[currentUser.role] || 0;
  const targetLevel = roleLevel[target.role] || 0;

  // ❌ ลบ role เท่ากัน หรือ สูงกว่าไม่ได้
  if (currentLevel <= targetLevel) return false;

  return true;
};

  const columns: GridColDef[] = [
  { field: "no", headerName: "No", width: 90 },
  { field: "username", headerName: "Username", flex: 1 },
  { field: "displayName", headerName: "Display Name", flex: 1 },
  { field: "email", headerName: "Email", flex: 1 },
  { field: "role", headerName: "Role", width: 120 },
  {
    field: "actions",
    headerName: "Actions",
    width: 150,
    renderCell: (params) => {
  const allowDelete = canDelete(params.row);

  return (
    <div className="flex items-center justify-center space-x-1 w-full h-full">
      <Button
        variant={"outline"}
        onClick={() => handleEdit(params.row)}
      >
        <EditIcon />
      </Button>

      <Button
        size="sm"
        variant="destructive"
        disabled={!allowDelete}
        onClick={() => {
          if (!allowDelete) return;
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

  const filteredRows = users.filter((row) =>
    (row.username || "").toLowerCase().includes(search.toLowerCase()) ||
    (row.displayName || "").toLowerCase().includes(search.toLowerCase()) ||
    (row.email || "").toLowerCase().includes(search.toLowerCase())
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
    </div>

    {/* responsive container */}
    <div style={{ width: "100%", overflowX: "auto" }}>
      <DataGrid
        rows={rowsWithIndex}
        columns={columns}
        pageSizeOptions={[5, 10]}
        autoHeight
        sx={{
          minWidth: 700, // 👈 ถ้าหน้าจอเล็กจะ scroll
        }}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5, page: 0 },
          },
        }}
      />
    </div>
    <DelUserDialog open={openDel} setOpen={setOpenDel} user={selectedDelRow}  />
  </Box>
);
}