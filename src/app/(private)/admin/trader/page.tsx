'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { deleteStockById, getAllStocks } from '@/actions/stocks'
import type { IStock } from '@/app/interfaces'
import InfoMessage from '@/components/info-message'
import PageTitle from '@/components/page-title'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const [loading, setLoading] = useState(true)
  const [deletingStockId, setDeletingStockId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [stocks, setStocks] = useState<IStock[]>([])
  const [stockCodeFilter, setStockCodeFilter] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [fromDateFilter, setFromDateFilter] = useState('')
  const [toDateFilter, setToDateFilter] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({
    stockCode: '',
    name: '',
    fromDate: '',
    toDate: '',
  })

  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const matchesStockCode = appliedFilters.stockCode
        ? stock.stockcode.toLowerCase().includes(appliedFilters.stockCode.toLowerCase())
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

      return matchesStockCode && matchesName && matchesFromDate && matchesToDate
    })
  }, [stocks, appliedFilters])

  const handleApplyFilters = () => {
    setAppliedFilters({
      stockCode: stockCodeFilter,
      name: nameFilter,
      fromDate: fromDateFilter,
      toDate: toDateFilter,
    })
  }

  const handleClearFilters = () => {
    setStockCodeFilter('')
    setNameFilter('')
    setFromDateFilter('')
    setToDateFilter('')
    setAppliedFilters({
      stockCode: '',
      name: '',
      fromDate: '',
      toDate: '',
    })
  }

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
              <div className='grid gap-3 md:grid-cols-4'>
                <Input
                  placeholder='Filter by stock code'
                  value={stockCodeFilter}
                  onChange={(event) => setStockCodeFilter(event.target.value)}
                />
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
              </div>

              {filteredStocks.length === 0 ? (
                <InfoMessage message='No stocks match the current filters.' />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stock Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Created On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStocks.map((stock) => (
                      <TableRow key={stock.id}>
                        <TableCell className='font-medium'>{stock.stockcode}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TraderPage