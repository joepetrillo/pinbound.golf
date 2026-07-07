import type { Metadata } from "next";

import { FullPageMessage } from "@/components/full-page-message";

export const metadata: Metadata = {
  description: "The page you are looking for does not exist.",
  title: "404 — Pinbound",
};

const NotFound = () => (
  <FullPageMessage
    description="The page you are looking for does not exist."
    title="404"
  />
);

export default NotFound;
