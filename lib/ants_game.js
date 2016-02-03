'use strict';
/**
* Ethan Anderson
* INFO 498E : Ants vs SomeBees
* 02/02/16
*/


/**
* Represents an insect (e.g., an Ant or a Bee) in the game
* This class should be treated as abstract
*/
class Insect {
    constructor(armor, place) {
        this._armor = armor;
        this._place = place;
        this._name = 'Insect'; // for clarity, should never see this
        this._watersafeBehavior;
    }
    
    get armor() {
        return this._armor;
    }
    
    reduceArmor(amount) {
        this._armor -= amount;
        if (this._armor <= 0) {
            console.log(this.toString() + ' ran out of armor and expired');
            this.place = undefined;
        }
    }
    
    get place() {
        return this._place;
    }
    
    set place(place) {
        if (place === undefined) { //if being removed
            this._place._removeInsect(this);
            this._place = undefined;
        }
        else if (place._addInsect(this)) { //try to go to new place
            if (this._place !== undefined) {
                this._place._removeInsect(this); //leave old place
            }
            this._place = place; //save our new location
        }
    }
    
    get name(){
        return this._name;
    }
    
    set name (name){
        this._name = name;
    }
    
    toString() {
        return this.name + '(' + (this.place ? this.place.name : '') + ')';
    }
    
    get action(){
        return this._action;
    }
    
    set action(action){
        this._action = action;
    }
    
    get actName(){
        return this._actName;
    }
    
    set actName(name){
        this._actName = name;
    }
    
    get watersafeBehavior() {
        return this._watersafeBehavior;
    }
    
    set watersafeBehavior(watersafe) {
        this._watersafeBehavior = watersafe;
    }
    
}

/**
* Represents a Bee (the antagonist!)
*/
class Bee extends Insect {
    constructor(armor, place) {
        super(armor, place);
        this.name = 'Bee';
        this._damage = 1;
        this.watersafe = true; // bees can fly
    }
    
    sting(ant) {
        console.log(this + ' stings ' + ant + '!');
        ant.reduceArmor(this._damage);
    }
    
    // return true if blocked, false if not
    get blocked() {
        var target = this.place.ant; // store reference for ease
        if (target !== undefined && !target.invisible) {    // check if the ant is invisible
            return true;
        } else {
            return false;
        }
    }
    
    //act on its turn
    act() {
        if (this.blocked) {
            this.sting(this.place.ant);
        }
        else if (this.armor > 0) {
            this.place = this.place.exit;
        }
    }
}

/**
* A class representing a basic Ant.
* This class should be treated as abstract
*/
class Ant extends Insect {
    constructor(armor, cost, action, invisibleBehavior, containerBehavior, place) {
        super(armor, place);
        this._name = 'Ant'; //for display
        this._foodCost = cost;
        this._range = 0;
        this._damage = 0;
        
        this._invisibleBehavior = invisibleBehavior; // set visible strategy
        this._containerBehavior = containerBehavior; // set if container default to false
    }
    
    get foodCost() {
        return this._foodCost;
    }
    
    get invisibleBehavior(){
        return this._visibleBehavior;
    }
    
    set invisibleBehavior(invisible){
        this._invisibleBehavior = invisible;
    }
    
    get range() {
        return this._range;
    }
    
    set range(range) {
        this._range = range;
    }
    
    get damage() {
        return this._damage;
    }
    
    set damage(damage) {
        this._damage = damage;
    }
    
    get name() {
        return this._name;
    }
    
    set name(name) {
        this._name = name;
    }
    
    
    act(colony) {
        if (this._action) {
            this._action.act(this, colony); // implementing strategy pattern
        }
    }
    
}

// implementing the container ant functionality
class Container extends Ant{
    constructor(armor, cost){
        super(armor, cost);
        this._container = true;
        this._contained = undefined;
    }
    
    get container(){ // check if the ant is implementing the container behavior
        return this._container;
    }
    
    get contained(){
        return this._contained;
    }
    
    set contained(ant){
        this._contained = ant; // add ant to container
    }   
}

/**
* Represents a location in the game
*/
class Place {
    constructor(name, exit, entrance) {
        this.name = name;
        this._bees = [];
        this._ant = undefined; //placeholder for code clarity
        this.exit = exit;
        this.entrance = entrance;
        this._water = false; // places aren't water by default
    }
    
