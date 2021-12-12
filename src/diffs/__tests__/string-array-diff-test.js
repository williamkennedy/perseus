import _stringArrayDiffJsx from "../string-array-diff.jsx";

var _module_ = {
    exports: {}
};

var exports = _module_.exports;
/* global expect */

const stringArrayDiff = _stringArrayDiffJsx;

describe("string array diff", function() {
    it("diffs an empty diff", function() {
        expect(stringArrayDiff([], [])).toEqual({
            before: [],
            after: [],
        });
    });

    it("diffs the same values", function() {
        expect(stringArrayDiff([1], [1])).toEqual({
            before: [
                {
                    status: "unchanged",
                    value: 1,
                },
            ],
            after: [
                {
                    status: "unchanged",
                    value: 1,
                },
            ],
        });
    });

    it("diffs an added value", function() {
        expect(stringArrayDiff([1], [1, 2])).toEqual({
            before: [
                {
                    status: "unchanged",
                    value: 1,
                },
            ],
            after: [
                {
                    status: "unchanged",
                    value: 1,
                },
                {
                    status: "added",
                    value: 2,
                },
            ],
        });
    });

    it("diffs a removed value", function() {
        expect(stringArrayDiff([1, 2, 3], [1])).toEqual({
            before: [
                {
                    status: "unchanged",
                    value: 1,
                },
                {
                    status: "removed",
                    value: 2,
                },
                {
                    status: "removed",
                    value: 3,
                },
            ],
            after: [
                {
                    status: "unchanged",
                    value: 1,
                },
            ],
        });
    });
});
export default _module_.exports;
