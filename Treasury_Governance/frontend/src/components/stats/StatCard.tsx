import type { ComponentType } from 'react';
import { Card } from '../ui/Card';

interface StatCardProps {
  icon: ComponentType;
  label: string;
  value: number | string;
  trend?: string;
}

export function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <Card className="hover:scale-105 transition-transform duration-200">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
          <Icon />
        </div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && <p className="text-green-400 text-xs">↑ {trend}</p>}
        </div>
      </div>
    </Card>
  );
}