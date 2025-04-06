"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))"];

export default function FeedbackPieChart() {
  const [data, setData] = useState([
    { name: "Resolved", value: 0 },
    { name: "Unresolved", value: 0 },
  ]);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchFeedbackStats = async () => {
      const { data: complaints, error } = await supabase
        .from("complaints")
        .select("status");

      if (error) {
        console.error("Error fetching feedback:", error);
        return;
      }

      const resolved = complaints.filter(
        (c) => c.status.toLowerCase() === "resolved"
      ).length;
      const unresolved = complaints.length - resolved;

      setData([
        { name: "Resolved", value: resolved },
        { name: "Unresolved", value: unresolved },
      ]);
    };

    fetchFeedbackStats();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Resolution</CardTitle>
        <CardDescription>Overview of feedback status</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <PieChart width={300} height={300}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={60}
            dataKey="value"
            label
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </CardContent>
    </Card>
  );
}
