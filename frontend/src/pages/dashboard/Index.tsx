import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function DashboardHome() {
  return (
    <div className="dashboard-section">
      <div className="dashboard-heading">
        <h1>Overview</h1>
        <p>Welkom terug. Hier is je dashboard.</p>
      </div>

      <Button onClick={() => toast("Dashboard werkt ✅")}>Test toast</Button>

      <div className="dashboard-stats">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="dashboard-stat-value">128</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="dashboard-stat-value">32</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="dashboard-stat-value">€ 4.2k</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
