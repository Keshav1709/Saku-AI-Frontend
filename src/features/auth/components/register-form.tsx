"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from "sonner";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

const registerSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),

}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
type RegisterFormValues = z.infer<typeof registerSchema>;


export function RegisterForm(){
    const router = useRouter();

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    });
    const onSubmit = async (values: RegisterFormValues) => {
        try {
            await authClient.signUp.email(
                {
                    name: values.email,
                    email: values.email,
                    password: values.password,
                    callbackURL: "/onboarding",
                },
                {
                    onSuccess: () => {
                        toast.success("Account created successfully!");
                        router.push("/onboarding");
                    },
                    onError: (ctx) => {
                        toast.error(ctx.error.message);
                    },
                }
            )
        } catch (err: any) {
            // Network or unexpected error (e.g., Failed to fetch)
            console.error('Sign up failed:', err);
            toast.error(err?.message ?? 'Sign up failed. Check your network or server.');
        }
    };

    const isPending = form.formState.isSubmitting;

    return (
        <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle>
                            Get Started
                        </CardTitle>
                        <CardDescription>
                            Create your account to get started
                        </CardDescription>
                    </CardHeader>       
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="grid gap-6">    
                                    <div className="flex flex-col gap-4">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            type="button"
                                            disabled={isPending}
                                        >
                                            <Image alt="google" src="/Saku-AI-Frontend/public/logos/google.svg" width={20} height={20} className="mr-2"/>
                                            Continue with Google
                                        </Button>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="email"
                                                        placeholder="me@gmail.com"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="password"
                                                        placeholder="******"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="password"
                                                        placeholder="******"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit"
                                        className="w-full"
                                        disabled={isPending}>
                                        Sign up
                                    </Button>
                                    <div className="text-center text-sm">
                                        Already have an account?{' '}
                                        <Link href="/auth/login"
                                            className="underline underline-offset-4">
                                            Login
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};