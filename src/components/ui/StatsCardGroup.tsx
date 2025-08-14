

import React from "react";
import { Card, CardContent } from "./Card";

interface Stat {
  label: string;
  value: string | number;
  unit?: string;
}

interface StatsCardProps {
  title: string;
  stats: Stat[];
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, stats, className }) => {
  return (
    <Card className={`mb-4 w-full max-w-md ${className || ""}`}>
      <CardContent>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-start p-2 bg-gray-50 rounded">
              <span className="text-2xl font-bold">
                {stat.value}
                {stat.unit && <span className="text-sm ml-1 text-gray-500">{stat.unit}</span>}
              </span>
              <span className="text-sm text-gray-600">{stat.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface StatsCardGroupProps {
  cards: StatsCardProps[];
  className?: string;
}

const StatsCardGroup: React.FC<StatsCardGroupProps> = ({ cards, className }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className || ""}`}>
      {cards.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </div>
  );
};

export default StatsCardGroup;
