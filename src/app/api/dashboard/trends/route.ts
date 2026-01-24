import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { subDays, format, startOfDay } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const startDate = subDays(startOfDay(new Date()), days);

    // 日次統計を取得
    const dailyStats = await prisma.dailyStat.findMany({
      where: {
        date: { gte: startDate },
      },
      orderBy: { date: "asc" },
    });

    // データを整形
    const trends = dailyStats.map((stat) => ({
      date: format(stat.date, "MM/dd"),
      newMembers: stat.newMembers,
      leftMembers: stat.leftMembers,
      netGrowth: stat.newMembers - stat.leftMembers,
      totalMembers: stat.totalMembers,
      messageCount: stat.messageCount,
      activeUsers: stat.activeUsers,
    }));

    return NextResponse.json(trends);
  } catch (error) {
    console.error("Error fetching trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch trends" },
      { status: 500 }
    );
  }
}
