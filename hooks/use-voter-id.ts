"use client";

import { useEffect, useState } from "react";

export function useVoterId() {
  const [voterId, setVoterId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("voterId");
    if (!id) {
      id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("voterId", id);
    }
    setVoterId(id);
  }, []);

  return voterId;
}