    _addInsect(insect) {
        if (insect instanceof Bee) {
            this._bees.push(insect);
            return true;
        }
        else if (this._ant === undefined) {
            this._ant = insect;
            return true;
        }
        else if(this._ant !== undefined){ // logic to check for container ants
            if(this._ant.container && !insect.container){ // old ant is contaienr new isn't
                this._ant.contained = insect;
                return true;
            }
            else if(!this._ant.container && insect.container){ // old ant is not container and new is
                insect.contained = this._ant;
                this._ant = insect;
                return true;
            }     
        }
        else {
            return false; //could not add insect
        }
    }
    
    _removeInsect(insect){
        if(insect instanceof Bee){
            var index = this._bees.indexOf(insect);
            if(index >= 0){
                this._bees.splice(index,1);
            }
        }
        else if(insect.contained !== undefined){ // check if the insect is a container
            this._ant = insect.contained;
        }
        else {
            this._ant = undefined;
        }

    }
    
    get ant() {
        return this._ant;
    }
    
    get bees() {
        return this._bees;
    }
    
    //Returns a nearby bee, between the minDistance and the maxDistance ahead.
    //If multiple bees are the same distance, a random bee is chosen
    getClosestBee(minDistance, maxDistance) {
        var p = this;
        for (var dist = 0; p !== undefined && dist <= maxDistance; dist++) {
            if (dist >= minDistance && p.bees.length > 0) {
                return p.bees[Math.floor(Math.random() * p.bees.length)]; //pick a random bee
            }
            p = p.entrance;
        }
        return undefined; //no bee found
    }
    
    toString() {
        return `Place[$(this.name)]`;
    }
}

/**
* An entire colony of ants and their tunnels
*/
class AntColony {
    constructor(startingFood, numTunnels, tunnelLength, moatFrequency) {
        var MAX_TUNNEL_LENGTH = 8;
        tunnelLength = Math.min(tunnelLength, MAX_TUNNEL_LENGTH); //respect the max-length
        
        this._food = startingFood;
        
        this._places = []; //2d-array storage for easy access
        this._beeEntrances = [];
        this._queenPlace = new Place('Ant Queen');
        
        //sets up a tunnels, which are linked-lists of places
        var prev, curr, typeName;
        for (var tunnel = 0; tunnel < numTunnels; tunnel++) {
            curr = this._queenPlace; //start the tunnels at the queen
            this._places[tunnel] = [];
            for (var step = 0; step < tunnelLength; step++) {
                //water or not?
                typeName = 'tunnel';
                if (moatFrequency !== 0 && (step + 1) % moatFrequency === 0) { //if we have moats and we're on a moat count (starting at 1)
                    typeName = 'water';
                }
                
                prev = curr; //keep track of the previous guy (who we will exit to)
                var locationId = tunnel + ',' + step; //location id string
                
                // logic to determine water or regular place
                if (typeName === 'water') {
                    curr = new Water(typeName + '[' + locationId + ']', prev); //create new water place with an exit that is the previous spot
                } else {
                    curr = new Place(typeName + '[' + locationId + ']', prev); //create new place with an exit that is the previous spot
                }
                
                prev.entrance = curr; //the previous person's entrance is the new spot
                this._places[tunnel][step] = curr; //keep track of new place
            }
            this._beeEntrances.push(curr); //current place is last item in the tunnel, so mark that it is a bee entrance
        } //loop to next tunnel
    }
    
    get food() {
        return this._food;
    }
    
    increaseFood(amount) {
        this._food += amount;
    }
    
    //returns a 2d-array of the places
    get places() {
        return this._places;
    }
    
    get entrances() {
        return this._beeEntrances;
    }
    
    get queenPlace() {
        return this._queenPlace;
    }
    
    get queenHasBees() {
        return this._queenPlace.bees.length > 0;
    }
    
    deployAnt(place, ant) {
        
        if (this._food >= ant.foodCost) {
            if (place.water && !ant.watersafe) { // only one invalid deployment condition for water
                return false;
            } else {
                this._food -= ant.foodCost;
                ant.place = place; //assign the ant
                return ant.place === place; //return if could place the ant
            }
        }
        else {
            return false; //could not place the ant due to food cost
        }
    }
    
    removeAnt(place) {
        place.ant = undefined;
    }
    
    //return all ants currently in the colony
    get allAnts() {
        var ants = [];
        for (var i = 0; i < this._places.length; i++) {
            for (var j = 0; j < this._places[i].length; j++) {
                if (this._places[i][j].ant !== undefined) {
                    ants.push(this._places[i][j].ant);
                }
            }
        }
        return ants;
    }
    
