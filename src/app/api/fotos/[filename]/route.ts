import { NextResponse } from "next/server";

import { getSessionUser } from "@/app/actions/auth";
import { readPhoto } from "@/lib/photos";

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const { filename } = await context.params;
  const photo = readPhoto(filename);
  if (!photo) {
    return new NextResponse("No encontrada", { status: 404 });
  }

  return new NextResponse(new Uint8Array(photo.buffer), {
    headers: {
      "Content-Type": photo.type,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
