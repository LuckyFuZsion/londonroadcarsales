import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PaginationControlsProps = {
  currentPage: number
  totalPages: number
  /** Build the href for a given page number (e.g. `/?page=2#latest`). */
  hrefForPage: (page: number) => string
  className?: string
}

export function PaginationControls({
  currentPage,
  totalPages,
  hrefForPage,
  className,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null

  const prevPage = currentPage - 1
  const nextPage = currentPage + 1

  return (
    <nav
      aria-label="Pagination"
      className={cn("grid grid-cols-[1fr_auto_1fr] items-center gap-2", className)}
    >
      {currentPage > 1 ? (
        <Link
          href={hrefForPage(prevPage)}
          className={cn(buttonVariants({ variant: "outline" }), "h-11 justify-self-start")}
          rel="prev"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <span className="h-11" aria-hidden="true" />
      )}

      <p className="px-2 text-center text-sm text-muted-foreground" aria-live="polite">
        Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
        <span className="font-medium text-foreground">{totalPages}</span>
      </p>

      {currentPage < totalPages ? (
        <Link
          href={hrefForPage(nextPage)}
          className={cn(buttonVariants({ variant: "outline" }), "h-11 justify-self-end")}
          rel="next"
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className="h-11" aria-hidden="true" />
      )}
    </nav>
  )
}
