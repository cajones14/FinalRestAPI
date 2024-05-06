const State = require('../model/State');

//get all States from json
const data = {
    states: require('../model/statesData.json'),
    setStates: function (data) {this.states = data}
};

//combine the states with the json data
/* async function mergeData(){
    for(const state in data.states){
        //search MongoDB for entered state and check for funfacts
        const fact = await State.findOne({statecode: data.states[state].code}).exec(); //comparing each state
        if(fact){
            data.states[state].funfacts = fact.funfacts; //combine funfacts with statesData.json
        }
    }
} */

//run the merge function
//mergeData();

//GET all of the states
const getAllStates = async (req, res) => {
    //check for a query
    if(req.query){
        //if contig is true, remove AK and HI
        if(req.query.contig == 'true'){
            const result = data.states.filter(st => st.code != "AK" && st.code != "HI");
            res.json(result);
            return;
        }
        //display only AK and HI if contig is false
        else if(req.query.contig == 'false'){
            const result = data.states.filter( st => st.code == "AK" || st.code == "HI");
            res.json(result);
            return;
        }  
    }

    //if not specified return all states
    res.json(data.states);
}

//GET a single state
const getState = async (req, res) => {
    //set state code to uppercase
    const code = req.params.state.toUpperCase();
    //search for specific state
    const state = data.states.find(st => st.code == code);
    //return the state
    res.json(state);
}

//GET state and capitol
const getCapital = (req, res) => {
    //set state code to uppercase
    const code = req.params.state.toUpperCase();
    //find state code
    const state = data.states.find( st => st.code == code);
    //Return capital
    res.json({
        "state": state.state,
        "capital": state.capital_city
    });
}

//GET state and nickname
const getNickname = (req, res) => {
    //set state code to uppercase
    const code = req.params.state.toUpperCase();
    //find state code
    const state = data.states.find( st => st.code == code);
    //return the nickname
    res.json({
        "state": state.state,
        "nickname": state.nickname
    });
}

//GET state and population
const getPopulation = (req, res) => {
    //set state code to uppercase
    const code = req.params.state.toUpperCase();
    //find state code
    const state = data.states.find( st => st.code == code);
    //return population
    res.json({
        "state": state.state,
        "population": state.population.toLocaleString("en-US")
    });
}

//GET admission date
const getAdmission = (req, res) => {
    //set state code to uppercase
    const code = req.params.state.toUpperCase();
    //find state code
    const state = data.states.find( st => st.code == code);
    //return admission date
    res.json({
        "state": state.state,
        "admitted": state.admission_date
    });
}

//GET a random fun fact
const getFunFact = async (req, res) => {
    //find state code
    const state = data.states.find( st => st.code == req.params.state.toUpperCase());
    //check if fun facts for state exist
    if(!state){
        return res.status(400).json({
            "message": `Invalid state abbreviation parameter`
        });
    }
    //check for matching state in database
    const duplicate = await State.findOne({ stateCode: state.code }).exec();

    //If no state found or no fun facts
    if(!duplicate || duplicate.funfacts === null || !state.funfacts){
        return res.status(400).json({
            "message": `No Fun Facts found for ${state.state}`
        });
    }
        
    
    //State was found and has fun facts
    res.json({
        "funfact": duplicate.funfacts[getRandomInt(duplicate.funfacts.length)]
    });
}

//create fun facts
const createFunFact = async (req, res) => {
    let funfactsArr = [];

    //find state in the request param
    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());

    //if not found
    if(!state){
        return res.status(400).json({
            "message": `Invalid state abbreviation parameter`
        });
    }
    //check for states funfacts on mongoDB
    const duplicate = await State.findOne({ stateCode: state.code }).exec();
    const funfactsBody = req.body.funfacts;

    //if there is no fun facts in the body
    if(!funfactsBody){
        return res.status(400).json({
            "message": `State fun facts value required` //Edit Maybe
        });
    }
    //If not null check for fun facts and push it in to funfacts array
    if(duplicate?.funfacts) funfactsArr = duplicate.funfacts;

    //if fun facts body is not an array
    if(!Array.isArray(funfactsBody)){
        return res.status(400).json({
            "message": `State fun facts value must be an array`
        });
    }else{
        funfactsArr = funfactsArr.concat(funfactsBody);
    }
    if(!duplicate){
        try{
            const result = await State.create({
                stateCode: state.code,
                funfacts: funfactsArr
            });
            result.save();
            res.json(result);
        }catch(err){
            console.error(err);
        }
        return;
    }
    //Duplicate is a state in the DB so overwrite with new info
    duplicate.overwrite({stateCode: duplicate.stateCode, funfacts: funfactsArr });
    duplicate.save();
    res.json(duplicate);
}

const updateFunFact = async (req, res) => {
    //Same for checking a state 
    const state = data.states.find(stt => stt.code === req.params.state.toUpperCase());
    if(!state){
        return res.status(400).json({
            "message":  `Invalid state abbreviateion parameter`
        });
    }
    //check for duplicate states in DB
    const duplicate = await State.findOne({ stateCode: state.code }).exec();

    //Check for index and funfact
    //make sure data is valid and exists
    if(!req.body.index) return res.status(400).json({
        "message": "State fun fact index value required"
    });

    if(!Number.isInteger(parseInt(req.body.index))){
        return res.status(400).json({
            "message": "Index must be enetered without quotes"
        });
    } 

    if(!req.body.funfact){
        return res.status(400).json({
            "message": "State fun fact value required"
        });
    } 

    if(!duplicate){
        return res.status(400).json({
            "message": `No Fun Facts found for ${state.state}`
        });
    }

    if(!duplicate.funfacts[req.body.index - 1]){
        return res.status(400).json({
            "message": `No Fun Fact found at that index for ${state.state}`
        });
    } 
    //for out of bounds errors
    try{
        duplicate.funfacts[req.body.index-1] = req.body.funfact;
        duplicate.save();
        res.json(duplicate);
    }catch(err){
        console.error(err);
        return res.status(400).json({
            "message": "An error ocurred, index out of bounds"
        });
    }
}

const deleteFunFact = async(req, res) => {
    const state = data.states.find( stt => stt.code === req.params.state.toUpperCase());
    if(!state){
        return res.status(400).json({ 
            "message": `Invalid state abbreviation parameter` 
        });
    }
    //check for duplicate state
    const duplicate = await State.findOne({ stateCode: state.code }).exec();

    //Ensure data exists where necessary
    if(!req.body.index){
        return res.status(400).json({
            "message": "State fun fact index value required"
        });
    }

    if(!duplicate){
        return res.status(400).json({
            "message": `No Fun Facts found for ${state.state}`
        });
    }

    if(!Number.isInteger(parseInt(req.body.index))){
        return res.status(400).json({
            "message": "Index must be a number entered without quotes"
        });
    }

    if(!duplicate.funfacts[req.body.index - 1]){
        return res.status(400).json({
            "message": `No Fun Fact found at that index for ${state.state}`
        });
    } 

    //Delete item at element index - 1
    try {
    duplicate.funfacts.splice(req.body.index - 1, 1);
    duplicate.save();
    res.json(duplicate);
    }
    catch(err){
        console.error(err);
    }
}

function getRandomInt(max){
    return Math.floor(Math.random() * max);
}

module.exports = {
    getAllStates, 
    getState, 
    getNickname, 
    getPopulation, 
    getCapital, 
    getAdmission, 
    getFunFact, 
    createFunFact, 
    updateFunFact, 
    deleteFunFact
}