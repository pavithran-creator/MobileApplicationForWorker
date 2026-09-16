import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const skills = [
    { id: 1, name: "Domestic wiring", category: "Electrical", requires_certification: true },
    { id: 2, name: "Electrical repair", category: "Electrical", requires_certification: true },
    { id: 3, name: "Pipe repair", category: "Plumbing", requires_certification: false },
    { id: 4, name: "Bathroom plumbing", category: "Plumbing", requires_certification: false },
    { id: 5, name: "Woodwork", category: "Carpentry", requires_certification: false },
    { id: 6, name: "House painting", category: "Painting", requires_certification: false },
    { id: 7, name: "Car driving", category: "Driving", requires_certification: true },
    { id: 8, name: "Home cleaning", category: "Cleaning", requires_certification: false },
    { id: 9, name: "Lawn maintenance", category: "Gardening", requires_certification: false },
    { id: 10, name: "Elderly assistance", category: "Caregiving", requires_certification: true },
  ];
  return NextResponse.json(skills);
}
