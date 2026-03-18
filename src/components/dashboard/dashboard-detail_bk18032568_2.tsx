"use client";

import { getPowerbi } from "@/actions/powerbi/action";
import { AlertCircle, Maximize } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface DashboardProps {
  id: string;
  name: string;
  description?: string | null;
  workspaceId: string;
  reportId: string;
  mainRole?: string | null;
  subRole?: string | null;
}

const DashboardDetail = ({
  id,
}: DashboardProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const reportInstance = useRef<any>(null); // 👈 เก็บ report
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let pbiService: any = null;

    async function loadReport() {
      try {
        const powerbi = await import("powerbi-client");
        const { models, service, factories } = powerbi;

        const data = await getPowerbi(id);

        if (!data || data.error) {
          setErrorMessage(data?.error || "Failed to load report");
          return;
        }

        const embedConfig = {
          type: "report",
          id: data.reportId,
          embedUrl: data.embedUrl,
          accessToken: data.embedToken,
          tokenType: models.TokenType.Embed,
        };

        if (reportRef.current) {
          pbiService = new service.Service(
            factories.hpmFactory,
            factories.wpmpFactory,
            factories.routerFactory,
          );

          pbiService.reset(reportRef.current);

          const report = pbiService.embed(
            reportRef.current,
            embedConfig
          );

          reportInstance.current = report; // 👈 เก็บไว้ใช้ fullscreen
        }
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || "Unexpected error occurred");
      }
    }

    loadReport();

    return () => {
      if (pbiService && reportRef.current) {
        try {
          pbiService.reset(reportRef.current);
        } catch (_) {}
      }
    };
  }, [id]);

  const handleFullscreen = () => {
    if (reportInstance.current) {
      reportInstance.current.fullscreen(); // 🚀 ตัวนี้แหละ
    }
  };

  if (errorMessage) {
    return (
      <div className="w-full flex gap-3 rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
        <AlertCircle className="h-5 w-5 mt-0.5" />
        <div>
          <div className="font-semibold">Failed to load dashboard</div>
          <div className="text-sm">{errorMessage}</div>
        </div>
      </div>
    );
  }

  return (
  <div className="relative w-full h-[100dvh] bg-gray-100 overflow-hidden">

    {/* 🔘 ปุ่ม Fullscreen */}
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-[9999]">
      <button
        onClick={handleFullscreen}
        className="
          flex items-center gap-2
          bg-black/50 hover:bg-black/70
          text-white text-sm sm:text-base
          px-3 py-2 sm:px-4 sm:py-2.5
          rounded-xl shadow-lg backdrop-blur
          transition-all duration-200
          active:scale-95
        "
      >
        <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">Fullscreen</span>
      </button>
    </div>

    {/* 📊 Report container */}
    <div className="w-full h-full flex items-center justify-center">
      
      {/* จำกัดสัดส่วนให้สวย (desktop) */}
      <div className="w-full h-full max-w-[1600px]">
        <div
          ref={reportRef}
          className="w-full h-full"
        />
      </div>

    </div>
  </div>
);
}

export default DashboardDetail;