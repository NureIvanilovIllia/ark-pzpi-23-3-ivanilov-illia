import { authConfig } from "../../../configs/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserByEmail } from "../../services/api";

export default async function Profile() {
    const session = await getServerSession(authConfig);

    if (!session) {
        redirect("/register");
    }

    const userData = await getUserByEmail(session.user.email);
    if (!userData) {
        redirect("/register");
    }
    return (
        <div className="container mx-auto p-4 flex">
            <div className="w-64 mr-8">
                <div className="bg-white shadow rounded-lg p-6 text-center">
                    <div className="mx-auto rounded-full bg-gray-200 h-24 w-24 flex items-center justify-center text-gray-600 text-sm mb-4">
                        your photo
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        {userData.firstname} | {userData.lastname}
                    </h2>
                    <p className="text-sm text-gray-500">
                        Active until april 2026
                    </p>
                </div>

                {/* Menu */}
                <div className="mt-6 space-y-4">
                    <Link
                        href="#"
                        className="block w-full text-left py-3 px-4 rounded-md bg-lime-200 hover:bg-lime-300 transition-colors"
                    >
                        Overview
                    </Link>
                    <Link
                        href="/calendar"
                        className="block w-full text-left py-3 px-4 rounded-md bg-lime-200 hover:bg-lime-300 transition-colors"
                    >
                        Book a training
                    </Link>
                    <Link
                        href="/app-release.apk" download={true}
                        className="block w-full text-left py-3 px-4 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
                    >
                        Download Apk
                    </Link>
                </div>
            </div>

            <div className="flex-1">
                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-4">
                        Profile Information
                    </h1>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600">First Name</p>
                            <p className="font-semibold">
                                {userData.firstname}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600">Last Name</p>
                            <p className="font-semibold">{userData.lastname}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Email</p>
                            <p className="font-semibold">{userData.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Birthday</p>
                            <p className="font-semibold">{userData.birthday}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
