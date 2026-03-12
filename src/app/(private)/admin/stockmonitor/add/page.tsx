import PageTitle from '@/components/page-title'
import MonitorForm from '@/components/monitor-form'
import React from 'react'

function AddMonitorPage() {
  return (
    <div className='flex flex-col gap-5'>
      <PageTitle title='Add New Monitor' />
      <MonitorForm formType='add' />
    </div>
  )
}

export default AddMonitorPage
