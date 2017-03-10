class NetMessage {
	constructor(type, data) {
		this.type = type;
		this.data = data;
	}
	json() {
		return JSON.stringify(this);
	}
}

export default NetMessage;
