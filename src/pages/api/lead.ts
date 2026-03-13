import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const {
    formType, name, firstName: firstNameField, lastName: lastNameField,
    email, phone, message, website, referrerName, intent, notes: searchNotes,
    beds, baths, priceMin, priceMax, propertyTypes, timeline, preApproval,
  } = body;

  // Honeypot check
  if (website) {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  const apiKey = import.meta.env.FUB_API_KEY;
  if (!apiKey) {
    console.error("FUB_API_KEY is not set");
    return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500 });
  }

  let firstName: string;
  let lastName: string;
  if (firstNameField || lastNameField) {
    firstName = (firstNameField || "").trim();
    lastName = (lastNameField || "").trim();
  } else {
    const parts = (name || "").trim().split(/\s+/);
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  }

  let note = "";
  if (formType === "contact") {
    note = message || "";
  } else if (formType === "referral") {
    const lines = ["🤝 Client Referral", "", `Referred by: ${referrerName || "Unknown"}`];
    if (intent) lines.push(`Intent: ${intent}`);
    if (searchNotes) { lines.push(""); lines.push(`Notes: ${searchNotes}`); }
    note = lines.join("\n");
  } else if (formType === "inquiry") {
    const lines = ["🏠 Home Search Inquiry", "", `Beds: ${beds || "Any"}  |  Baths: ${baths || "Any"}`];
    const priceStr = [priceMin, priceMax].filter(Boolean).join(" – ");
    lines.push(`Price: ${priceStr || "No preference"}`);
    const types = Array.isArray(propertyTypes) ? propertyTypes : [propertyTypes];
    lines.push(`Type: ${types.length ? types.join(", ") : "Any"}`);
    if (timeline) lines.push(`Timeline: ${timeline}`);
    if (preApproval) lines.push(`Pre-Approved: ${preApproval}`);
    if (searchNotes) { lines.push(""); lines.push(`Notes: ${searchNotes}`); }
    note = lines.join("\n");
  }

  const person: Record<string, unknown> = { firstName, lastName };
  if (email) person.emails = [{ value: email }];
  if (phone) person.phones = [{ value: phone }];

  const sourceMap: Record<string, string> = {
    inquiry:  "Ackiss Homes Website - Find Your Perfect Home",
    referral: "Ackiss Homes Website - Client Referral",
  };
  const typeMap: Record<string, string> = {
    inquiry:  "Property Inquiry",
    referral: "Referral",
  };
  const payload: Record<string, unknown> = {
    source: sourceMap[formType] ?? "Ackiss Homes Website - General Inquiry",
    type:   typeMap[formType]   ?? "General Inquiry",
    person,
  };
  if (note) payload.message = note;

  const authHeader = `Basic ${btoa(`${apiKey}:`)}`;

  const fubRes = await fetch("https://api.followupboss.com/v1/events", {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      "X-System": "Ackiss Homes Website",
      "X-System-Key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!fubRes.ok) {
    const text = await fubRes.text();
    console.error("FUB API error:", fubRes.status, text);
    return new Response(JSON.stringify({ error: "Failed to submit lead" }), { status: 502 });
  }

  const timelineTagMap: Record<string, string> = {
    "ASAP":           "timeline-asap",
    "1–3 Months":     "timeline-1-3mo",
    "3–6 Months":     "timeline-3-6mo",
    "Just Exploring": "timeline-exploring",
  };
  const preApprovalTagMap: Record<string, string> = {
    "Yes":           "pre-approved",
    "Working On It": "pre-approval-in-progress",
    "Not Yet":       "not-pre-approved",
  };
  const tags = formType === "inquiry"
    ? [
        "website-lead", "website-property-inquiry",
        ...(timelineTagMap[timeline]       ? [timelineTagMap[timeline]]       : []),
        ...(preApprovalTagMap[preApproval] ? [preApprovalTagMap[preApproval]] : []),
      ]
    : formType === "referral"
    ? ["website-lead", "website-referral"]
    : ["website-lead", "website-contact"];

  try {
    const eventData = await fubRes.json();
    const personId = eventData?.person?.id ?? eventData?.id;
    if (personId) {
      await fetch(`https://api.followupboss.com/v1/people/${personId}`, {
        method: "PUT",
        headers: { Authorization: authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          tags,
          customWebsiteInquiryType:
            formType === "inquiry" ? "Find Your Perfect Home"
            : formType === "referral" ? "Client Referral"
            : "General Inquiry",
        }),
      });
    }
  } catch (err) {
    console.error("Failed to apply tags:", err);
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
