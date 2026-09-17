const STYLES: Record<string, string> = {
  slate: "bg-ink-100 text-ink-600",
  amber: "bg-amber-100 text-amber-700",
  green: "bg-emerald-100 text-emerald-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
};

export function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: keyof typeof STYLES;
}) {
  return <span className={`badge ${STYLES[tone]}`}>{children}</span>;
}

export const LOAD_STATUS_TONE: Record<string, keyof typeof STYLES> = {
  PLANNED: "slate",
  AT_PICKUP: "amber",
  IN_TRANSIT: "blue",
  AT_DELIVERY: "amber",
  COMPLETED: "green",
};

export const LOAD_STATUS_LABEL: Record<string, string> = {
  PLANNED: "Planned",
  AT_PICKUP: "At pickup",
  IN_TRANSIT: "In transit",
  AT_DELIVERY: "At delivery",
  COMPLETED: "Completed",
};

export const CLAIM_STATUS_TONE: Record<string, keyof typeof STYLES> = {
  DRAFT: "slate",
  SENT: "blue",
  ACKNOWLEDGED: "amber",
  PAID: "green",
  DISPUTED: "red",
  REJECTED: "red",
};
