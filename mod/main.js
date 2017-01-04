var harvesterGui = new UI.StandartWindow({
    standart: {
        header: {text: {text: "Crop Harvester"}},
        inventory: {standart: true},
        background: {standart: true}
    },
    
    drawing: [
		{type: "bitmap", x: 614, y: 50, bitmap: "harvester_liquid_scale_background", scale: 5.9375}
    ],
    
    elements: {
		"seedSlot0": {type: "slot", x: 350, y: 50},
		"seedSlot1": {type: "slot", x: 415, y: 50},
		"seedSlot2": {type: "slot", x: 480, y: 50},
		"seedSlot3": {type: "slot", x: 350, y: 115},
		"seedSlot4": {type: "slot", x: 415, y: 115},
		"seedSlot5": {type: "slot", x: 480, y: 115},
		"seedSlot6": {type: "slot", x: 350, y: 180},
		"seedSlot7": {type: "slot", x: 415, y: 180},
		"seedSlot8": {type: "slot", x: 480, y: 180},
		
		"resultSlot0": {type: "slot", x: 760, y: 50},
		"resultSlot1": {type: "slot", x: 825, y: 50},
		"resultSlot2": {type: "slot", x: 890, y: 50},
		"resultSlot3": {type: "slot", x: 760, y: 115},
		"resultSlot4": {type: "slot", x: 825, y: 115},
		"resultSlot5": {type: "slot", x: 890, y: 115},
		"resultSlot6": {type: "slot", x: 760, y: 180},
		"resultSlot7": {type: "slot", x: 825, y: 180},
		"resultSlot8": {type: "slot", x: 890, y: 180},
		
		"compostSlot0": {type: "slot", y: 270, x: 350},
		"compostSlot1": {type: "slot", y: 270, x: 415},
		"compostSlot2": {type: "slot", y: 270, x: 480},
		
		"liquidScale": {type: "scale", x: 620, y: 56, bitmap: "harvester_liquid_scale", direction: 1, scale: 5.9375}
    }
});


Block.setPrototype("cropHarvester", {
	type: Block.TYPE_ROTATION,
	
	getVariations: function(){
		return [{ 
			name: "Crop Harvester", 
			texture: [
				["harvester_bottom", 0],
				["harvester_top", 0],
				["harvester_back", 0],
				["harvester_front", 0],
				["harvester_side", 0],
				["harvester_side", 0]
			],
			inCreative: true
		}, { 
			name: "Crop Harvester",
			texture: [
				["harvester_bottom", 0],
				["harvester_top", 0],
				["harvester_back", 0],
				["harvester_front", 1],
				["harvester_side", 0],
				["harvester_side", 0]
			],
			inCreative: false
		}];
	}
});

