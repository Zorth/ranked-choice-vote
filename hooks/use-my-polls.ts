"use client";

import { useState, useEffect } from "react";

export function useMyPolls() {
  const [createdPolls, setCreatedPolls] = useState<string[]>([]);
  const [votedPolls, setVotedPolls] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const created = JSON.parse(localStorage.getItem("createdPolls") || "[]");
      const voted = JSON.parse(localStorage.getItem("votedPolls") || "[]");
      setCreatedPolls(created);
      setVotedPolls(voted);
    }
  }, []);

  const addCreatedPoll = (id: string) => {
    const newCreated = Array.from(new Set([...createdPolls, id]));
    setCreatedPolls(newCreated);
    localStorage.setItem("createdPolls", JSON.stringify(newCreated));
  };

  const addVotedPoll = (id: string) => {
    const newVoted = Array.from(new Set([...votedPolls, id]));
    setVotedPolls(newVoted);
    localStorage.setItem("votedPolls", JSON.stringify(newVoted));
  };

  return { createdPolls, votedPolls, addCreatedPoll, addVotedPoll };
}
