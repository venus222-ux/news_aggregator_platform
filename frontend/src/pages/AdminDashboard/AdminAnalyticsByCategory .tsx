import { useEffect } from "react";
import { useState } from "react";
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

interface CategoryStats {
  date: string;
  [categoryName: string]: number | string;
}

const AdminAnalyticsByCategory = () => {
  const [stats, setStats] = useState<CategoryStats[]>([]);
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

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE"];

  return (
    <div>
      <h2 className="mb-4">Article Views by Category (Last 7 Days)</h2>
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
          {categories.map((cat, idx) => (
            <Line
              key={cat}
              type="monotone"
              dataKey={cat}
              stroke={colors[idx % colors.length]}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminAnalyticsByCategory;