TileEntity.registerPrototype(BlockID.cropHarvester, {
	isCropHarvester: true,
	defaultValues: {
		index: 0
	},
	
	getGuiScreen: function(){
		return harvesterGui;
	},
	
	tick: function(){
		this.liquidStorage.updateUiScale("liquidScale", "water");
		
		var farmlandCoords = this.findFarmland();
		if (farmlandCoords){
			var block = World.getBlock(farmlandCoords.x, farmlandCoords.y + 1, farmlandCoords.z);
			var CROPS = {
				59: [[296, 1, 0], [295, parseInt(1 + Math.random() * 3), 0]],
				141: [[391, parseInt(1 + Math.random() * 3), 0]],
				142: [[392, parseInt(1 + Math.random() * 3), 0]],
				244: [[457, 1, 0], [458, parseInt(1 + Math.random() * 3), 0]]
			};
			var SEEDS = {
				295: 59,
				391: 141,
				392: 142,
				458: 244
			};
			
			if (CROPS[block.id]){
				if (block.data >= 7){
					this.addDroneTask({x: farmlandCoords.x + .5, y: farmlandCoords.y + 1.5, z: farmlandCoords.z + .5}, function(drone){
						World.destroyBlock(farmlandCoords.x, farmlandCoords.y + 1, farmlandCoords.z);
						var drop = CROPS[block.id];
						
						if (drop[0]){
							drone.setCarriedDrop(drop[0][0], drop[0][1], drop[0][2]);
						}
						
						drone.addTask(drone.origin, function(){
							for (var i in drop){
								this.addResult(SEEDS[drop[i][0]] ? "seedSlot" : "resultSlot", drop[i][0], drop[i][1], drop[i][2]);
							}
							drone.setCarriedDrop(0, 0, 0);
						});
					});
				}
				else{
					var COMPOST = {
						351: {data: 15, value: 4}
					};
					COMPOST[ItemID.advancedCompost] = {data: 0, value: 8};
					
					if (this.getWater(0.5)){
						var compost = this.getCompostItem(COMPOST);
						this.addDroneTask({x: farmlandCoords.x + .5, y: farmlandCoords.y + 2.6, z: farmlandCoords.z + .5}, function(drone){
							if (compost){
								World.setBlock(farmlandCoords.x, farmlandCoords.y + 1, farmlandCoords.z, block.id, Math.min(7, block.data + COMPOST[compost.id].value));
								drone.setCarriedDrop(0, 0, 0);
							}
							this.waterFarmland(drone, farmlandCoords, CROPS);
						}, function(drone){
							if (compost){
								drone.setCarriedDrop(compost.id, 1, compost.data);
							}
						});
					}
				}
			}
			else if (block.id == 0){
				var seed = this.getSeedItem(SEEDS);
				if (seed){
					this.addDroneTask({x: farmlandCoords.x + .5, y: farmlandCoords.y + 1.5, z: farmlandCoords.z + .5}, function(drone){
						World.setBlock(farmlandCoords.x, farmlandCoords.y + 1, farmlandCoords.z, SEEDS[seed.id], 0);
						drone.setCarriedDrop(0, 0, 0);
					}, function(drone){
						drone.setCarriedDrop(seed.id, 1, 0);
					});
				}
			}
			
			if (World.getBlockData(farmlandCoords.x, farmlandCoords.y, farmlandCoords.z) == 0){
				if (this.getWater(0.3)){
					this.addDroneTask({x: farmlandCoords.x + .5, y: farmlandCoords.y + 2.6, z: farmlandCoords.z + .5}, function(drone){
						this.waterFarmland(drone, farmlandCoords, CROPS);
					});
				}
			}
		}
	},
	
	findFarmland: function(){
		var RANGE = 9;
		var pos = this.data.index % (RANGE * RANGE);
		var x = this.x - parseInt(RANGE / 2) + pos % RANGE;
		var z = this.z - parseInt(RANGE / 2) + parseInt(pos / RANGE);
		this.data.index++;
		
		for (var y = this.y - 3; y < this.y + 4; y++){
			if (World.getBlockID(x, y, z) == 60){
				return {
					x: x,
					y: y,
					z: z
				};
			}
		}
		return null;
	},
	
	addResult: function(area, id, count, data){
		for (var i = 0; i < 9; i++){
			var slot = this.container.getSlot(area + i);
			if (slot.id == id && slot.data == data || slot.id == 0){
				var add = Math.min(64 - slot.count, count);
				slot.count += add;
				slot.id = id;
				slot.data = data;
				count -= add;
				if (count == 0){
					break;
				}
			}
		}
		if (count > 0){
			World.drop(this.x + .5, this.y + 1, this.z + .5, id, count, data);
		}
	},
	
	getSeedItem: function(seedItems){
		for (var i = 0; i < 9; i++){
			var slot = this.container.getSlot("seedSlot" + i);
			if (seedItems[slot.id]){
				var seed = {id: slot.id, data: slot.data};
				slot.count--;
				this.container.validateAll();
				return seed;
			}
		}
		return null;
	},
	
	getCompostItem: function(compostItems){
		for (var i = 0; i < 9; i++){
			var slot = this.container.getSlot("compostSlot" + i);
			var data = compostItems[slot.id];
			if (data && data.data == slot.data){
				var compost = {id: slot.id, data: slot.data};
				slot.count--;
				this.container.validateAll();
				return compost;
			}
		}
		return null;
	},
	
	waterFarmland: function(drone, farmlandCoords, crops){
		drone.setWait(60, function(drone, timeLeft){
			if (timeLeft > 35){
				for (var i = 0; i < 3; i++){
					Particles.addParticle(drone.pos.x + (Math.random() - .5) * .2, drone.pos.y, drone.pos.z + (Math.random() - .5) * .2, Native.ParticleType.dripWater, 0, 0, 0);
				}
			}
			if (timeLeft == 0){
				var crop = World.getBlock(farmlandCoords.x, farmlandCoords.y + 1, farmlandCoords.z);
				if (crops[crop.id]){
					World.setBlock(farmlandCoords.x, farmlandCoords.y + 1, farmlandCoords.z, crop.id, crop.data + 1);
				}
				for (var x = farmlandCoords.x - 1; x < farmlandCoords.x + 2; x++){
					for (var z = farmlandCoords.z - 1; z < farmlandCoords.z + 2; z++){
						if (World.getBlockID(x, farmlandCoords.y, z) == 60){
							World.setBlock(x, farmlandCoords.y, z, 60, 1);
						}
					}
				}
			}
		});
	},
	
	getWater: function(amount){
		var got = this.liquidStorage.getLiquid("water", amount, true);
		return got > 0;
	},
	
	
	// ----------- DRONES --------------
	createDrones: function(amount){
		this.drones = [];
		for (var i = 0; i < amount; i++){
			var coords = {x: this.x + Math.random(), y: this.y + Math.random() * .8 + 1.25, z: this.z + Math.random()};
			var drone = new HarvestDrone(this, coords);
			drone.init();
			this.drones.push(drone);
		}
	},
	
	init: function(){
		this.createDrones(3);
		this.liquidStorage.setLimit("water", 16);
	},
	
	destroy: function(){
		for (var i in this.drones){
			this.drones[i].destroy();
		}
	},
	
	
	addDroneTask: function(coords, task1, task2){
		var freeDrone = null;
		for (var i in this.drones){
			var drone = this.drones[i];
			if (!drone.isInProgress()){
				freeDrone = this.drones[i];
				break;
			}
			else if (drone.currentTask) {
				var target = drone.currentTask.target;
				if (target.x == coords.x && target.y == coords.y && target.z == coords.z){
					return;
				}
			}
		}
		
		if (freeDrone){
			freeDrone.addTask(coords, task1, task2);
			freeDrone.addTask(freeDrone.origin);
		}
	},
});


