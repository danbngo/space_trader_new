/**
 * SaveManager - Comprehensive save/load system that handles circular references using UUIDs
 * 
 * This system serializes the entire game state (GameState, StarSystem, all entities) 
 * by converting object references to UUID strings, then deserializes them back by
 * looking up objects in the gameRegistry.
 * 
 * Key Features:
 * - Handles circular references (Fleet->Ship->Fleet)
 * - Converts Map<Object, value> to Map<uuid_string, value>
 * - Converts arrays of objects to arrays of uuid strings
 * - Preserves primitive values (numbers, strings, booleans)
 * - Multi-pass deserialization for proper reference restoration
 */

const SaveManager = {
    SAVE_KEY_PREFIX: 'spaceGameSave_',
    SAVE_LIST_KEY: 'spaceGameSaveList',
    SAVE_VERSION: '1.0.0',

    /**
     * Convert an object reference to its UUID string
     * @param {any} obj - Object that might have a uuid property
     * @returns {string|null} UUID string or null
     */
    objectToUUID(obj) {
        if (!obj) return null;
        if (typeof obj === 'string') return obj; // Already a UUID
        if (obj.uuid) return obj.uuid;
        return null;
    },

    /**
     * Convert a UUID string back to its object reference via gameRegistry
     * @param {string} uuid - UUID string
     * @param {string} type - Type of object (planet, fleet, ship, etc.)
     * @returns {any} The object from registry or null
     */
    uuidToObject(uuid, type) {
        if (!uuid) return null;
        if (typeof uuid !== 'string') return uuid; // Already an object
        return gameRegistry.get(type, uuid);
    },

    /**
     * Serialize a Map<Object, value> to an array of [uuid_string, value] pairs
     * @param {Map} map - Map to serialize
     * @param {string} keyType - Type of keys (for UUID lookup)
     * @returns {Array} Array of [uuid, value] pairs
     */
    serializeMap(map, keyType) {
        if (!map || !(map instanceof Map)) return [];
        const entries = [];
        for (const [key, value] of map.entries()) {
            const keyUUID = this.objectToUUID(key);
            if (keyUUID) {
                // Recursively serialize the value if it's an object with uuid
                const serializedValue = value && typeof value === 'object' && value.uuid 
                    ? this.objectToUUID(value)
                    : value;
                entries.push([keyUUID, serializedValue]);
            }
        }
        return entries;
    },

    /**
     * Deserialize an array of [uuid_string, value] pairs back to Map<Object, value>
     * @param {Array} entries - Array of [uuid, value] pairs
     * @param {string} keyType - Type of keys for UUID lookup
     * @param {string} [valueType] - Optional type of values for UUID lookup
     * @returns {Map} Reconstructed Map
     */
    deserializeMap(entries, keyType, valueType = null) {
        const map = new Map();
        if (!entries || !Array.isArray(entries)) return map;
        
        for (const [keyUUID, value] of entries) {
            const keyObj = this.uuidToObject(keyUUID, keyType);
            if (keyObj) {
                // If value is a UUID string and we have a valueType, look it up
                const finalValue = valueType && typeof value === 'string'
                    ? this.uuidToObject(value, valueType)
                    : value;
                map.set(keyObj, finalValue);
            }
        }
        return map;
    },

    /**
     * Serialize an array of objects to an array of UUID strings
     * @param {Array} arr - Array of objects
     * @returns {Array} Array of UUID strings
     */
    serializeArray(arr) {
        if (!arr || !Array.isArray(arr)) return [];
        return arr.map(obj => this.objectToUUID(obj) || obj).filter(x => x !== null);
    },

    /**
     * Deserialize an array of UUID strings back to objects
     * @param {Array} uuids - Array of UUID strings
     * @param {string} type - Type of objects for UUID lookup
     * @returns {Array} Array of objects
     */
    deserializeArray(uuids, type) {
        if (!uuids || !Array.isArray(uuids)) return [];
        return uuids.map(uuid => this.uuidToObject(uuid, type)).filter(x => x !== null);
    },

    /**
     * Serialize CountsMap to a simple array of [uuid/type, count] pairs
     * @param {CountsMap} countsMap
     * @returns {Array}
     */
    serializeCountsMap(countsMap) {
        if (!countsMap || !countsMap.counts) return [];
        const entries = [];
        for (const [key, value] of countsMap.counts.entries()) {
            // Key might be an object with uuid OR a type object (like CARGO_TYPES.FUEL)
            const keyId = this.objectToUUID(key) || (key && key.name ? key.name : key);
            entries.push([keyId, value]);
        }
        return entries;
    },

    /**
     * Serialize a Map with object keys to array of [keyUuid, value] pairs
     * @param {Map} map - Map with object keys
     * @returns {Array}
     */
    serializeMapWithObjectKeys(map) {
        if (!map || !(map instanceof Map)) return [];
        const entries = [];
        for (const [key, value] of map.entries()) {
            const keyUUID = this.objectToUUID(key);
            if (keyUUID) {
                // Recursively serialize the value if it's an object with uuid or name
                const serializedValue = value && typeof value === 'object' && value.uuid 
                    ? this.objectToUUID(value)
                    : (value && typeof value === 'object' && value.name ? value.name : value);
                entries.push([keyUUID, serializedValue]);
            }
        }
        return entries;
    },

    /**
     * Deserialize array of [keyUuid, value] pairs back to Map with object keys
     * @param {Array} entries - Array of [uuid, value] pairs
     * @param {string} keyType - Type of keys for UUID lookup
     * @param {Object} [valueRegistry] - Optional registry to lookup value types (e.g., RANK_TYPES)
     * @returns {Map}
     */
    deserializeMapWithObjectKeys(entries, keyType, valueRegistry = null) {
        const map = new Map();
        if (!entries || !Array.isArray(entries)) return map;
        
        for (const [keyUUID, value] of entries) {
            const keyObj = this.uuidToObject(keyUUID, keyType);
            if (keyObj) {
                // If value is a string and we have a valueRegistry, look it up
                let finalValue = value;
                if (valueRegistry && typeof value === 'string') {
                    finalValue = Object.values(valueRegistry).find(t => t && t.name === value) || value;
                }
                map.set(keyObj, finalValue);
            }
        }
        return map;
    },

    /**
     * Deserialize CountsMap from array of [uuid/type, count] pairs
     * @param {Array} entries
     * @param {Object} typeRegistry - Optional registry to lookup type objects (e.g., CARGO_TYPES)
     * @returns {CountsMap}
     */
    deserializeCountsMap(entries, typeRegistry = null) {
        const countsMap = new CountsMap();
        if (!entries || !Array.isArray(entries)) return countsMap;
        
        for (const [keyId, value] of entries) {
            let key = keyId;
            
            // Try to resolve as a type from registry first (for cargo types, skills, etc.)
            if (typeRegistry && typeof keyId === 'string') {
                const typeObj = typeRegistry[keyId] || 
                               Object.values(typeRegistry).find(t => t && t.name === keyId);
                if (typeObj) {
                    key = typeObj;
                }
            }
            
            // Try to resolve as a UUID from gameRegistry (for Planet, Religion keys)
            if (typeof keyId === 'string' && keyId.includes('_')) {
                // Check various object types by UUID prefix
                if (keyId.startsWith('planet_')) {
                    const obj = gameRegistry.get('planet', keyId);
                    if (obj) key = obj;
                } else if (keyId.startsWith('religion_')) {
                    const obj = RELIGIONS.find(r => r.uuid === keyId);
                    if (obj) key = obj;
                }
            }
            
            countsMap.counts.set(key, value);
        }
        return countsMap;
    },

    /**
     * Main serialization function - converts GameState to JSON-safe object
     * @param {GameState} gs - The game state to serialize
     * @returns {Object} JSON-safe object
     */
    serializeGameState(gs) {
        console.log('SaveManager: Starting serialization...');
        const startTime = Date.now();

        try {
            const saveData = {
                version: this.SAVE_VERSION,
                timestamp: Date.now(),
                year: gs.year,
                encounterImmunityUntilYear: gs.encounterImmunityUntilYear,
                nextTitheYear: gs.nextTitheYear,
                
                // System reference
                systemName: gs.system ? gs.system.name : null,
                
                // Fleet reference
                fleetUUID: this.objectToUUID(gs.fleet),
                
                // Missions
                missions: (gs.missions || []).map(mission => this.serializeMission(mission)),
                
                // Maps with planet/spaceobject keys
                memorizedSettlements: this.serializeMapWithObjectKeys(gs.memorizedSettlements),
                lastVisitedDates: this.serializeMapWithObjectKeys(gs.lastVisitedDates),
                lastSeenDates: this.serializeMapWithObjectKeys(gs.lastSeenDates),
                
                // StarSystem data
                system: this.serializeStarSystem(gs.system)
            };

            const elapsed = Date.now() - startTime;
            console.log(`SaveManager: Serialization complete in ${elapsed}ms`);
            return saveData;
        } catch (error) {
            console.error('SaveManager: Serialization error:', error);
            throw error;
        }
    },

    /**
     * Serialize a StarSystem
     * @param {StarSystem} system
     * @returns {Object}
     */
    serializeStarSystem(system) {
        if (!system) return null;
        
        // Serialize planet dynamic data (civilization, settlement)
        const planetData = [];
        for (const planet of system.planets.concat(system.dwarfPlanets || [])) {
            planetData.push({
                uuid: planet.uuid,
                civilizationUUID: this.objectToUUID(planet.civilization),
                settlementUUID: this.objectToUUID(planet.settlement)
            });
        }
        
        return {
            name: system.name,
            color: system.color,
            radius: system.radius,
            
            // Store UUIDs of all space objects
            stars: this.serializeArray(system.stars),
            planets: this.serializeArray(system.planets),
            dwarfPlanets: this.serializeArray(system.dwarfPlanets),
            moons: this.serializeArray(system.moons),
            spaceStations: this.serializeArray(system.spaceStations),
            asteroidBelts: this.serializeArray(system.asteroidBelts),
            asteroids: this.serializeArray(system.asteroids),
            ruins: this.serializeArray(system.ruins),
            anomalies: this.serializeArray(system.anomalies),
            
            // Planet dynamic data
            planetData: planetData,
            
            // Fleets
            fleets: (system.fleets || []).map(fleet => this.serializeFleet(fleet)),
            abandonedFleets: (system.abandonedFleets || []).map(fleet => this.serializeFleet(fleet)),
            
            // Religions
            religions: (system.religions || []).map(religion => this.serializeReligion(religion)),
            
            // News
            news: (system.news || []).map(news => this.serializeNews(news)),
            history: (system.history || []).map(news => this.serializeNews(news)),
        };
    },

    /**
     * Serialize a Fleet
     * @param {Fleet} fleet
     * @returns {Object}
     */
    serializeFleet(fleet) {
        if (!fleet) return null;
        
        return {
            uuid: fleet.uuid,
            name: fleet.name,
            color: fleet.color,
            x: fleet.x,
            y: fleet.y,
            angle: fleet.angle,
            cloakLevel: fleet.cloakLevel,
            destroyed: fleet.destroyed,
            abandonedYear: fleet.abandonedYear,
            originalName: fleet.originalName,
            
            planetUUID: this.objectToUUID(fleet.planet),
            locationUUID: this.objectToUUID(fleet.location),
            fleetTypeName: fleet.fleetType ? fleet.fleetType.name : null,
            flagshipUUID: this.objectToUUID(fleet.flagship),
            destroyedBy: typeof fleet.destroyedBy === 'string' ? fleet.destroyedBy : this.objectToUUID(fleet.destroyedBy),
            
            ships: fleet.ships.map(ship => this.serializeShip(ship)),
            officers: fleet.officers.map(officer => this.serializeOfficer(officer)),
            captainUUID: this.objectToUUID(fleet.captain),
            
            cargo: this.serializeCountsMap(fleet.cargo),
            
            route: fleet.route ? this.serializeRoute(fleet.route) : null,
            fleetAI: fleet.fleetAI ? this.serializeFleetAI(fleet.fleetAI) : null,

            fuel: fleet.fuel || 0,
        };
    },

    /**
     * Serialize a Ship
     * @param {Ship} ship
     * @returns {Object}
     */
    serializeShip(ship) {
        if (!ship) return null;
        
        return {
            uuid: ship.uuid,
            name: ship.name,
            color: ship.color,
            hull: ship.hull,
            shields: ship.shields,
            lasers: ship.lasers,
            engine: ship.engine,
            cargoSpace: ship.cargoSpace,
            radars: ship.radars,
            maxActionsPerTurn: ship.maxActionsPerTurn,
            actionsRemaining: ship.actionsRemaining,
            x: ship.x,
            y: ship.y,
            angle: ship.angle,
            escaped: ship.escaped,
            radiusModifier: ship instanceof AsteroidShip ? ship.radiusModifier : 1,
            widthModifier: ship instanceof AsteroidShip ? ship.widthModifier : 1,
            
            shipTypeName: ship.shipType ? ship.shipType.name : null,
            fleetUUID: this.objectToUUID(ship.fleet),
            pilotUUID: this.objectToUUID(ship.pilot),
            disabledByShipUUID: this.objectToUUID(ship.disabledByShip),
            aiTypeName: ship.aiType ? ship.aiType : null,
            
            localModules: (ship.localModules || []).map(m => this.serializeShipModule(m)),
            moduleCooldowns: this.serializeCountsMap(ship.moduleCooldowns),
            statusEffects: this.serializeCountsMap(ship.statusEffects),
            
            // For asteroids
            asteroidVertices: ship instanceof AsteroidShip ? ship.asteroidVertices || null : null,
        };
    },

    /**
     * Serialize a ShipModule
     * @param {ShipModule} module
     * @returns {Object}
     */
    serializeShipModule(module) {
        if (!module) return null;
        return {
            moduleTypeName: module.moduleType ? module.moduleType.name : null,
            quality: module.quality || 1.0
        };
    },

    /**
     * Serialize an Officer
     * @param {Officer} officer
     * @returns {Object}
     */
    serializeOfficer(officer) {
        if (!officer) return null;
        
        return {
            uuid: officer.uuid,
            name: officer.name,
            age: officer.age,
            credits: officer.credits,
            level: officer.level,
            skillPoints: officer.skillPoints,
            numPerkPoints: officer.numPerkPoints,
            expPoints: officer.expPoints,
            
            planetUUID: this.objectToUUID(officer.planet),
            religionName: officer.religion ? officer.religion.name : null,
            fleetUUID: this.objectToUUID(officer.fleet),
            
            reputation: this.serializeCountsMap(officer.reputation),
            bounty: this.serializeCountsMap(officer.bounty),
            skills: this.serializeCountsMap(officer.skills),
            
            loans: (officer.loans || []).map(loan => this.serializeBankLoan(loan)),
            implants: (officer.implants || []).map(implant => this.serializeCyberImplant(implant)),
            geneticModifications: (officer.geneticModifications || []).map(mod => this.serializeGeneticModification(mod)),
            ranks: this.serializeMapWithObjectKeys(officer.ranks),
            perks: (officer.perks || []).map(perk => perk ? perk.name : null).filter(x => x),
        };
    },

    /**
     * Serialize a Mission
     * @param {Mission} mission
     * @returns {Object}
     */
    serializeMission(mission) {
        if (!mission) return null;
        
        return {
            uuid: mission.uuid,
            description: mission.description,
            expirationDate: mission.expirationDate,
            amount: mission.amount,
            reward: mission.reward,
            amountFulfilled: mission.amountFulfilled,
            
            missionTypeName: mission.missionType ? mission.missionType.name : null,
            planetUUID: this.objectToUUID(mission.planet),
            targetPlanetUUID: this.objectToUUID(mission.targetPlanet),
            cargoTypeName: mission.cargoType ? mission.cargoType.name : null,
        };
    },

    /**
     * Serialize a Route
     * @param {Route} route
     * @returns {Object}
     */
    serializeRoute(route) {
        if (!route) return null;
        
        const serialized = {
            uuid: route.uuid,
            startYear: route.startYear,
            endYear: route.endYear,
            travelTime: route.travelTime,
            valid: route.valid,
            
            fleetUUID: this.objectToUUID(route.fleet),
            destinationUUID: this.objectToUUID(route.destination),
            
            path: route.path ? {
                startX: route.path.startX,
                startY: route.path.startY,
                toX: route.path.toX,
                toY: route.path.toY,
                normalize: route.path.normalize
            } : null
        };
        
        // Handle InterceptionRoute special case
        if (route instanceof InterceptionRoute && route.targetFleet) {
            serialized.isInterception = true;
            serialized.targetFleetUUID = this.objectToUUID(route.targetFleet);
            serialized.interceptionPoint = route.interceptionPoint;
            serialized.iterations = route.iterations;
        }
        
        return serialized;
    },

    /**
     * Serialize FleetAI
     * @param {FleetAI} fleetAI
     * @returns {Object}
     */
    serializeFleetAI(fleetAI) {
        if (!fleetAI) return null;
        
        return {
            fleetUUID: this.objectToUUID(fleetAI.fleet),
            originUUID: this.objectToUUID(fleetAI.origin),
            destinationUUID: this.objectToUUID(fleetAI.destination),
            targetUUID: this.objectToUUID(fleetAI.target),
            voyageYearsRemaining: fleetAI.voyageYearsRemaining,
            visited: this.serializeArray(fleetAI.visited),
        };
    },

    /**
     * Serialize Religion
     * @param {Religion} religion
     * @returns {Object}
     */
    serializeReligion(religion) {
        if (!religion) return null;
        
        return {
            uuid: religion.uuid,
            name: religion.name,
            color: religion.color,
            symbol: religion.symbol,
            traits: (religion.traits || []).map(trait => trait ? trait.name : null).filter(x => x),
        };
    },

    /**
     * Serialize News
     * @param {News} news
     * @returns {Object}
     */
    serializeNews(news) {
        if (!news) return null;
        
        return {
            uuid: news.uuid,
            startedName: news.startedName,
            endedName: news.endedName,
            failedName: news.failedName,
            cancelledName: news.cancelledName,
            durationYears: news.durationYears,
            startYear: news.startYear,
            endYear: news.endYear,
            started: news.started,
            ended: news.ended,
            failed: news.failed,
            cancelled: news.cancelled,
            endAsap: news.endAsap,
            endedYear: news.endedYear,
            
            newsTypeName: news.newsType ? news.newsType.name : null,
            planetUUID: this.objectToUUID(news.planet),
            targetPlanetUUID: this.objectToUUID(news.targetPlanet),
        };
    },

    /**
     * Serialize BankLoan
     * @param {BankLoan} loan
     * @returns {Object}
     */
    serializeBankLoan(loan) {
        if (!loan) return null;
        
        return {
            principal: loan.principal,
            interest: loan.interest,
            term: loan.term,
            startYear: loan.startYear,
            dueYear: loan.dueYear,
            outstandingBalance: loan.outstandingBalance,
            planetUUID: this.objectToUUID(loan.planet),
        };
    },

    /**
     * Serialize CyberImplant
     * @param {CyberImplant} implant
     * @returns {Object}
     */
    serializeCyberImplant(implant) {
        if (!implant) return null;
        
        return {
            implantTypeName: implant.implantType ? implant.implantType.name : null,
            quality: implant.quality || 1.0
        };
    },

    /**
     * Serialize GeneticModification
     * @param {GeneticModification} mod
     * @returns {Object}
     */
    serializeGeneticModification(mod) {
        if (!mod) return null;
        
        return {
            modificationTypeName: mod.modificationType ? mod.modificationType.name : null,
            quality: mod.quality || 1.0
        };
    },

    /**
     * Main deserialization function - reconstructs GameState from saved data
     * @param {Object} saveData - The saved data object
     * @returns {GameState} Reconstructed game state
     */
    deserializeGameState(saveData) {
        console.log('SaveManager: Starting deserialization...');
        const startTime = Date.now();

        try {
            // Clear and prepare registry
            gameRegistry.clear();
            
            // Create new GameState
            const gs = new GameState();
            
            // Restore basic properties
            gs.year = saveData.year || GAME_START_YEAR;
            gs.encounterImmunityUntilYear = saveData.encounterImmunityUntilYear || 0;
            gs.nextTitheYear = saveData.nextTitheYear || 0;
            gs.missions = [];
            
            // PASS 1: Deserialize StarSystem structure (stars, planets, etc. - already exist globally)
            // We use existing SOLAR_SYSTEM and just update dynamic data
            gs.system = SOLAR_SYSTEM;
            
            // PASS 2: Deserialize all entities (fleets, ships, officers, etc.)
            if (saveData.system) {
                this.deserializeStarSystemEntities(gs.system, saveData.system);
            }
            
            // PASS 3: Restore all cross-references (fleet->captain, ship->pilot, etc.)
            this.restoreCrossReferences(gs, saveData);
            
            // PASS 4: Restore GameState-level references
            gs.fleet = this.uuidToObject(saveData.fleetUUID, 'fleet');
            gs.missions = (saveData.missions || []).map(c => this.deserializeMission(c));
            
            // Restore maps (note: memorizedSettlements values need special handling)
            gs.memorizedSettlements = new Map();
            if (saveData.memorizedSettlements && Array.isArray(saveData.memorizedSettlements)) {
                for (const [planetUUID, settlementUUID] of saveData.memorizedSettlements) {
                    const planet = this.uuidToObject(planetUUID, 'planet');
                    const settlement = this.uuidToObject(settlementUUID, 'settlement');
                    if (planet && settlement) {
                        gs.memorizedSettlements.set(planet, settlement);
                    }
                }
            }
            gs.lastVisitedDates = this.deserializeMapWithObjectKeys(saveData.lastVisitedDates, 'planet');
            gs.lastSeenDates = this.deserializeMapWithObjectKeys(saveData.lastSeenDates, 'planet');
            
            const elapsed = Date.now() - startTime;
            console.log(`SaveManager: Deserialization complete in ${elapsed}ms`);
            
            return gs;
        } catch (error) {
            console.error('SaveManager: Deserialization error:', error);
            throw error;
        }
    },

    /**
     * Deserialize all entities in a StarSystem
     * @param {StarSystem} system
     * @param {Object} systemData
     */
    deserializeStarSystemEntities(system, systemData) {
        // Restore planet dynamic data (civilization, settlement)
        if (systemData.planetData && Array.isArray(systemData.planetData)) {
            for (const pData of systemData.planetData) {
                const planet = this.uuidToObject(pData.uuid, 'planet');
                if (planet) {
                    planet.civilization = this.uuidToObject(pData.civilizationUUID, 'civilization');
                    planet.settlement = this.uuidToObject(pData.settlementUUID, 'settlement');
                    if (pData.civilizationUUID && !planet.civilization) {
                        console.warn(`SaveManager: Failed to restore civilization for planet ${planet.name}`);
                    }
                    if (pData.settlementUUID && !planet.settlement) {
                        console.warn(`SaveManager: Failed to restore settlement for planet ${planet.name}`);
                    }
                }
            }
        }
        
        // Religions
        system.religions = (systemData.religions || []).map(r => this.deserializeReligion(r));
        
        // Fleets
        system.fleets = (systemData.fleets || []).map(f => this.deserializeFleet(f));
        system.abandonedFleets = (systemData.abandonedFleets || []).map(f => this.deserializeFleet(f));
        
        // News
        system.news = (systemData.news || []).map(n => this.deserializeNews(n));
        system.history = (systemData.history || []).map(n => this.deserializeNews(n));
    },

    /**
     * Deserialize a Fleet
     * @param {Object} data
     * @returns {Fleet}
     */
    deserializeFleet(data) {
        if (!data) return null;
        
        // Create fleet with basic properties
        const fleet = new Fleet(
            data.name,
            null, // planet will be restored later
            null, // fleetType will be restored later
            data.color,
            data.x,
            data.y
        );
        
        // Restore UUID (override generated one)
        fleet.uuid = data.uuid;
        gameRegistry.registerFleet(fleet);
        
        // Restore properties
        fleet.angle = data.angle;
        fleet.cloakLevel = data.cloakLevel || 0;
        fleet.destroyed = data.destroyed || false;
        fleet.abandonedYear = data.abandonedYear || null;
        fleet.originalName = data.originalName || null;
        
        fleet.fuel = data.fuel || 0;
        
        // Deserialize ships first
        fleet.ships = (data.ships || []).map(s => this.deserializeShip(s));
        
        // Deserialize officers
        fleet.officers = (data.officers || []).map(o => this.deserializeOfficer(o));
        
        // Restore cargo
        fleet.cargo = this.deserializeCountsMap(data.cargo, CARGO_TYPES);
        
        // Store UUIDs for later reference restoration
        fleet._planetUUID = data.planetUUID;
        fleet._locationUUID = data.locationUUID;
        fleet._fleetTypeName = data.fleetTypeName;
        fleet._flagshipUUID = data.flagshipUUID;
        fleet._captainUUID = data.captainUUID;
        fleet._destroyedBy = data.destroyedBy;
        fleet._routeData = data.route;
        fleet._fleetAIData = data.fleetAI;
        
        return fleet;
    },

    /**
     * Deserialize a Ship
     * @param {Object} data
     * @returns {Ship}
     */
    deserializeShip(data) {
        if (!data) return null;
        
        // Find ship type
        const shipType = this.findShipType(data.shipTypeName);
        
        // Create ship
        const ship = new Ship(
            data.name,
            shipType,
            data.color,
            data.hull,
            data.shields,
            data.lasers,
            data.engine,
            data.cargoSpace,
            data.radars,
            data.maxActionsPerTurn
        );
        
        // Restore UUID
        ship.uuid = data.uuid;
        gameRegistry.registerShip(ship);
        
        // Restore properties
        ship.actionsRemaining = data.actionsRemaining;
        ship.x = data.x;
        ship.y = data.y;
        ship.angle = data.angle;
        ship.escaped = data.escaped || false;
        // Only restore radiusModifier/widthModifier for AsteroidShips
        Object.assign(ship, {
            radiusModifier: data.radiusModifier || 1,
            widthModifier: data.widthModifier || 1,
            asteroidVertices: data.asteroidVertices || null,
        })
        
        // Restore modules
        ship.localModules = (data.localModules || []).map(m => this.deserializeShipModule(m));
        ship.moduleCooldowns = this.deserializeCountsMap(data.moduleCooldowns, SHIP_MODULE_TYPES);
        ship.statusEffects = this.deserializeCountsMap(data.statusEffects, STATUS_EFFECTS);
        
        // Store UUIDs for later reference restoration
        ship._fleetUUID = data.fleetUUID;
        ship._pilotUUID = data.pilotUUID;
        ship._disabledByShipUUID = data.disabledByShipUUID;
        ship._aiTypeName = data.aiTypeName;
        
        return ship;
    },

    /**
     * Deserialize a ShipModule
     * @param {Object} data
     * @returns {ShipModule}
     */
    deserializeShipModule(data) {
        if (!data) return null;
        
        const moduleType = this.findShipModuleType(data.moduleTypeName);
        if (!moduleType) return null;
        
        return new ShipModule(moduleType, data.quality || 1.0);
    },

    /**
     * Deserialize an Officer
     * @param {Object} data
     * @returns {Officer}
     */
    deserializeOfficer(data) {
        if (!data) return null;
        
        // Find types
        const religion = this.findReligion(data.religionName);
        
        // Create officer
        const officer = new Officer(
            data.name,
            null, // planet restored later
            null,
            null,
            religion,
            data.age,
            data.credits
        );
        
        // Restore UUID
        officer.uuid = data.uuid;
        gameRegistry.registerOfficer(officer);
        
        // Restore properties
        officer.level = data.level || 1;
        officer.skillPoints = data.skillPoints || 0;
        officer.numPerkPoints = data.numPerkPoints || 0;
        officer.expPoints = data.expPoints || 0;
        
        // Restore maps
        officer.reputation = this.deserializeCountsMap(data.reputation);
        officer.bounty = this.deserializeCountsMap(data.bounty);
        officer.skills = this.deserializeCountsMap(data.skills, SKILLS);
        officer.ranks = this.deserializeMapWithObjectKeys(data.ranks, 'planet', RANK_TYPES);
        
        // Restore arrays
        officer.loans = (data.loans || []).map(l => this.deserializeBankLoan(l));
        officer.implants = (data.implants || []).map(i => this.deserializeCyberImplant(i));
        officer.geneticModifications = (data.geneticModifications || []).map(m => this.deserializeGeneticModification(m));
        officer.perks = (data.perks || []).map(perkName => this.findPerkType(perkName)).filter(x => x);
        
        // Store UUIDs for later reference restoration
        officer._planetUUID = data.planetUUID;
        officer._fleetUUID = data.fleetUUID;
        
        return officer;
    },

    /**
     * Deserialize a Mission
     * @param {Object} data
     * @returns {Mission}
     */
    deserializeMission(data) {
        if (!data) return null;
        
        const missionType = this.findMissionType(data.missionTypeName);
        const planet = this.uuidToObject(data.planetUUID, 'planet');
        const targetPlanet = this.uuidToObject(data.targetPlanetUUID, 'planet');
        const cargoType = this.findCargoType(data.cargoTypeName);
        
        const mission = new Mission(
            missionType,
            planet,
            targetPlanet,
            data.expirationDate,
            cargoType,
            data.amount,
            data.reward,
        );
        
        mission.uuid = data.uuid;
        mission.amountFulfilled = data.amountFulfilled || 0;
        
        gameRegistry.registerMission(mission);
        return mission;
    },

    /**
     * Deserialize Religion
     * @param {Object} data
     * @returns {Religion}
     */
    deserializeReligion(data) {
        if (!data) return null;
        
        const traits = (data.traits || []).map(traitName => this.findReligionTrait(traitName)).filter(x => x);
        const religion = new Religion(data.name, traits, data.color, data.symbol);
        religion.uuid = data.uuid;
        
        gameRegistry.registerCivilization(religion); // Religions use civilization registry
        return religion;
    },

    /**
     * Deserialize News
     * @param {Object} data
     * @returns {News}
     */
    deserializeNews(data) {
        if (!data) return null;
        
        const newsType = this.findNewsType(data.newsTypeName);
        const planet = this.uuidToObject(data.planetUUID, 'planet');
        const targetPlanet = this.uuidToObject(data.targetPlanetUUID, 'planet');
        
        const news = new News(
            data.startedName || '',
            data.endedName || '',
            data.failedName || '',
            data.cancelledName || '',
            newsType,
            planet,
            targetPlanet
        );
        
        news.uuid = data.uuid;
        news.durationYears = data.durationYears;
        news.startYear = data.startYear;
        news.endYear = data.endYear;
        news.started = data.started;
        news.ended = data.ended;
        news.failed = data.failed;
        news.cancelled = data.cancelled;
        news.endAsap = data.endAsap;
        news.endedYear = data.endedYear;
        
        // Note: Effects are not restored since news events don't need to be re-executed after loading
        
        gameRegistry.registerNews(news);
        return news;
    },

    /**
     * Deserialize BankLoan
     * @param {Object} data
     * @returns {BankLoan}
     */
    deserializeBankLoan(data) {
        if (!data) return null;
        
        const planet = this.uuidToObject(data.planetUUID, 'planet');
        
        const loan = new BankLoan(
            data.principal,
            data.interest,
            data.term,
            data.startYear,
            planet
        );
        
        // Restore calculated/saved fields
        loan.dueYear = data.dueYear;
        loan.outstandingBalance = data.outstandingBalance;
        
        return loan;
    },

    /**
     * Deserialize CyberImplant
     * @param {Object} data
     * @returns {CyberImplant}
     */
    deserializeCyberImplant(data) {
        if (!data) return null;
        
        const implantType = this.findCyberImplantType(data.implantTypeName);
        if (!implantType) return null;
        
        return new CyberImplant(implantType, data.quality || 1.0);
    },

    /**
     * Deserialize GeneticModification
     * @param {Object} data
     * @returns {GeneticModification}
     */
    deserializeGeneticModification(data) {
        if (!data) return null;
        
        const modType = this.findGeneticModificationType(data.modificationTypeName);
        if (!modType) return null;
        
        return new GeneticModification(modType, data.quality || 1.0);
    },

    /**
     * Restore all cross-references after all entities are created
     * @param {GameState} gs
     * @param {Object} saveData
     */
    restoreCrossReferences(gs, saveData) {
        console.log('SaveManager: Restoring cross-references...');
        
        // Restore fleet references
        for (const fleet of gs.system.fleets.concat(gs.system.abandonedFleets || [])) {
            fleet.planet = this.uuidToObject(fleet._planetUUID, 'planet');
            fleet.location = this.uuidToObject(fleet._locationUUID, 'planet');
            fleet.fleetType = this.findFleetType(fleet._fleetTypeName);
            fleet.flagship = this.uuidToObject(fleet._flagshipUUID, 'ship');
            fleet.captain = this.uuidToObject(fleet._captainUUID, 'officer');
            
            // Handle destroyedBy (can be string or UUID)
            if (typeof fleet._destroyedBy === 'string' && !fleet._destroyedBy.includes('_')) {
                fleet.destroyedBy = fleet._destroyedBy;
            } else {
                fleet.destroyedBy = this.uuidToObject(fleet._destroyedBy, 'fleet');
            }
            
            // Restore route
            if (fleet._routeData) {
                fleet.route = this.deserializeRoute(fleet._routeData);
            }
            
            // Restore fleetAI
            if (fleet._fleetAIData) {
                fleet.fleetAI = this.deserializeFleetAI(fleet._fleetAIData);
            }
            
            // Restore ship->fleet references
            for (const ship of fleet.ships) {
                ship.fleet = fleet;
                ship.pilot = this.uuidToObject(ship._pilotUUID, 'officer');
                ship.disabledByShip = this.uuidToObject(ship._disabledByShipUUID, 'ship');
                ship.aiType = this.findAIType(ship._aiTypeName);
            }
            
            // Restore officer->fleet and officer->planet references
            for (const officer of fleet.officers) {
                officer.fleet = fleet;
                officer.planet = this.uuidToObject(officer._planetUUID, 'planet');
            }
        }
    },

    /**
     * Deserialize a Route
     * @param {Object} data
     * @returns {Route}
     */
    deserializeRoute(data) {
        if (!data) return null;
        
        const fleet = this.uuidToObject(data.fleetUUID, 'fleet');
        const destination = this.uuidToObject(data.destinationUUID, 'planet');
        
        if (!fleet || !destination) return null;
        
        // Check if this is an InterceptionRoute
        if (data.isInterception) {
            const targetFleet = this.uuidToObject(data.targetFleetUUID, 'fleet');
            if (!targetFleet) {
                console.warn('SaveManager: InterceptionRoute targetFleet not found, creating regular Route');
                // Fall through to regular route creation
            } else {
                // Create InterceptionRoute manually to restore state
                const route = Object.create(InterceptionRoute.prototype);
                route.uuid = data.uuid;
                route.fleet = fleet;
                route.destination = destination;
                route.startYear = data.startYear;
                route.endYear = data.endYear;
                route.travelTime = data.travelTime;
                route.valid = data.valid;
                route.isInterception = true;
                route.targetFleet = targetFleet;
                route.targetRouteAtCreation = targetFleet.route;
                route.interceptionPoint = data.interceptionPoint;
                route.iterations = data.iterations;
                
                if (data.path) {
                    route.path = new Path(
                        data.path.startX,
                        data.path.startY,
                        data.path.toX,
                        data.path.toY,
                        data.path.normalize
                    );
                }
                
                gameRegistry.registerRoute(route);
                return route;
            }
        }
        
        // Create regular route manually since constructor calculates path
        const route = Object.create(Route.prototype);
        route.uuid = data.uuid;
        route.fleet = fleet;
        route.destination = destination;
        route.startYear = data.startYear;
        route.endYear = data.endYear;
        route.travelTime = data.travelTime;
        route.valid = data.valid;
        
        if (data.path) {
            route.path = new Path(
                data.path.startX,
                data.path.startY,
                data.path.toX,
                data.path.toY,
                data.path.normalize
            );
        }
        
        gameRegistry.registerRoute(route);
        return route;
    },

    /**
     * Deserialize FleetAI
     * @param {Object} data
     * @returns {FleetAI}
     */
    deserializeFleetAI(data) {
        if (!data) return null;
        
        const fleet = this.uuidToObject(data.fleetUUID, 'fleet');
        const origin = this.uuidToObject(data.originUUID, 'planet');
        
        if (!fleet) return null;
        
        // Determine AI class from fleet type
        const fleetAIType = getFleetAITypeForFleetType(fleet.fleetType);
        const AIClass = fleetAIType ? fleetAIType.aiClass : FleetAI;
        
        // Create AI with proper constructor (fleet, origin, starMap)
        const fleetAI = new AIClass(fleet, origin, null);
        
        // Restore additional properties
        fleetAI.destination = this.uuidToObject(data.destinationUUID, 'planet');
        fleetAI.target = this.uuidToObject(data.targetUUID, 'planet');
        fleetAI.voyageYearsRemaining = data.voyageYearsRemaining || 0;
        fleetAI.visited = this.deserializeArray(data.visited || [], 'planet');
        
        return fleetAI;
    },

    // === Type Finder Helper Methods ===

    findShipType(name) {
        if (!name) return null;
        return Object.values(SHIP_TYPES).find(t => t.name === name) ||
               Object.values(ASTEROID_SHIP_TYPES).find(t => t.name === name) ||
               (name === 'Starting Ship' ? SHIP_TYPES.FRIGATE : null);
    },

    findShipModuleType(name) {
        if (!name) return null;
        return Object.values(SHIP_MODULE_TYPES).find(t => t.name === name);
    },

    findFleetType(name) {
        if (!name) return null;
        return Object.values(FLEET_TYPES).find(t => t.name === name);
    },

    findMissionType(name) {
        if (!name) return null;
        return Object.values(MISSION_TYPES).find(t => t.name === name);
    },

    findCargoType(name) {
        if (!name) return null;
        return Object.values(CARGO_TYPES).find(t => t.name === name);
    },

    findNewsType(name) {
        if (!name) return null;
        return Object.values(NT).find(t => t.name === name);
    },

    findEffectType(name) {
        if (!name) return null;
        return Object.values(EFFECT_TYPES).find(t => t.name === name);
    },

    findPerkType(name) {
        if (!name) return null;
        return Object.values(PERK_TYPES).find(t => t.name === name);
    },

    findReligionTrait(name) {
        if (!name) return null;
        return Object.values(RELIGION_TRAITS).find(t => t.name === name);
    },

    findCyberImplantType(name) {
        if (!name) return null;
        return CYBER_IMPLANT_TYPES_ALL.find(t => t.name === name);
    },

    findGeneticModificationType(name) {
        if (!name) return null;
        return GENETIC_MODIFICATION_TYPES_ALL.find(t => t.name === name);
    },

    findFleetAIType(name) {
        if (!name) return null;
        return Object.values(FLEET_AI_TYPES).find(t => t.name === name);
    },

    findAIType(name) {
        return name
        /*if (!name) return null;
        return Object.values(AI_TYPES).find(t => t.name === name);*/
    },

    /**
     * Get list of all saves
     * @returns {Array<{name: string, timestamp: number, year: number, captainName: string}>}
     */
    getSaveList() {
        const listJson = localStorage.getItem(this.SAVE_LIST_KEY);
        return listJson ? JSON.parse(listJson) : [];
    },

    /**
     * Update save list
     * @param {Array} saveList
     */
    setSaveList(saveList) {
        localStorage.setItem(this.SAVE_LIST_KEY, JSON.stringify(saveList));
    },

    /**
     * Save the current game to a named slot
     * @param {string} saveName - Name for this save
     * @returns {Object} Result with success flag, size, or error
     */
    saveGame(saveName = 'quicksave') {
        try {
            console.log(`SaveManager: Saving game as "${saveName}"...`);
            const saveData = this.serializeGameState(gs);
            
            // Add metadata
            saveData.saveName = saveName;
            saveData.captainName = gs.captain?.name || 'Unknown';
            
            const jsonString = JSON.stringify(saveData);
            
            // Check size
            const sizeKB = (jsonString.length / 1024).toFixed(2);
            console.log(`SaveManager: Save size: ${sizeKB} KB`);
            
            // Save to slot
            const saveKey = this.SAVE_KEY_PREFIX + saveName;
            localStorage.setItem(saveKey, jsonString);
            
            // Update save list
            let saveList = this.getSaveList();
            const existingIndex = saveList.findIndex(s => s.name === saveName);
            const saveInfo = {
                name: saveName,
                timestamp: saveData.timestamp,
                year: saveData.year,
                captainName: saveData.captainName
            };
            
            if (existingIndex >= 0) {
                saveList[existingIndex] = saveInfo;
            } else {
                saveList.push(saveInfo);
            }
            
            this.setSaveList(saveList);
            console.log('SaveManager: Game saved successfully!');
            
            // Mark as saved this tick
            gs.savedThisTick = true;
            
            return { success: true, size: sizeKB };
        } catch (error) {
            console.error('SaveManager: Save failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Load a game from a named slot
     * @param {string} saveName - Name of the save to load
     * @returns {GameState|null} The loaded game state or null if failed
     */
    loadGame(saveName = 'quicksave') {
        try {
            console.log(`SaveManager: Loading game "${saveName}"...`);
            const saveKey = this.SAVE_KEY_PREFIX + saveName;
            const jsonString = localStorage.getItem(saveKey);
            
            if (!jsonString) {
                console.warn(`SaveManager: No save data found for "${saveName}"`);
                return null;
            }
            
            const saveData = JSON.parse(jsonString);
            
            // Check version
            if (saveData.version !== this.SAVE_VERSION) {
                console.warn(`SaveManager: Save version mismatch (${saveData.version} vs ${this.SAVE_VERSION})`);
            }
            
            const loadedGs = this.deserializeGameState(saveData);
            console.log('SaveManager: Game loaded successfully!');
            
            return loadedGs;
        } catch (error) {
            console.error('SaveManager: Load failed:', error);
            return null;
        }
    },

    /**
     * Check if any saves exist
     * @returns {boolean}
     */
    hasSave() {
        return this.getSaveList().length > 0;
    },

    /**
     * Delete a saved game
     * @param {string} saveName - Name of the save to delete
     */
    deleteSave(saveName) {
        const saveKey = this.SAVE_KEY_PREFIX + saveName;
        localStorage.removeItem(saveKey);
        
        // Update save list
        let saveList = this.getSaveList();
        saveList = saveList.filter(s => s.name !== saveName);
        this.setSaveList(saveList);
        
        console.log(`SaveManager: Save "${saveName}" deleted`);
    }
};

console.log('SaveManager loaded');
