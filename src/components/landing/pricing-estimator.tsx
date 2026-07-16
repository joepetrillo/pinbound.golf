"use client";

import NumberFlow from "@number-flow/react";
import type { Format } from "@number-flow/react";
import { useState } from "react";

import { Slider } from "@/components/ui/slider";

const MIN_MONTHLY_CALLS = 300;
const MAX_MONTHLY_CALLS = 3000;
const MONTHLY_CALL_STEP = 300;
const DEFAULT_MONTHLY_CALLS = 1200;
const MIN_ESTIMATED_PRICE = 299;
const PRICE_PER_STEP = 100;
const PRICE_FORMAT: Format = {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
};

const numberFormatter = new Intl.NumberFormat("en-US");

const getEstimatedPrice = (monthlyCalls: number): number =>
  MIN_ESTIMATED_PRICE +
  ((monthlyCalls - MIN_MONTHLY_CALLS) / MONTHLY_CALL_STEP) * PRICE_PER_STEP;

export const PricingEstimator = () => {
  const [monthlyCalls, setMonthlyCalls] = useState(DEFAULT_MONTHLY_CALLS);
  const estimatedPrice = getEstimatedPrice(monthlyCalls);

  const handleVolumeChange = (value: number | readonly number[]) => {
    const nextMonthlyCalls = typeof value === "number" ? value : value[0];

    if (nextMonthlyCalls !== undefined) {
      setMonthlyCalls(nextMonthlyCalls);
    }
  };

  return (
    <div className="flex h-full flex-col p-8 md:p-10">
      <p className="text-sm font-medium text-muted-foreground">
        Estimated monthly price after your pilot
      </p>
      <output
        aria-atomic="true"
        aria-live="polite"
        className="mt-3 flex items-baseline gap-2"
      >
        <NumberFlow
          className="inline-block min-w-[5ch] text-5xl font-medium tracking-tight tabular-nums md:text-6xl"
          format={PRICE_FORMAT}
          locales="en-US"
          value={estimatedPrice}
        />
        <span className="text-muted-foreground">/ month</span>
      </output>
      <p className="mt-4 max-w-prose text-balance text-muted-foreground">
        One workspace subscription with pooled usage, every launch capability,
        clear reporting, and threshold alerts.
      </p>

      <div className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <label className="text-sm font-medium" htmlFor="monthly-call-volume">
            Average calls per month
          </label>
          <span className="text-xl font-medium tabular-nums">
            {numberFormatter.format(monthlyCalls)}
          </span>
        </div>
        <Slider
          className="mt-5"
          format={{ maximumFractionDigits: 0 }}
          id="monthly-call-volume"
          max={MAX_MONTHLY_CALLS}
          min={MIN_MONTHLY_CALLS}
          onValueChange={handleVolumeChange}
          step={MONTHLY_CALL_STEP}
          value={[monthlyCalls]}
        />
        <div className="mt-3 flex justify-between gap-4 text-xs text-muted-foreground tabular-nums">
          <span>{numberFormatter.format(MIN_MONTHLY_CALLS)}</span>
          <span>{numberFormatter.format(MAX_MONTHLY_CALLS)}+</span>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-pretty text-muted-foreground">
          This planning estimate assumes one course and an average 90-second
          call; your pilot usage confirms the right allowance before billing
          begins.
        </p>
      </div>
    </div>
  );
};
