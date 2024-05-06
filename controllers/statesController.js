const State = require('../model/State');

//get all States from json
const data = {
    states: require('../model/statesData.json'),
    setStates: function (data) {this.states = data}
};

//GET all of the states
const getAllStates = async (req, res) => {
    let statesList;

    // ../states/?contig=true
    // Return only contiguous 48
    if(req.query.contig === 'true') {
        statesList = data.states.filter(st => st.code !== "AK" && st.code !== "HI");
    }

    // ../states/?contig=true
    // Return non-contiguous 2
    else if (req.query.contig === 'false') {
        statesList = data.states.filter( st => st.code === "AK" || st.code === "HI");     
    }

    // Return all 50
    else {
        statesList = data.states;  
    }     
    
    // database data
    for(let state of statesList) {
      try {
          const stateExists = await State.findOne({stateCode: state.code}).exec();
          if (stateExists.funfacts) {
              state.funfacts = [...stateExists.funfacts];
          }
      } catch (err) {
          console.log(err);
          console.log("Get failed: " + err);
      }
    }
    // ../states/
    res.json(statesList);
}

//GET a single state
const getState = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = data.states.find( st => st.code === code);

    try {
      const stateExists = await State.findOne({stateCode: state.code}).exec();
      if (stateExists.funfacts) {
          state.funfacts = [...stateExists.funfacts];
      }
    } catch (err) {
        console.log(err);
        console.log("Get failed: " + err);
    }
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
    const code = req.params.state.toUpperCase();
    const state = data.states.find( st => st.code === code);

    const stateInDB = await State.findOne({stateCode: code}).exec();
    if(!stateInDB) { 
        res.status(201).json({ 'message': `No Fun Facts found for ${state.state}` });
    } 
    else {
        const randomFact = stateInDB.funfacts[Math.floor((Math.random()*stateInDB.funfacts.length))];
        res.status(201).json({ 'funfact': randomFact });
    }
}

//create fun facts
const createFunFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const funfact = req.body.funfacts;

    // no funfact entered
    if(!funfact) {
        return res.status(400).json({ 'message': 'State fun facts value required' });
    }
  
    // funfact is not an array
    else if(!Array.isArray(funfact)) { 
        return res.status(400).json({ 'message': 'State fun facts value must be an array' });
    }

    const stateInDB = await State.findOne({ stateCode: code }).exec();
    
      // state record not yet in DB
        if (!stateInDB) {
        try {
            const result = await State.create({
            stateCode: code,
            funfacts: funfact
        });
        res.status(201).json(result);
        } catch (err) {
            console.log("Create failed: " + err);
        }
    }

    // state record is in DB
    else {
        try {
        stateInDB.funfacts = stateInDB.funfacts.concat(funfact);
        const result = await stateInDB.save();
        res.status(201).json(result);
        } catch (err) {
            console.log("Save failed: " + err);
        }
    }
}

const updateFunFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const state = data.states.find( st => st.code === code);
    const index = req.body.index;
    const x = index - 1;

    const stateInDB = await State.findOne({ stateCode: code }).exec();

    // no index entered
    if (!index) {
        return res.status(400).json({ 'message': 'State fun fact index value required' });
    }

    // no updated fun fact entered
    else if (!req.body.funfact) {
        return res.status(400).json({ 'message': 'State fun fact value required' });
    }

    // state record not in DB
    else if (!stateInDB) {
        return res.status(404).json({ 'message': `No Fun Facts found for ${state.state}` });
    }

    // index value not in array
    else if (index > stateInDB.funfacts.length) {
        return res.status(404).json({ 'message': `No Fun Fact found at that index for ${state.state}` });
    }

    try {
        stateInDB.funfacts.splice(x, 1, req.body.funfact);
        const operation = await stateInDB.save();
    
        res.status(200).json(operation);
    } catch (err) {
        console.log("Update failed: " + err);
    }
}

const deleteFunFact = async(req, res) => {
    const code = req.params.state.toUpperCase();
    const state = data.states.find( st => st.code === code);
    const index = req.body.index;
    const x = index - 1;

    const stateInDB = await State.findOne({ stateCode: code }).exec();
  
    // no index entered
    if (!index) {
        return res.status(400).json({ 'message': 'State fun fact index value required' });
    }
    
    // state record not in DB
    else if (!stateInDB) {
        return res.status(404).json({ 'message': `No Fun Facts found for ${state.state}` });
    }
    
    // index value not in array
    else if (index > stateInDB.funfacts.length) {
        return res.status(404).json({ 'message': `No Fun Fact found at that index for ${state.state}` });
    }
    try {
        stateInDB.funfacts.splice(x, 1);
        await stateInDB.save();
    
        res.status(200).json(stateInDB);
    } catch (err) {
        console.log("Delete failed: " + err);
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