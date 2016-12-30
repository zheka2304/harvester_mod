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




