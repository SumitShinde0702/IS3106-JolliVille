"use client";
import React from "react";
import { use, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import AdminNav from "../components/AdminNav";
import { SectionCards } from "components/section-cards";
import { ChartAreaInteractive } from "components/chart-area-interactive";
import FeedbackPieChart from "components/feedback-piechart";
import withAdminOnly from "../utils/preventUser";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, when: "beforeChildren" },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

function AdminDashboard() {
  const [userStats, setUserStats] = useState({
    active: 0,
    inactive: 0,
    admin: 0,
    users: 0,
  });

  const supabase = createClientComponentClient();

  // Fetch user stats (active, inactive, admin, users)
  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("status, admin");

      if (error) {
        console.error("Error fetching stats", error);
        return;
      }

      const stats = {
        active: 0,
        inactive: 0,
        admin: 0,
        users: 0,
      };

      data.forEach((user) => {
        if (user.status === "active") stats.active++;
        else stats.inactive++;

        if (user.admin) stats.admin++;
        else stats.users++;
      });

      setUserStats(stats);
    };

    fetchStats();
  }, []);

  return (
    <>
      <AdminNav />
      <motion.div
        className="p-8 space-y-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 min-h-screen"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl font-bold mb-8 text-gradient"
          variants={itemVariants}
        >
          Dashboard
        </motion.h1>

        {/* Section cards for user stats */}
        <motion.div variants={itemVariants}>
          <SectionCards userStats={userStats} />
        </motion.div>

        {/* Journal Entry line graph */}
        <motion.div variants={itemVariants}>
          <ChartAreaInteractive />
        </motion.div>

        {/* Feedback Pie Chart */}
        <motion.div variants={itemVariants}>
          <FeedbackPieChart />
        </motion.div>
      </motion.div>
    </>
  );
}

export default withAdminOnly(AdminDashboard);
