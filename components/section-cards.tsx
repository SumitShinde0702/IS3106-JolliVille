import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards({
  userStats,
}: {
  userStats: { active: number; inactive: number; admin: number; users: number };
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 px-4 lg:px-6">
      {/* Active Users Card */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Active Users</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {userStats.active}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />+
              {(
                (userStats.active / (userStats.active + userStats.inactive)) *
                100
              ).toFixed(2)}
              %
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active users this month <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total active users in the system
          </div>
        </CardFooter>
      </Card>

      {/* Inactive Users Card */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Inactive Users</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {userStats.inactive}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingDownIcon className="size-3" />-
              {(
                (userStats.inactive / (userStats.active + userStats.inactive)) *
                100
              ).toFixed(2)}
              %
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Inactive users this period <TrendingDownIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Users who are not active</div>
        </CardFooter>
      </Card>

      {/* Total Users Card */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Normal Users</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {userStats.users}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />+
              {(
                (userStats.users / (userStats.users + userStats.admin)) *
                100
              ).toFixed(2)}
              %
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Users joined this month <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Overall user base growth</div>
        </CardFooter>
      </Card>

      {/* Admin Users Card */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Admin Users</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {userStats.admin}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="text-muted-foreground">
            Total Admin users in the system
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
