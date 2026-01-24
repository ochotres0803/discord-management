"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Activity,
  Hash,
  BarChart3,
} from "lucide-react";

interface ChannelStat {
  channelId: string;
  channelName: string;
  messageCount: number;
}

interface TrendData {
  date: string;
  messageCount: number;
  activeUsers: number;
}

export default function ActivityPage() {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [channels, setChannels] = useState<ChannelStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [trendsRes, channelsRes] = await Promise.all([
          fetch(`/api/dashboard/trends?days=${period}`),
          fetch(`/api/activity/channels?days=${period}`),
        ]);

        if (trendsRes.ok) {
          const trendsData = await trendsRes.json();
          setTrends(trendsData);
        }

        if (channelsRes.ok) {
          const channelsData = await channelsRes.json();
          setChannels(channelsData);
        }
      } catch (error) {
        console.error("Failed to fetch activity data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [period]);

  // 集計値の計算
  const totalMessages = trends.reduce((sum, t) => sum + t.messageCount, 0);
  const avgMessages = trends.length > 0 ? Math.round(totalMessages / trends.length) : 0;
  const maxActiveUsers = Math.max(...trends.map(t => t.activeUsers), 0);
  const avgActiveUsers = trends.length > 0 
    ? Math.round(trends.reduce((sum, t) => sum + t.activeUsers, 0) / trends.length) 
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="アクティビティ分析" />
        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header title="アクティビティ分析" />
      
      <div className="p-6 space-y-6">
        {/* 期間選択 */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">アクティビティ統計</h2>
            <p className="text-sm text-slate-500">メッセージとアクティブユーザーの分析</p>
          </div>
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList>
              <TabsTrigger value="7">7日間</TabsTrigger>
              <TabsTrigger value="30">30日間</TabsTrigger>
              <TabsTrigger value="90">90日間</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* KPIカード */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={`総メッセージ数（${period}日間）`}
            value={totalMessages.toLocaleString()}
            icon={MessageSquare}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="平均メッセージ/日"
            value={avgMessages.toLocaleString()}
            icon={BarChart3}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="最大アクティブユーザー"
            value={maxActiveUsers}
            icon={Activity}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
          <StatCard
            title="平均アクティブユーザー"
            value={avgActiveUsers}
            icon={Activity}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
        </div>

        {/* グラフ */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TrendChart
            title="日別メッセージ数"
            data={trends}
            dataKey="messageCount"
            type="area"
            color="#8b5cf6"
            height={300}
          />
          <TrendChart
            title="日別アクティブユーザー数"
            data={trends}
            dataKey="activeUsers"
            type="line"
            color="#f59e0b"
            height={300}
          />
        </div>

        {/* チャンネルランキング */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Hash className="h-5 w-5 text-slate-500" />
              チャンネル別メッセージ数 TOP 10
            </CardTitle>
          </CardHeader>
          <CardContent>
            {channels.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">順位</TableHead>
                    <TableHead>チャンネル名</TableHead>
                    <TableHead className="text-right">メッセージ数</TableHead>
                    <TableHead className="text-right">割合</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channels.map((channel, index) => {
                    const totalChannelMessages = channels.reduce((sum, c) => sum + c.messageCount, 0);
                    const percentage = totalChannelMessages > 0 
                      ? ((channel.messageCount / totalChannelMessages) * 100).toFixed(1)
                      : 0;
                    
                    return (
                      <TableRow key={channel.channelId}>
                        <TableCell>
                          <Badge
                            variant={index < 3 ? "default" : "secondary"}
                            className={
                              index === 0
                                ? "bg-yellow-500"
                                : index === 1
                                ? "bg-slate-400"
                                : index === 2
                                ? "bg-amber-600"
                                : ""
                            }
                          >
                            {index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          # {channel.channelName}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {channel.messageCount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-500 w-12 text-right">
                              {percentage}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-slate-500">
                データがありません
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
