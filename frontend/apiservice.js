const API_BASE = "http://localhost:8000";

export const Apiservice = {
    async fetchScore() {
        try {
            const response = await fetch(`${API_BASE}/score`);
            return await response.json();
        } catch (e) {
            console.error("Error fetching score:", e);
            return null;
        }
    },

    async fetchStartNumbers() {
        try {
            const response = await fetch(`${API_BASE}/start-numbers`);
            return await response.json();
        } catch (e) {
            console.error("Error fetching numbers:", e);
            throw e;
        }
    },

    async fetchStartLetters(vowelCount = 3) {
        try {
            const response = await fetch(`${API_BASE}/start-letters?vowel_count=${vowelCount}`);
            return await response.json();
        } catch (e) {
            console.error("Error fetching letters:", e);
            throw e;
        }
    },

    async submitNumbers(data) {
        try {
            const response = await fetch(`${API_BASE}/submit-numbers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (e) {
            console.error("Error submitting numbers:", e);
            throw e;
        }
    },

    async submitLetters(data) {
        try {
            const response = await fetch(`${API_BASE}/submit-letters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (e) {
            console.error("Error submitting letters:", e);
            throw e;
        }
    }
};