    //return all bees currently in the colony
    get allBees() {
        var bees = [];
        for (var i = 0; i < this._places.length; i++) {
            for (var j = 0; j < this._places[i].length; j++) {
                bees = bees.concat(this._places[i][j].bees);
            }
        }
        return bees;
    }
    
    //Creates a default starting colony
    static createDefaultColony() {
        return new AntColony(10, 1, 8, 0);
    }
    
    //Creates a testing colony with extra food
    static createTestColony() {
        return new AntColony(12, 1, 8, 0);
    }
    
    //Creates a full colony with 3 tunnels
    static createFullColony() {
        return new AntColony(2, 3, 8, 0);
    }
    
    //Creates a full colony with three tunnels and moats
    static createWetColony() {
        return new AntColony(50, 3, 8, 1);
    }
}

class Hive extends Place {
    constructor(beeArmor) {
        super('Hive');
        this._beeArmor = beeArmor;
        this._waves = {};
    }
    
    //Adds a wave of attacking bees to this hive
    addWave(attackTurn, numBees) {
        var wave = [];
        for (var i = 0; i < numBees; i++) {
            var bee = new Bee(this._beeArmor, this);
            wave.push(bee);
            bee.place = this;
            this._bees.push(bee); //explicitly position the bee; workaround for bug(?)
        }
        this._waves[attackTurn] = wave;
        return this;
    }
    
    //Moves in the invaders who are attacking the colony on the given turn
    invade(colony, time) {
        if (this._waves[time] !== undefined) {
            this._waves[time].forEach(function (bee) {
                var randEntrance = Math.floor(Math.random() * colony.entrances.length);
                bee.place = colony.entrances[randEntrance];
            });
            return this._waves[time]; //return list of new bees
        }
        else {
            return []; //no bees attacking
        }
    }
    
    //Creates a hive with two attacking bees
    static createTestHive() {
        var hive = new Hive(3)
        .addWave(2, 1)
        .addWave(3, 1);
        return hive;
    }
    
    //Creates a hive filled with attacking bees
    static createFullHive() {
        var hive = new Hive(3)
        .addWave(2, 1);
        for (var i = 3; i < 15; i += 2) {
            hive.addWave(i, 1);
        }
        hive.addWave(15, 8);
        return hive;
    }
    
    //Creates a hive filled with a huge number of powerful attacking bees
    static createInsaneHive() {
        var hive = new Hive(4)
        .addWave(1, 2);
        for (var i = 3; i < 15; i += 2) {
            hive.addWave(i, 1);
        }
        hive.addWave(15, 20);
        return hive;
    }
}


class AntGame {
    constructor(colony, hive) {
        this._colony = colony;
        this._hive = hive;
        this._turn = 0;
        this._antFactory = new AntFactory();
    }
    
    //execute a turn
    takeTurn() {
        //all ants take a turn
        this._colony.allAnts.forEach(function (ant) {
            ant.act(this._colony); //pass in colony reference if needed
        }, this);
        
        //all bees take a turn
        this._colony.allBees.forEach(function (bee) {
            bee.act();
        }, this);
        
        //new bees arrive
        this._hive.invade(this._colony, this._turn);
        
        //turn finished
        this._turn++;
    }
    
    get turn() {
        return this._turn;
    }
    
    //returns true if the game is won, false if lost, and undefined if ongoing
    get gameWon() {
        if (this._colony.queenHasBees) { //queen has been reached
            return false; //we won!
        }
        else if (this._colony.allBees.length + this._hive.bees.length === 0) { //no more bees!
            return true; //we won!
        }
        
        return undefined; //ongoing
    }
    
    //User control: deploy an ant of the given type
    //@param antType should be a String (subclass name)
    //@param placeName should be a String (form: "0,1" [tunnel,step])
    deployAnt(antType, placeName) {
        try { //brute force error catching
            var loc = placeName.split(',');
            var place = this._colony._places[loc[0]][loc[1]];
            
            // IMPLEMENT FACOTRY HERE
            var ant = this._antFactory.createAnt(antType);
            
            // then deploy the ant to the colony
            return this._colony.deployAnt(place, ant);
            //return true; //success
        } catch (e) {
            return false; //error = failure
        }
    }
    
