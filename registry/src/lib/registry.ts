import semver from "semver"

interface Registry_Int{
    services: {
        [key: string]: service_type
    }
    getService: (name: string, version: string)=>service_type
    register: (name: string, version: string, ip: string, port: number)=>service_type
    unregister: (name: string, version: string, ip: string, port: number)=>service_type
}

type service_type = {
            name: string
            version: string
            ip: string
            port: number
            timestamp: number
        }

class Registry implements Registry_Int{
    services: {[key: string]:service_type} = {}

    private expiresIn = 30

    private cleanup = () =>{
        const now = Date.now() / 1000
        Object.keys(this.services).forEach(key=>{
            if(this.services[key].timestamp <= now){
                delete this.services[key]
            }
        })
    }

    register = (name: string, version: string, ip: string, port: number) =>{
        this.cleanup()
        const key = name + version + ip + port;
        const now = Date.now() / 1000
        if(this.services[key]){
            this.services[key].timestamp = now + this.expiresIn
            console.log(`service ${name} v${version} registered`)
            return this.services[key]
        }
        this.services[key] = {name, version, ip, port, timestamp: now + this.expiresIn}
        return this.services[key]
    }
    unregister= (name: string, version: string, ip: string, port: number) =>{
        this.cleanup()
        const key = name + version + ip + port;
        const target = this.services[key]
        delete this.services[key]
        console.log(`${key} - unregistered`)
        return target
    }
    getService = (name: string, version: string) =>{
        this.cleanup()
        const filtered = Object.values(this.services).filter(service => service.name === name && semver.satisfies(version, service.version))
        const indx = Math.floor(Math.random() * filtered.length)
        return filtered[indx]
    }
}

export default Object.freeze(new Registry())