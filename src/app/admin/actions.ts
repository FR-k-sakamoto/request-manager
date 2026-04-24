"use server";

import type { RequestStatus } from "@/generated/prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { z } from "zod";

const updateStatusSchema = z.object({
  requestId: z.string().min(1),
  nextStatus: z.enum(["PENDING", "COMPLETED", "REJECTED"]),
  rejectedReason: z.string().optional(),
  redirectTo: z.string().default("/admin"),
});

function resolveRedirectPath(pathname: string) {
  if (!pathname.startsWith("/")) {
    return "/admin";
  }

  return pathname;
}

export async function updateRequestStatus(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?error=forbidden");
  }

  const parsed = updateStatusSchema.safeParse({
    requestId: formData.get("requestId"),
    nextStatus: formData.get("nextStatus"),
    rejectedReason: formData.get("rejectedReason"),
    redirectTo: formData.get("redirectTo"),
  });

  if (!parsed.success) {
    redirect("/admin?error=invalid");
  }

  const redirectTo = resolveRedirectPath(parsed.data.redirectTo);
  const nextStatus = parsed.data.nextStatus as RequestStatus;
  const rejectedReason = parsed.data.rejectedReason?.trim() ?? "";

  if (nextStatus === "REJECTED" && !rejectedReason) {
    redirect(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}error=rejected-reason-required`);
  }

  const request = await prisma.request.findUnique({
    where: { id: parsed.data.requestId },
    select: { id: true, status: true },
  });

  if (!request) {
    redirect("/admin?error=not-found");
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.request.update({
      where: { id: parsed.data.requestId },
      data: {
        status: nextStatus,
        handledById: session.user.id,
        completedAt: nextStatus === "COMPLETED" ? now : null,
        rejectedAt: nextStatus === "REJECTED" ? now : null,
        rejectedReason: nextStatus === "REJECTED" ? rejectedReason : null,
      },
    }),
    prisma.requestStatusHistory.create({
      data: {
        requestId: parsed.data.requestId,
        fromStatus: request.status,
        toStatus: nextStatus,
        changedById: session.user.id,
        comment: nextStatus === "REJECTED" ? rejectedReason : undefined,
      },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath(redirectTo);
  redirect(redirectTo);
}
