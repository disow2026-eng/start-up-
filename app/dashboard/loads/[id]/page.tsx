import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { LoadDetail } from "@/components/app/LoadDetail";

export default async function LoadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  const load = await prisma.load.findUnique({
    where: { id },
    include: { claim: true },
  });

  if (!load || load.userId !== userId) notFound();

  return (
    <LoadDetail
      load={{
        id: load.id,
        referenceNumber: load.referenceNumber,
        brokerName: load.brokerName,
        brokerEmail: load.brokerEmail,
        shipperName: load.shipperName,
        shipperCity: load.shipperCity,
        shipperState: load.shipperState,
        receiverName: load.receiverName,
        receiverCity: load.receiverCity,
        receiverState: load.receiverState,
        freeTimeMinutesPickup: load.freeTimeMinutesPickup,
        freeTimeMinutesDelivery: load.freeTimeMinutesDelivery,
        ratePerHour: load.ratePerHour,
        pickupAppointmentAt: load.pickupAppointmentAt?.toISOString() ?? null,
        pickupArrivedAt: load.pickupArrivedAt?.toISOString() ?? null,
        pickupDepartedAt: load.pickupDepartedAt?.toISOString() ?? null,
        deliveryAppointmentAt: load.deliveryAppointmentAt?.toISOString() ?? null,
        deliveryArrivedAt: load.deliveryArrivedAt?.toISOString() ?? null,
        deliveryDepartedAt: load.deliveryDepartedAt?.toISOString() ?? null,
        status: load.status,
      }}
      claim={
        load.claim
          ? {
              id: load.claim.id,
              status: load.claim.status,
              amount: load.claim.amount,
              totalDetentionMinutes: load.claim.totalDetentionMinutes,
            }
          : null
      }
    />
  );
}
