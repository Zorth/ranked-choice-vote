"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Calendar as CalendarIcon, History, ExternalLink } from "lucide-react";
import { format, addMonths, isAfter } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useMyPolls } from "@/hooks/use-my-polls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();
  const { createdPolls, votedPolls, addCreatedPoll } = useMyPolls();
  
  const allMyPollIds = Array.from(new Set([...createdPolls, ...votedPolls])) as Id<"polls">[];
  const myPollsData = useQuery(api.polls.getByIds, { ids: allMyPollIds });

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [deadline, setDeadline] = useState<Date | undefined>(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  const createPoll = useMutation(api.polls.create);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = async () => {
    if (!title || options.some((o) => !o.trim()) || !deadline) return;

    const maxDeadline = addMonths(new Date(), 1);
    const finalDeadline = isAfter(deadline, maxDeadline) ? maxDeadline : deadline;

    const id = await createPoll({
      title,
      options: options.map((o) => o.trim()),
      deadline: finalDeadline.getTime(),
    });
    addCreatedPoll(id);
    router.push(`/poll/${id}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 pt-24 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tighter">Ranked Choice Voting</h1>
          <p className="text-xl text-muted-foreground max-w-prose mx-auto">
            Create fair polls where everyone&apos;s preference counts.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setTitle("");
            setOptions(["", ""]);
            setDeadline(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
          }
        }}>
          <DialogTrigger asChild>
            <Button size="lg" className="px-12 h-16 text-xl shadow-xl hover:shadow-primary/20 transition-all">
              <Plus className="mr-2 h-6 w-6" /> Create New Poll
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create a New Poll</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Poll Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Where should we go for lunch?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Options</Label>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                    />
                    {options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={handleAddOption}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Option
                </Button>
              </div>
              <div className="grid gap-2">
                <Label>Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      initialFocus
                      disabled={(date) =>
                        date < new Date() || date > addMonths(new Date(), 1)
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleCreate} disabled={!title || options.some(o => !o.trim())}>
                Create Poll
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {allMyPollIds.length > 0 && (
          <div className="w-full max-w-2xl space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-bold">Your Recent Polls</h2>
            </div>
            
            <div className="grid gap-4">
              {myPollsData === undefined ? (
                <div className="text-center py-8 text-muted-foreground italic">Loading your history...</div>
              ) : myPollsData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground italic">No polls found in your history.</div>
              ) : (
                myPollsData.sort((a, b) => b.createdAt - a.createdAt).map((poll) => (
                  <Card key={poll._id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => router.push(`/poll/${poll._id}`)}>
                    <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{poll.title}</CardTitle>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-sans">
                          <span>{poll.options.length} options</span>
                          <span>•</span>
                          <span>{createdPolls.includes(poll._id) ? "Created by you" : "Voted by you"}</span>
                          <span>•</span>
                          <span className={Date.now() > poll.deadline ? "text-destructive font-bold" : ""}>
                            {Date.now() > poll.deadline ? "Expired" : `Ends ${format(poll.deadline, "MMM d")}`}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
