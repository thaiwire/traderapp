'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { deleteMonitorById, getAllMonitors } from '@/actions/monitors'
import type { IMonitor } from '@/app/interfaces'
import InfoMessage from '@/components/info-message'
import PageTitle from '@/components/page-title'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getDateFormat, getTimeFormat } from '@/helpers'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

function StockMonitorPage() {
  const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20]

  const [loading, setLoading] = useState(true)
  const [deletingMonitorId, setDeletingMonitorId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [monitors, setMonitors] = useState<IMonitor[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [stockCodeFilter, setStockCodeFilter] = useState('')
  const [monitorTypeFilter, setMonitorTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({
    stockCode: '',
    monitorType: '',
    status: '',
  })

  const filteredMonitors = useMemo(() => {
    return monitors.filter((monitor) => {
      const matchesStockCode = appliedFilters.stockCode
        ? monitor.stockcode.toLowerCase().includes(appliedFilters.stockCode.toLowerCase())
        : true

      const matchesMonitorType = appliedFilters.monitorType
        ? monitor.monitor_type === appliedFilters.monitorType
        : true

      const matchesStatus = appliedFilters.status
        ? monitor.status.toLowerCase() === appliedFilters.status.toLowerCase()
        : true

      return matchesStockCode && matchesMonitorType && matchesStatus
    })
  }, [monitors, appliedFilters])

  const totalPages = Math.max(1, Math.ceil(filteredMonitors.length / itemsPerPage))

  const paginatedMonitors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredMonitors.slice(start, start + itemsPerPage)
  }, [filteredMonitors, currentPage, itemsPerPage])

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }, [totalPages])

  const handleApplyFilters = () => {
    setCurrentPage(1)
    setAppliedFilters({
      stockCode: stockCodeFilter,
      monitorType: monitorTypeFilter,
      status: statusFilter,
    })
  }

  const handleClearFilters = () => {
    setCurrentPage(1)
    setStockCodeFilter('')
    setMonitorTypeFilter('')
    setStatusFilter('')
    setAppliedFilters({
      stockCode: '',
      monitorType: '',
      status: '',
    })
  }

  const buildExportRows = () => {
    return filteredMonitors.map((monitor) => ({
      stockCode: monitor.stockcode,
      monitorType: monitor.monitor_type,
      priceBelow: `$${monitor.price_below}`,
      priceTop: `$${monitor.price_top}`,
      status: monitor.status,
      createdOn: `${getDateFormat(monitor.created_at, 'MMM DD, YYYY')} ${getTimeFormat(monitor.created_at, 'hh:mm A')}`,
    }))
  }

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const buildTableMarkup = (rows: ReturnType<typeof buildExportRows>) => {
    const bodyRows = rows
      .map(
        (row) =>
          `<tr><td>${row.stockCode}</td><td>${row.monitorType}</td><td>${row.priceBelow}</td><td>${row.priceTop}</td><td>${row.status}</td><td>${row.createdOn}</td></tr>`
      )
      .join('')

    return `<table border="1" cellpadding="6" cellspacing="0"><thead><tr><th>Stock Code</th><th>Monitor Type</th><th>Price Below</th><th>Price Top</th><th>Status</th><th>Created On</th></tr></thead><tbody>${bodyRows}</tbody></table>`
  }

  const handleExportExcel = () => {
    const rows = buildExportRows()
    if (rows.length === 0) {
      toast.error('No data available to export')
      return
    }

    const tableMarkup = buildTableMarkup(rows)
    const fileMarkup = `<html><head><meta charset="UTF-8" /></head><body>${tableMarkup}</body></html>`
    const fileName = `stock-monitors-${new Date().toISOString().slice(0, 10)}.xls`

    downloadFile(fileMarkup, fileName, 'application/vnd.ms-excel')
    toast.success('Excel exported successfully')
  }

  const handleExportWord = () => {
    const rows = buildExportRows()
    if (rows.length === 0) {
      toast.error('No data available to export')
      return
    }

    const tableMarkup = buildTableMarkup(rows)
    const fileMarkup = `<html><head><meta charset="UTF-8" /></head><body><h2>Stock Monitors Report</h2>${tableMarkup}</body></html>`
    const fileName = `stock-monitors-${new Date().toISOString().slice(0, 10)}.doc`

    downloadFile(fileMarkup, fileName, 'application/msword')
    toast.success('Word exported successfully')
  }

  const handlePrintPdf = () => {
    const rows = buildExportRows()
    if (rows.length === 0) {
      toast.error('No data available to print')
      return
    }

    const tableMarkup = buildTableMarkup(rows)
    const printWindow = window.open('', '_blank', 'width=1000,height=700')

    if (!printWindow) {
      toast.error('Unable to open print preview')
      return
    }

    const printHtml = `
      <html>
        <head>
          <title>Stock Monitors Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h2 { margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h2>Stock Monitors Report</h2>
          ${tableMarkup}
        </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(printHtml)
    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
    }
  }

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handleDeleteMonitor = async (monitorId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this monitor?')
    if (!confirmed) {
      return
    }

    try {
      setDeletingMonitorId(monitorId)
      const response = await deleteMonitorById(monitorId)

      if (!response.success) {
        toast.error(response.message || 'Failed to delete monitor')
        return
      }

      setMonitors((prevMonitors) => prevMonitors.filter((monitor) => monitor.id !== monitorId))
      toast.success(response.message || 'Monitor deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete monitor')
    } finally {
      setDeletingMonitorId(null)
    }
  }

  useEffect(() => {
    const loadMonitors = async () => {
      try {
        const response = await getAllMonitors()
        if (!response.success) {
          setErrorMessage(response.message || 'Failed to fetch monitors')
          return
        }

        setMonitors(response.monitors || [])
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to fetch monitors')
      } finally {
        setLoading(false)
      }
    }

    loadMonitors()
  }, [])

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between'>
        <PageTitle title='Stock Monitor' />
        <Button asChild>
          <Link href='/admin/stockmonitor/add' className='flex items-center gap-2'>
            <Plus className='size-4' />
            Add New Monitor
          </Link>
        </Button>
      </div>

      {errorMessage && <InfoMessage message={errorMessage} />}

      {!errorMessage && (
        <div className='rounded-lg border border-border bg-card p-4 shadow-sm'>
          {loading ? (
            <InfoMessage message='Loading monitors...' />
          ) : monitors.length === 0 ? (
            <InfoMessage message='No monitors found. Add your first monitor to get started.' />
          ) : (
            <div className='space-y-4'>
              <div className='grid gap-3 md:grid-cols-3'>
                <Input
                  placeholder='Filter by stock code'
                  value={stockCodeFilter}
                  onChange={(event) => setStockCodeFilter(event.target.value)}
                />

                <Select value={monitorTypeFilter} onValueChange={setMonitorTypeFilter}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Filter by monitor type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='quick'>Quick</SelectItem>
                    <SelectItem value='slow'>Slow</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Filter by status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='inactive'>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='flex items-center gap-2'>
                <Button type='button' onClick={handleApplyFilters}>
                  Apply Filter
                </Button>
                <Button type='button' variant='outline' onClick={handleClearFilters}>
                  Clear Filter
                </Button>
                <Button type='button' variant='outline' onClick={handleExportExcel}>
                  Export Excel
                </Button>
                <Button type='button' variant='outline' onClick={handleExportWord}>
                  Export Word
                </Button>
                <Button type='button' variant='outline' onClick={handlePrintPdf}>
                  Print PDF
                </Button>
              </div>

              {filteredMonitors.length === 0 ? (
                <InfoMessage message='No monitors match the current filters.' />
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stock Code</TableHead>
                        <TableHead>Monitor Type</TableHead>
                        <TableHead>Price Below</TableHead>
                        <TableHead>Price Top</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created On</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedMonitors.map((monitor) => (
                        <TableRow key={monitor.id}>
                          <TableCell className='font-medium'>{monitor.stockcode}</TableCell>
                          <TableCell className='capitalize'>{monitor.monitor_type}</TableCell>
                          <TableCell>${monitor.price_below}</TableCell>
                          <TableCell>${monitor.price_top}</TableCell>
                          <TableCell className='capitalize'>{monitor.status}</TableCell>
                          <TableCell>
                            {getDateFormat(monitor.created_at, 'MMM DD, YYYY')} {getTimeFormat(monitor.created_at, 'hh:mm A')}
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Link href={`/admin/stockmonitor/edit/${monitor.id}`}>
                                <Button type='button' variant='outline' size='icon-sm' title='Edit'>
                                  <Pencil className='size-4' />
                                </Button>
                              </Link>

                              <Button
                                type='button'
                                variant='destructive'
                                size='icon-sm'
                                title='Delete'
                                onClick={() => handleDeleteMonitor(monitor.id)}
                                disabled={deletingMonitorId === monitor.id}
                              >
                                <Trash2 className='size-4' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <p className='text-sm text-muted-foreground'>
                      Page {currentPage} of {totalPages}
                    </p>

                    <div className='flex items-center gap-2'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm text-muted-foreground'>Rows per page</span>
                        <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                          <SelectTrigger className='h-9 w-22.5'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={String(option)}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type='button'
                        variant='outline'
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </Button>

                      <div className='flex items-center gap-1'>
                        {pageNumbers.map((pageNumber) => (
                          <Button
                            key={pageNumber}
                            type='button'
                            variant={currentPage === pageNumber ? 'default' : 'outline'}
                            onClick={() => setCurrentPage(pageNumber)}
                          >
                            {pageNumber}
                          </Button>
                        ))}
                      </div>

                      <Button
                        type='button'
                        variant='outline'
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StockMonitorPage