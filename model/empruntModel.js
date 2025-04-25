import mongoose from "../config/database.js";

const Schema = mongoose.Schema;

const EmpruntSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    materiel: { type: mongoose.Schema.Types.ObjectId, ref: "Materiels", required: true },
    debutEmprunt: { type: Date, required: true },
    finEmprunt: { type: Date, required: true },
    isValid: {
      type: String,
      enum: ["En attente", "Non Validé", "Validé"],
      default: "En attente"
    },
    isRendu: { type: Boolean, default: false }
  },
  { collection: "Emprunts", timestamps: true }
);

const Emprunt = mongoose.model("Emprunts", EmpruntSchema);
export default Emprunt;
