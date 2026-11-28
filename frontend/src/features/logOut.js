import api from "../../utils/axios";

async function logOut() {
    try {
        await api.post("/api/auth/logout")
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

export default logOut
