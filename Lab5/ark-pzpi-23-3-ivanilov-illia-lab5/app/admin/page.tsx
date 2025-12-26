"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

interface User {
    user_id: number;
    email: string;
    password: string;
    role: string | null;
    status: string | null;
}

interface UserProfile {
    profile_id: number;
    user_id: number;
    weight: number | null;
    activity_level: string | null;
    goal_type: string | null;
    date_of_birth: string | null;
}

interface DailyPlan {
    dailyplan_id: number;
    user_id: number;
    date: string;
    target: number | null;
    total_intake_ml: number | null;
    deviation_ml: number | null;
    amount_of_intakes: number | null;
}

interface Intake {
    intake_id: number;
    dailyplan_id: number;
    volume_ml: number | null;
    intake_time: string | null;
}

type TabType = "users" | "profiles" | "daily-plans" | "intakes" | "statistics";

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<TabType>("users");
    const [users, setUsers] = useState<User[]>([]);
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
    const [intakes, setIntakes] = useState<Intake[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    
    const [waterStats, setWaterStats] = useState<any>(null);
    const [activityStats, setActivityStats] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsFilters, setStatsFilters] = useState({
        user_id: "",
        from_date: "",
        to_date: "",
        group_by: "day" as "day" | "user" | "activity_level",
    });

    useEffect(() => {
        if (activeTab === "statistics") {
            loadStatistics();
        } else {
            loadData();
        }
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            switch (activeTab) {
                case "users":
                    const usersRes = await fetch("/api/users");
                    const usersData = await usersRes.json();
                    if (usersData.ok) {
                        setUsers(usersData.data);
                    }
                    break;
                case "profiles":
                    const profilesRes = await fetch("/api/profiles");
                    const profilesData = await profilesRes.json();
                    if (profilesData.ok) {
                        setProfiles(profilesData.data);
                    }
                    break;
                case "daily-plans":
                    const plansRes = await fetch("/api/daily-plans");
                    const plansData = await plansRes.json();
                    if (plansData.ok) {
                        setDailyPlans(plansData.data);
                    }
                    break;
                case "intakes":
                    const intakesRes = await fetch("/api/intakes");
                    const intakesData = await intakesRes.json();
                    if (intakesData.ok) {
                        setIntakes(intakesData.data);
                    }
                    break;
            }
        } catch (err: any) {
            setError(err.message || "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item[Object.keys(item)[0]]);
        setEditForm({ ...item });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            let endpoint = "";
            let id = 0;
            let payload = { ...editForm };

            switch (activeTab) {
                case "users":
                    endpoint = `/api/users/${editingId}`;
                    id = editForm.user_id;
                    if (!payload.password || payload.password.trim() === "") {
                        delete payload.password;
                    }
                    break;
                case "profiles":
                    endpoint = `/api/profiles/${editingId}`;
                    id = editForm.profile_id;
                    break;
                case "daily-plans":
                    endpoint = `/api/daily-plans/${editingId}`;
                    id = editForm.dailyplan_id;
                    break;
                case "intakes":
                    endpoint = `/api/intakes/${editingId}`;
                    id = editForm.intake_id;
                    break;
            }

            const res = await fetch(endpoint, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.ok) {
                setEditingId(null);
                setEditForm({});
                await loadData();
            } else {
                setError(data.error?.message || "Failed to update");
            }
        } catch (err: any) {
            setError(err.message || "Failed to save");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this item?")) {
            return;
        }

        setLoading(true);
        setError(null);
        try {
            let endpoint = "";
            switch (activeTab) {
                case "users":
                    endpoint = `/api/users/${id}`;
                    break;
                case "profiles":
                    endpoint = `/api/profiles/${id}`;
                    break;
                case "daily-plans":
                    endpoint = `/api/daily-plans/${id}`;
                    break;
                case "intakes":
                    endpoint = `/api/intakes/${id}`;
                    break;
            }

            const res = await fetch(endpoint, {
                method: "DELETE",
            });

            if (res.ok || res.status === 204) {
                await loadData();
            } else {
                const data = await res.json();
                setError(data.error?.message || "Failed to delete");
            }
        } catch (err: any) {
            setError(err.message || "Failed to delete");
        } finally {
            setLoading(false);
        }
    };

    const renderUsersTable = () => {
        if (loading && users.length === 0) {
            return <div className={styles.loading}>Loading...</div>;
        }

        return (
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Password</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.user_id}>
                            {editingId === user.user_id ? (
                                <>
                                    <td>{user.user_id}</td>
                                    <td>
                                        <input
                                            type="email"
                                            value={editForm.email || ""}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    email: e.target.value,
                                                })
                                            }
                                            className={styles.input}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="password"
                                            value={editForm.password || ""}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    password: e.target.value,
                                                })
                                            }
                                            className={styles.input}
                                            placeholder="Leave empty to keep"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={editForm.role || ""}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    role: e.target.value,
                                                })
                                            }
                                            className={styles.input}
                                            placeholder="admin, user, etc."
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            value={editForm.status || ""}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    status: e.target.value,
                                                })
                                            }
                                            className={styles.input}
                                            placeholder="active, inactive, etc."
                                        />
                                    </td>
                                    <td>
                                        <button
                                            onClick={handleSave}
                                            className={styles.btnSave}
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className={styles.btnCancel}
                                        >
                                            Cancel
                                        </button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{user.user_id}</td>
                                    <td>{user.email}</td>
                                    <td>{"*".repeat(8)}</td>
                                    <td>{user.role || "-"}</td>
                                    <td>{user.status || "-"}</td>
                                    <td>
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className={styles.btnEdit}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(user.user_id)
                                            }
                                            className={styles.btnDelete}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderProfilesTable = () => {
        if (loading && profiles.length === 0) {
            return <div className={styles.loading}>Loading...</div>;
        }

        return (
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User ID</th>
                        <th>Weight</th>
                        <th>Activity Level</th>
                        <th>Goal Type</th>
                        <th>Date of Birth</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {profiles.map((profile) => (
                        <tr key={profile.profile_id}>
                            {editingId === profile.profile_id ? (
                                <>
                                    <td>{profile.profile_id}</td>
                                    <td>
                                        <input
                                            type="number"
                                            value={editForm.user_id || ""}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    user_id: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className={styles.input}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={editForm.weight || ""}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    weight: parseFloat(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className={styles.input}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            value={editForm.activity_level || ""}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    activity_level:
                                                        e.target.value,
                                                })
                                            }
                                            className={styles.select}
                                        >
                                            <option value="">-</option>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            value={editForm.goal_type || ""}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    goal_type: e.target.value,
                                                })
                                            }
                                            className={styles.select}
                                        >
                                            <option value="">-</option>
                                            <option value="lose_weight">
                                                Lose Weight
                                            </option>
                                            <option value="maintain">
                                                Maintain
                                            </option>
                                            <option value="gain_muscle">
                                                Gain Muscle
                                            </option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="date"
                                            value={
                                                editForm.date_of_birth
                                                    ? typeof editForm.date_of_birth === 'string'
                                                        ? editForm.date_of_birth.split("T")[0]
                                                        : new Date(editForm.date_of_birth).toISOString().split("T")[0]
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    date_of_birth:
                                                        e.target.value ? new Date(e.target.value).toISOString() : null,
                                                })
                                            }
                                            className={styles.input}
                                        />
                                    </td>
                                    <td>
                                        <button
                                            onClick={handleSave}
                                            className={styles.btnSave}
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className={styles.btnCancel}
                                        >
                                            Cancel
                                        </button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{profile.profile_id}</td>
                                    <td>{profile.user_id}</td>
                                    <td>{profile.weight || "-"}</td>
                                    <td>{profile.activity_level || "-"}</td>
                                    <td>{profile.goal_type || "-"}</td>
                                    <td>
                                        {profile.date_of_birth
                                            ? new Date(
                                                  profile.date_of_birth
                                              ).toLocaleDateString()
                                            : "-"}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleEdit(profile)}
                                            className={styles.btnEdit}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    profile.profile_id
                                                )
                                            }
                                            className={styles.btnDelete}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderDailyPlansTable = () => {
        if (loading && dailyPlans.length === 0) {
            return <div className={styles.loading}>Loading...</div>;
        }

        return (
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User ID</th>
                        <th>Date</th>
                        <th>Target</th>
                        <th>Total Intake</th>
                        <th>Deviation</th>
                        <th>Amount of Intakes</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {dailyPlans.map((plan) => (
                        <tr key={plan.dailyplan_id}>
                            {editingId === plan.dailyplan_id ? (
                                <>
                                    <td>{plan.dailyplan_id}</td>
                                    <td>
                                        <input
                                            type="number"
                                            value={editForm.user_id || ""}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    user_id: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className={styles.input}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="date"
                                            value={
                                                editForm.date
                                                    ? typeof editForm.date === 'string'
                                                        ? editForm.date.split("T")[0]
                                                        : new Date(editForm.date).toISOString().split("T")[0]
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    date: e.target.value ? new Date(e.target.value).toISOString() : null,
                                                })
                                            }
                                            className={styles.input}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editForm.target || ""}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    target: parseFloat(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className={styles.input}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={
                                                editForm.total_intake_ml || ""
                                            }
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    total_intake_ml: parseFloat(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className={styles.input}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editForm.deviation_ml || ""}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    deviation_ml: parseFloat(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className={styles.input}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            value={
                                                editForm.amount_of_intakes || ""
                                            }
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    amount_of_intakes: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className={styles.input}
                                        />
                                    </td>
                                    <td>
                                        <button
                                            onClick={handleSave}
                                            className={styles.btnSave}
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className={styles.btnCancel}
                                        >
                                            Cancel
                                        </button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{plan.dailyplan_id}</td>
                                    <td>{plan.user_id}</td>
                                    <td>
                                        {new Date(plan.date).toLocaleDateString()}
                                    </td>
                                    <td>{plan.target || "-"}</td>
                                    <td>{plan.total_intake_ml || "-"}</td>
                                    <td>{plan.deviation_ml || "-"}</td>
                                    <td>{plan.amount_of_intakes || "-"}</td>
                                    <td>
                                        <button
                                            onClick={() => handleEdit(plan)}
                                            className={styles.btnEdit}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    plan.dailyplan_id
                                                )
                                            }
                                            className={styles.btnDelete}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderIntakesTable = () => {
        if (loading && intakes.length === 0) {
            return <div className={styles.loading}>Loading...</div>;
        }

        return (
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Daily Plan ID</th>
                        <th>Volume (ml)</th>
                        <th>Intake Time</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {intakes.map((intake) => (
                        <tr key={intake.intake_id}>
                            {editingId === intake.intake_id ? (
                                <>
                                    <td>{intake.intake_id}</td>
                                    <td>
                                        <input
                                            type="number"
                                            value={editForm.dailyplan_id || ""}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    dailyplan_id: parseInt(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className={styles.input}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editForm.volume_ml || ""}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    volume_ml: parseFloat(
                                                        e.target.value
                                                    ),
                                                })
                                            }
                                            className={styles.input}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="datetime-local"
                                            value={
                                                editForm.intake_time
                                                    ? typeof editForm.intake_time === 'string'
                                                        ? editForm.intake_time.slice(0, 16)
                                                        : new Date(editForm.intake_time).toISOString().slice(0, 16)
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    intake_time: e.target.value ? new Date(e.target.value).toISOString() : null,
                                                })
                                            }
                                            className={styles.input}
                                        />
                                    </td>
                                    <td>
                                        <button
                                            onClick={handleSave}
                                            className={styles.btnSave}
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className={styles.btnCancel}
                                        >
                                            Cancel
                                        </button>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td>{intake.intake_id}</td>
                                    <td>{intake.dailyplan_id}</td>
                                    <td>{intake.volume_ml || "-"}</td>
                                    <td>
                                        {intake.intake_time
                                            ? new Date(
                                                  intake.intake_time
                                              ).toLocaleString()
                                            : "-"}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleEdit(intake)}
                                            className={styles.btnEdit}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(intake.intake_id)
                                            }
                                            className={styles.btnDelete}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const loadStatistics = async () => {
        setStatsLoading(true);
        setError(null);
        try {
            const waterParams = new URLSearchParams();
            if (statsFilters.user_id) {
                waterParams.append("user_id", statsFilters.user_id);
            }
            if (statsFilters.from_date) {
                waterParams.append("from_date", statsFilters.from_date);
            }
            if (statsFilters.to_date) {
                waterParams.append("to_date", statsFilters.to_date);
            }
            if (statsFilters.group_by) {
                waterParams.append("group_by", statsFilters.group_by);
            }

            const activityParams = new URLSearchParams();
            if (statsFilters.user_id) {
                activityParams.append("user_id", statsFilters.user_id);
            }
            if (statsFilters.from_date) {
                activityParams.append("from_date", statsFilters.from_date);
            }
            if (statsFilters.to_date) {
                activityParams.append("to_date", statsFilters.to_date);
            }

            const [waterRes, activityRes] = await Promise.all([
                fetch(`/api/statistics/water-consumption?${waterParams.toString()}`),
                fetch(`/api/statistics/activities?${activityParams.toString()}`),
            ]);

            const waterData = await waterRes.json();
            const activityData = await activityRes.json();

            if (waterData.ok) {
                setWaterStats(waterData.data);
            }
            if (activityData.ok) {
                setActivityStats(activityData.data);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load statistics");
        } finally {
            setStatsLoading(false);
        }
    };

    const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) {
            return "";
        }
        const str = String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const exportToCSV = () => {
        if (!waterStats && !activityStats) {
            return;
        }

        const lines: string[] = [];
        
        lines.push("Statistics Export");
        lines.push(`Generated: ${new Date().toLocaleString()}`);
        lines.push("");
        
        if (statsFilters.user_id) {
            lines.push(`User ID: ${statsFilters.user_id}`);
        }
        if (statsFilters.from_date) {
            lines.push(`From Date: ${statsFilters.from_date}`);
        }
        if (statsFilters.to_date) {
            lines.push(`To Date: ${statsFilters.to_date}`);
        }
        lines.push(`Group By: ${statsFilters.group_by}`);
        lines.push("");
        lines.push("");

        if (waterStats) {
            lines.push("=== WATER CONSUMPTION STATISTICS ===");
            lines.push("");
            lines.push("Summary Metrics");
            lines.push("Metric,Value");
            lines.push(`Average Target (ml),${escapeCSV(waterStats.average_target || 0)}`);
            lines.push(`Average Intake (ml),${escapeCSV(waterStats.average_intake || 0)}`);
            lines.push(`Average per Portion (ml),${escapeCSV(waterStats.average_intake_per_portion || 0)}`);
            lines.push(`Completion Percentage,${escapeCSV(waterStats.completion_percentage?.toFixed(2) || 0)}%`);
            lines.push("");
            lines.push("");

            if (waterStats.breakdown && waterStats.breakdown.length > 0) {
                lines.push(`Breakdown by ${statsFilters.group_by}`);
                lines.push("Group,Average Target (ml),Average Intake (ml),Completion Percentage,Count");
                waterStats.breakdown.forEach((item: any) => {
                    lines.push(
                        `${escapeCSV(item.group)},${escapeCSV(item.average_target || 0)},${escapeCSV(item.average_intake || 0)},${escapeCSV(item.completion_percentage?.toFixed(2) || 0)}%,${escapeCSV(item.count || 0)}`
                    );
                });
                lines.push("");
                lines.push("");
            }
        }

        if (activityStats) {
            lines.push("=== ACTIVITY STATISTICS ===");
            lines.push("");
            lines.push("Summary Metrics");
            lines.push("Metric,Value");
            lines.push(`Average Activities per User,${escapeCSV(activityStats.average_activities_per_user?.toFixed(2) || 0)}`);
            lines.push(`Average Water Bonus (ml),${escapeCSV(activityStats.average_water_bonus || 0)}`);
            lines.push("");
            lines.push("");

            if (activityStats.popular_activity_types && activityStats.popular_activity_types.length > 0) {
                lines.push("Popular Activity Types");
                lines.push("Activity Type,Count,Percentage");
                activityStats.popular_activity_types.forEach((item: any) => {
                    lines.push(
                        `${escapeCSV(item.activity_type || "unknown")},${escapeCSV(item.count || 0)},${escapeCSV(item.percentage?.toFixed(2) || 0)}%`
                    );
                });
            }
        }

        const csvContent = lines.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        const dateStr = new Date().toISOString().split("T")[0];
        const filename = `statistics_${dateStr}_${Date.now()}.csv`;
        
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderStatistics = () => {
        if (statsLoading && !waterStats && !activityStats) {
            return <div className={styles.loading}>Loading statistics...</div>;
        }

        return (
            <div className={styles.statsContainer}>
                <div className={styles.statsFilters}>
                    <h3>Filters</h3>
                    <div className={styles.filterRow}>
                        <label>
                            User ID:
                            <input
                                type="number"
                                value={statsFilters.user_id}
                                onChange={(e) =>
                                    setStatsFilters({
                                        ...statsFilters,
                                        user_id: e.target.value,
                                    })
                                }
                                className={styles.input}
                                placeholder="Leave empty for all"
                            />
                        </label>
                        <label>
                            From Date:
                            <input
                                type="date"
                                value={statsFilters.from_date}
                                onChange={(e) =>
                                    setStatsFilters({
                                        ...statsFilters,
                                        from_date: e.target.value,
                                    })
                                }
                                className={styles.input}
                            />
                        </label>
                        <label>
                            To Date:
                            <input
                                type="date"
                                value={statsFilters.to_date}
                                onChange={(e) =>
                                    setStatsFilters({
                                        ...statsFilters,
                                        to_date: e.target.value,
                                    })
                                }
                                className={styles.input}
                            />
                        </label>
                        <label>
                            Group By:
                            <select
                                value={statsFilters.group_by}
                                onChange={(e) =>
                                    setStatsFilters({
                                        ...statsFilters,
                                        group_by: e.target.value as "day" | "user" | "activity_level",
                                    })
                                }
                                className={styles.select}
                            >
                                <option value="day">Day</option>
                                <option value="user">User</option>
                                <option value="activity_level">Activity Level</option>
                            </select>
                        </label>
                        <button
                            onClick={loadStatistics}
                            className={styles.btnRefresh}
                        >
                            Refresh
                        </button>
                        <button
                            onClick={exportToCSV}
                            className={styles.btnExport}
                            disabled={!waterStats && !activityStats}
                        >
                            Export to CSV
                        </button>
                    </div>
                </div>

                <div className={styles.statsSection}>
                    <h2 className={styles.statsTitle}>Water Consumption Statistics</h2>
                    {waterStats && (
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Average Target</div>
                                <div className={styles.statValue}>
                                    {waterStats.average_target?.toLocaleString() || 0} ml
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Average Intake</div>
                                <div className={styles.statValue}>
                                    {waterStats.average_intake?.toLocaleString() || 0} ml
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Average per Portion</div>
                                <div className={styles.statValue}>
                                    {waterStats.average_intake_per_portion?.toLocaleString() || 0} ml
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Completion %</div>
                                <div className={styles.statValue}>
                                    {waterStats.completion_percentage?.toFixed(2) || 0}%
                                </div>
                            </div>
                        </div>
                    )}

                    {waterStats?.breakdown && waterStats.breakdown.length > 0 && (
                        <div className={styles.breakdownSection}>
                            <h3>Breakdown by {statsFilters.group_by}</h3>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Group</th>
                                        <th>Avg Target (ml)</th>
                                        <th>Avg Intake (ml)</th>
                                        <th>Completion %</th>
                                        <th>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {waterStats.breakdown.map((item: any, index: number) => (
                                        <tr key={index}>
                                            <td>{item.group}</td>
                                            <td>
                                                {item.average_target?.toLocaleString() || 0}
                                            </td>
                                            <td>
                                                {item.average_intake?.toLocaleString() || 0}
                                            </td>
                                            <td>
                                                {item.completion_percentage?.toFixed(2) || 0}%
                                            </td>
                                            <td>{item.count || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className={styles.statsSection}>
                    <h2 className={styles.statsTitle}>Activity Statistics</h2>
                    {activityStats && (
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>
                                    Avg Activities per User
                                </div>
                                <div className={styles.statValue}>
                                    {activityStats.average_activities_per_user?.toFixed(2) || 0}
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statLabel}>Average Water Bonus</div>
                                <div className={styles.statValue}>
                                    {activityStats.average_water_bonus?.toLocaleString() || 0} ml
                                </div>
                            </div>
                        </div>
                    )}

                    {activityStats?.popular_activity_types &&
                        activityStats.popular_activity_types.length > 0 && (
                            <div className={styles.breakdownSection}>
                                <h3>Popular Activity Types</h3>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Activity Type</th>
                                            <th>Count</th>
                                            <th>Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activityStats.popular_activity_types.map(
                                            (item: any, index: number) => (
                                                <tr key={index}>
                                                    <td>{item.activity_type || "unknown"}</td>
                                                    <td>{item.count || 0}</td>
                                                    <td>
                                                        {item.percentage?.toFixed(2) || 0}%
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Admin Panel</h1>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${
                        activeTab === "users" ? styles.tabActive : ""
                    }`}
                    onClick={() => setActiveTab("users")}
                >
                    Users
                </button>
                <button
                    className={`${styles.tab} ${
                        activeTab === "profiles" ? styles.tabActive : ""
                    }`}
                    onClick={() => setActiveTab("profiles")}
                >
                    User Profiles
                </button>
                <button
                    className={`${styles.tab} ${
                        activeTab === "daily-plans" ? styles.tabActive : ""
                    }`}
                    onClick={() => setActiveTab("daily-plans")}
                >
                    Daily Plans
                </button>
                <button
                    className={`${styles.tab} ${
                        activeTab === "intakes" ? styles.tabActive : ""
                    }`}
                    onClick={() => setActiveTab("intakes")}
                >
                    Intakes
                </button>
                <button
                    className={`${styles.tab} ${
                        activeTab === "statistics" ? styles.tabActive : ""
                    }`}
                    onClick={() => setActiveTab("statistics")}
                >
                    Statistics
                </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.tableContainer}>
                {activeTab === "users" && renderUsersTable()}
                {activeTab === "profiles" && renderProfilesTable()}
                {activeTab === "daily-plans" && renderDailyPlansTable()}
                {activeTab === "intakes" && renderIntakesTable()}
                {activeTab === "statistics" && renderStatistics()}
            </div>
        </div>
    );
}

