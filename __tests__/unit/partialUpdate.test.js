const sqlForPartialUpdate = require('../../helpers/partialUpdate');

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
      function () {

    // FIXME: write real tests!
    let items = {num_employees: 0};
    let resp = sqlForPartialUpdate('companies', items, "handle", "1");

    expect(resp).toEqual({
      query: 'UPDATE companies SET num_employees=$1 WHERE handle=$2 RETURNING *',
      values: [0, "1"]});

  });
});
