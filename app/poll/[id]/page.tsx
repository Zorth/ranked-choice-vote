"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, ChevronUp, ChevronDown, CheckCircle2, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useVoterId } from "@/hooks/use-voter-id";

export default function PollPage() {
  const params = useParams();
  const router = useRouter();
  const pollId = params.id as Id<"polls">;
  const voterId = useVoterId();
  
  const poll = useQuery(api.polls.get, { id: pollId });
  const myVote = useQuery(api.votes.getMyVote, 
    pollId && voterId ? { pollId, voterId } : "skip"
  );
  const submitVote = useMutation(api.votes.submit);

  const [availableOptions, setAvailableOptions] = useState<number[]>([]);
  const [rankedOptions, setRankedOptions] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (poll && !isEditing && !isSubmitted) {
      if (myVote) {
        setRankedOptions(myVote.rankings);
        const rankedSet = new Set(myVote.rankings);
        setAvailableOptions(
          poll.options.map((_, i) => i).filter(i => !rankedSet.has(i))
        );
        setIsSubmitted(true);
      } else {
        setAvailableOptions(poll.options.map((_, i) => i));
      }
    }
  }, [poll, myVote, isEditing, isSubmitted]);

  if (poll === undefined || (voterId !== null && myVote === undefined)) {
    return <div className="flex min-h-screen items-center justify-center">Loading poll...</div>;
  }

  if (poll === null) {
    return <div className="flex min-h-screen items-center justify-center">Poll not found.</div>;
  }

  const isExpired = Date.now() > poll.deadline;

  const moveToRanked = (index: number) => {
    setAvailableOptions(availableOptions.filter((i) => i !== index));
    setRankedOptions([...rankedOptions, index]);
  };

  const moveToAvailable = (index: number) => {
    setRankedOptions(rankedOptions.filter((i) => i !== index));
    setAvailableOptions([...availableOptions, index]);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newRanked = [...rankedOptions];
    [newRanked[index - 1], newRanked[index]] = [newRanked[index], newRanked[index - 1]];
    setRankedOptions(newRanked);
  };

  const moveDown = (index: number) => {
    if (index === rankedOptions.length - 1) return;
    const newRanked = [...rankedOptions];
    [newRanked[index + 1], newRanked[index]] = [newRanked[index], newRanked[index + 1]];
    setRankedOptions(newRanked);
  };

  const handleSubmit = async () => {
    if (rankedOptions.length === 0 || !voterId) return;
    await submitVote({
      pollId,
      voterId,
      rankings: rankedOptions,
    });
    setIsSubmitted(true);
    setIsEditing(false);
  };

  if (isSubmitted && !isEditing) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Vote Recorded!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You have already voted in "{poll.title}".
            </p>
            <div className="space-y-2 border rounded-md p-4 bg-muted/30">
              <p className="text-xs font-semibold text-left uppercase text-muted-foreground">Your Ranking:</p>
              {rankedOptions.map((optIdx, i) => (
                <div key={optIdx} className="flex gap-2 text-sm">
                  <span className="font-bold">{i + 1}.</span>
                  <span>{poll.options[optIdx]}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-2">
              {!isExpired && (
                <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit My Vote
                </Button>
              )}
              <Button className="w-full" onClick={() => router.push(`/poll/${pollId}/results`)}>
                See Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 pt-20">
      <div className="max-w-4xl w-full space-y-8">
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-muted-foreground">
            Create Another Poll
          </Button>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">{poll.title}</h1>
          <p className="text-muted-foreground">
            {isExpired ? (
              <span className="text-destructive font-semibold">This poll has ended.</span>
            ) : (
              <span>Ends on {format(poll.deadline, "PPP p")}</span>
            )}
          </p>
          {isEditing && (
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase mt-2">
              Editing mode
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Available Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Options</CardTitle>
              <p className="text-sm text-muted-foreground">Click an option to add it to your ranking.</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {availableOptions.length === 0 ? (
                <p className="text-sm italic text-muted-foreground py-4 text-center">All options ranked.</p>
              ) : (
                availableOptions.map((optIdx) => (
                  <Button
                    key={optIdx}
                    variant="outline"
                    className="w-full justify-between group"
                    onClick={() => moveToRanked(optIdx)}
                    disabled={isExpired}
                  >
                    {poll.options[optIdx]}
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Your Ranking */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Your Ranking (1 is best)</CardTitle>
              <p className="text-sm text-muted-foreground">Rank your choices in order of preference.</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {rankedOptions.length === 0 ? (
                <p className="text-sm italic text-muted-foreground py-4 text-center">No options selected yet.</p>
              ) : (
                rankedOptions.map((optIdx, index) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <div className="flex flex-col gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveUp(index)}
                        disabled={index === 0 || isExpired}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveDown(index)}
                        disabled={index === rankedOptions.length - 1 || isExpired}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 flex items-center gap-3 bg-background border rounded-md px-3 py-2 shadow-sm">
                      <span className="font-bold text-primary w-4">{index + 1}.</span>
                      <span className="flex-1">{poll.options[optIdx]}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => moveToAvailable(optIdx)}
                        disabled={isExpired}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center pt-4 gap-4">
          <Button
            size="lg"
            className="px-12"
            disabled={rankedOptions.length === 0 || isExpired || !voterId}
            onClick={handleSubmit}
          >
            {isEditing ? "Update Vote" : "Submit Vote"}
          </Button>
          {isEditing && (
             <Button variant="ghost" size="lg" onClick={() => setIsEditing(false)}>
               Cancel
             </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push(`/poll/${pollId}/results`)}
          >
            See Results
          </Button>
        </div>
      </div>
    </main>
  );
}
