"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  CreditCard,
  Tag,
  Percent,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  Trash2,
  RefreshCw,
  TrendingUp,
  Receipt,
  Sparkles,
  ShieldCheck,
  Edit2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface CoursePricing {
  id: string
  slug: string
  title: string
  category: string
  price: number
  compareAtPrice?: number | null
  currency: string
  isPublished: boolean
}

interface CouponItem {
  id: string
  code: string
  discountPct: number
  maxUses?: number | null
  usedCount: number
  maxDiscountAmount?: number | null
  minCartAmount?: number | null
  isActive: boolean
}

interface TransactionItem {
  id: string
  orderId: string
  paymentId?: string | null
  studentName: string
  studentEmail: string
  courseTitle: string
  amount: number
  currency: string
  status: string
  paymentMethod?: string | null
  couponCode?: string | null
  createdAt: string
}

export default function PaymentsAndCouponsPage() {
  const [billingEnabled, setBillingEnabled] = React.useState(false)
  const [courses, setCourses] = React.useState<CoursePricing[]>([])
  const [coupons, setCoupons] = React.useState<CouponItem[]>([])
  const [transactions, setTransactions] = React.useState<TransactionItem[]>([])
  const [loading, setLoading] = React.useState(true)

  // Dialogs
  const [couponOpen, setCouponOpen] = React.useState(false)
  const [newCode, setNewCode] = React.useState("")
  const [newDiscount, setNewDiscount] = React.useState(20)
  const [newMaxUses, setNewMaxUses] = React.useState<number | "">("")

  // Edit Course Price
  const [priceOpen, setPriceOpen] = React.useState(false)
  const [editCourse, setEditCourse] = React.useState<CoursePricing | null>(null)
  const [editPrice, setEditPrice] = React.useState(0)
  const [editCompare, setEditCompare] = React.useState<number | "">("")

  const fetchBillingData = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/billing")
      if (res.ok) {
        const data = await res.json()
        setBillingEnabled(data.billingEnabled)
        setCourses(data.courses)
        setCoupons(data.coupons)
        setTransactions(data.transactions)
      }
    } catch (err) {
      toast.error("Failed to load billing configurations")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchBillingData()
  }, [fetchBillingData])

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/admin/billing/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode,
          discountPct: Number(newDiscount),
          maxUses: newMaxUses ? Number(newMaxUses) : null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error("Failed to create coupon", { description: data.error })
        return
      }

      toast.success("Coupon code created!")
      setCouponOpen(false)
      setNewCode("")
      setNewDiscount(20)
      setNewMaxUses("")
      fetchBillingData()
    } catch (err) {
      toast.error("Network error")
    }
  }

  const handleToggleCoupon = async (coupon: CouponItem) => {
    try {
      const res = await fetch("/api/admin/billing/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id, isActive: !coupon.isActive }),
      })

      if (res.ok) {
        toast.success(`Coupon ${coupon.code} ${!coupon.isActive ? "activated" : "deactivated"}`)
        fetchBillingData()
      }
    } catch (err) {
      toast.error("Error toggling coupon")
    }
  }

  const handleDeleteCoupon = async (coupon: CouponItem) => {
    if (!confirm(`Delete coupon code ${coupon.code}?`)) return
    try {
      const res = await fetch("/api/admin/billing/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id, deleteCoupon: true }),
      })

      if (res.ok) {
        toast.success("Coupon deleted")
        fetchBillingData()
      }
    } catch (err) {
      toast.error("Error deleting coupon")
    }
  }

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editCourse) return

    try {
      const res = await fetch("/api/admin/billing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: editCourse.id,
          price: Number(editPrice),
          compareAtPrice: editCompare ? Number(editCompare) : null,
        }),
      })

      if (res.ok) {
        toast.success(`Updated pricing for ${editCourse.title}`)
        setPriceOpen(false)
        fetchBillingData()
      }
    } catch (err) {
      toast.error("Error updating price")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Course Pricing, Coupons & Billing
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Configure course fees, launch promotional coupons, and audit recent gateway transactions.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setCouponOpen(true)}
          className="gap-2 bg-brand-teal text-brand-charcoal hover:bg-brand-teal-deep font-semibold"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Coupon</span>
        </Button>
      </div>

      {/* Feature Flag Banner */}
      {!billingEnabled && (
        <div className="p-4 rounded-xl bg-card border border-brand-teal/30 shadow-sm flex items-start gap-3 text-xs">
          <Sparkles className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">FEATURE_BILLING_ENABLED = false</span>
              <Badge className="bg-brand-teal/15 text-brand-cyan text-[10px]">Sandbox Simulator Active</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Billing gateway enforcement is currently disabled in your environment configuration. The LMS remains
              100% usable without charging learners, and you can test pricing schemes and coupons freely.
            </p>
          </div>
        </div>
      )}

      {/* Course Pricing Table */}
      <Card className="border-border/80 overflow-hidden">
        <CardHeader className="bg-muted/20 py-4 px-6 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Course Tuition Catalog</CardTitle>
              <CardDescription className="text-xs">Manage public pricing and promotional strike-through rates</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">{courses.length} Courses</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Fee (INR)</TableHead>
                <TableHead>Original Fee</TableHead>
                <TableHead>Listing Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                    No courses created in database yet.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <span className="font-semibold text-xs text-foreground block">{c.title}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{c.slug}</span>
                    </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{c.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-sm text-brand-ink dark:text-brand-cyan">
                      ₹{c.price.toLocaleString("en-IN")}
                    </span>
                  </TableCell>
                  <TableCell>
                    {c.compareAtPrice ? (
                      <span className="text-xs text-muted-foreground line-through">
                        ₹{c.compareAtPrice.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {c.isPublished ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px]">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Draft / Review</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditCourse(c)
                        setEditPrice(c.price)
                        setEditCompare(c.compareAtPrice || "")
                        setPriceOpen(true)
                      }}
                      className="text-xs gap-1.5 h-8 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Fee</span>
                    </Button>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Coupons Manager */}
      <Card className="border-border/80 overflow-hidden">
        <CardHeader className="bg-muted/20 py-4 px-6 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Promotional Discount Coupons</CardTitle>
              <CardDescription className="text-xs">Manage discount vouchers, usage caps, and validity</CardDescription>
            </div>
            <Badge className="bg-brand-teal/15 text-brand-cyan text-xs">{coupons.length} Coupons</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Voucher Code</TableHead>
                <TableHead>Discount Value</TableHead>
                <TableHead>Redemptions Cap</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No active discount coupons configured.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-brand-teal" />
                        <span className="font-mono font-bold text-xs text-foreground bg-muted/60 px-2 py-0.5 rounded">
                          {coupon.code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-emerald-400 text-xs">{coupon.discountPct}% OFF</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground font-mono">
                        {coupon.usedCount} / {coupon.maxUses || "∞"} used
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={coupon.isActive}
                        onCheckedChange={() => handleToggleCoupon(coupon)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCoupon(coupon)}
                        className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Gateway Transactions Ledger */}
      <Card className="border-border/80 overflow-hidden">
        <CardHeader className="bg-muted/20 py-4 px-6 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Recent Payment Transactions</CardTitle>
              <CardDescription className="text-xs">Immutable financial audit ledger</CardDescription>
            </div>
            <Receipt className="w-4 h-4 text-brand-teal" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                    No payment transactions recorded in ledger.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-xs">{tx.orderId}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-xs block">{tx.studentName}</span>
                    <span className="text-[10px] text-muted-foreground">{tx.studentEmail}</span>
                  </TableCell>
                  <TableCell className="text-xs font-medium max-w-xs truncate">{tx.courseTitle}</TableCell>
                  <TableCell className="font-bold text-xs text-brand-ink dark:text-brand-cyan">
                    ₹{tx.amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{tx.paymentMethod || "Direct"}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px]">
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {new Date(tx.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Coupon Dialog */}
      <Dialog open={couponOpen} onOpenChange={setCouponOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create Promotional Coupon</DialogTitle>
            <DialogDescription>Generate a new discount voucher code for students.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Voucher Code</Label>
              <Input
                required
                placeholder="e.g. DIWALI40"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                className="font-mono uppercase rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Discount Percentage (%)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                required
                value={newDiscount}
                onChange={(e) => setNewDiscount(Number(e.target.value))}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Maximum Uses (Optional)</Label>
              <Input
                type="number"
                placeholder="Leave blank for unlimited"
                value={newMaxUses}
                onChange={(e) => setNewMaxUses(e.target.value ? Number(e.target.value) : "")}
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCouponOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-teal text-brand-charcoal hover:bg-brand-teal-deep font-semibold rounded-xl">
                Create Coupon
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Course Price Dialog */}
      <Dialog open={priceOpen} onOpenChange={setPriceOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Update Course Pricing</DialogTitle>
            <DialogDescription>{editCourse?.title}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePrice} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Enrollment Fee (INR)</Label>
              <Input
                type="number"
                min={0}
                required
                value={editPrice}
                onChange={(e) => setEditPrice(Number(e.target.value))}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Compare-At / Strike-through Fee (INR)</Label>
              <Input
                type="number"
                min={0}
                placeholder="Optional strike-through rate"
                value={editCompare}
                onChange={(e) => setEditCompare(e.target.value ? Number(e.target.value) : "")}
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setPriceOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-teal text-brand-charcoal hover:bg-brand-teal-deep font-semibold rounded-xl">
                Save Price
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
