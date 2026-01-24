import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7", 10);

    const startDate = subDays(startOfDay(new Date()), days);

    // チャンネル別メッセージ数（TOP 10）
    const channelStats = await prisma.message.groupBy({
      by: ["channelId", "channelName"],
      where: {
        createdAt: { gte: startDate },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    const result = channelStats.map((stat) => ({
      channelId: stat.channelId,
      channelName: stat.channelName || "Unknown",
      messageCount: stat._count.id,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching channel stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch channel stats" },
      { status: 500 }
    );
  }
}
