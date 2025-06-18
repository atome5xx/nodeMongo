import mongoose from "../config/database.js";

const Schema = mongoose.Schema;

// Schema pour compteur auto-incrément (simple exemple)
const CounterSchema = new Schema({
  _id: { type: String, required: true }, // Nom de la collection
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);


const EmpruntSchema = new Schema(
  {
    id: { type: Number, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    materiel: { type: mongoose.Schema.Types.ObjectId, ref: "Materiels", required: true },
    debutEmprunt: { type: Date, required: true },
    finEmprunt: { type: Date, required: true },
    isValid: {
      type: String,
      enum: ["En attente", "Non Validé", "Validé"],
      default: "En attente"
    },
    isRendu: {
      type: String,
      enum: ["En attente", "Non Rendu", "Rendu"],
      default: "Non Rendu"
    },
    isRappelEnvoye: { type: Boolean, default: false }  // <-- ajouté ici
  },
  { collection: "Emprunts", timestamps: true }
);

// Middleware pre-save pour auto-incrementer le champ id
EmpruntSchema.pre('save', async function(next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'empruntId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.id = counter.seq;
  }
  next();
});

const Emprunt = mongoose.model("Emprunts", EmpruntSchema);
export default Emprunt;
