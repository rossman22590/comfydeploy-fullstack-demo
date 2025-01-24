"use client";

import { ImageGenerationResult } from "@/components/ImageGenerationResult";
import { Button } from "@/components/ui/button";
import { generateImage } from "@/server/generate";
import { useState } from "react";
import { Card } from "./ui/card";
import { WandSparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";

export function App() {
	const [prompt, setPrompt] = useState(
		"beautiful scenery nature glass bottle landscape, , purple galaxy bottle,",
	);
	const [debouncedPrompt] = useDebounce(prompt, 200);
	const [runIds, setRunIds] = useState<string[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);

	const handleGenerate = async () => {
		setIsGenerating(true);
		const tempId = `generating-${Date.now()}`;
		setRunIds(prevIds => [tempId, ...prevIds]);

		try {
			const result = await generateImage(prompt);
			if (result && result.run_id) {
				setRunIds(prevIds => [result.run_id, ...prevIds.filter(id => id !== tempId)]);
				mutate("userRuns");
			}
		} catch (error) {
			console.error("Error generating image:", error);
			toast.error("Failed to generate image. Please try again.");
			setRunIds(prevIds => prevIds.filter(id => id !== tempId));
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<div className="flex-grow overflow-y-auto">
				<div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
					{runIds.map((runId) => (
						<ImageGenerationResult key={runId} runId={runId} />
					))}
				</div>
			</div>
			<div className="fixed z-50 bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm">
				<Card className="p-2 shadow-lg rounded-xl max-w-3xl mx-auto">
					<div className="flex flex-col gap-2">
						<textarea
							id="input"
							className="w-full p-2 rounded-xl text-base sm:text-sm z-10 resize-none border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={prompt}
							onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
							placeholder="Describe the image you want to generate ..."
							rows={3}
						/>
						<Button
							variant="expandIcon"
							className={cn(
								"rounded-xl transition-all w-full",
								isGenerating && "opacity-50 cursor-not-allowed"
							)}
							Icon={WandSparklesIcon}
							iconPlacement="right"
							onClick={handleGenerate}
							disabled={isGenerating}
						>
							{isGenerating ? "Generating..." : "Generate"}
						</Button>
					</div>
				</Card>
			</div>
		</div>
	);
}
