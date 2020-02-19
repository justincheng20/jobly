process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/companyModel");

const testCompany1 = {
    handle: "testHandle",
    name: "testName",
    num_employees: 1,
    description: "test description",
    logo_url: "testLogoUrl.com"
}

const testCompany2 = {
    handle: "test2Handle2",
    name: "test2Name2",
    num_employees: 2,
    description: "test description 2",
    logo_url: "testLogoUrl2.com"
}

describe("Company Routes Test", function () {

    beforeEach(async function () {
        await db.query("DELETE FROM companies");
        await Company.make(testCompany1);
        await Company.make(testCompany2);
    });

    describe("GET /companies", function () {
        test("Can get all companies", async function () {
            let resp = await request(app).get("/companies");
            expect(resp.body).toEqual({ companies: [testCompany1, testCompany2] });
        });

        test("Can filter companies by number of minimum employees", async function () {
            let query = "?min_employees=2";
            let resp = await request(app).get(`/companies${query}`);
            expect(resp.body).toEqual({ companies: [testCompany2] });
        });

        test("Can filter companies by number of maximum employees", async function () {
            let query = "?max_employees=1";
            let resp = await request(app).get(`/companies${query}`);
            expect(resp.body).toEqual({ companies: [testCompany1] });
        });

        test("Returns error when max < min in query", async function () {
            let query = "?min_employees=2&max_employees=1";
            let resp = await request(app).get(`/companies${query}`);
            expect(resp.body).toEqual({ message: expect.any(String), status: 400 });
        });

        test("Can filter by search term", async function () {
            let query = "?searchTerm=stna";
            let resp = await request(app).get(`/companies${query}`);
            expect(resp.body).toEqual({ companies: [testCompany1] });
        });
    });


    describe("POST /companies", function () {
        test("Can make a new company", async function () {
            let testCompany3 = {
                handle: "test3Handle3",
                name: "test3Name3",
                num_employees: 3,
                description: "test description3",
                logo_url: "testLogoUrl3.com"
            }

            let resp = await request(app)
                .post("/companies")
                .send(testCompany3);

            expect(resp.body).toEqual({ company: testCompany3 });
        });

        test("Can not make company with invalid input", async function () {
            let invalidCompany = { num_employees: "3" }
            let resp = await request(app)
                .post("/companies")
                .send(invalidCompany);

            expect(resp.body).toEqual({ message: expect.any(Array), status: 400 })
            expect(resp.body.message.length).toEqual(3);
        });
    });

    describe("Get /company:handle", function () {
        test("Can get a company by its handle", async function () {
            let handle = testCompany1.handle;
            let resp = await request(app).get(`/companies/${handle}`);
            expect(resp.body).toEqual({ company: testCompany1 });
        });

        test("Returns 404 error on invalid handle", async function () {
            let handle = "invalidHandle";
            let resp = await request(app).get(`/companies/${handle}`);
            expect(resp.body).toEqual({ message: expect.any(String), status: 404 });
        });
    });

});

afterAll(async function () {
    await db.end();
});