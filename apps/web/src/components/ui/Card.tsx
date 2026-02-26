import React from 'react'
import { cn } from './Button'

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('panel flex flex-col', className)} {...props} />
    )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('flex flex-col mb-4 space-y-1', className)} {...props} />
    )
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className={cn('font-semibold leading-none text-gray-900 m-0', className)} {...props} />
    )
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p className={cn('text-sm text-gray-500 m-0', className)} {...props} />
    )
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('flex-1', className)} {...props} />
    )
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('flex items-center mt-4 pt-4 border-t border-gray-100', className)} {...props} />
    )
}
