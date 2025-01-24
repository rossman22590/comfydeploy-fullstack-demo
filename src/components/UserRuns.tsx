"use client";

import useSWR from "swr";
import { getUserRuns } from "@/server/getUserRuns";
import React, { useState } from "react";
import { ImageGenerationResult } from "./ImageGenerationResult";
import { Sparkle, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Run {
  progress: number | null;
  run_id: string;
  user_id: string;
  createdAt: Date | null;
  image_url: string | null;
  inputs: Record<string, string> | null;
  live_status: string | null;
}

export function UserRuns() {
    const { data: userRuns, isValidating } = useSWR<Run[]>("userRuns", getUserRuns);

    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const handleView = (imageUrl: string) => {
        setLightboxImage(imageUrl);
    };

    const handleDownload = async (imageUrl: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'generated-image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    if (userRuns && userRuns.length > 0) {
        return (
            <>
                <div className="max-w-[1200px] w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-32">
                    {userRuns.map((run) => (
                        <div
                            className="rounded-sm overflow-hidden relative group"
                            key={run.run_id}
                        >
                            {!run.image_url && <ImageGenerationResult runId={run.run_id} />}
                            {run.image_url && (
                                <>
                                    <img src={run.image_url} alt="Run" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="sm" onClick={() => run.image_url && handleView(run.image_url)}>
                                            <Eye className="mr-2 h-4 w-4" /> View
                                        </Button>
                                        <Button size="sm" onClick={() => run.image_url && handleDownload(run.image_url)}>
                                            <Download className="mr-2 h-4 w-4" /> Download
                                        </Button>
                                    </div>
                                </>
                            )}
                            {run.inputs && (
                                <div className="transition-opacity group-hover:opacity-100 opacity-0 absolute top-0 left-0 right-0 text-xs text-white/80 p-4 bg-slate-950/40 flex flex-col gap-2">
                                    {Object.entries(run.inputs).map(([key, value]) => (
                                        <div key={key}>
                                            <span className="font-bold">{key}:</span>{" "}
                                            <span>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {lightboxImage && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setLightboxImage(null)}>
                        <img src={lightboxImage} alt="Lightbox" className="max-w-full max-h-full object-contain" />
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="text-sm flex w-full h-[calc(100vh-45px-50px)] justify-center items-center text-gray-400 gap-2">
            Start generating some images! <Sparkle size={16}/>
        </div>
    );
}
