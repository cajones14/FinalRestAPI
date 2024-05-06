//Get states data from the statesData.json JSON file
const data = {
    states: require('../model/statesData.json'),
    setStates: function (data) { this.states = data }
}

//Middleware function to verify state
const verifyState = () => {
    return (req, res, next) => {
        const code = req.params.state.toUpperCase();
        const state = data.states.find( st => st.code === code);
        //If state abbreviation doesn't exist
        if(!state){
            return res.status(404).json({ 'message': 'Invalid state abbreviation parameter' });
        }
        next();
    }
}

module.exports = verifyState