export const metadata = {
  title: "TradeQuote — Quotes & Invoices for Tradespeople",
  description: "Create professional quotes and invoices in seconds. Free quote and invoice generator for electricians, plumbers, landscapers, and trades.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
