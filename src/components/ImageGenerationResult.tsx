"use client";

import { useEffect, useState } from "react";
import { LoadingIcon } from "@/components/LoadingIcon";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { checkStatus } from "@/server/generate";
import { cn } from "@/lib/utils";

interface ImageGenerationResultProps extends React.ComponentProps<"div"> {
  runId: string;
}

export function ImageGenerationResult({
  runId,
  className,
}: ImageGenerationResultProps) {
  const [image, setImage] = useState("");
  const [status, setStatus] = useState<string>("preparing");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!runId) return;
    const interval = setInterval(() => {
      checkStatus(runId).then((res) => {
        if (res) {
          setStatus(res.status);
          if (res.status === "success" && res.outputs && res.outputs.length > 0) {
            const imageData = res.outputs[0]?.data?.images?.[0];
            if (imageData && typeof imageData === 'object' && 'url' in imageData) {
              setImage(imageData.url);
              setLoading(false);
              clearInterval(interval);
            }
          }
        }
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [runId]);

  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!image) return;

    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const blobURL = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobURL;
      link.download = "generated-image.png";
      link.click();
      URL.revokeObjectURL(blobURL);
    } catch (err) {
      console.error("Download error: ", err);
    }
  };

  return (
    <>
      <div
        className={cn(
          "aspect-square relative overflow-hidden rounded-lg shadow-md cursor-pointer",
          className,
          loading
            ? "bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 animate-pulse"
            : "bg-gray-800"
        )}
        onClick={() => {
          if (!loading && image) {
            setIsModalOpen(true);
          }
        }}
      >
        {!loading && image && (
          <img
            className="w-full h-full object-cover"
            src={image}
            alt="Generated image"
          />
        )}

        {!image && status && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            {status} <LoadingIcon />
          </div>
        )}

        {loading && <Skeleton className="w-full h-full" />}

        {/* <div className="absolute bottom-2 left-0 w-full flex justify-center">
          <Button
            type="button"
            variant="secondary"
            onClick={handleDownload}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs py-1 px-2"
            disabled={loading || !image}
          >
            Download
          </Button>
        </div> */}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <button
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 rounded px-3 py-1"
            onClick={() => setIsModalOpen(false)}
          >
            X
          </button>
          <img
            src={image}
            alt="Expanded generated image"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </>
  );
}
