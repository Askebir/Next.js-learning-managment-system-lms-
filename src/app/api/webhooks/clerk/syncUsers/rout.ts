import { insertUser } from "@/src/features/users/users";
import { syncClerkUserMetadata } from "@/src/services/clerk";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await currentUser();
  if (user == null) return new Response("User not found", { status: 500 });
  if (user.fullName == null) {
    return new Response("User name missing", { status: 500 });
  }
  if (user.primaryEmailAddress?.emailAddress == null) {
    return new Response("User email missing", { status: 500 });
  }

  const dbUser = await insertUser({
    clerkUserId: user.id,
    name: user.fullName,
    email: user.primaryEmailAddress.emailAddress,
    imageUrl: user.imageUrl,
    role: user.publicMetadata.role ?? "user",
  });

  await syncClerkUserMetadata(dbUser);

  await new Promise((res) => setTimeout(res, 100));

  return NextResponse.redirect(request.headers.get("referer") ?? "/");
}
