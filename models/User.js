import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: [true, "El nombre de usuario es obligatorio"],
            unique: true,
            trim: true,
            maxlength: [50, "El nombre de usuario no puede superar los 50 caracteres"]
        },
        email: {
            type: String,
            required: [true, "El correo electrónico es obligatorio"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Formato de correo electrónico inválido"]
        },
        password: {
            type: String,
            required: [true, "La contraseña es obligatoria"],
            select: false
        },
        firstName: {
            type: String,
            required: [true, "El nombre es obligatorio"],
            trim: true,
            maxlength: [60, "El nombre no puede superar los 60 caracteres"]
        },
        lastName: {
            type: String,
            required: [true, "El apellido es obligatorio"],
            trim: true,
            maxlength: [60, "El apellido no puede superar los 60 caracteres"]
        },
        role: {
            type: String,
            enum: {
                values: ["admin", "usuario"],
                message: "El rol debe ser 'admin' o 'usuario'"
            },
            default: "usuario"
        }
    },
    { collection: "users", timestamps: true }
);

// Hashea la contraseña antes de guardar, sólo si cambió.
// (Mongoose 9: los hooks async no reciben `next`; se devuelve la promesa.)
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compara la contraseña enviada con la hasheada.
userSchema.methods.comparePassword = function (candidato) {
    return bcrypt.compare(candidato, this.password);
};

export default mongoose.model("User", userSchema);
