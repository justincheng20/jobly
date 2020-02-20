process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/companyModel");

let testCompany1;
let testCompany2;

describe("Company Routes Test", function () {

    beforeEach(async function () {
        await db.query("DELETE FROM companies");
        testCompany1 = await Company.create({
            handle: "testHandle",
            name: "testName",
            num_employees: 1,
            description: "test description",
            logo_url: "testLogoUrl.com"
        });
        testCompany2 = await Company.create({
            handle: "test2Handle2",
            name: "test2Name2",
            num_employees: 2,
            description: "test description 2",
            logo_url: "testLogoUrl2.com"
        });
    });

    describe("GET /companies", function () {
        test("Can get all companies", async function () {
            let resp = await request(app).get("/companies");
            expect(resp.body).toEqual({ companies: expect.any(Array) });
            expect(resp.body.companies.length).toBe(2);
        });

        test("Can filter companies by number of minimum employees", async function () {
            let query = "?min_employees=2";
            let resp = await request(app).get(`/companies${query}`);
            expect(resp.body).toEqual({ companies: expect.any(Array) });
            expect(resp.body.companies.length).toBe(1);
        });

        test("Can filter companies by number of maximum employees", async function () {
            let query = "?max_employees=1";
            let resp = await request(app).get(`/companies${query}`);
            expect(resp.body).toEqual({ companies: expect.any(Array) });
            expect(resp.body.companies.length).toBe(1);
        });

        test("Returns error when max < min in query", async function () {
            let query = "?min_employees=2&max_employees=1";
            let resp = await request(app).get(`/companies${query}`);
            expect(resp.body).toEqual({ message: expect.any(String), status: 400 });
        });

        test("Can filter by search term", async function () {
            //testName vs test2Name2
            //  ^^^^        ^^ ^^
            let query = "?searchTerm=stna";
            let resp = await request(app).get(`/companies${query}`);
            expect(resp.body).toEqual({ companies: expect.any(Array) });
            expect(resp.body.companies.length).toBe(1);
        });
    });


    describe("POST /companies", function () {
        test("Can create a new company", async function () {
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

            const allCompanies = await Company.getCompanies({});

            expect(resp.body).toEqual({ company: testCompany3 });
            expect(allCompanies.length).toBe(3);
        });

        test("Can not create company with invalid input", async function () {
            let invalidCompany = { num_employees: "3" }
            let resp = await request(app)
                .post("/companies")
                .send(invalidCompany);

            expect(resp.body).toEqual({ message: expect.any(Array), status: 400 })
            expect(resp.body.message.length).toEqual(3);
        });
    });

    describe("Get /companies/:handle", function () {
        test("Can get a company by its handle", async function () {
            let handle = testCompany1.handle;
            let expectedData = {...testCompany1, jobs: []}
            let resp = await request(app).get(`/companies/${handle}`);
            expect(resp.body).toEqual({ company: expectedData });
        });

        test("Returns 404 error on invalid handle", async function () {
            let handle = "invalidHandle";
            let resp = await request(app).get(`/companies/${handle}`);
            expect(resp.body).toEqual({ message: expect.any(String), status: 404 });
        });
    });

    describe("PATCH /companies/:handle", function () {
        test("Can patch company with a full object", async function () {
            let testCompany3 = {
                handle: "test3Handle3",
                name: "test3Name3",
                num_employees: 3,
                description: "test description3",
                logo_url: "testLogoUrl3.com"
            }
            let handle = testCompany1.handle;
            let resp = await request(app)
                .patch(`/companies/${handle}`)
                .send(testCompany3);

            expect(resp.body).toEqual({ company: testCompany3 });
        });

        test("Can patch company with partial data", async function () {
            let smallChange = {
                description: "description test!"
            };
            let expected = {
                ...testCompany1
            };
            expected.description = smallChange.description;

            let handle = testCompany1.handle;
            let resp = await request(app)
                .patch(`/companies/${handle}`)
                .send(smallChange);

            expect(resp.body).toEqual({ company: expected });
        });

        test("Returns 404 error on invalid handle", async function () {
            let handle = "invalidHandle";
            let resp = await request(app)
                .patch(`/companies/${handle}`)
                .send({
                    handle: "test3Handle3",
                    name: "test3Name3",
                    num_employees: 3,
                    description: "test description3",
                    logo_url: "testLogoUrl3.com"
                });
            expect(resp.body).toEqual({ message: expect.any(String), status: 404 });
        });

        test("Returns 400 error on invalid info", async function () {
            let invalidChange = { num_employees: "3" }
            let handle = testCompany1.handle;
            let resp = await request(app)
                .patch(`/companies/${handle}`)
                .send(invalidChange);

            expect(resp.body).toEqual({ message: expect.any(Array), status: 400 });
            expect(resp.body.message.length).toBe(1);
        });

        test("Returns 400 error on non-unique info", async function () {
            let handle = testCompany1.handle;
            let resp = await request(app)
                .patch(`/companies/${handle}`)
                .send(testCompany2);

            expect(resp.body).toEqual({ message: expect.any(String), status: 400 });
        });
    });

    describe("DELETE /companies/:", function () {
        test("Can delete a company", async function () {
            let handle = testCompany1.handle;
            let resp = await request(app).delete(`/companies/${handle}`);

            expect(resp.body).toEqual({ message: "Deleted" });
        });

        test("Returns 404 error on invalid handle", async function () {
            let handle = "invalidHandle";
            let resp = await request(app).delete(`/companies/${handle}`);
            expect(resp.body).toEqual({ message: expect.any(String), status: 404 });
        });
    });

});

afterAll(async function () {
    await db.end();
});