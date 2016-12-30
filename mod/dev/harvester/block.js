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
	defaultValues: {
		index: 0
	},
	
	getGuiScreen: function(){
		return harvesterGui;
	},
	
	tick: function(){
		var farmlandCoords = this.findFarmland();
		if (farmlandCoords){
			var block = World.getBlock(farmlandCoords.x, farmlandCoords.y + 1, farmlandCoords.z);
			var CROPS = {
				59: [[296, 1, 0], [295, parseInt(1 + Math.random() * 3), 0]],
				141: true,
				142: true,
				244: true
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
					
					var compost = this.getCompostItem(COMPOST);
					if (compost){
						this.addDroneTask({x: farmlandCoords.x + .5, y: farmlandCoords.y + 2.6, z: farmlandCoords.z + .5}, function(drone){
							World.setBlock(farmlandCoords.x, farmlandCoords.y + 1, farmlandCoords.z, block.id, Math.min(7, block.data + COMPOST[compost.id].value));
							drone.setCarriedDrop(0, 0, 0);
							this.waterFarmland(drone, farmlandCoords);
						}, function(drone){
							drone.setCarriedDrop(compost.id, 1, compost.data);
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
				this.addDroneTask({x: farmlandCoords.x + .5, y: farmlandCoords.y + 2.6, z: farmlandCoords.z + .5}, function(drone){
					this.waterFarmland(drone, farmlandCoords);
				});
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
	
	waterFarmland: function(drone, farmlandCoords){
		drone.setWait(60, function(drone, timeLeft){
			if (timeLeft > 35){
				for (var i = 0; i < 3; i++){
					Particles.addParticle(drone.pos.x + (Math.random() - .5) * .2, drone.pos.y, drone.pos.z + (Math.random() - .5) * .2, Native.ParticleType.dripWater, 0, 0, 0);
				}
			}
			if (timeLeft == 0){
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