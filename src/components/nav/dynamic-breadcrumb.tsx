"use client"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation"
import Link from "next/link"
import { getDashboardName } from "@/actions/dashboard/action";
import { useEffect, useState } from "react";

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  const [name, setName] = useState("");
  const segments = pathname.split("/").filter(Boolean)
  
  const dashBoardName = async (dashboardId: string) => {
    const res = await getDashboardName(dashboardId);
    return res;
  }
  useEffect(() => {
    if (segments.length > 1 && segments[0] == "dashboard") {
      const lastSegment = segments[segments.length - 1];
      dashBoardName(lastSegment).then(name => {
        setName(name || lastSegment);
      });
    }
  }, [pathname])
  

  return (
  <Breadcrumb className="w-full overflow-hidden">
    <BreadcrumbList
      className="
        flex-nowrap 
        overflow-x-auto 
        whitespace-nowrap 
        scrollbar-hide
        max-w-full
      "
    >
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/")
        const isLast = index === segments.length - 1

        return (
          <div key={href} className="flex items-center shrink-0">
            {index !== 0 && <BreadcrumbSeparator />}

            <BreadcrumbItem className="max-w-[120px] sm:max-w-none truncate">
              {isLast ? (
                <BreadcrumbPage className="truncate block">
                  {decodeURIComponent(name || segment)}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={href}
                    className="truncate block hover:underline"
                  >
                    {decodeURIComponent(segment)}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        )
      })}
    </BreadcrumbList>
  </Breadcrumb>
)
}