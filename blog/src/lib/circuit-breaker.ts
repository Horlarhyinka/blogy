import {httpRequest} from "./factory"

enum states {open = "OPEN", close = "CLOSE", half = "HALF"}

interface Breaker_Int{
    state: endpoint_type
    callService: (options: {url: string, method: string, data?: object})=>Promise<any>
}

type endpoint_type = {[endpoint: string]: {
        failures: number
        state: states
        nextTry: number
    }}

class Breaker implements Breaker_Int{
    state: endpoint_type = {};
    constructor(
        private failureTreshold = 3,
        private cooldown = 10

    ){ }
    private initialize = (endpoint: string)=>{
        this.state[endpoint] = {failures: 0, state: states.close, nextTry: Date.now()/1000 + 15}
    }
    private failed = (endpoint: string)=>{
        const state = this.state[endpoint]
        state.failures += 1
        const now = Date.now() /1000
        if(state.failures >= this.failureTreshold){
            state.state = states.open
            state.nextTry = this.cooldown + now
        }else{
            state.state = states.half
        }
    }

    private success = (endpoint: string)=>{
        this.initialize(endpoint)
    }

    private canMakeRequest = (endpoint: string)=>{
        if(!this.state[endpoint]){
            this.initialize(endpoint)
        }
        const state = this.state[endpoint]
        if(state.state === states.close){
            return true;
        }
        const now = Date.now() / 1000
        if(state.state === states.open){
            if(now > state.nextTry){
                this.initialize(endpoint)
                return true
            }
            return false
        }
        return true

    }

    callService = async(options: {url: string, method: string, data?: object})=>{
        const HTTP_SERVER_ERR_STATUS="5"
            const endpoint = options.method! + options.url
            if(!this.state[endpoint])this.initialize(endpoint);
            if(!this.canMakeRequest(endpoint))return false
            try{
                const res = await httpRequest(options)
                if(String(res.status)[0] === HTTP_SERVER_ERR_STATUS)throw Error(res.data);
                this.success(endpoint)
                return res
            }catch(err: any){
                this.failed(endpoint)
                console.log(`${options.method} for ${options.url} failed: `, err)
                return err.response?.data || false
            }
            
    }
}

export default Object.freeze(new Breaker())