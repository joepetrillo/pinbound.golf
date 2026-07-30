import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { RiArrowDownSLine } from "@remixicon/react";

import { cn } from "@/lib/utils";

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-2xl border",
        className
      )}
      {...props}
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "transition-colors duration-150 ease-[ease] not-last:border-b motion-reduce:duration-100 data-open:bg-muted/50",
        className
      )}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-start justify-between gap-6 border border-transparent p-4 text-left text-sm font-medium outline-none hover:underline aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
        <RiArrowDownSLine
          data-slot="accordion-trigger-icon"
          className="pointer-events-none shrink-0 transition-transform duration-150 ease-[cubic-bezier(0.645,0.045,0.355,1)] group-data-panel-open/accordion-trigger:rotate-180 motion-reduce:transition-none"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="group/accordion-panel box-border h-(--accordion-panel-height) overflow-hidden text-sm transition-[height] duration-150 ease-[cubic-bezier(0.25,1,0.5,1)] data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
      {...props}
    >
      <div
        className={cn(
          "px-4 pt-0 pb-4 transition-[opacity,transform,filter] duration-150 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-[transform,opacity,filter] group-data-ending-style/accordion-panel:transform-[translateY(-2px)] group-data-ending-style/accordion-panel:opacity-0 group-data-ending-style/accordion-panel:blur-[2px] group-data-starting-style/accordion-panel:transform-[translateY(-2px)] group-data-starting-style/accordion-panel:opacity-0 group-data-starting-style/accordion-panel:blur-[2px] motion-reduce:transform-none motion-reduce:blur-none motion-reduce:transition-opacity [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
