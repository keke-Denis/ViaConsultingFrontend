// Page wrapper
import LoginForm from "@/components/login-form"

export default function Page() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 md:p-10 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="w-full">
        <LoginForm />
      </div>
    </div>
  )
}