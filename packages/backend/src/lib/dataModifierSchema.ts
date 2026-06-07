export const dataModifierSchema = {
  CreatedAt: { type: Date, required: true, default: Date.now },
  ModifiedAt: { type: Date, required: false },
  ModifiedBy: { type: String, required: false },
  CreatedBy: { type: String, required: false },
};
