"use client";

import { RiGlobalLine } from "@remixicon/react";
import { createContext, useContext, useMemo, type ComponentProps } from "react";
import PhoneNumberInput, {
  getCountryCallingCode,
  type Country,
  type FlagProps,
  type Value,
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

type PhoneInputSize = "sm" | "default" | "lg";

interface PhoneInputContextValue {
  variant: PhoneInputSize;
  popupClassName?: string;
}

const PhoneInputContext = createContext<PhoneInputContextValue>({
  variant: "default",
});

const FlagComponent = ({ country }: FlagProps) => {
  const Flag = flags[country];

  return (
    <span
      aria-hidden="true"
      className="flex size-4 items-center justify-center overflow-hidden rounded-[5px] [&_svg:not([class*='size-'])]:size-full!"
    >
      {Flag ? (
        <Flag title="" />
      ) : (
        <RiGlobalLine className="size-4 opacity-60" />
      )}
    </span>
  );
};

/** Borderless control; the wrapping InputGroup owns border, focus, and invalid state. */
const InputComponent = ({
  className,
  ...props
}: ComponentProps<typeof InputGroupInput>) => {
  const { variant } = useContext(PhoneInputContext);

  return (
    <InputGroupInput
      className={cn(
        variant === "sm" && "h-8",
        variant === "lg" && "h-10",
        className
      )}
      {...props}
    />
  );
};

interface CountryEntry {
  label: string;
  value: Country | undefined;
}

interface CountrySelectProps {
  disabled?: boolean;
  value: Country;
  options: CountryEntry[];
  onChange: (country: Country) => void;
}

/**
 * Searchable country picker via shadcn Combobox (Base UI).
 * Combobox is the right primitive here — Select has no search, and a
 * large static country list needs filter-as-you-type.
 */
const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
}: CountrySelectProps) => {
  const { popupClassName } = useContext(PhoneInputContext);

  const countries = countryList.flatMap((entry) =>
    entry.value ? [entry.value] : []
  );

  const labelByCountry = new Map(
    countryList.flatMap((entry) =>
      entry.value ? ([[entry.value, entry.label]] as const) : []
    )
  );

  const countryLabel = (country: Country) =>
    labelByCountry.get(country) ?? country;

  return (
    <Combobox
      itemToStringLabel={countryLabel}
      items={countries}
      onValueChange={(country: Country | null) => {
        if (country) {
          onChange(country);
        }
      }}
      value={selectedCountry || null}
    >
      <InputGroupAddon
        align="inline-start"
        className="self-stretch p-0 has-[>button]:ml-0"
      >
        <ComboboxTrigger
          aria-label={countryLabel(selectedCountry)}
          className={cn(
            "-my-px -ms-px flex h-[calc(100%+2px)] items-center justify-center gap-1 rounded-s-4xl border-e border-border/60 bg-transparent ps-3 pe-1 text-sm outline-none",
            "hover:bg-muted focus-visible:bg-muted aria-expanded:bg-muted",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
          disabled={disabled}
        >
          <FlagComponent country={selectedCountry} countryName="" />
        </ComboboxTrigger>
      </InputGroupAddon>
      <ComboboxContent
        align="start"
        className={cn(
          "w-72 min-w-72 *:data-[slot=input-group]:bg-transparent",
          popupClassName
        )}
      >
        <ComboboxInput
          placeholder="Search country"
          showTrigger={false}
          showClear={true}
        />
        <ComboboxSeparator />
        <ComboboxEmpty className="px-4 py-2.5 text-sm">
          No country found.
        </ComboboxEmpty>
        <ComboboxList className="scroll-fade overflow-y-auto overscroll-contain">
          {(country: Country) => (
            <ComboboxItem
              className="flex items-center gap-2"
              key={country}
              value={country}
            >
              <FlagComponent country={country} countryName="" />
              <span className="flex-1 text-sm text-balance">
                {countryLabel(country)}
              </span>
              <span className="text-sm text-muted-foreground tabular-nums">
                +{getCountryCallingCode(country)}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};

type PhoneInputProps = Omit<
  ComponentProps<"input">,
  "onChange" | "value" | "ref"
> &
  Omit<
    ComponentProps<typeof PhoneNumberInput>,
    "onChange" | "variant" | "popupClassName" | "scrollAreaClassName"
  > & {
    onChange?: (value: Value) => void;
    variant?: PhoneInputSize;
    popupClassName?: string;
  };

const PhoneInput = ({
  className,
  variant = "default",
  popupClassName,
  onChange,
  value,
  ...props
}: PhoneInputProps) => {
  const contextValue = useMemo(
    () => ({
      popupClassName,
      variant,
    }),
    [popupClassName, variant]
  );

  return (
    <PhoneInputContext.Provider value={contextValue}>
      <PhoneNumberInput
        className={cn(
          // One ring when either the country trigger or the number field is focused.
          // overflow-hidden clips the square country trigger to the pill.
          "overflow-hidden has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/30",
          variant === "sm" && "h-8",
          variant === "lg" && "h-10",
          className
        )}
        containerComponent={InputGroup}
        countrySelectComponent={CountrySelect}
        flagComponent={FlagComponent}
        inputComponent={InputComponent}
        onChange={(nextValue) => {
          onChange?.((nextValue ?? "") as Value);
        }}
        smartCaret={false}
        value={value || undefined}
        {...props}
      />
    </PhoneInputContext.Provider>
  );
};

export { PhoneInput };
export type { Value as PhoneInputValue };
