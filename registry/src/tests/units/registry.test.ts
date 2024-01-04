import registry from "../../lib/registry";

        const serviceObj = {
            ip: "127.0.0.1",
            port: 3000,
            version: "2.1.1",
            name: "test"
        }

describe("registry/register", ()=>{
    it("should register a new service", ()=>{
        const registeredService = registry.register(serviceObj.name, serviceObj.version, serviceObj.ip, serviceObj.port)
        expect(registeredService).toMatchObject(serviceObj)
    })
})

describe("registry/getService", ()=>{
    it("should return service if service exists", ()=>{
        const registeredService = registry.register(serviceObj.name, serviceObj.version, serviceObj.ip, serviceObj.port)
        expect(registry.getService(serviceObj.name, serviceObj.version)).toMatchObject(registeredService)
    })
    it("should return null if service name is incorrect", ()=>{
        const service404 = {...serviceObj, name: "thisservicedoesnotexist"}
        expect(registry.getService(service404.name, service404.version)).not.toBeDefined()
    })
    it("should return undefined if service version does not match", ()=>{
        const service404 = {...serviceObj, version: "3.0.0"}
        expect(registry.getService(service404.name, service404.version)).not.toBeDefined()
    })
})

describe("registry/unregister", ()=>{
    it("should remove service from registry", ()=>{
        registry.register(serviceObj.name, serviceObj.version, serviceObj.ip, serviceObj.port)
        registry.unregister(serviceObj.name, serviceObj.version, serviceObj.ip, serviceObj.port)
        expect(registry.getService(serviceObj.name, serviceObj.version)).not.toBeDefined()
    })
})