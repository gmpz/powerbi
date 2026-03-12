"use client";
import React from "react";
import { Button } from "../ui/button";

const BtnProvider = () => {
  const handlePorviderLogin = () => {
    // redirect ไป API กลาง
    window.location.href =
      `https://moph.id.th/oauth/redirect?client_id=01992c8d-2aef-7e03-988d-a70d06e8b7d8&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL}/providerid/&response_type=code&state=${process.env.NEXT_PUBLIC_APP_URL}/providerid/`;
  };
  return (
    <Button
      variant="outline"
      onClick={handlePorviderLogin}
      type="button"
      className="w-40 h-14 flex items-center justify-center border-green-600 hover:bg-green-200/10"
    >
      <img
        src="/assets/provider.png"
        alt="Image"
        className="h-12 object-contain"
      />
    </Button>
  );
};

export default BtnProvider;
