import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
})

interface RoleFormModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    role: { id: number; name: string; description: string } | null
    onSuccess: () => void
    isViewOnly: boolean  // Add this new prop
}

export function RoleFormModal({
    isOpen,
    onOpenChange,
    role,
    onSuccess,
    isViewOnly,  // Add this new prop
}: RoleFormModalProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: role?.name || '',
            description: role?.description || '',
        },
    })

    React.useEffect(() => {
        if (role) {
            form.reset({
                name: role.name,
                description: role.description,
            });
        }
    }, [role, form]);

    console.log(role, form.getValues());

    const { handleSubmit, formState: { isSubmitting } } = useForm();

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = role ? `/api/roles/${role.id}` : '/api/roles'
            const method = role ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                throw new Error('Failed to save role')
            }

            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error('Error saving role:', error)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-full sm:max-w-[90vw]">
                <DialogHeader>
                    <DialogTitle>{isViewOnly ? 'View Role' : (role ? 'Edit Role' : 'Create Role')}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isViewOnly} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} disabled={isViewOnly} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {!isViewOnly && (
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : (role ? 'Update' : 'Create')}
                            </Button>
                        )}
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}