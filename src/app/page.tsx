"use client";

import { useEffect, useState } from 'react';
import { Users, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import { Prospect, ProspectStats } from '@/types/prospect';
import { getRecommendation, RecommendationStatus, STEPS } from '@/lib/logic';

// Mock data generator for initial state or error state
const getInitialStats = (): ProspectStats => ({
  total: 0,
  byStep: STEPS.reduce((acc, step) => ({ ...acc, [step]: 0 }), {} as any),
  alerts: 0,
  avgScore: 0
});

export default function DashboardPage() {
  const [stats, setStats] = useState<ProspectStats>(getInitialStats());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/prospects');
        const data: Prospect[] = await response.json();

        if (!Array.isArray(data)) {
          setLoading(false);
          return;
        }

        const newStats = data.reduce((acc, p) => {
          acc.total++;
          acc.byStep[p.etape] = (acc.byStep[p.etape] || 0) + 1;
          acc.avgScore += p.score;

          const rec = getRecommendation(p);
          if (rec.status === 'ALERT') acc.alerts++;

          return acc;
        }, getInitialStats());

        if (newStats.total > 0) {
          newStats.avgScore = Math.round(newStats.avgScore / newStats.total);
        }

        setStats(newStats);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const chartData = STEPS.map(step => ({
    step,
    count: stats.byStep[step] || 0
  }));

  if (loading) {
    return <div className="flex h-96 items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre tunnel de conversion.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Prospects"
          value={stats.total}
          icon={Users}
          description="Prospects enregistrés"
        />
        <StatCard
          title="Alertes Actives"
          value={stats.alerts}
          icon={AlertCircle}
          description="Prospects à relancer"
        />
        <StatCard
          title="Score Moyen"
          value={`${stats.avgScore}%`}
          icon={TrendingUp}
          description="Qualité globale du tunnel"
        />
        <StatCard
          title="Étape Cruciale"
          value={STEPS[0]}
          icon={BarChart3}
          description="Étape avec le plus d'activité"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <FunnelChart data={chartData} />
        </div>
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-full">
            <h3 className="mb-6 text-lg font-semibold text-primary">Progression Globale</h3>
            <div className="space-y-6">
              {STEPS.map((step) => {
                const count = stats.byStep[step] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={step}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">{step}</span>
                      <span className="text-sm font-bold text-primary">{count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
