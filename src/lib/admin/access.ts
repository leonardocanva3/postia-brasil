import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { prisma } from "@/lib/database/prisma";

export async function requirePlatformAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    },
    select: {
      id: true,
      isPlatformAdmin: true
    }
  });

  if (!user?.isPlatformAdmin) {
    redirect("/dashboard");
  }

  return user;
}
