import { useEffect, useState } from 'react';
import { checkStatus } from '@/server/generate';

type RunStatus = {
  status: "success" | "failed" | "running" | "uploading" | "not-started" | "preparing";
  id: string;
  progress?: number;
  liveStatus?: string;
  outputs?: Array<{
    data?: {
      images?: Array<{ url: string }>;
    };
  }>;
} | null;

export function useRunStatus(runId: string) {
  const [data, setData] = useState<RunStatus>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoading(true);
      const result = await checkStatus(runId);
      setData(result);
      setIsLoading(false);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);

    return () => clearInterval(interval);
  }, [runId]);

  return { data, isLoading };
}
