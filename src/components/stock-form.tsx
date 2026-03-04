"use client"

import React, { useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

import type { IStock } from "@/app/interfaces"
import { createStock, editStockById } from "@/actions/stocks"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const stockFormSchema = z.object({
  stockcode: z.string().min(1, "Stock code is required"),
  name: z.string().min(2, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be 0 or greater"),
  date: z.string().min(1, "Date is required"),
})

type StockFormValues = z.infer<typeof stockFormSchema>

interface StockFormProps {
  formType: "add" | "edit"
  stockData?: Partial<IStock>
}

function StockForm({ formType, stockData }: StockFormProps) {
  const router = useRouter()

  const initialValues = useMemo<StockFormValues>(
    () => ({
      stockcode: stockData?.stockcode ?? "",
      name: stockData?.name ?? "",
      description: stockData?.description ?? "",
      price: stockData?.price ?? 0,
      date: stockData?.date ?? "",
    }),
    [stockData]
  )

  const form = useForm<StockFormValues>({
    resolver: zodResolver(stockFormSchema),
    defaultValues: initialValues,
  })

  const onSubmit = async (values: StockFormValues) => {
    try {
      let response: { success: boolean; message?: string } | null = null

      if (formType === "add") {
        response = await createStock(values)
      } else {
        if (!stockData?.id) {
          toast.error("Stock id is missing")
          return
        }

        response = await editStockById(stockData.id, values)
      }

      if (response?.success) {
        toast.success(
          response.message ||
            (formType === "edit"
              ? "Stock updated successfully!"
              : "Stock created successfully!")
        )
        form.reset()
        router.push("/admin/trader")
      } else {
        toast.error(
          response?.message ||
            (formType === "edit"
              ? "Failed to update stock. Please try again."
              : "Failed to create stock. Please try again.")
        )
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit stock")
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="stockcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Code</FormLabel>
                  <FormControl>
                    <Input placeholder="AAPL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Apple Inc" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Company description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="0.00"
                      value={field.value}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              {formType === "edit" ? "Update Stock" : "Create Stock"}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  )
}

export default StockForm
