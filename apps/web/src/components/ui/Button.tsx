import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
    size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'btn',
                    {
                        'btn-primary': variant === 'primary',
                        'btn-secondary': variant === 'secondary',
                        'btn-danger': variant === 'danger',
                        'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent': variant === 'ghost',
                        'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50': variant === 'outline',
                        'px-2.5 py-1.5 text-xs': size === 'sm',
                        'px-4 py-2': size === 'md',
                        'px-6 py-3 text-lg': size === 'lg',
                        'p-2': size === 'icon',
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = 'Button'

export { Button }
