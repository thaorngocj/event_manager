"use client"

import * as React from "react"
import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"

type SidebarContextType = {
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextType>({
  open: true,
  setOpen: () => {},
  openMobile: false,
  setOpenMobile: () => {},
  isMobile: false,
  toggleSidebar: () => {},
})

export function useSidebar() {
  return React.useContext(SidebarContext)
}

export function SidebarProvider({
  defaultOpen = true,
  children,
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { defaultOpen?: boolean }) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(defaultOpen)
  const [openMobile, setOpenMobile] = React.useState(false)

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((v) => !v)
    } else {
      setOpen((v) => !v)
    }
  }, [isMobile])

  return (
    <SidebarContext.Provider value={{ open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }}>
      <div
        className={cn("flex h-screen w-full overflow-hidden", className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export function Sidebar({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const { open, isMobile, openMobile, setOpenMobile } = useSidebar()

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className={cn("w-64 p-0 flex flex-col", className)}>
          {children}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col transition-all duration-300 overflow-hidden shrink-0",
        open ? "w-64" : "w-0",
        className
      )}
    >
      {children}
    </aside>
  )
}

export function SidebarTrigger({ className }: { className?: string }) {
  const { toggleSidebar } = useSidebar()
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-9 w-9 shrink-0", className)}
      onClick={toggleSidebar}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

export function SidebarInset({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-1 flex-col overflow-auto min-w-0", className)}>
      {children}
    </div>
  )
}

export function SidebarHeader({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return <div className={cn("flex shrink-0", className)}>{children}</div>
}

export function SidebarFooter({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return <div className={cn("flex shrink-0 flex-col mt-auto", className)}>{children}</div>
}

export function SidebarContent({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return <div className={cn("flex flex-1 flex-col overflow-auto", className)}>{children}</div>
}

export function SidebarGroup({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return <div className={cn("flex flex-col", className)}>{children}</div>
}

export function SidebarGroupLabel({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return <div className={cn("text-xs font-semibold", className)}>{children}</div>
}

export function SidebarGroupContent({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return <div className={cn("", className)}>{children}</div>
}

export function SidebarMenu({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return <ul className={cn("flex flex-col", className)}>{children}</ul>
}

export function SidebarMenuItem({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return <li className={cn("", className)}>{children}</li>
}

export function SidebarMenuButton({
  children,
  className,
  onClick,
}: {
  children?: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
