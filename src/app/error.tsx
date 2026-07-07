"use client";

import { FullPageMessage } from "@/components/full-page-message";

const ErrorPage = () => (
  <FullPageMessage
    description="An unexpected error occurred. Please try again."
    title="Something went wrong"
  />
);

export default ErrorPage;
