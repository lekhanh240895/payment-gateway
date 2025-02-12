import Link from "next/link"

export default function Home() {
  return (
    <div>
      <Link href={"/paypal"}>Paypal Examples</Link>
      <Link href={"/stripe"}>Stripe Examples</Link>
      <Link href={"/momo"}>Momo Examples</Link>
    </div>
  )
}
