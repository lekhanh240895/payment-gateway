import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <Link href="/paypal">
        <div className="m-2 rounded bg-blue-500 p-4 text-white hover:bg-blue-700">
          Paypal Examples
        </div>
      </Link>
      <Link href="/google-pay">
        <div className="m-2 rounded bg-blue-500 p-4 text-white hover:bg-blue-700">
          Google Pay Examples
        </div>
      </Link>
      <Link href="/stripe">
        <div className="m-2 rounded bg-blue-500 p-4 text-white hover:bg-blue-700">
          Stripe Examples
        </div>
      </Link>
      <Link href="/momo">
        <div className="m-2 rounded bg-blue-500 p-4 text-white hover:bg-blue-700">
          Momo Examples
        </div>
      </Link>
    </div>
  )
}
