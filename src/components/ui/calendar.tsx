import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-2",
        caption_label: "text-sm font-bold tracking-tight text-white",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-white/5 text-white",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-[#8B92B3] rounded-md w-9 font-black text-[0.7rem] uppercase tracking-tighter",
        row: "flex w-full mt-2",
        cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-transparent [&:has([aria-selected])]:bg-white/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }), 
          "h-10 w-10 p-0 font-black aria-selected:opacity-100 text-[#E8EAF6] hover:bg-[#7C6AFA25] hover:text-[#7C6AFA] rounded-xl transition-all"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-[#7C6AFA] text-white hover:bg-[#6151E0] hover:text-white focus:bg-[#7C6AFA] focus:text-white shadow-[0_0_15px_rgba(124,106,250,0.4)]",
        day_today: "bg-white/10 text-white font-black",
        day_outside:
          "day-outside text-[#5A6080] opacity-50 aria-selected:bg-white/5 aria-selected:text-[#5A6080] aria-selected:opacity-30",
        day_disabled: "text-[#5A6080] opacity-30 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-white/5 aria-selected:text-[#E8EAF6]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