    //User control: remove an ant from the given place
    //@param placeName should be a String (form: "0,1" [tunnel,step])
    removeAnt(placeName) {
        try { //brute force error catching
            var loc = placeName.split(',');
            var place = this._colony._places[loc[0]][loc[1]];
            if(place.ant.name === 'Queen'){
                return false;
            }
            place.ant.place = undefined; //take ant who was there and have him leave (circular)
            return true; //success
        } catch (e) {
            return false; //error = failure
        }
    }
    
    get colony() {
        return this._colony;
    }
    
    get hive() {
        return this._hive;
    }
    
}

// creates ant and assigns strategies
class AntFactory{
    constructor(){
        this._queenDeployed = false;
    }
    createAnt(antType){
        var newAnt;
        // logic to check if the Queen has already been deployed
        if(antType === 'Queen' && this._queenDeployed === false){
            newAnt = Ants[antType].queen;    // TRYING SINGLETON idk why
        }
        else {
            
            newAnt = new Ants[antType](); // create new ant dynamically
            
            if(antType === 'Queen'){
                this._queenDeployed = true;
            }
        }
        
        newAnt.action = new Actions[newAnt.actName](); // assign the action dynamically
        
        return newAnt;
    }
}

/*************
* STRATEGIES *
*************/

//an object to hold different behaviors to implement a Strategy pattern

var Behaviors = {
    
    WatersafeBehavior : class {
        get watersafe(){
            return true;
        } 
    },
    
    InvisibleBehavior : class {
        get visible(){
            return false;
        }
    } 
};



/*************
*  ACTIONS  *
*************/

// abstract Action
class Action { // lawsuit ha ha
    constructor() {
        
    }
    
    act() {
        // DO NOTHING
    }
}

//an object to hold action subclasses / give them specific namespaces
var Actions = {
    
    // attack action
    Attack: class extends Action {
        
        act(ant) {
            var _bees = ant.place.bees; // get range from ant getter
            
            if (_bees) {
                // console.log(ant + ' throws a leaf at ' + target + ' : ' + ant.damage + ' damage');
                for (var i = 0; i < _bees.length; i++) {
                    console.log(ant + ' secret attacks ' + _bees[i] + ' : ' + ant.damage + ' damage -- Kapow!');
                    _bees[i].reduceArmor(ant.damage);
                }
            }
        }
        
    },
    
    Throw: class extends Action {
        act(ant) {
            var target = ant.place.getClosestBee(0, ant.range); // get range from ant getter
            
            if (target) {
                console.log(ant + ' throws a leaf at ' + target + ' : ' + ant.damage + ' damage');
                target.reduceArmor(ant.damage);
            }
        }
    },
    
    // grow action
    Grow: class extends Action {
        act(ant, colony) {
            colony.increaseFood(ant.grow);
        }
    },
    
    Passive: class extends Action {
        // TODO nothing??? idk how to best implement this
    },
    
    // eat action
    Eat: class extends Action {
        act(ant) {
            // check if ant is hungry
            if (ant.hungry === 0) {
                var target = ant.place.getClosestBee(0, 0);
                if (target) {
                    console.log(ant + ' eats ' + target + ' and will digest for 3 turns');
                        target.reduceArmor(target.armor);
                    ant.hungry = 3; // reset counter
                }
            } else if (ant.hungry > 0) {
                console.log(ant + ' is digesting for ' + ant.hungry + ' turns');
                    ant.hungry -= 1; // decrement turns until can eat
                return false; // let client know that it can't eat (though not really used, could be good future)
            }
        }
    },
    
    // fire action
    Fire: class extends Action {
        act(ant, amount) {
            if (ant.armor - amount <= 0) {
                console.log(ant + ' goes down in a firey inferno!!!! boom');
                // store bees in place
                var beeArr = ant.place.bees;
                
                for (var i = 0; i < beeArr.length; i++) {
                    beeArr[i].reduceArmor(ant.damage);
                }
                
            }
        }
    },
    
    // inspire action for queen to double damage
    Inspire: class extends Action {
        act(_ant) {
            // get both ants
            var enterAnt = _ant.place.entrance.ant;
            var exitAnt = _ant.place.exit.ant;
            
            // check if the ants are defined, and if they are already in inspired obj
            if (enterAnt !== undefined && !_ant.inspired[enterAnt.name]) {
                _ant.inspired[enterAnt.name] = enterAnt;
                this.double(enterAnt);
            }
            
            if (exitAnt !== undefined && !_ant.inspired[exitAnt.name]) {
                _ant.inspired[exitAnt.name] = exitAnt;
                this.double(exitAnt);
            }
            
        }

        double(target) {
            target.damage *= 2;
        }
    }
};

