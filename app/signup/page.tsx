//app/signup/page.tsx
import SignupForm  from "@/components/signup-form"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      <div className="w-full max-w-2xl">
        <SignupForm />
      </div>
    </div>
  )
}
