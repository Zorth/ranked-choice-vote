"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RoundResult {
  tallies: Record<number, number>;
  eliminated: number[];
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const pollId = params.id as Id<"polls">;
  const poll = useQuery(api.polls.get, { id: pollId });
  const votes = useQuery(api.votes.getByPoll, { pollId });

  if (poll === undefined || votes === undefined) {
    return <div className="flex min-h-screen items-center justify-center">Calculating results...</div>;
  }

  if (poll === null) {
    return <div className="flex min-h-screen items-center justify-center">Poll not found.</div>;
  }

  // Ranked Choice Algorithm
  const rounds: RoundResult[] = [];
  const eliminatedOptions = new Set<number>();
  const totalOptions = poll.options.length;
  const finalRanking: number[] = [];

  // Deep copy of ballots to manipulate
  const currentBallots = votes.map(v => [...v.rankings]);

  while (eliminatedOptions.size < totalOptions) {
    const tallies: Record<number, number> = {};
    // Initialize tallies for all non-eliminated options
    for (let i = 0; i < totalOptions; i++) {
      if (!eliminatedOptions.has(i)) {
        tallies[i] = 0;
      }
    }

    // Tally first available preference for each ballot
    for (const ballot of currentBallots) {
      // Find the first option in ballot that isn't eliminated
      const firstChoice = ballot.find(optIdx => !eliminatedOptions.has(optIdx));
      if (firstChoice !== undefined) {
        tallies[firstChoice] = (tallies[firstChoice] || 0) + 1;
      }
    }

    const remainingOptions = Object.keys(tallies).map(Number);
    if (remainingOptions.length === 0) break;

    // Find min votes
    const minVotes = Math.min(...Object.values(tallies));
    
    // Check if someone has more than 50%
    // const totalVotesInRound = Object.values(tallies).reduce((a, b) => a + b, 0);
    
    const optionsWithMinVotes = remainingOptions.filter(opt => tallies[opt] === minVotes);
    
    // If all remaining have the same votes, they are all "eliminated" (tied)
    const toEliminate = optionsWithMinVotes.length === remainingOptions.length 
      ? remainingOptions 
      : optionsWithMinVotes;

    rounds.push({ tallies, eliminated: toEliminate });

    // Add to final ranking (in reverse order of elimination)
    // We'll reverse this at the end
    finalRanking.push(...toEliminate);
    
    for (const opt of toEliminate) {
      eliminatedOptions.add(opt);
    }

    if (eliminatedOptions.size === totalOptions) break;
  }

  const sortedFinalRanking = [...finalRanking].reverse();
  const winnerIndex = sortedFinalRanking[0];

  return (
    <main className="flex min-h-screen flex-col items-center p-8 pt-20">
      <div className="max-w-3xl w-full space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push(`/poll/${pollId}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Vote
          </Button>
          <h1 className="text-2xl font-bold">Results: {poll.title}</h1>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            Create Another
          </Button>
        </div>

        {votes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No votes have been cast yet.
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Winner Card */}
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <Trophy className="h-12 w-12 text-yellow-500" />
                </div>
                <CardTitle className="text-3xl">Winner: {poll.options[winnerIndex]}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Based on {votes.length} votes using Ranked Choice Voting.
                </p>
              </CardContent>
            </Card>

            {/* Final Ranking */}
            <Card>
              <CardHeader>
                <CardTitle>Final Ranking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sortedFinalRanking.map((optIdx, i) => (
                  <div key={optIdx} className="flex items-center gap-4">
                    <span className="font-bold text-xl w-6">{i + 1}.</span>
                    <span className="flex-1 text-lg">{poll.options[optIdx]}</span>
                    {i === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Rounds Detail */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Elimination Rounds</h3>
              {rounds.map((round, i) => (
                <Card key={i} className="bg-muted/50">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">Round {i + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-4">
                    {Object.entries(round.tallies).sort((a, b) => b[1] - a[1]).map(([optIdx, count]) => (
                      <div key={optIdx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className={round.eliminated.includes(Number(optIdx)) ? "line-through opacity-50" : ""}>
                            {poll.options[Number(optIdx)]}
                          </span>
                          <span>{count} {count === 1 ? 'vote' : 'votes'}</span>
                        </div>
                        <Progress value={(count / votes.length) * 100} className="h-1" />
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground pt-2">
                      Eliminated: {round.eliminated.map(idx => poll.options[idx]).join(", ")}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
