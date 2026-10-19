// FILE: frontend/src/app/page.tsx
import { RequestForm } from "@/components/request-form";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Novae Conseil</h1>
        <p className="mt-2 text-gray-600">
          Tell us about your project — we&apos;ll route it to the right team.
        </p>
      </div>
      <RequestForm />
    </main>
  );
}
