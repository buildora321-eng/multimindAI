const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (email) =>
    typeof email === "string" ? email.trim().toLowerCase() : "";

export const validateRegistration = ({ name, email, password, confirmPassword }) => {
    const errors = {};
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedName) errors.name = "Name is required.";
    else if (normalizedName.length < 2 || normalizedName.length > 100) {
        errors.name = "Name must be between 2 and 100 characters.";
    }

    if (!normalizedEmail) errors.email = "Email is required.";
    else if (normalizedEmail.length > 254 || !emailPattern.test(normalizedEmail)) {
        errors.email = "Enter a valid email address.";
    }

    if (typeof password !== "string" || !password) {
        errors.password = "Password is required.";
    } else if (
        password.length < 8 ||
        Buffer.byteLength(password, "utf8") > 72 ||
        !/[a-z]/.test(password) ||
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password)
    ) {
        errors.password = "Use at least 8 characters with an uppercase letter, a lowercase letter, and a number (maximum 72 bytes).";
    }

    if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
    }

    return { errors, normalizedName, normalizedEmail };
};

export const validateLogin = ({ email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !emailPattern.test(normalizedEmail) || typeof password !== "string" || !password) {
        return { valid: false, normalizedEmail };
    }
    return { valid: true, normalizedEmail };
};
