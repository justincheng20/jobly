process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/companyModel");
const Job = require("../../models/jobModel");

let testCompany1;


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

        testJob1 = await Job.create({
            title: "tester",
            salary: 0,
            equity: 0,
            company_handle: "testHandle"
        });

        testJob2 = await Job.create({
            title: "tester2tester",
            salary: 2,
            equity: .2,
            company_handle: "testHandle"
        });
    });

    describe("GET /jobs", function () {
        test("Can get all jobs", async function () {
            let resp = await request(app).get("/jobs");
            expect(resp.body).toEqual({ jobs: expect.any(Array) });
            expect(resp.body.jobs.length).toBe(2);
        });

        test("Can filter jobs by minimum salary", async function () {
            let query = "?min_salary=2.0";
            let resp = await request(app).get(`/jobs${query}`);
            expect(resp.body).toEqual({ jobs: expect.any(Array) });
            expect(resp.body.jobs.length).toBe(1);
        });

        test("Can filter jobs by minimum equity", async function () {
            let query = "?min_equity=0.2";
            let resp = await request(app).get(`/jobs${query}`);
            expect(resp.body).toEqual({ jobs: expect.any(Array) });
            expect(resp.body.jobs.length).toBe(1);
        });

        test("Can filter job title by search term", async function () {
            let query = "?searchTerm=er2te";
            let resp = await request(app).get(`/jobs${query}`);
            expect(resp.body).toEqual({ jobs: expect.any(Array) });
            expect(resp.body.jobs.length).toBe(1);
        });


        describe("POST /jobs", function () {
            test("Can create a new job listing", async function () {
                let testJob3 = {
                    title: "tester3tester",
                    salary: 3,
                    equity: .3,
                    company_handle: "testHandle"
                }
                let resp = await request(app)
                    .post("/jobs")
                    .send(testJob3);

                const allJobs = await Job.getJobs({});
                
                
                // Q: Is it good practice to use expect.any(Object)?
                expect(resp.body).toEqual({ job: expect.any(Object) });
                // Is this better?
                expect(resp.body.job).toBeInstanceOf(Object);
                expect(resp.body).toMatchObject({ job: testJob3 });
                expect(allJobs.length).toBe(3);
            });

            test("Can not create a job listing with invalid inputs", async function () {
                let invalidJob = {
                    salary: "3",
                    equity: 5,
                    company_handle: "Non existent handle"
                }
                let resp = await request(app)
                    .post("/jobs")
                    .send(invalidJob);

                const allJobs = await Job.getJobs({});

                expect(resp.body).toEqual({ message: expect.any(Array), status: 400 })
                expect(allJobs.length).toBe(2);
            });
        });


        describe("Get /jobs/:id", function () {
            test("Can get a job by its ID", async function () {
                let id = testJob1.id;
                
                let resp = await request(app).get(`/jobs/${id}`);
                expect(resp.body).toEqual({ job: expect.any(Object) });
            });
    
            test("Returns 404 error on invalid id", async function () {
                let id = "-1";
                let resp = await request(app).get(`/jobs/${id}`);
                expect(resp.body).toEqual({ message: expect.any(String), status: 404 });
            });
        });


    });


});

afterAll(async function () {
    await db.end();
});