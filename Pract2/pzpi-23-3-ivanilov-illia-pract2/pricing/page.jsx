"use client";
import { useEffect, useState } from "react";
import { getPaymentDataWithSignature } from "../../utils/payment";
import { getAllMemberships } from "../../services/api";

export default function Pricing() {
    const [memberships, setMemberships] = useState([]);

    useEffect(() => {
        getAllMemberships()
            .then((data) => setMemberships(data))
            .catch((error) =>
                console.error("Error fetching memberships:", error)
            );
    }, []);

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Membership Plans
                    </h2>
                    <p className="mt-4 text-xl text-gray-600">
                        Choose the perfect plan for your fitness journey
                    </p>
                </div>

                <div className="mt-12 grid gap-8 lg:grid-cols-2">
                    {memberships.map((membership) => {
                        const { data, signature } = getPaymentDataWithSignature(
                            `${membership.membership_price}`,
                            membership.membership_name,
                            membership.id
                        );

                        return (
                            <div
                                key={membership.id}
                                className="bg-white rounded-lg shadow-lg overflow-hidden"
                            >
                                <div className="px-6 py-8">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {membership.membership_name}
                                    </h3>
                                    <p className="mt-4 text-gray-600">
                                        {membership.membership_description}
                                    </p>
                                    <div className="mt-6">
                                        <span className="text-4xl font-extrabold text-gray-900">
                                            ${membership.membership_price}
                                        </span>
                                        <span className="text-base font-medium text-gray-500">
                                            /month
                                        </span>
                                    </div>
                                    <div className="mt-6 space-y-4">
                                        <div className="flex items-center">
                                            <span className="text-gray-600">
                                                Type:{" "}
                                                {membership.membership_type}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-gray-600">
                                                Training Sessions:{" "}
                                                {membership.count_of_training}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-gray-600">
                                                Training Type: {membership.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-8">
                                        <form
                                            method="POST"
                                            action="https://www.liqpay.ua/api/3/checkout"
                                            acceptCharset="utf-8"
                                        >
                                            <input
                                                type="hidden"
                                                name="data"
                                                value={data}
                                            />
                                            <input
                                                type="hidden"
                                                name="signature"
                                                value={signature}
                                            />
                                            <button
                                                type="submit"
                                                className="w-full bg-lime-200 py-2 px-4 rounded hover:bg-lime-300 transition duration-200 cursor-pointer"
                                            >
                                                Choose Plan
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
