import { createUser, findUserByEmail, findUserByEmailByPassword } from "../dao/user.dao.js"
import { ConflictError } from "../utils/errorHandler.js"
import {signToken} from "../utils/helper.js"
import bcrypt from "bcryptjs"

export const registerUser = async (name, email, password) => {
    const user = await findUserByEmail(email)
    if(user) throw new ConflictError("User already exists")
    const hashed = await bcrypt.hash(password, 10)
    const newUser = await createUser(name, email, hashed)
    const token = await signToken({id: newUser.id})
    return {token,user:newUser}
}

export const loginUser = async (email, password) => {
    const user = await findUserByEmailByPassword(email)
    if(!user) throw new Error("Invalid email or password")

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if(!isPasswordValid) throw new Error("Invalid email or password")
    const token = signToken({id: user.id})
    // strip password before returning
    const { password: _pw, ...rest } = user
    return {token,user:rest}
}
