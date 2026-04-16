import { useEffect } from "react";
import { useAnalyticsStore } from "../../store/useAnalyticsStore";

import AnalyticsChart from "./AnalyticsChart";

const AdminAnalytics = () => {
  const { stats, fetchStats } = useAnalyticsStore();

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="mb-4">Article Analytics (Views & Clicks)</h2>
      <AnalyticsChart data={stats} />
    </div>
  );
};

export default AdminAnalytics;
