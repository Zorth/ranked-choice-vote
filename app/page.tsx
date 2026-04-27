"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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
import { Plus, Trash2, Calendar as CalendarIcon, Copy, Check } from "lucide-react";
import { format, addMonths, isAfter } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [deadline, setDeadline] = useState<Date | undefined>(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [createdPollId, setCreatedPollId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    router.push(`/poll/${id}`);
  };

  const pollUrl = createdPollId ? `${window.location.origin}/poll/${createdPollId}` : "";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pollUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-8">
        <h1 className="text-4xl font-bold tracking-tight">Ranked Choice Voting</h1>
        <p className="text-xl text-muted-foreground text-center max-w-prose">
          Create fair polls where everyone&apos;s preference counts.
        </p>

        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setCreatedPollId(null);
            setTitle("");
            setOptions(["", ""]);
            setDeadline(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
          }
        }}>
          <DialogTrigger asChild>
            <Button size="lg" className="px-8 h-14 text-lg">
              Create New Poll
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{createdPollId ? "Poll Created!" : "Create a New Poll"}</DialogTitle>
            </DialogHeader>

            {createdPollId ? (
              <div className="grid gap-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Your poll is ready! Share this link with others to start voting.
                </p>
                <div className="flex items-center gap-2">
                  <Input value={pollUrl} readOnly />
                  <Button size="icon" variant="outline" onClick={copyToClipboard}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button asChild className="w-full">
                  <a href={`/poll/${createdPollId}`}>Go to Poll</a>
                </Button>
              </div>
            ) : (
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
                  <p className="text-[10px] text-muted-foreground">
                    Max 1 month in the future. Polls are deleted 1 month after deadline.
                  </p>
                </div>
                <Button onClick={handleCreate} disabled={!title || options.some(o => !o.trim())}>
                  Create Poll
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
