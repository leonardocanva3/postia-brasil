export type PicPayPaymentLinkInput = Readonly<{
  externalReference: string;
  amount: number;
  description: string;
}>;

export type PicPayPaymentLookupInput = Readonly<{
  externalReference: string;
}>;

export function createPicPayPaymentLink(input: PicPayPaymentLinkInput) {
  const baseUrl = process.env.PICPAY_PAYMENT_URL ?? "https://app.picpay.com/checkout";
  const url = new URL(baseUrl);

  url.searchParams.set("reference", input.externalReference);
  url.searchParams.set("amount", input.amount.toFixed(2));
  url.searchParams.set("description", input.description);

  return url.toString();
}

export async function getPicPayPaymentStatus(input: PicPayPaymentLookupInput) {
  return {
    externalReference: input.externalReference,
    status: "PENDING" as const
  };
}

export function validatePicPayWebhook(secret: string | null) {
  return Boolean(
    secret &&
      process.env.PICPAY_WEBHOOK_SECRET &&
      secret === process.env.PICPAY_WEBHOOK_SECRET
  );
}
