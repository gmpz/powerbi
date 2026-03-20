import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-10">
      
        <div className="absolute inset-0 -z-10 lg:hidden">
        <img
          src="/assets/w-1.png"
          alt="bg"
          className="h-full w-full object-cover"
        />
        {/* overlay กันอ่านยาก */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
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
