import Link from "next/link"

import { Button } from "@/components/ui/button"

function Homepage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16 md:px-10">
        <div className="grid w-full gap-10 rounded-2xl border border-border bg-card p-8 md:grid-cols-2 md:p-12">
          <div className="space-y-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Stock Trader
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Trade smarter with your own stock dashboard.
            </h1>
            <p className="max-w-xl text-muted-foreground">
              Track stock performance, manage entries, and filter market data by
              date and type in one clean workflow.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild size="lg">
                <Link href="/register">Create Account</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-6">
            <h2 className="text-xl font-semibold">Why trade with us?</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>• Fast stock entry and editing for daily operations</li>
              <li>• Filter by stock code, type, name, and date range</li>
              <li>• Clear admin workflow with role-based dashboard access</li>
              <li>• Simple UI built for quick decisions</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Homepage