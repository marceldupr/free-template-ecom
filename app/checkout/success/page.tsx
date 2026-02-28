import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Thank you for your order!</h1>
      <p className="text-aurora-muted mb-8">
        Your payment was successful. You will receive a confirmation email shortly.
      </p>
      <Link
        href="/catalogue"
        className="inline-block px-6 py-3 rounded-component bg-aurora-accent text-aurora-bg font-medium hover:opacity-90"
      >
        Continue shopping
      </Link>
    </div>
  );
}
