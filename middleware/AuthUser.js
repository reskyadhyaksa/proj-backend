import Users from "../models/UserModel.js";

export const VerifyUser = async (req, res, next) => {
    if (!req.session.userId) { return res.status(400).json({ msg: "Harap login terlebih dahulu!" }) }

    const user = await Users.findOne({
        where: {
            uuid: req.session.userId
        }
    });

    if (!user) {
        return res.status(404).json({ msg: "User tidak ditemukan!" })
    }

    req.userId = user.id;
    next();
}