"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Custom color scheme
const COLORS = {
  journalEntries: "#10b981", // Emerald-500
};

interface ChartData {
  date: string;
  journalEntries: number;
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");
  const [chartData, setChartData] = React.useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const supabase = createClientComponentClient();

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  // Fetch journal entries data from Supabase
  React.useEffect(() => {
    const fetchJournalEntries = async () => {
      setIsLoading(true);
      try {
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (timeRange === "7d" ? 7 : 30));

        // Format dates for Supabase query
        const startDateStr = startDate.toISOString();
        const endDateStr = endDate.toISOString();

        // Fetch journal entries grouped by date
        const { data, error } = await supabase
          .from("journal_entries")
          .select("created_at")
          .gte("created_at", startDateStr)
          .lte("created_at", endDateStr)
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Process data into daily counts
        const dailyCounts: Record<string, number> = {};

        // Initialize all dates in range with 0 values
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split("T")[0];
          dailyCounts[dateStr] = 0;
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Count journal entries per day
        data?.forEach((entry) => {
          const dateStr = new Date(entry.created_at)
            .toISOString()
            .split("T")[0];
          if (dailyCounts[dateStr] !== undefined) {
            dailyCounts[dateStr]++;
          }
        });

        // Convert to array format for chart
        const chartDataArray = Object.entries(dailyCounts).map(
          ([date, count]) => ({
            date,
            journalEntries: count,
          })
        );

        setChartData(chartDataArray);
      } catch (error) {
        console.error("Error fetching journal entries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJournalEntries();
  }, [timeRange, supabase]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Daily Journal Entries</CardTitle>
        <CardDescription>
          {timeRange === "7d" ? "Last 7 days" : "Last 30 days"}
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => value && setTimeRange(value)}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="30d" className="h-8 px-2.5">
              Last 30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5">
              Last 7 days
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="@[767px]/card:hidden flex w-40"
              aria-label="Select time range"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p>Loading data...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="colorJournalEntries"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={COLORS.journalEntries}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLORS.journalEntries}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                minTickGap={timeRange === "7d" ? 1 : 5}
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <Tooltip
                labelFormatter={formatDate}
                formatter={(value: number) => [
                  `${value} entries`,
                  "Journal Entries",
                ]}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                itemStyle={{ color: "#1f2937" }}
              />
              <Area
                type="monotone"
                dataKey="journalEntries"
                stroke={COLORS.journalEntries}
                fill="url(#colorJournalEntries)"
                strokeWidth={2}
                name="Journal Entries"
                activeDot={{
                  r: 6,
                  stroke: COLORS.journalEntries,
                  strokeWidth: 2,
                  fill: "#ffffff",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
