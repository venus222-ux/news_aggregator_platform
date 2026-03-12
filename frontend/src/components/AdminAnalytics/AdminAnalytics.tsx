// src/pages/admin/AdminAnalytics.tsx
import { useEffect } from "react";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";
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

const AdminAnalytics = () => {
  const { stats, fetchStats } = useAnalyticsStore();

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="mb-4">Article Analytics (Views & Clicks)</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={stats}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="views" stroke="#8884d8" name="Views" />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#82ca9d"
            name="Clicks"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminAnalytics;
