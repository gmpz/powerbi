"use client";

import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, TextField } from "@mui/material";
import { red } from "@mui/material/colors";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EditIcon, Trash2Icon } from "lucide-react";
import { DelDefualtRoleDialog } from "./del-default-role-dialog";
import AddDefualtRoleDialog from "./add-defualt-role-dialog";
import { Param } from "@prisma/client/runtime/library";
import EditDefaultRoleDialog from "./edit-default-role-dialog";

type UserDefaultRole = {
  id: string
  username: string
  displayName: string | null
  email: string | null
  role: string
  createdAt: Date
  updatedAt: Date
  provider_id: string

  defaultRoles: {
    mainRole: {
      id: string
      name: string
    } | null

    subRole: {
      id: string
      name: string
    } | null
  }[]
}
type User = {
  id: string
  username: string
  displayName: string | null
  email: string | null
  role: string
  createdAt: Date
  updatedAt: Date
  provider_id: string
}


export default function UserDefaultRoleTable({ users, currentUser }: { users: UserDefaultRole[], currentUser:User }) {
  const [mounted, setMounted] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const router = useRouter();

  const [openDel, setOpenDel] = React.useState(false);
  const [selectedDelRow, setSelectedDelRow] = React.useState<UserDefaultRole>();

  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);

  const [selectedRow, setSelectedRow] = React.useState<any>(null);



  const columns: GridColDef[] = [
  { field: "no", headerName: "No", width: 90 },
  { field: "username", headerName: "Username", flex: 1 },
  { field: "displayName", headerName: "Display Name", flex: 1 },
  
  { field: "role", headerName: "Role", width: 150 },
  { field: "mainRole", headerName: "mainRole", width: 150 , renderCell: (params) => {
    return ( 
      <span>{params.row.defaultRoles[0].mainRole?.name ? params.row.defaultRoles[0].mainRole?.name : "-"}</span>
    )} },
  { field: "subRole", headerName: "subRole", width: 150 , renderCell: (params) => {
    return ( 
      <span>{params.row.defaultRoles[0].subRole?.name ? params.row.defaultRoles[0].subRole?.name : "-"}</span>
    )}},
  {
    field: "actions",
    headerName: "Actions",
    width: 150,
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

  const filteredRows = users.filter((row) =>
    (row.username || "").toLowerCase().includes(search.toLowerCase()) ||
    (row.displayName || "").toLowerCase().includes(search.toLowerCase()) ||
    (row.role || "").toLowerCase().includes(search.toLowerCase())
  );
  const rowsWithIndex = filteredRows.map((row, index) => ({
  ...row,
  no: index + 1, // 👈 สร้างลำดับ
}));

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
      <Button variant={"outline"} onClick={() => setOpenAdd(true)}>
          + Default Role's User 
        </Button>
    </div>

    {/* responsive container */}
    <div style={{ width: "100%", overflowX: "auto" }}>
      <DataGrid
        rows={rowsWithIndex}
        columns={columns}
        pageSizeOptions={[10, 20]}
        autoHeight
        sx={{
          minWidth: 700, // 👈 ถ้าหน้าจอเล็กจะ scroll
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

      <AddDefualtRoleDialog
        open={openAdd}
        setOpen={setOpenAdd}
      />
      
    </div>

    <DelDefualtRoleDialog open={openDel} setOpen={setOpenDel} user={selectedDelRow}  />
  </Box>
);
}