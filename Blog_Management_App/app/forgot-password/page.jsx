import Link from "next/link";
import Navbar from "@/components/Navbar";

const ForgotPasswordPage = () => {
  return (
    <div>
      <Navbar />
      <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 pb-10 pt-24">
        <section className="w-full rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-amber-900">Forgot Password Unavailable</h1>
          <p className="mt-3 text-sm text-amber-800">
            This backend currently does not provide <code>/api/auth/forgot-password</code>. For now,
            password recovery cannot be completed from the frontend.
          </p>
          <Link href="/login" className="mt-4 inline-block rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
            Back to Login
          </Link>
        </section>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
