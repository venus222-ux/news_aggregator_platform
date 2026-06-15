import { useEffect, useState } from "react";
import API from "../../api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import type { CategoryStatsPoint } from "../../types";

const AdminAnalyticsByCategory = () => {
  const [stats, setStats] = useState<CategoryStatsPoint[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    API.get("/admin/analytics/article-stats-by-category")
      .then((res) => {
        setStats(res.data);
        if (res.data.length > 0) {
          const keys = Object.keys(res.data[0]).filter((k) => k !== "date");
          setCategories(keys);
        }
      })
      .catch(console.error);
  }, []);

  // Polished palette matching a modern slate theme
  const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={stats}
          margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
        >
          {/* Subtle horizontal gridlines only for a cleaner look */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f1f5f9"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            tickLine={false}
            dy={10}
            style={{ fontSize: "12px", fontWeight: 500 }}
          />

          <YAxis
            stroke="#94a3b8"
            tickLine={false}
            dx={-5}
            style={{ fontSize: "12px", fontWeight: 500 }}
          />

          {/* Custom dark theme tooltip */}
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              borderRadius: "10px",
              color: "#fff",
              border: "none",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            }}
            itemStyle={{ fontSize: "13px" }}
            labelStyle={{
              fontSize: "12px",
              color: "#94a3b8",
              fontWeight: 600,
              marginBottom: "4px",
            }}
          />

          <Legend
            verticalAlign="top"
            height={40}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "13px", fontWeight: 500 }}
          />

          {categories.map((cat, idx) => (
            <Line
              key={cat}
              type="monotone"
              dataKey={cat}
              stroke={colors[idx % colors.length]}
              strokeWidth={2.5}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminAnalyticsByCategory;
