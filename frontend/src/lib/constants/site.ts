import type { ComponentType } from "react";
import { Compass } from "@/components/animate-ui/icons/compass";
import { Settings } from "@/components/animate-ui/icons/settings";
import { Users } from "@/components/animate-ui/icons/users";
import { TrendingUp } from "@/components/animate-ui/icons/trending-up";

type IconComponent = ComponentType<{
  className?: string;
  strokeWidth?: number;
  animateOnHover?: boolean;
}>;

export const SITE = {
  name: "Novae Conseil",
  tagline: "Your transformation partner.",
};

export const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Our approach", href: "#approach" },
  { label: "About", href: "#about" }, // no About section in the design yet
] as const;

export const FOOTER_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "#request" },
] as const;

export type Service = {
  title: string;
  description: string;
  icon: IconComponent;
};

export const SERVICES: Service[] = [
  {
    title: "Organizational diagnostics",
    description:
      "Understand your current situation and identify opportunities for improvement.",
    icon: Compass,
  },
  {
    title: "Process transformation",
    description: "Optimize your processes for greater efficiency and agility.",
    icon: Settings,
  },
  {
    title: "Change management",
    description:
      "Guide your teams through change with a practical and human approach.",
    icon: Users,
  },
  {
    title: "Executive coaching",
    description:
      "Support your leaders in their development and decision-making.",
    icon: TrendingUp,
  },
];

export const APPROACH_POINTS = [
  "A hands-on team, close to your reality",
  "Solutions tailored to your challenges",
  "Measurable results, not just recommendations",
] as const;
