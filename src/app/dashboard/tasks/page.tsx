"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, Clock, AlertCircle } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="flex flex-col">
      <Header title="タスク管理" />
      
      <div className="p-6 space-y-6">
        {/* Phase 2 バッジ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              Phase 2
            </Badge>
            <span className="text-sm text-slate-500">この機能は Phase 2 で実装予定です</span>
          </div>
        </div>

        {/* プレースホルダーUI */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                未着手
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-3 bg-white rounded-lg border border-slate-200 opacity-50">
                  <p className="text-sm font-medium text-slate-600">サンプルタスク 1</p>
                  <p className="text-xs text-slate-400 mt-1">担当: 未割当</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 opacity-50">
                  <p className="text-sm font-medium text-slate-600">サンプルタスク 2</p>
                  <p className="text-xs text-slate-400 mt-1">担当: 未割当</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                進行中
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-3 bg-white rounded-lg border border-slate-200 opacity-50">
                  <p className="text-sm font-medium text-slate-600">サンプルタスク 3</p>
                  <p className="text-xs text-slate-400 mt-1">担当: 未割当</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                完了
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-slate-400 text-sm">
                完了したタスクはここに表示されます
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 機能説明 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">実装予定の機能</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                タスクの作成・編集・削除
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                担当者の割り当て
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                期限の設定と通知
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                ドラッグ&ドロップでのステータス変更
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                チームメンバーとの共有
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex justify-center">
          <Button disabled className="opacity-50">
            <Plus className="h-4 w-4 mr-2" />
            新規タスクを作成（Phase 2 で有効化）
          </Button>
        </div>
      </div>
    </div>
  );
}
