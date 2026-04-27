"use client";

import { useState } from "react";

export function useVoterId() {
  const [voterId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("voterId");
      if (!id) {
        id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("voterId", id);
      }
      return id;
    }
    return null;
  });

  return voterId;
}
