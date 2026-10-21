export default function AdminDashboardPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back to the Novae Conseil admin panel.
          </p>
        </div>
        <div className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-md">
          Admin Area
        </div>
      </div>

      {/* Content Area */}
      <div className="grid gap-6">
        <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h2 className="text-lg font-medium mb-2">Overview</h2>
          <p className="text-sm text-muted-foreground">
            Your protected administrative controls will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
