"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Copy, Download, ExternalLink, ImageIcon, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Certificate, getCertificatesByJobId } from "@/apis/cert"

export function CertificatesTable({ jobId }: { jobId?: string }) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!jobId) return
    setLoading(true)
    getCertificatesByJobId(jobId)
      .then((data) => {
        // 👇 FIX: unwrap certificates
        setCertificates(data.certificates || [])
      })
      .catch((err) => {
        console.error("Failed to load certificates", err)
        setCertificates([])
      })
      .finally(() => setLoading(false))
  }, [jobId])

  const filteredCertificates = useMemo(() => {
    let rows = certificates
    if (status !== "all") rows = rows.filter((r) => r.status === status)
    if (query.trim()) {
      const q = query.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.recipient_name.toLowerCase().includes(q) ||
          r.recipient_email.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.slug.toLowerCase().includes(q),
      )
    }
    return rows
  }, [certificates, query, status])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // ignore
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 md:p-6">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name, email, ID, or slug"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status" className="sr-only">
              Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">Recipient</TableHead>
                <TableHead className="min-w-[140px]">Email</TableHead>
                <TableHead className="min-w-[120px]">Certificate ID</TableHead>
                <TableHead className="min-w-[120px]">Status</TableHead>
                <TableHead className="min-w-[140px]">Issued</TableHead>
                <TableHead className="text-right min-w-[220px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Loading certificates...
                  </TableCell>
                </TableRow>
              ) : filteredCertificates.length > 0 ? (
                filteredCertificates.map((c) => {
                  const publicUrl = `/c/${c.slug}`
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.recipient_name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.recipient_email}</TableCell>
                      <TableCell className="font-mono text-xs">{c.id}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            c.status === "generated" ? "default" : c.status === "failed" ? "destructive" : "secondary"
                          }
                          className={cn(
                            c.status === "generated" && "bg-emerald-600 hover:bg-emerald-600 text-white",
                            c.status === "pending" && "bg-amber-500 hover:bg-amber-500 text-white",
                          )}
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.generated_at ? new Date(c.generated_at).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <ImageIcon className="mr-2 h-4 w-4" />
                                Preview
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Preview - {c.recipient_name}</DialogTitle>
                              </DialogHeader>
                              <img
                                src={c.img_url || "/placeholder.svg"}
                                alt={`Certificate for ${c.recipient_name}`}
                                className="w-full rounded-md border"
                              />
                            </DialogContent>
                          </Dialog>
                          <Button asChild variant="outline" size="sm">
                            <a href={c.img_url} download>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </a>
                          </Button>
                          <Button asChild size="sm">
                            <Link href={publicUrl} target="_blank">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Public
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyToClipboard(new URL(publicUrl, window.location.origin).toString())}
                            title="Copy public link"
                            aria-label="Copy public link"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No certificates found for this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
