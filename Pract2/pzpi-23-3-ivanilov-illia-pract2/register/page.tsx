"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { checkUserExists, createUser } from "../../services/api";

export default function RegisterPage() {
    const [form, setForm] = useState({ firstname: "", lastname: "", birthday: "", email: "", password: "" });
    const router = useRouter();

    async function handleRegister(e) {
        e.preventDefault();

        if (await checkUserExists(form.email)) {
            alert("User already exists");
            return;
        }

        await createUser(form);

        await signIn("credentials", {
            redirect: true,
            email: form.email,
            password: form.password,
            callbackUrl: "/profile",
        });
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <h1 className="text-3xl font-bold mb-8">Create an account</h1>
            <form
                onSubmit={handleRegister}
                className="space-y-4 max-w-md w-full mx-auto"
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        placeholder="blablabla@gmail.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full border p-2 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Firstname</label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={form.firstname}
                        onChange={(e) => setForm({ ...form, firstname: e.target.value })}
                        className="w-full border p-2 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Lastname</label>
                    <input
                        type="text"
                        placeholder="Enter your lastname"
                        value={form.lastname}
                        onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                        className="w-full border p-2 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Birthday</label>
                    <input
                        type="date" 
                        placeholder="Enter your birthday"
                        value={form.birthday}
                        onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                        className="w-full border p-2 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full border p-2 rounded-md"
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-lime-400 text-black px-4 py-2 rounded-md font-bold">
                    Create account
                </button>
                <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: "/profile" })}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded-md font-bold flex items-center justify-center space-x-2"
                >
                    <span>Continue with Google</span>
                </button>
                <div className="text-center text-sm mt-4">
                    Already Have An Account? <Link href="/login" className="underline">Log In</Link>
                </div>
            </form>
        </div>
    );
}
