"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";

export default function UsernameProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  // Redirect to profile page with username
  React.useEffect(() => {
    if (username) {
      router.push(`/profile/${username}`);
    }
  }, [username, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <p>Loading profile...</p>
      </div>
    </div>
  );
}
