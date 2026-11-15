// Central place for temple details – edit these to rebrand the whole site.
export const SITE = {
  name: "Shanti Dham Temple",
  short: "Shanti Dham",
  tagline: "Offerings, poojas and receipts in one place",
  address: "Temple Road, Haridwar, Uttarakhand 249401",
  phone: "+91 97703 07887",
  email: "yuvikapatel314@gmail.com",
  hours: "Open daily, 5:30 AM to 8:30 PM",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};
export const NAV = [
  { href: "/", label: "Home" },
  { href: "/donate", label: "Donate" },
  { href: "/booking", label: "Book a pooja" },
  { href: "/receipt", label: "Find receipt" },
];
