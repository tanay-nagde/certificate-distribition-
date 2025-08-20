"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const recentJobs = [
  {
    id: "JOB-1234",
    date: "2025-07-25",
    template: "Certificate of Completion",
    status: "completed",
    certificates: 127,
  },
  {
    id: "JOB-1233",
    date: "2025-07-24",
    template: "Certificate of Achievement",
    status: "completed",
    certificates: 85,
  },
  {
    id: "JOB-1232",
    date: "2025-07-23",
    template: "Certificate of Excellence",
    status: "failed",
    certificates: 0,
  },
  {
    id: "JOB-1231",
    date: "2025-07-22",
    template: "Certificate of Completion",
    status: "completed",
    certificates: 42,
  },
  {
    id: "JOB-1230",
    date: "2025-07-21",
    template: "Certificate of Achievement",
    status: "completed",
    certificates: 73,
  },
]

export function RecentJobs() {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Template Used</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right"># Certificates</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentJobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">{job.id}</TableCell>
              <TableCell>{job.date}</TableCell>
              <TableCell>{job.template}</TableCell>
              <TableCell>
                <Badge variant={job.status === "completed" ? "default" : "destructive"}>{job.status}</Badge>
              </TableCell>
              <TableCell className="text-right">{job.certificates}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
