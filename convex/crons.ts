import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "delete old polls",
  { hourUTC: 0, minuteUTC: 0 },
  api.polls.deleteOldPolls,
  {}
);

export default crons;
