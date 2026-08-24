import type { PageContent } from "../../types"

export const content: PageContent = {
  section: "about",
  slug: "contact",
  path: "/about/contact",
  title: "Contact",
  meta: {
    title: "Contact — OCRA ÉIREANN",
    description:
      "Contact OCRA ÉIREANN — the association welcomes enquiries from athletes, clubs, coaches, Technical Officials, race organisers, volunteers and partners.",
  },
  blocks: [
    { type: "h2", text: "Contact OCRA ÉIREANN" },
    {
      type: "p",
      text: "The Obstacle Course Racing Association of Ireland (OCRA ÉIREANN) welcomes enquiries from athletes, clubs, coaches, Technical Officials, race organisers, volunteers, partners and anyone interested in getting involved in obstacle sport.",
    },
    {
      type: "p",
      text: "For general enquiries, email us and your message will be directed to the appropriate member of the team.",
    },
    { type: "link", label: "info@ocra.ie", href: "mailto:info@ocra.ie" },
    { type: "h2", text: "Help Us Direct Your Enquiry" },
    {
      type: "p",
      text: "To help us route your message to the right person, mention which area your enquiry relates to:",
    },
    {
      type: "ul",
      items: [
        "General enquiry",
        "Membership",
        "Clubs & community",
        "Coaching",
        "Technical Officials",
        "Events",
        "Race organisers",
        "Team Ireland / qualification",
        "Volunteering",
        "Partnerships",
        "Media / press",
        "Website / technical issue",
      ],
    },
    {
      type: "p",
      text: "A contact form with enquiry categories is on its way — until then, email reaches the same team.",
    },
    { type: "h2", text: "Follow OCRA ÉIREANN" },
    {
      type: "p",
      text: "Stay up to date with OCRA news, events, Team Ireland, competitions, coaching, clubs and developments within the Irish obstacle racing community.",
    },
    {
      type: "link",
      label: "Facebook",
      href: "https://www.facebook.com/ocrassociationireland/",
    },
    {
      type: "link",
      label: "Instagram",
      href: "https://www.instagram.com/ocrireland/",
    },
  ],
  ctas: [
    { label: "Get Involved", href: "/get-involved" },
    { label: "About OCRA", href: "/about" },
  ],
}
