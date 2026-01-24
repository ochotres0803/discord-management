"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserPlus,
  UserMinus,
  TrendingUp,
} from "lucide-react";

interface MemberStats {
  totalActive: number;
  periodNewMembers: number;
  periodLeftMembers: number;
  netGrowth: number;
}

interface TrendData {
  date: string;
  newMembers: number;
  leftMembers: number;
  netGrowth: number;
  totalMembers: number;
}

export default function MembersPage() {
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [statsRes, trendsRes] = await Promise.all([
          fetch(`/api/members/stats?days=${period}`),
          fetch(`/api/dashboard/trends?days=${period}`),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (trendsRes.ok) {
          const trendsData = await trendsRes.json();
          setTrends(trendsData);
        }
      } catch (error) {
        console.error("Failed to fetch member data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [period]);

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="メンバー分析" />
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
      <Header title="メンバー分析" />
      
      <div className="p-6 space-y-6">
        {/* 期間選択 */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">メンバー統計</h2>
            <p className="text-sm text-slate-500">サーバーのメンバー動向を分析</p>
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
            title="現在のメンバー数"
            value={stats?.totalActive.toLocaleString() || "0"}
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          <StatCard
            title={`新規参加（${period}日間）`}
            value={stats?.periodNewMembers || 0}
            icon={UserPlus}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          <StatCard
            title={`退出（${period}日間）`}
            value={stats?.periodLeftMembers || 0}
            icon={UserMinus}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
          <StatCard
            title={`純増減（${period}日間）`}
            value={stats?.netGrowth || 0}
            icon={TrendingUp}
            iconColor={stats?.netGrowth && stats.netGrowth >= 0 ? "text-green-600" : "text-red-600"}
            iconBgColor={stats?.netGrowth && stats.netGrowth >= 0 ? "bg-green-100" : "bg-red-100"}
          />
        </div>

        {/* グラフ */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TrendChart
            title="メンバー総数推移"
            data={trends}
            dataKey="totalMembers"
            type="area"
            color="#3b82f6"
            height={300}
          />
          <TrendChart
            title="日別 新規参加者数"
            data={trends}
            dataKey="newMembers"
            type="bar"
            color="#10b981"
            height={300}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TrendChart
            title="日別 退出者数"
            data={trends}
            dataKey="leftMembers"
            type="bar"
            color="#ef4444"
            height={300}
          />
          <TrendChart
            title="日別 純増減"
            data={trends}
            dataKey="netGrowth"
            type="bar"
            color="#8b5cf6"
            height={300}
          />
        </div>

        {/* 成長サマリー */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">成長サマリー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">平均日次流入</span>
                <Badge variant="secondary" className="font-mono">
                  {((stats?.periodNewMembers || 0) / parseInt(period)).toFixed(1)} 人/日
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">平均日次退出</span>
                <Badge variant="secondary" className="font-mono">
                  {((stats?.periodLeftMembers || 0) / parseInt(period)).toFixed(1)} 人/日
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">平均日次純増</span>
                <Badge 
                  variant="secondary" 
                  className={`font-mono ${
                    stats?.netGrowth && stats.netGrowth >= 0 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {stats?.netGrowth && stats.netGrowth >= 0 ? "+" : ""}
                  {((stats?.netGrowth || 0) / parseInt(period)).toFixed(1)} 人/日
                </Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">定着率（推定）</span>
                <Badge variant="secondary" className="font-mono">
                  {stats?.periodNewMembers && stats.periodLeftMembers
                    ? (100 - (stats.periodLeftMembers / (stats.totalActive + stats.periodLeftMembers)) * 100).toFixed(1)
                    : 100}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