Block.setPrototype("harvesterPump", {
	type: Block.TYPE_BASE,
	
	getVariations: function(){
		return [{ 
			name: "Harvester Pump", 
			texture: [
				["harvester_bottom", 0],
				["pump_top", 0],
				["pump_side", 0],
				["pump_side", 0],
				["pump_side", 0],
				["pump_side", 0]
			],
			inCreative: true
		}];
	}
});

TileEntity.registerPrototype(BlockID.harvesterPump, {
	tick: function(){
		if (World.getThreadTime() % 20 == 0){
			this.harvester = World.getTileEntity(this.x, this.y + 1, this.z);
			if (this.liquidStorage.isEmpty()){
				var tile = World.getBlock(this.x, this.y - 1, this.z);
				if ((tile.id == 8 || tile.id == 9) && tile.data == 0){
					this.liquidStorage.addLiquid("water", 1);
					World.setBlock(this.x, this.y - 1, this.z, 0, 0);
				}
			}
		}
		
		if (this.harvester && this.harvester.isCropHarvester){
			var targetStorage = this.harvester.liquidStorage;
			var got = this.liquidStorage.getLiquid("water", 0.05);
			var left = targetStorage.addLiquid("water", got);
			this.liquidStorage.addLiquid("water", left);
		}
	}
});


Item.setPrototype("harvestDrone", {
	getTexture: function(){
		return {name: "harvest_drone"};
	},
	
	getName: function(){
		return "Harvest Drone";
	},
	
	getParams: function(){
		return {isTech: true}
	}
});


