import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

interface IAdmin {
  name: string;
  email: string;
  password: string;
}

const adminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

const Admin = mongoose.model<IAdmin>("Admin", adminSchema);

export default Admin;