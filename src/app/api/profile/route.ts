import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request: Request) {
  const user = await requireUser();
  const body = await request.json();

  const { fullName, phone, address, city, state, postalCode } = body ?? {};

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      fullName: fullName ?? user.fullName,
      phone: phone ?? user.phone,
      address: address ?? user.address,
      city: city ?? user.city,
      state: state ?? user.state,
      postalCode: postalCode ?? user.postalCode,
    },
  });

  return NextResponse.json({ ok: true, user: { id: updated.id } });
}
