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