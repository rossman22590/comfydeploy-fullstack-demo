"use server";

import { ComfyDeployClient } from "@/lib/comfy-deploy";
import { db } from "@/db/db";
import { runs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

const client = new ComfyDeployClient({
  apiBase: process.env.COMFY_API_URL,
  apiToken: process.env.COMFY_DEPLOY_API_KEY!,
});

export async function generateImage(prompt: string) {
  const { userId } = auth();
  
  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    const result = await client.run({
      deployment_id: process.env.COMFY_DEPLOY_WF_DEPLOYMENT_ID!,
      inputs: {
        input_text: prompt,
      },
    });

    if (result && result.run_id) {
      // Save the run to the database
      try {
        await db.insert(runs).values({
          run_id: result.run_id,
          user_id: userId,
          inputs: { input_text: prompt },
          live_status: "started",
          progress: 0,
        });
        console.log(`Run ${result.run_id} saved to database`);
      } catch (dbError) {
        console.error("Error saving run to database:", dbError);
        // Optionally, you might want to throw this error or handle it differently
      }
    } else {
      console.error("No run_id returned from client.run");
    }

    return result;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export async function checkStatus(run_id: string) {
  try {
    const status = await client.getRun(run_id);
    
    if (status) {
      // Update the run status in the database
      try {
        await db.update(runs)
          .set({
            live_status: status.status,
            image_url: status.outputs?.[0]?.data?.images?.[0]?.url,
          })
          .where(sql`${runs.run_id} = ${run_id}`);
        console.log(`Run ${run_id} status updated in database`);
      } catch (dbError) {
        console.error("Error updating run status in database:", dbError);
      }
    }

    return status;
  } catch (error) {
    console.error("Error checking run status:", error);
    throw error;
  }
}

export async function getUploadUrl(type: string, file_size: number) {
  try {
    return await client.getUploadUrl(type, file_size);
  } catch (error) {
    console.error("Error getting upload URL:", error);
    return null;
  }
}
