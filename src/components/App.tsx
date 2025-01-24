"use client";

import { ImageGenerationResult } from "@/components/ImageGenerationResult";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateImage } from "@/server/generate";
import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { ArrowRightIcon, WandSparklesIcon, Zap } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

export function App() {
    const [prompt, setPrompt] = useState(
        "beautiful scenery nature glass bottle landscape, , purple galaxy bottle,"
    );
    const [debouncedPrompt] = useDebounce(prompt, 200);

    const [realtime, setRealtime] = useState(false);

    return (
        <div className="fixed z-50 bottom-0 md:bottom-2 flex flex-col gap-2 w-full md:max-w-lg mx-auto">
            <Card className="p-2 shadow-lg rounded-none md:rounded-2xl">
                <div className="flex flex-col gap-2">
                    <textarea
                        id="input"
                        className="rounded-xl text-base sm:text-sm z-10 w-full p-2 resize-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="An amazing image"
                        rows={4}
                    />
                    <Button
                        variant="expandIcon"
                        className={cn(
                            "rounded-xl transition-all w-full min-w-0 p-0 bg-pink-500 hover:bg-pink-600 text-white",
                            realtime && "opacity-0"
                        )}
                        Icon={WandSparklesIcon}
                        iconPlacement="right"
                        onClick={async () => {
                            const runId = await generateImage(prompt);
                            mutate("userRuns");
                        }}
                    >
                        Generate
                    </Button>
                </div>
            </Card>
        </div>
    );
}
