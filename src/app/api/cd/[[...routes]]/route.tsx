import { type NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const apiPath = pathname.replace("/api/cd", "");
  const url = `https://api.myapps.ai/api${apiPath}${search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("Authorization", `Bearer ${process.env.COMFY_DEPLOY_API_KEY}`);

  const response = await fetch(url, {
    method: request.method,
    headers,
    body: request.body,
  });

  const isStreamable = response.headers.get('Transfer-Encoding') === 'chunked' ||
                       response.headers.get('Content-Type')?.includes('text/event-stream');

  if (isStreamable) {
    const transformStream = new TransformStream();
    const writer = transformStream.writable.getWriter();

    response.body?.pipeTo(new WritableStream({
      write(chunk) {
        writer.write(chunk);
      },
      close() {
        writer.close();
      }
    }));

    return new NextResponse(transformStream.readable, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
