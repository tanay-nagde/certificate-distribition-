import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { CertificatesTable } from "@/components/jobs/certificates-table"

export default async function JobDetailPage({ params }: { params: { jobId: string } }) {
  const { jobId } = await params

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="container mx-auto p-4 md:p-6">
          <div className="mb-6">
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
              <ol className="flex items-center gap-2">
                <li>
                  <a href="/" className="hover:underline">
                    Dashboard
                  </a>
                </li>
                <li>{">"}</li>
                <li className="text-foreground font-medium">Job {jobId}</li>
              </ol>
            </nav>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Certificates for Job {jobId}</h1>
            <p className="text-sm text-muted-foreground">
              All generated certificates associated with this job. Search, filter, and view public links.
            </p>
          </div>

          <CertificatesTable jobId={jobId} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
