"use server";

import { ComfyDeployClient } from "@/lib/comfy-deploy";

const client = new ComfyDeployClient({
  apiBase: process.env.COMFY_API_URL,
  apiToken: process.env.COMFY_DEPLOY_API_KEY!,
});

export async function generateImage(prompt: string) {
  return await client.run({
    deployment_id: process.env.COMFY_DEPLOY_WF_DEPLOYMENT_ID!,
    inputs: {
      input_text: prompt,
    },
  });
}

export async function checkStatus(run_id: string) {
  return await client.getRun(run_id);
}

export async function getUploadUrl(type: string, file_size: number) {
  try {
    return await client.getUploadUrl(type, file_size);
  } catch (error) {
    console.error(error);
    return null;
  }
}
