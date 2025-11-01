"use client";

import { useEffect, useState } from "react";

export default function testDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
    // Define your parameters
    const workspaceId = "demo_workspace_001"; // Get this from context/props/state
    const range = "7d"; // or "24h", "30d", "90d"

    // Build the URL with query parameters
    const params = new URLSearchParams({
      workspaceId,
      range,
    });

    const response = await fetch(`/api/dashboard/analytics/overview?${params}`);
    const result = await response.json();
    setData(result);
  };

  fetchData();
  }, []);

  return (
    <div>
      <h1>Dashboard Overview Test Page</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}