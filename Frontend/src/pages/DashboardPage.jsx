import { useEffect, useState } from "react";
import { getDashboardOverview } from "../api/dashboardApi";

import KpiCards from "../components/KpiCards";
import AllocationChart from "../components/AllocationChart";
import PerformanceChart from "../components/PerformanceChart";
import HoldingsTable from "../components/HoldingsTable";

export default function DashboardPage() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const data = await getDashboardOverview();
                console.log("dashboard overview:", data);
                setDashboardData(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        }

        fetchDashboard();
    }, []);

    if (loading) {
        return <div style={{ color: "#e2e8f0" }}>Loading dashboard...</div>;
    }

    if (error) {
        return <div style={{ color: "#ef4444" }}>{error}</div>;
    }

    return (
        <div style={styles.main}>
            <KpiCards data={dashboardData} />

            <div style={styles.chartGrid}>
                <AllocationChart data={dashboardData?.allocation || []} />
                <PerformanceChart />
            </div>

            <HoldingsTable data={dashboardData?.topHoldings || []} />
        </div>
    );
}

const styles = {
    main: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    chartGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
    },
};