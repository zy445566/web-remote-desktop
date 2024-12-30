import { v1 as uuidv1 } from 'uuid';

export class InvokeWebSocketClient {
    constructor() {
        this.ws = new WebSocket(`ws://${window.location.host}${window.location.pathname}`)
        this.invokeMap = {}
        this.ws.onmessage = (e) => {
            const data = JSON.parse(e.data)
            if (this.invokeMap[data.id]) {
                try {
                    if (data.error) { return this.invokeMap[data.id].reject(data.error) }
                    return this.invokeMap[data.id].resolve(data.result)
                } finally {
                    delete this.invokeMap[data.id]
                }
            }
        }
    }

    onopen() {
        return new Promise((resolve) => {
            this.ws.onopen = () => {
                resolve()
            }
        })
    }

    close() {
        this.ws.close()
    }

    invoke(command, params) {
        return new Promise((resolve, reject) => {
            const id = uuidv1();
            this.ws.send(JSON.stringify({ id, command, params }));
            this.invokeMap[id] = { resolve, reject }
        })
    }
}