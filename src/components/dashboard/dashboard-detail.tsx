"use client";

import { getPowerbi } from "@/actions/powerbi/action";
import { AlertCircle, Maximize, Minimize } from "lucide-react";
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

const DashboardDetail = ({ id }: DashboardProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reportInstance = useRef<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

          const report = pbiService.embed(reportRef.current, embedConfig);
          reportInstance.current = report;
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

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;

    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if ((el as any).webkitRequestFullscreen) {
      (el as any).webkitRequestFullscreen();
    }
    setIsFullscreen(true);
  };

  const handleExitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    }
    setIsFullscreen(false);
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
    <div ref={containerRef} className="relative w-full h-[100dvh] bg-gray-100 overflow-hidden">

      {/* แสดงเฉพาะ desktop (md ขึ้นไป) เท่านั้น */}
      <div className="hidden xl:block absolute top-4 right-4 z-[9999]">
        {isFullscreen ? (
          <button
            onClick={handleExitFullscreen}
            className="
              flex items-center gap-2
              bg-red-600/90 hover:bg-red-600
              text-white text-sm
              px-4 py-2.5
              rounded-xl shadow-2xl backdrop-blur
              transition-all duration-200 active:scale-95
            "
          >
            <Minimize className="w-5 h-5" />
            <span>Exit</span>
          </button>
        ) : (
          <button
            onClick={handleFullscreen}
            className="
              flex items-center gap-2
              bg-black/70 hover:bg-black
              text-white text-sm
              px-4 py-2.5
              rounded-xl shadow-lg backdrop-blur
              transition-all duration-200 active:scale-95
            "
          >
            <Maximize className="w-5 h-5" />
            <span>Fullscreen</span>
          </button>
        )}
      </div>

      {/* Report container */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full h-full max-w-[1600px]">
          <div ref={reportRef} className="w-full h-full" />
        </div>
      </div>

    </div>
  );
};

export default DashboardDetail;