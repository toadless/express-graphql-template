import mongoose from "mongoose" 
// Export schema for use as child schema in an externally defined mongoose
// schema - model not required for export, since this schema is ONLY used as
// a child schema to other externally defined mongoose schemas, and is
// NOT stored in its own collection on database, and is NOT required by gql
// reducers
export default new mongoose.Schema({
    tokenJti: { type: String, required: true },
})