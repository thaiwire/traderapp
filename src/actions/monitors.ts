'use server'

import type { IMonitor } from '@/app/interfaces'
import supabaseConfig from '@/app/config/supabse-config'

const MONITOR_TABLE_CANDIDATES = ['monitors', 'monitor', 'stock_monitors', 'stockmonitor'] as const
const STOCKCODE_PATTERN = /^[A-Z0-9._-]+$/

const isMissingTableError = (message?: string) => {
  const normalizedMessage = (message || '').toLowerCase()
  return (
    normalizedMessage.includes('could not find the table') ||
    normalizedMessage.includes('relation') && normalizedMessage.includes('does not exist')
  )
}

const getMissingTableMessage = () => {
  return "Monitor table not found. Create one of: monitors, monitor, stock_monitors, or stockmonitor."
}

const tryWithMonitorTables = async <T>(
  operation: (tableName: string) => any
) => {
  let lastError: any = null

  for (const tableName of MONITOR_TABLE_CANDIDATES) {
    const result = (await operation(tableName)) as { data: T | null; error: any }

    if (!result.error) {
      return { ...result, tableName }
    }

    lastError = result.error

    if (!isMissingTableError(result.error?.message)) {
      return { ...result, tableName }
    }
  }

  return {
    data: null,
    error: lastError || new Error(getMissingTableMessage()),
    tableName: null,
  }
}

export const createMonitor = async (payload: Partial<IMonitor>) => {
  try {
    const stockcode = payload.stockcode?.trim().toUpperCase();
    const price_below = Number(payload.price_below);
    const price_top = Number(payload.price_top);
    const monitor_type = payload.monitor_type;
    const status = payload.status?.trim();

    if (
      !stockcode ||
      Number.isNaN(price_below) ||
      Number.isNaN(price_top) ||
      !monitor_type ||
      !status
    ) {
      throw new Error(
        "Stock code, price below, price top, monitor type and status are required",
      );
    }

    if (!STOCKCODE_PATTERN.test(stockcode)) {
      throw new Error('Stock code must contain uppercase letters only')
    }
    
    

    const duplicateCheck = await tryWithMonitorTables<{ id: number }[]>((tableName) =>
      supabaseConfig
        .from(tableName)
        .select('id')
        .ilike('stockcode', stockcode)
        .limit(1),
    );
   

    if (duplicateCheck.error) {
      throw new Error(
        isMissingTableError(duplicateCheck.error.message)
          ? getMissingTableMessage()
          : duplicateCheck.error.message,
      );
    }

    if (duplicateCheck.data && duplicateCheck.data.length > 0) {
      throw new Error('Stock code already exists');
    }


    const { data, error } = await tryWithMonitorTables((tableName) =>
      supabaseConfig
        .from(tableName)
        .insert({
          stockcode,
          price_below,
          price_top,
          monitor_type,
          status,
        })
        .select("*")
        .single(),
    );

    if (error) {
      throw new Error(
        isMissingTableError(error.message)
          ? getMissingTableMessage()
          : error.message,
      );
    }

    return {
      success: true,
      message: "Monitor created successfully",
      monitor: data as IMonitor,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An error occurred while creating monitor',
    }
  }
}

export const editMonitorById = async (id: number, payload: Partial<IMonitor>) => {
  try {
    if (!id) {
      throw new Error('Monitor id is required')
    }

    const updatePayload: Partial<IMonitor> = {}

    if (payload.stockcode !== undefined) {
      const normalizedStockcode = payload.stockcode.trim().toUpperCase()
      if (!normalizedStockcode) {
        throw new Error('Stock code is required')
      }
      if (!STOCKCODE_PATTERN.test(normalizedStockcode)) {
        throw new Error('Stock code must contain uppercase letters only')
      }
      updatePayload.stockcode = normalizedStockcode
    }
    if (payload.price_below !== undefined) {
      const parsedPriceBelow = Number(payload.price_below)
      if (Number.isNaN(parsedPriceBelow)) {
        throw new Error('Price below must be a valid number')
      }
      updatePayload.price_below = parsedPriceBelow
    }
    if (payload.price_top !== undefined) {
      const parsedPriceTop = Number(payload.price_top)
      if (Number.isNaN(parsedPriceTop)) {
        throw new Error('Price top must be a valid number')
      }
      updatePayload.price_top = parsedPriceTop
    }
    if (payload.monitor_type !== undefined) updatePayload.monitor_type = payload.monitor_type
    if (payload.status !== undefined) updatePayload.status = payload.status.trim()

    if (Object.keys(updatePayload).length === 0) {
      throw new Error('At least one field is required to update monitor')
    }

    if (updatePayload.stockcode !== undefined) {
      const duplicateCheck = await tryWithMonitorTables<{ id: number }[]>((tableName) =>
        supabaseConfig
          .from(tableName)
          .select('id')
          .ilike('stockcode', updatePayload.stockcode as string)
          .neq('id', id)
          .limit(1)
      )

      if (duplicateCheck.error) {
        throw new Error(isMissingTableError(duplicateCheck.error.message) ? getMissingTableMessage() : duplicateCheck.error.message)
      }

      if (duplicateCheck.data && duplicateCheck.data.length > 0) {
        throw new Error('Stock code already exists')
      }
    }

    const { data, error } = await tryWithMonitorTables((tableName) =>
      supabaseConfig
        .from(tableName)
        .update(updatePayload)
        .eq('id', id)
        .select('*')
        .maybeSingle()
    )

    if (error) {
      throw new Error(isMissingTableError(error.message) ? getMissingTableMessage() : error.message)
    }

    if (!data) {
      throw new Error('Monitor not found')
    }

    return {
      success: true,
      message: 'Monitor updated successfully',
      monitor: data as IMonitor,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An error occurred while updating monitor',
    }
  }
}

export const getMonitorById = async (id: number) => {
  try {
    if (!id) {
      throw new Error('Monitor id is required')
    }

    const { data, error } = await tryWithMonitorTables((tableName) =>
      supabaseConfig
        .from(tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle()
    )

    if (error) {
      throw new Error(isMissingTableError(error.message) ? getMissingTableMessage() : error.message)
    }

    if (!data) {
      throw new Error('Monitor not found')
    }

    return {
      success: true,
      message: 'Monitor fetched successfully',
      monitor: data as IMonitor,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch monitor',
      monitor: null,
    }
  }
}

export const deleteMonitorById = async (id: number) => {
  try {
    if (!id) {
      throw new Error('Monitor id is required')
    }

    const { data, error } = await tryWithMonitorTables((tableName) =>
      supabaseConfig
        .from(tableName)
        .delete()
        .eq('id', id)
        .select('id')
        .maybeSingle()
    )

    if (error) {
      throw new Error(isMissingTableError(error.message) ? getMissingTableMessage() : error.message)
    }

    if (!data) {
      throw new Error('Monitor not found')
    }

    return {
      success: true,
      message: 'Monitor deleted successfully',
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An error occurred while deleting monitor',
    }
  }
}

export const getAllMonitors = async () => {
  try {
    const { data, error } = await tryWithMonitorTables((tableName) =>
      supabaseConfig
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
    )

    if (error) {
      throw new Error(isMissingTableError(error.message) ? getMissingTableMessage() : error.message)
    }

    return {
      success: true,
      message: 'Monitors fetched successfully',
      monitors: (data || []) as IMonitor[],
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch monitors',
      monitors: null,
    }
  }
}
