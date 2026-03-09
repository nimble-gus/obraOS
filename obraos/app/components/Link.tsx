"use client";

import NextLink, { LinkProps } from "next/link";
import { ReactNode } from "react";

/** Wrapper para Next.js Link compatible con MUI component={Link} */
export default function Link(props: LinkProps & { children?: ReactNode }) {
  return <NextLink {...props} />;
}
