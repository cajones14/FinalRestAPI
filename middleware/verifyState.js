

//Get states data from the statesData.json JSON file
const stateData = {
    states: require('../model/statesData.json'),
    setStates: function (stateData) { this.states = stateData }
};



//Middleware function to verify state
const verifyState = (req, res, next) => {
    //Convert to Uppercase
    const code = req.params.state.toUpperCase();
    //Search for the state
    const state = stateData.states.find( st => st.code == code);

    //If state abbreviation doesn't exist
    if(!state){
        return res.status(400).json({
            'message': 'Invalid state abbreviation parameter'
        });
    }
    res.state = state;
    next();
}

module.exports = verifyState;