function HarvestDrone(harvester, coords){
	this.harvester = harvester;
	this.pos = coords;
	this.origin = {
		x: coords.x,
		y: coords.y,
		z: coords.z,
	};
	
	this.init = function(){
		this.animation1 = new Animation.Item(coords.x, coords.y, coords.z);
		this.animation1.describeItem({
			id: ItemID.harvestDrone,
			count: 1,
			data: 0,
			rotation: "x",
			size: .9
		});
		this.animation1.load();
		
		this.animation2 = new Animation.Item(coords.x, coords.y, coords.z);
		this.animation2.describeItem({
			id: ItemID.harvestDrone,
			count: 1,
			data: 0,
			rotation: "z",
			size: .9
		});
		this.animation2.load();
		
		Updatable.addUpdatable(this);
	}
	
	this.setCarriedDrop = function(id, count, data){
		if (this.animation3){
			this.animation3.destroy();
			this.animation3 = null;
		}
		if (id > 0 && count > 0){
			this.animation3 = new Animation.Item(coords.x, coords.y - .25, coords.z);
			this.animation3.describeItem({
				id: id,
				count: count,
				data: data,
				rotation: Math.random() > .5 ? "x" : "z",
				size: 1
			});
			this.animation3.load();
		}
	}
	
	this.setWait = function(time, func){
		this.waitingTime = time;
		this.waitingFunc = func;
	}
	
	this.waitingFunc = null;
	this.waitingTime = 0;
	this.currentTask = null;
	this.update = function(){
		this.animation1.setPos(this.pos.x, this.pos.y, this.pos.z);
		this.animation2.setPos(this.pos.x, this.pos.y, this.pos.z);
		if (this.animation3){
			this.animation3.setPos(this.pos.x, this.pos.y - .25, this.pos.z);
		}
		
		if (this.waitingTime-- > 0){
			if (this.waitingFunc){
				this.waitingFunc.apply(this.harvester, [this, this.waitingTime]);
			}
			return;
		}
		
		if (this.currentTask == null){
			this.currentTask = this.queue.shift();
			if (this.currentTask && this.currentTask.func2){
				this.currentTask.func2.apply(this.harvester, [this]);
			}
		}
		if (this.currentTask){
			var target = this.currentTask.target;
			var delta = {
				x: target.x - this.pos.x,
				y: target.y - this.pos.y,
				z: target.z - this.pos.z,
			};
			var dis = Math.sqrt(delta.x * delta.x + delta.y * delta.y + delta.z * delta.z);
			if (dis < 0.2){
				if (this.currentTask.func1){
					this.currentTask.func1.apply(this.harvester, [this]);
				}
				this.currentTask = null;
			}
			
			var speed = Math.min(0.05, dis);
			this.pos.x += delta.x / dis * speed;
			this.pos.y += delta.y / dis * speed;
			this.pos.z += delta.z / dis * speed;
		}
	}
	
	this.queue = [];
	this.addTask = function(target, func1, func2){
		this.queue.push({
			target: target,
			func1: func1,
			func2: func2
		});
	}
	
	this.isInProgress = function(){
		return this.queue.length > 0;
	}
	
	this.destroy = function(){
		this.remove = true;
		this.animation1.destroy();
		this.animation2.destroy();
		if (this.animation3){
			this.animation3.destroy();
		}
	}
}






Item.setPrototype("advancedCompost", {
	getTexture: function(){
		return {name: "compost"};
	},
	
	getName: function(){
		return "Compost";
	}
});


Recipes.addShaped({id: ItemID.advancedCompost, count: 8, data: 0}, [
	"xxx",
	"xax",
	"xxx"
], ["x", 351, 15, "a", 3, 0]);

Recipes.addShaped({id: BlockID.harvesterPump, count: 1, data: 0}, [
	"   ",
	"bxb",
	"xax"
], ["x", 265, 0, "a", 325, 0, "b", 331, 0]);

Recipes.addShaped({id: BlockID.cropHarvester, count: 1, data: 0}, [
	"bbb",
	"xax",
	"xax"
], ["x", 265, 0, "a", 20, 0, "b", 331, 0]);