// create new unique Symbols for queen Singleton using ES6
// found on Stackexchange; credit - 
let singleton = Symbol();
let singletonEnforcer = Symbol();
/*************
* ANT TYPES *
*************/

// an object to hold ant subclasses / give them specific namespaces
var Ants = {
    // grower type
    Grower: class extends Ant {
        // armor: 1 foodCost: 2
        constructor() {
            super(1, 2);
            this.name = 'Grower';
            this.actName = 'Grow';
            this._grow = 1; // default one food every turn
        }
        
        get grow() {
            return this._grow;
        }
        
    },
    
    // thrower type
    Thrower: class extends Ant {
        // armor: 1 foodCost: 4
        constructor() {
            super(1, 4);
            this.name = 'Thrower';
            this.damage = 1;
            this.range = 3;
            this.actName = 'Throw';
        }
        
    },
    
    // wall type
    Wall: class extends Ant {
        // armor: 4 foodCost: 4
        constructor() {
            super(4, 4);
            this.name = 'Wall';
            this.actName = 'Passive';
        }
    },
    
    // hungry type
    Hungry: class extends Ant {
        // armor: 1 foodCost: 4
        constructor() {
            super(1, 4);
            this.name = 'Hungry';
            this.actName = 'Eat';
            this._hungry = 0; // counter for digestion turns   
        }
        
        get hungry() {
            return this._hungry;
        }
        
        set hungry(turn) {
            this._hungry = turn;
        }
        
    },
    
    // fire type
    Fire: class extends Ant {
        // armor: 1 foodCost: 4
        constructor() {
            super(1, 4);
            this.name = 'Fire';
            this.damage = 3;
            this.actName = 'Passive';
        }
        
        // override, so when the Fire ant is killed, it damages all bees in place
        reduceArmor(amount) {
            this.action = new Actions['Fire'](); // set fire action only after it's been stung
            // fire, and then call the super reduceArmor
            this.action.act(this, amount);
            // if super is called first the ant disappears and runtime error occurs
            super.reduceArmor(amount);
        }
        
    },
    
    // scuba type, watersafe
    Scuba: class extends Ant {
        // armor: 1 foodCost: 5
        constructor() {
            super(1, 5);
            this.name = 'Scuba';
            this.damage = 1;
            this.range = 3;
            this.actName = 'Throw';
            this.watersafeBehavior = new Behaviors['WatersafeBehavior']();
        }
        
    },
    
    // ninja type, invisible
    Ninja: class extends Ant {
        // armor: 1 foodCost: 6
        constructor() {
            super(1, 6);
            this.name = 'Ninja';
            this.damage = 1;
            this.actName = 'Attack';
            this.invisibleBehavior = new Behaviors['InvisibleBehavior'](); // Ninjas are invisible -- kapow!
        }
        
    },
    
    // bodyguard type, is container
    Bodyguard: class extends Container {
        constructor() {
            super(2, 4);
            this.name = 'Bodyguard';
            this.actName = 'Passive';
        }
    },
    
    // queen type, inspiring, watersafe
    Queen: class extends Ant {
        
        constructor(enforcer) {
            if (enforcer !== singletonEnforcer) throw 'Cannot construct singleton';
            
            // armor: 1 foodCost: 6
            super(1, 6);
            this.name = 'Queen';
            this.actName = 'Inspire';
            this.watersafe = new Behaviors['WatersafeBehavior']();
            this._inspired = {}; // empty obj to hold inspired ants so we can lookup by key
        }
        
        static get queen() {
            if (!this[singleton]) {
                this[singleton] = new Ants['Queen'](singletonEnforcer);
                
                return this[singleton];
            }  
            
        }
           
        // return inspired ants
        get inspired() {
            return this._inspired;
        }
        
        // add inspired ant
        set inspired(ant) {
            this._inspired[ant.name] = ant;
        }
        
    }
    //other types go here!
    //declare as SubclassName : class definition
    //so that the SubclassName acts as a key to find the class definition
};


//export classes to be available to other modules. Note that this does expose some of the other classes
module.exports.Hive = Hive;
module.exports.AntColony = AntColony;
module.exports.AntGame = AntGame;