'use server'

import { IStock } from './../app/interfaces/index'
import supabaseConfig from '@/app/config/supabse-config'

export const createStock = async (payload: Partial<IStock>) => {
  try {
    const stockcode = payload.stockcode?.trim()
    const name = payload.name?.trim()
    const description = payload.description?.trim()
    const price = Number(payload.price)
    const date = payload.date?.trim()

    if (!stockcode || !name || !description || Number.isNaN(price) || !date) {
      throw new Error('Stock code, name, description, price and date are required')
    }

    const { data, error } = await supabaseConfig
      .from('stocks')
      .insert({
        stockcode,
        name,
        description,
        price,
        date,
      })
      .select('*')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return {
      success: true,
      message: 'Stock created successfully',
      stock: data,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An error occurred while creating stock',
    }
  }
}

export const editStockById = async (id: number, payload: Partial<IStock>) => {
  try {
    if (!id) {
      throw new Error('Stock id is required')
    }

    const updatePayload: Partial<IStock> = {}

    if (payload.stockcode !== undefined) updatePayload.stockcode = payload.stockcode.trim()
    if (payload.name !== undefined) updatePayload.name = payload.name.trim()
    if (payload.description !== undefined) updatePayload.description = payload.description.trim()
    if (payload.price !== undefined) {
      const parsedPrice = Number(payload.price)
      if (Number.isNaN(parsedPrice)) {
        throw new Error('Price must be a valid number')
      }
      updatePayload.price = parsedPrice
    }
    if (payload.date !== undefined) updatePayload.date = payload.date.trim()

    if (Object.keys(updatePayload).length === 0) {
      throw new Error('At least one field is required to update stock')
    }

    const { data, error } = await supabaseConfig
      .from('stocks')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error('Stock not found')
    }

    return {
      success: true,
      message: 'Stock updated successfully',
      stock: data,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An error occurred while updating stock',
    }
  }
}

export const getStockById = async (id: number) => {
  try {
    if (!id) {
      throw new Error('Stock id is required')
    }

    const { data, error } = await supabaseConfig
      .from('stocks')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error('Stock not found')
    }

    return {
      success: true,
      message: 'Stock fetched successfully',
      stock: data,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch stock',
      stock: null,
    }
  }
}

export const deleteStockById = async (id: number) => {
  try {
    if (!id) {
      throw new Error('Stock id is required')
    }

    const { data, error } = await supabaseConfig
      .from('stocks')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error('Stock not found')
    }

    return {
      success: true,
      message: 'Stock deleted successfully',
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An error occurred while deleting stock',
    }
  }
}

export const getAllStocks = async () => {
  try {
    const { data, error } = await supabaseConfig
      .from('stocks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return {
      success: true,
      message: 'Stocks fetched successfully',
      stocks: data,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch stocks',
      stocks: null,
    }
  }
}
