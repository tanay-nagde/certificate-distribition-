"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getAllUploadJobs } from "@/apis/parser"
import Link from "next/link"

type Job = {
  id: string
  admin_id: string
  template_id: string
  uploaded_at: string
  status: string
  total_records: number
  processed_count: number
  failed_count: number
}

export function RecentJobs() {
  const [recentJobs, setRecentJobs] = useState<Job[]>([])

  useEffect(() => {
    const fetchRecentJobs = async () => {
      const data = await getAllUploadJobs()
      if (data?.jobs?.results) {
        setRecentJobs(data.jobs.results)
      }
    }

    fetchRecentJobs()
  }, [])

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
              <TableCell className="font-medium">
                 <Link href={`/jobs/${job.id}`} className="text-primary hover:underline">
                  {job.id}
                </Link>
                </TableCell>
              <TableCell>{new Date(job.uploaded_at).toLocaleString()}</TableCell>
              <TableCell>{job.template_id}</TableCell>
              <TableCell>
                <Badge variant={job.status === "completed" ? "default" : "secondary"}>
                  {job.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{job.total_records}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
