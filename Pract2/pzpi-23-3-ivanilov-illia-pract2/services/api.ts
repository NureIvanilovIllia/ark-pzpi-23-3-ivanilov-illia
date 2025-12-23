
const API_BASE_URL = "https://db-zkzn.onrender.com";

export interface User {
    id: string;
    email: string;
    name?: string;
    firstname?: string;
    lastname?: string;
    birthday?: string;
    password?: string;
    provider?: string;
}

export interface Training {
    id: number;
    fitness_room_name: string;
    capacity: number;
    date_of_day: string;
    start_time: string;
    end_time: string;
    user_id: string[];
}
export async function getUserByEmail(email: string): Promise<User | null> {
    try {
        const res = await fetch(`${API_BASE_URL}/usersI?email=${email}`, {
            cache: "no-store",
        });
        const users: User[] = await res.json();
        return users[0] || null;
    } catch (error) {
        console.error( error);
        return null;
    }
}

export async function checkUserExists(email: string): Promise<boolean> {
    const user = await getUserByEmail(email);
    return user !== null;
}


export async function createUser(userData: Partial<User>): Promise<Response> {
    return fetch(`${API_BASE_URL}/usersI`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });
}


export async function getAllTrainings(): Promise<Training[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/trainingsI`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching trainings:", error);
        return [];
    }
}


export async function updateTraining(
    trainingId: number,
    trainingData: Partial<Training>
): Promise<Response> {
    return fetch(`${API_BASE_URL}/trainingsI/${trainingId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(trainingData),
    });
}


export async function createTraining(trainingData: Partial<Training>): Promise<Response> {
    return fetch(`${API_BASE_URL}/trainingsI`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(trainingData),
    });
}


export async function getAllMemberships(): Promise<any[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/membershipsI`);
        return await res.json();
    } catch (error) {
        console.error("Error fetching memberships:", error);
        return [];
    }
}

