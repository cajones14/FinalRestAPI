const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StateSchema = new Schema({
    //contain the state's abbreviation
    stateCode: {
        type: String,
        required: true,
        unique: true
    },
    //contains fun facts about the state
    funfacts: [String]
});

module.exports = mongoose.model('State', StateSchema);