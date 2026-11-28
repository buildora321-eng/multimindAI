import { requireSession } from "../../shared/auth/index.js"

const protect=async (req,res,next) => {
    return requireSession(req, res, () => {
        req.user = req.authSession
        return next()
    })
}

export default protect
