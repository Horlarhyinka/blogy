import Request from "supertest";
import server from "../../service";

const serviceObj = {
    name: "service",
    version: "1.0.0",
    port: 3001,
    ip: "127.0.0.7"
}
describe("service/register", ()=>{
const url = `/services/register/${serviceObj.name}/${serviceObj.version}/${serviceObj.port}`
    it("should register a service.", async()=>{
        const response = await Request(server).put(url)
        expect(response.body.ip).toBeDefined()
    })
})

describe("service/getService", ()=>{
    it("should return a service", async()=>{
        const r1 = await Request(server).put(`/services/register/${serviceObj.name}/${serviceObj.version}/${serviceObj.port}`)
        const response = await Request(server).get(`/services/${r1.body?.name}/${r1.body?.version}`)
        expect(response.body.ip).toBeDefined()
    })
    it("should return status 503 if service is unavailable", async()=>{
        const response = await Request(server).get(`/services/name/1.0.0`)
        expect(response.statusCode).toBe(503)
    })
})