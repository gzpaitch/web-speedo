"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"
import type * as React from "react"

import { cn } from "@/lib/utils"

function Tabs({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			className={cn("flex flex-col gap-2", className)}
			{...props}
		/>
	)
}

const tabsListVariants = cva(
	"inline-flex items-center justify-center rounded-xl p-1 text-muted-foreground",
	{
		variants: {
			variant: {
				default: "bg-muted",
				line: "gap-1 rounded-none bg-transparent p-0",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
)

function TabsList({
	className,
	variant = "default",
	...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
	VariantProps<typeof tabsListVariants>) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			data-variant={variant}
			className={cn(tabsListVariants({ variant }), className)}
			{...props}
		/>
	)
}

function TabsTrigger({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			className={cn(
				"inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap text-foreground/65 transition-all",
				"hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
				"data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:bg-input/30",
				"group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
				className
			)}
			{...props}
		/>
	)
}

function TabsContent({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			data-slot="tabs-content"
			className={cn("flex-1 text-sm outline-none", className)}
			{...props}
		/>
	)
}

export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants }
