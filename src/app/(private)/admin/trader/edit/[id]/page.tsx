import { getStockById } from '@/actions/stocks'
import InfoMessage from '@/components/info-message'
import PageTitle from '@/components/page-title'
import StockForm from '@/components/stock-form'
import React from 'react'

interface EditStockPageProps {
  params: Promise<{ id: string }>
}

async function EditStockPage({ params }: EditStockPageProps) {
  const { id } = await params
  const stock = await getStockById(Number(id))

  if (!stock || !stock.success || !stock.stock) {
    return <InfoMessage message='Stock not found' />
  }

  return (
    <div className='flex flex-col gap-5'>
      <PageTitle title='Edit Stock' />
      <StockForm formType='edit' stockData={stock.stock} />
    </div>
  )
}

export default EditStockPage
