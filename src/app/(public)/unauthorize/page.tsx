"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { logout } from "@/actions/auth/action";

export default function UnauthorizePage() {


  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-amber-100">
          <ShieldAlert className="w-8 h-8 text-amber-600" />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            กำลังรอการอนุมัติ
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            บัญชีของคุณยังไม่ได้รับสิทธิ์เข้าใช้งานระบบ
            กรุณารอการอนุมัติจากผู้ดูแลระบบ
          </p>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          Waiting for approval
        </div>

        {/* Actions */}
        <div className="pt-4 space-y-3">
          
          <button
            onClick={handleLogout}
            className="w-full bg-gray-900 hover:bg-black text-white py-2 rounded-lg transition"
          >
            ออกจากระบบ
          </button>

          <p className="text-xs text-gray-400">
            หากมีข้อสงสัย กรุณาติดต่อผู้ดูแลระบบ
          </p>
        </div>
      </div>
    </div>
  );
}
