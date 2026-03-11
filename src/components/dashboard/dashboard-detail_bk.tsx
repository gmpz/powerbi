"use client";

import { getPowerbi } from "@/actions/powerbi/action";
import { AlertCircle } from "lucide-react";
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
  name,
  description,
  workspaceId,
  reportId,
  mainRole,
  subRole,
}: DashboardProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
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
          const pbiService = new service.Service(
            factories.hpmFactory,
            factories.wpmpFactory,
            factories.routerFactory,
          );

          pbiService.embed(reportRef.current, embedConfig);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || "Unexpected error occurred");
      }
    }

    loadReport();
  }, [id]);

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
    <div style={{ height: "100dvh" }}>
      <div ref={reportRef} style={{ height: "100%" }} />
    </div>
  );
};

export default DashboardDetail;
