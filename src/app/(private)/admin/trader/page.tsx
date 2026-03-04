'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { deleteStockById, getAllStocks } from '@/actions/stocks'
import type { IStock } from '@/app/interfaces'
import InfoMessage from '@/components/info-message'
import PageTitle from '@/components/page-title'
import { stocktypes } from '@/app/constants'
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

function TraderPage() {
  const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20]

  const [loading, setLoading] = useState(true)
  const [deletingStockId, setDeletingStockId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [stocks, setStocks] = useState<IStock[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [stockCodeFilter, setStockCodeFilter] = useState('')
  const [stockTypeFilter, setStockTypeFilter] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [fromDateFilter, setFromDateFilter] = useState('')
  const [toDateFilter, setToDateFilter] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({
    stockCode: '',
    stockType: '',
    name: '',
    fromDate: '',
    toDate: '',
  })

  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const stockTypeValue = stock.stocktype || ''

      const matchesStockCode = appliedFilters.stockCode
        ? stock.stockcode.toLowerCase().includes(appliedFilters.stockCode.toLowerCase())
        : true

      const matchesStockType = appliedFilters.stockType
        ? stockTypeValue === appliedFilters.stockType
        : true

      const matchesName = appliedFilters.name
        ? stock.name.toLowerCase().includes(appliedFilters.name.toLowerCase())
        : true

      const stockDate = new Date(stock.date)
      const hasValidStockDate = !Number.isNaN(stockDate.getTime())
      const fromDate = appliedFilters.fromDate ? new Date(appliedFilters.fromDate) : null
      const toDate = appliedFilters.toDate ? new Date(appliedFilters.toDate) : null

      const matchesFromDate = fromDate
        ? hasValidStockDate && stockDate >= fromDate
        : true
      const matchesToDate = toDate ? hasValidStockDate && stockDate <= toDate : true

      return matchesStockCode && matchesStockType && matchesName && matchesFromDate && matchesToDate
    })
  }, [stocks, appliedFilters])

  const totalPages = Math.max(1, Math.ceil(filteredStocks.length / itemsPerPage))

  const paginatedStocks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredStocks.slice(start, start + itemsPerPage)
  }, [filteredStocks, currentPage, itemsPerPage])

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }, [totalPages])

  const handleApplyFilters = () => {
    setCurrentPage(1)
    setAppliedFilters({
      stockCode: stockCodeFilter,
      stockType: stockTypeFilter,
      name: nameFilter,
      fromDate: fromDateFilter,
      toDate: toDateFilter,
    })
  }

  const handleClearFilters = () => {
    setCurrentPage(1)
    setStockCodeFilter('')
    setStockTypeFilter('')
    setNameFilter('')
    setFromDateFilter('')
    setToDateFilter('')
    setAppliedFilters({
      stockCode: '',
      stockType: '',
      name: '',
      fromDate: '',
      toDate: '',
    })
  }

  const buildExportRows = () => {
    return filteredStocks.map((stock) => ({
      stockCode: stock.stockcode,
      stockType: (stock.stocktype || 'N/A').replaceAll('_', ' '),
      name: stock.name,
      price: `$${stock.price}`,
      date: getDateFormat(stock.date, 'MMM DD, YYYY'),
      createdOn: `${getDateFormat(stock.created_at, 'MMM DD, YYYY')} ${getTimeFormat(stock.created_at, 'hh:mm A')}`,
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
          `<tr><td>${row.stockCode}</td><td>${row.stockType}</td><td>${row.name}</td><td>${row.price}</td><td>${row.date}</td><td>${row.createdOn}</td></tr>`
      )
      .join('')

    return `<table border="1" cellpadding="6" cellspacing="0"><thead><tr><th>Stock Code</th><th>Stock Type</th><th>Name</th><th>Price</th><th>Date</th><th>Created On</th></tr></thead><tbody>${bodyRows}</tbody></table>`
  }

  const handleExportExcel = () => {
    const rows = buildExportRows()
    if (rows.length === 0) {
      toast.error('No data available to export')
      return
    }

    const tableMarkup = buildTableMarkup(rows)
    const fileMarkup = `<html><head><meta charset="UTF-8" /></head><body>${tableMarkup}</body></html>`
    const fileName = `stocks-${new Date().toISOString().slice(0, 10)}.xls`

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
    const fileMarkup = `<html><head><meta charset="UTF-8" /></head><body><h2>Stocks Report</h2>${tableMarkup}</body></html>`
    const fileName = `stocks-${new Date().toISOString().slice(0, 10)}.doc`

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
          <title>Stocks Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h2 { margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h2>Stocks Report</h2>
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

  const handleDeleteStock = async (stockId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this stock?')
    if (!confirmed) {
      return
    }

    try {
      setDeletingStockId(stockId)
      const response = await deleteStockById(stockId)

      if (!response.success) {
        toast.error(response.message || 'Failed to delete stock')
        return
      }

      setStocks((prevStocks) => prevStocks.filter((stock) => stock.id !== stockId))
      toast.success(response.message || 'Stock deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete stock')
    } finally {
      setDeletingStockId(null)
    }
  }

  useEffect(() => {
    const loadStocks = async () => {
      try {
        const response = await getAllStocks()
        if (!response.success) {
          setErrorMessage(response.message || 'Failed to fetch stocks')
          return
        }

        setStocks(response.stocks || [])
      } catch (error: any) {
        setErrorMessage(error.message || 'Failed to fetch stocks')
      } finally {
        setLoading(false)
      }
    }

    loadStocks()
  }, [])

  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between'>
        <PageTitle title='Stocks' />
        <Button asChild>
          <Link href='/admin/trader/add' className='flex items-center gap-2'>
            <Plus className='size-4' />
            Add New Stock
          </Link>
        </Button>
      </div>

      {errorMessage && <InfoMessage message={errorMessage} />}

      {!errorMessage && (
        <div className='rounded-lg border border-border bg-card p-4 shadow-sm'>
          {loading ? (
            <InfoMessage message='Loading stocks...' />
          ) : stocks.length === 0 ? (
            <InfoMessage message='No stocks found. Add your first stock to get started.' />
          ) : (
            <div className='space-y-4'>
              <div className='grid gap-3 md:grid-cols-5'>
                <Input
                  placeholder='Filter by stock code'
                  value={stockCodeFilter}
                  onChange={(event) => setStockCodeFilter(event.target.value)}
                />
                <Select value={stockTypeFilter} onValueChange={setStockTypeFilter}>
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Filter by stock type' />
                  </SelectTrigger>
                  <SelectContent>
                    {stocktypes.map((stockType) => (
                      <SelectItem key={stockType.value} value={stockType.value}>
                        {stockType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder='Filter by name'
                  value={nameFilter}
                  onChange={(event) => setNameFilter(event.target.value)}
                />
                <Input
                  type='date'
                  placeholder='From Date'
                  value={fromDateFilter}
                  onChange={(event) => setFromDateFilter(event.target.value)}
                />
                <Input
                  type='date'
                  placeholder='To Date'
                  value={toDateFilter}
                  onChange={(event) => setToDateFilter(event.target.value)}
                />
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

              {filteredStocks.length === 0 ? (
                <InfoMessage message='No stocks match the current filters.' />
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stock Code</TableHead>
                        <TableHead>Stock Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Created On</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStocks.map((stock) => {
                        const stockTypeLabel = (stock.stocktype || 'N/A').replaceAll('_', ' ')

                        return (
                          <TableRow key={stock.id}>
                            <TableCell className='font-medium'>{stock.stockcode}</TableCell>
                            <TableCell className='capitalize'>{stockTypeLabel}</TableCell>
                            <TableCell>{stock.name}</TableCell>
                            <TableCell>${stock.price}</TableCell>
                            <TableCell>{getDateFormat(stock.date, 'MMM DD, YYYY')}</TableCell>
                            <TableCell>
                              {getDateFormat(stock.created_at, 'MMM DD, YYYY')} {getTimeFormat(stock.created_at, 'hh:mm A')}
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <Link href={`/admin/trader/edit/${stock.id}`}>
                                  <Button type='button' variant='outline' size='icon-sm' title='Edit'>
                                    <Pencil className='size-4' />
                                  </Button>
                                </Link>

                                <Button
                                  type='button'
                                  variant='destructive'
                                  size='icon-sm'
                                  title='Delete'
                                  onClick={() => handleDeleteStock(stock.id)}
                                  disabled={deletingStockId === stock.id}
                                >
                                  <Trash2 className='size-4' />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
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

export default TraderPage