"use client"

import React, { useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

import type { IMonitor } from "@/app/interfaces"
import { createMonitor, editMonitorById } from "@/actions/monitors"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const monitorFormSchema = z
  .object({
    stockcode: z
      .string()
      .trim()
      .min(1, "Stock code is required")
      .regex(/^[A-Z0-9._-]+$/, "Stock code must be uppercase"),
    price_below: z.number().min(0, "Price below must be 0 or greater"),
    price_top: z.number().min(0, "Price top must be 0 or greater"),
    monitor_type: z.enum(["quick", "slow"], { message: "Monitor type is required" }),
    status: z.string().min(1, "Status is required"),
  })
  .refine((values) => values.price_top >= values.price_below, {
    message: "Price top must be greater than or equal to price below",
    path: ["price_top"],
  })

type MonitorFormValues = z.infer<typeof monitorFormSchema>

interface MonitorFormProps {
  formType: "add" | "edit"
  monitorData?: Partial<IMonitor>
}

function MonitorForm({ formType, monitorData }: MonitorFormProps) {
  const router = useRouter()

  const initialValues = useMemo<MonitorFormValues>(() => {
    return {
      stockcode: monitorData?.stockcode?.toUpperCase() ?? "",
      price_below: monitorData?.price_below ?? 0,
      price_top: monitorData?.price_top ?? 0,
      monitor_type: monitorData?.monitor_type ?? "quick",
      status: monitorData?.status ?? "active",
    }
  }, [monitorData])

  const form = useForm<MonitorFormValues>({
    resolver: zodResolver(monitorFormSchema),
    defaultValues: initialValues,
  })

  const onSubmit = async (values: MonitorFormValues) => {
    try {
      let response: { success: boolean; message?: string } | null = null

      if (formType === "add") {
        response = await createMonitor(values)
      } else {
        if (!monitorData?.id) {
          toast.error("Monitor id is missing")
          return
        }

        response = await editMonitorById(monitorData.id, values)
      }

      if (response?.success) {
        toast.success(
          response.message ||
            (formType === "edit"
              ? "Monitor updated successfully!"
              : "Monitor created successfully!")
        )
        form.reset()
        router.push("/admin/stockmonitor")
      } else {
        toast.error(
          response?.message ||
            (formType === "edit"
              ? "Failed to update monitor. Please try again."
              : "Failed to create monitor. Please try again.")
        )
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit monitor")
    }
  }

  const handleCancel = () => {
    router.push('/admin/stockmonitor')
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
                    <Input
                      placeholder="AAPL"
                      {...field}
                      value={field.value}
                      onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monitor_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monitor Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select monitor type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="quick">Quick</SelectItem>
                      <SelectItem value="slow">Slow</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="price_below"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Below</FormLabel>
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
              name="price_top"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Top</FormLabel>
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
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full md:max-w-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {formType === "edit" ? "Update Monitor" : "Create Monitor"}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  )
}

export default MonitorForm
