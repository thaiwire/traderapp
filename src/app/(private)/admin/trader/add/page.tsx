import PageTitle from '@/components/page-title'
import StockForm from '@/components/stock-form'
import React from 'react'

function AddStockPage() {
  return (
    <div className='flex flex-col gap-5'>
      <PageTitle title='Add New Stock' />
      <StockForm formType='add' />
    </div>
  )
}

export default AddStockPage
