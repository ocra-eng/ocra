import type { PageContent } from "../../types"

export const content: PageContent = {
  section: "about",
  slug: "index",
  path: "/about",
  title: "About OCRA",
  meta: {
    title: "About OCRA — OCRA ÉIREANN",
    description:
      "The Obstacle Course Racing Association of Ireland (OCRA ÉIREANN) is the national organisation dedicated to the development and promotion of obstacle sport in Ireland.",
  },
  blocks: [
    { type: "h2", text: "About OCRA ÉIREANN" },
    {
      type: "p",
      text: "The Obstacle Course Racing Association of Ireland (OCRA ÉIREANN) is the national organisation dedicated to the development and promotion of obstacle sport in Ireland.",
    },
    {
      type: "p",
      text: "Our role is to support the growth of the sport at every level, from people discovering obstacle racing for the first time through to athletes representing Ireland at major international competitions.",
    },
    {
      type: "p",
      text: "OCRA works to bring together athletes, clubs, coaches, Technical Officials, race organisers, volunteers and the wider obstacle racing community. Our aim is to help create a strong, sustainable pathway for people to participate in, develop within and contribute to the sport.",
    },
    { type: "h2", text: "What We Do" },
    { type: "p", text: "OCRA's work includes:" },
    {
      type: "ul",
      items: [
        "Supporting the development of obstacle sport across Ireland",
        "Developing pathways for athletes from grassroots participation to international competition",
        "Supporting and developing OCR clubs and communities",
        "Providing structured education and development pathways for coaches",
        "Developing Technical Officials and supporting consistent standards at competitions",
        "Working with race organisers to strengthen the Irish event calendar and improve collaboration across the sport",
        "Supporting national championships and qualification pathways",
        "Selecting and supporting athletes representing Ireland at international competition",
        "Promoting safe, fair and inclusive participation",
        "Building relationships with national and international sporting organisations",
        "Supporting the long-term recognition and development of obstacle sport",
      ],
    },
    { type: "h2", text: "Our Community" },
    {
      type: "p",
      text: "Obstacle racing brings together people from a wide range of sporting backgrounds and ability levels.",
    },
    {
      type: "p",
      text: "Some athletes compete at elite international level. Others race recreationally, train with local clubs, volunteer at events, coach athletes, officiate competitions or simply enjoy taking on obstacles with friends.",
    },
    { type: "p", text: "OCRA exists to support that entire community." },
    {
      type: "p",
      text: "We want people to have clear ways to discover the sport, find somewhere to train, take part in events, develop their skills and, where they choose, progress into competitive, coaching, officiating or organisational roles.",
    },
    { type: "h2", text: "Building the Sport Together" },
    {
      type: "p",
      text: "The continued development of obstacle sport in Ireland depends on collaboration.",
    },
    {
      type: "p",
      text: "OCRA aims to work constructively with athletes, clubs, training facilities, race organisers, coaches, Technical Officials, volunteers and partner organisations rather than developing each part of the sport in isolation.",
    },
    {
      type: "p",
      text: "Whether you are taking part in your first obstacle race, building a local OCR community, organising an event or aiming to represent Ireland internationally, OCRA is here to help develop the pathway.",
    },
  ],
  ctas: [
    { label: "What Is OCR?", href: "/about/what-is-ocr" },
    { label: "Get Involved", href: "/get-involved" },
    { label: "Contact OCRA", href: "/about/contact" },
  ],
}
