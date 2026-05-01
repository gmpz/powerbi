"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { checkAndRefreshRole, logout } from "@/actions/auth/action";
import {
  checkSubmitRegister,
  getRegisterSubRole,
  register,
} from "@/actions/register/action";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type SubRole = {
  id: string;
  code: number;
  name: string;
};

export default function UnauthorizePage() {
  const router = useRouter();

  // null = loading
  // true = submit แล้ว
  // false = ยังไม่ submit
  const [hasRegistered, setHasRegistered] = useState<boolean | null>(null);

  const [selectedRole, setSelectedRole] = useState<
    "VIEWER" | "EXECUTIVE" | ""
  >("");

  const [orgCode, setOrgCode] = useState<number | null>(null);
  const [orgDesc, setOrgDesc] = useState("");

  const [subRoles, setSubRoles] = useState<SubRole[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const [registerData, subRoleData] = await Promise.all([
          checkSubmitRegister(),
          getRegisterSubRole(),
        ]);

        setHasRegistered(registerData.hasSubmit);
        setSubRoles(subRoleData);
      } catch (error) {
        console.error(error);

        toast.error("ไม่สามารถโหลดข้อมูลได้");

        setHasRegistered(false);
      }
    };

    initialize();

    const interval = setInterval(async () => {
      try {
        const data = await checkAndRefreshRole();

        if (data?.role !== "ANONYMOUS") {
          router.replace("/dashboard");
        }
      } catch (error) {
        console.error(error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = async () => {
    await logout();
  };

  const handleRequestAccess = async () => {
    try {
      if (!selectedRole) {
        toast.error("กรุณาเลือกสิทธิ์");
        return;
      }

      if (orgCode === null || !orgDesc) {
        toast.error("กรุณาเลือกหน่วยบริการ");
        return;
      }

      setLoading(true);

      const result = await register(
        selectedRole,
        orgCode.toString().padStart(5, "0"),
        orgDesc
      );

      if (result.success) {
        toast.success("ส่งคำร้องขอสิทธิ์เรียบร้อย");

        // เปลี่ยนเป็น waiting ทันที
        setHasRegistered(true);

        return;
      }

      toast.error("ไม่สามารถส่งคำร้องได้");
    } catch (error) {
      console.error(error);

      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleOrgChange = (value: string) => {
    const [code, name] = value.split("|");

    setOrgCode(Number(code));
    setOrgDesc(`[${code.toString().padStart(5, "0")}] ${name}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-amber-100">
          <ShieldAlert className="w-8 h-8 text-amber-600" />
        </div>

        {/* Loading */}
        {hasRegistered === null ? (
          <div className="py-8 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />

            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                กำลังตรวจสอบข้อมูล
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                กรุณารอสักครู่...
              </p>
            </div>
          </div>
        ) : hasRegistered ? (
          <>
            {/* Submit แล้ว */}
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                กำลังรอการอนุมัติ
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                บัญชีของคุณยังไม่ได้รับสิทธิ์เข้าใช้งานระบบ
                กรุณารอการอนุมัติจากผู้ดูแลระบบ
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              Waiting for approval
            </div>
          </>
        ) : (
          <>
            {/* ยังไม่ submit */}
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                ขอสิทธิ์เข้าใช้งาน
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                กรุณาเลือกสิทธิ์ที่ต้องการใช้งานระบบ
              </p>
            </div>

            <div className="space-y-4 text-left">
              {/* Role */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  เลือกสิทธิ์การใช้งาน
                </label>

                <select
                  value={selectedRole}
                  onChange={(e) =>
                    setSelectedRole(
                      e.target.value as "VIEWER" | "EXECUTIVE"
                    )
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">-- เลือกสิทธิ์ --</option>

                  <option value="EXECUTIVE">
                    ผู้บริหาร/หัวหน้ากลุ่มงาน
                  </option>

                  <option value="VIEWER">
                    ผู้ใช้งานทั่วไป
                  </option>
                </select>
              </div>

              {/* Org */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  เลือกหน่วยบริการ
                </label>

                <select
                  onChange={(e) => handleOrgChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">
                    -- เลือกหน่วยบริการ --
                  </option>

                  {subRoles.map((subRole) => (
                    <option
                      key={subRole.id}
                      value={`${subRole.code}|${subRole.name}`}
                    >
                      [{subRole.code.toString().padStart(5, "0")}] {subRole.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Button */}
              <button
                disabled={loading}
                onClick={handleRequestAccess}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white py-2 rounded-lg transition"
              >
                {loading
                  ? "กำลังส่งคำร้อง..."
                  : "ร้องขอสิทธิ์"}
              </button>
            </div>
          </>
        )}

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