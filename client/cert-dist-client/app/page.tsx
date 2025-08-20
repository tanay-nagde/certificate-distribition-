import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadCSV } from "@/components/dashboard/upload-csv"
import { SelectTemplate } from "@/components/dashboard/select-template"
import { JobConfig } from "@/components/dashboard/job-config"
import { RecentJobs } from "@/components/dashboard/recent-jobs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function Dashboard() {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="container mx-auto p-4 md:p-6">
          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Upload CSV File</CardTitle>
                  <CardDescription>Upload a CSV file with recipient data</CardDescription>
                </CardHeader>
                <CardContent>
                  <UploadCSV />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Select Template</CardTitle>
                  <CardDescription>Choose a certificate template</CardDescription>
                </CardHeader>
                <CardContent>
                  <SelectTemplate />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Configuration</CardTitle>
                  <CardDescription>Configure and start certificate generation</CardDescription>
                </CardHeader>
                <CardContent>
                  <JobConfig />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
                <CardDescription>View and manage recent certificate generation jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentJobs />
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
