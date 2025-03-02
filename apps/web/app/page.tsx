import { Button } from "@repo/ui/components"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-gray-100">
      <Link href="/paypal">
        <Button className="bg-blue-500 text-white hover:bg-blue-700">
          Paypal Examples
        </Button>
      </Link>
      <Link href="/google-pay">
        <Button className="bg-blue-500 text-white hover:bg-blue-700">
          Google Pay Examples
        </Button>
      </Link>
      <Link href="/stripe">
        <Button className="bg-blue-500 text-white hover:bg-blue-700">
          Stripe Examples
        </Button>
      </Link>
      <Link href="/momo">
        <Button className="bg-blue-500 text-white hover:bg-blue-700">
          Momo Examples
        </Button>
      </Link>
    </div>
  )
}
