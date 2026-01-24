"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserPlus,
  MessageSquare,
  Activity,
  TrendingUp,
} from "lucide-react";

interface DashboardSummary {
  totalMembers: number;
  newMembersToday: number;
  messagesToday: number;
  activeUsersToday: number;
  weeklyNewMembers: number;
  weeklyLeftMembers: number;
  weeklyMessages: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  dauRate: number;
  wauRate: number;
  mauRate: number;
}

interface TrendData {
  date: string;
  newMembers: number;
  leftMembers: number;
  netGrowth: number;
  totalMembers: number;
  messageCount: number;
  activeUsers: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [summaryRes, trendsRes] = await Promise.all([
          fetch("/api/dashboard/summary"),
          fetch(`/api/dashboard/trends?days=${period}`),
        ]);

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setSummary(summaryData);
        }

        if (trendsRes.ok) {
          const trendsData = await trendsRes.json();
          setTrends(trendsData);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [period]);

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="ダッシュボード" />
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
      <Header title="ダッシュボード" />
      
      <div className="p-6 space-y-6">
        {/* KPIカード */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="総メンバー数"
            value={summary?.totalMembers.toLocaleString() || "0"}
            change={summary?.weeklyNewMembers ? Math.round((summary.weeklyNewMembers / (summary.totalMembers - summary.weeklyNewMembers)) * 100) : 0}
            changeLabel="先週比"
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title="今日の新規参加"
            value={summary?.newMembersToday || 0}
            icon={UserPlus}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title="今日のメッセージ"
            value={summary?.messagesToday.toLocaleString() || "0"}
            icon={MessageSquare}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
          <StatCard
            title="アクティブユーザー (DAU)"
            value={summary?.activeUsersToday || 0}
            icon={Activity}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
        </div>

        {/* アクティブ率 */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-slate-500 mb-1">DAU率</p>
              <p className="text-4xl font-bold text-indigo-600">
                {summary?.dauRate || 0}%
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {summary?.activeUsersToday || 0} / {summary?.totalMembers || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-slate-500 mb-1">WAU率</p>
              <p className="text-4xl font-bold text-indigo-600">
                {summary?.wauRate || 0}%
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {summary?.weeklyActiveUsers || 0} / {summary?.totalMembers || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-slate-500 mb-1">MAU率</p>
              <p className="text-4xl font-bold text-indigo-600">
                {summary?.mauRate || 0}%
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {summary?.monthlyActiveUsers || 0} / {summary?.totalMembers || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* トレンドチャート */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">トレンド</CardTitle>
            <Tabs value={period} onValueChange={setPeriod}>
              <TabsList>
                <TabsTrigger value="7">7日</TabsTrigger>
                <TabsTrigger value="30">30日</TabsTrigger>
                <TabsTrigger value="90">90日</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="members">
              <TabsList className="mb-4">
                <TabsTrigger value="members">メンバー推移</TabsTrigger>
                <TabsTrigger value="messages">メッセージ数</TabsTrigger>
                <TabsTrigger value="active">アクティブユーザー</TabsTrigger>
              </TabsList>
              <TabsContent value="members">
                <TrendChart
                  title="メンバー純増数"
                  data={trends}
                  dataKey="netGrowth"
                  type="bar"
                  color="#10b981"
                  height={300}
                />
              </TabsContent>
              <TabsContent value="messages">
                <TrendChart
                  title="メッセージ数"
                  data={trends}
                  dataKey="messageCount"
                  type="area"
                  color="#8b5cf6"
                  height={300}
                />
              </TabsContent>
              <TabsContent value="active">
                <TrendChart
                  title="アクティブユーザー数"
                  data={trends}
                  dataKey="activeUsers"
                  type="line"
                  color="#f59e0b"
                  height={300}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
