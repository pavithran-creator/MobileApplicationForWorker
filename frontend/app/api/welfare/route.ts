import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const schemes = [
      { id: 1, name: "Accidental Health Cover", description: "State Cooperative Health Scheme covering workplace hazards and hospitalization up to ₹2,00,000" },
      { id: 2, name: "Artisan Pension Fund", description: "Contributory retirement pension security for registered cooperative tradespersons" },
      { id: 3, name: "Child Education Grant", description: "Annual academic grant of ₹10,000 for children of verified cooperative workers" },
      { id: 4, name: "Maternity & Family Assistance", description: "Statutory health and family welfare support sponsored by cooperative surplus" }
    ];

    const enrollments = [
      { id: 1, worker_id: 1, benefit_id: 1, benefit_name: "Accidental Health Cover", status: "ACTIVE", enrolled_at: "2025-01-15" },
      { id: 2, worker_id: 1, benefit_id: 2, benefit_name: "Artisan Pension Fund", status: "ACTIVE", enrolled_at: "2025-01-15" },
      { id: 3, worker_id: 2, benefit_id: 1, benefit_name: "Accidental Health Cover", status: "ACTIVE", enrolled_at: "2025-02-10" },
      { id: 4, worker_id: 3, benefit_id: 1, benefit_name: "Accidental Health Cover", status: "ACTIVE", enrolled_at: "2025-03-01" },
      { id: 5, worker_id: 4, benefit_id: 3, benefit_name: "Child Education Grant", status: "ACTIVE", enrolled_at: "2025-02-18" },
      { id: 6, worker_id: 5, benefit_id: 2, benefit_name: "Artisan Pension Fund", status: "ACTIVE", enrolled_at: "2025-01-20" }
    ];

    return NextResponse.json({
      schemes,
      enrollments
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err?.message || "Failed to fetch welfare data" }, { status: 500 });
  }
}
