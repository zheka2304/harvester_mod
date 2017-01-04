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