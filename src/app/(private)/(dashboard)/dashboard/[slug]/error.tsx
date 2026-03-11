"use client";

export default function ErrorPage({ error }: { error: Error }) {
  return (
    <div className="p-8 text-red-500">
      Something went wrong.
    </div>
  );
}