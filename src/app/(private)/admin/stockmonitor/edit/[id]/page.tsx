import { getMonitorById } from '@/actions/monitors'
import InfoMessage from '@/components/info-message'
import PageTitle from '@/components/page-title'
import MonitorForm from '@/components/monitor-form'
import React from 'react'

interface EditMonitorPageProps {
  params: Promise<{ id: string }>
}

async function EditMonitorPage({ params }: EditMonitorPageProps) {
  const { id } = await params
  const monitor = await getMonitorById(Number(id))

  if (!monitor || !monitor.success || !monitor.monitor) {
    return <InfoMessage message='Monitor not found' />
  }

  return (
    <div className='flex flex-col gap-5'>
      <PageTitle title='Edit Monitor' />
      <MonitorForm formType='edit' monitorData={monitor.monitor} />
    </div>
  )
}

export default EditMonitorPage
