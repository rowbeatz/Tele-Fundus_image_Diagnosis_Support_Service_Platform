import { forwardRef, type LabelHTMLAttributes } from 'react'
import { cn } from './Button'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> { }

const Label = forwardRef<HTMLLabelElement, LabelProps>(
    ({ className, ...props }, ref) => {
        return (
            <label
                ref={ref}
                className={cn('label', className)}
                {...props}
            />
        )
    }
)
Label.displayName = 'Label'

export { Label }
