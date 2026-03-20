import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-10">
        <div className="flex justify-center lg:justify-start px-2">
          <a
  href="/"
  className="block lg:flex lg:items-center lg:gap-3 font-medium max-w-full text-center lg:text-left"
>
  {/* Logo */}
  <div className="mx-auto lg:mx-0 flex size-20 lg:size-12 shrink-0 items-center justify-center overflow-hidden rounded-md">
    <img
      src="/assets/logomoph.png"
      alt="logo"
      className="w-full h-full object-contain"
    />
  </div>

  {/* Text */}
  <span className="mt-2 lg:mt-0 text-xs sm:text-base md:text-base leading-tight line-clamp-2 lg:line-clamp-none">
    Dashboard สำนักงานสาธารณสุขจังหวัดปทุมธานี
  </span>
</a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/assets/w-1.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
