import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { subDays, startOfDay, format } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const startDate = subDays(startOfDay(new Date()), days);

    // 日別の参加者数
    const joinsByDay = await prisma.member.groupBy({
      by: ["joinedAt"],
      where: {
        joinedAt: { gte: startDate },
      },
      _count: true,
    });

    // 日別の退出者数
    const leavesByDay = await prisma.member.groupBy({
      by: ["leftAt"],
      where: {
        leftAt: { gte: startDate, not: null },
      },
      _count: true,
    });

    // 現在のアクティブメンバー数
    const totalActive = await prisma.member.count({
      where: { isActive: true },
    });

    // 期間中の純増減
    const periodNewMembers = await prisma.member.count({
      where: {
        joinedAt: { gte: startDate },
      },
    });

    const periodLeftMembers = await prisma.member.count({
      where: {
        leftAt: { gte: startDate, not: null },
      },
    });

    return NextResponse.json({
      totalActive,
      periodNewMembers,
      periodLeftMembers,
      netGrowth: periodNewMembers - periodLeftMembers,
      joinsByDay,
      leavesByDay,
    });
  } catch (error) {
    console.error("Error fetching member stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch member stats" },
      { status: 500 }
    );
  }
}
