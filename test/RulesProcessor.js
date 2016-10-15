define([
	"UniversalDataConverter/RulesProcessor"
], function (RulesProcessor) {
	QUnit.module("RulesProcessor");

	QUnit.test("RulesProcessor calls tests", function (assert) {
		var iNumsCount = 0;
		var iStringsCount = 0;
		var iNumsStringsCount = 0;

		var oProcessor = new RulesProcessor([
			{
				pattern: /^[0-9]+$/g,
				action: function () {
					assert.ok(true, "Nums call");
					iNumsCount++;
				}
			},
			{
				pattern: "^[A-z]+$",
				action: function () {
					assert.ok(true, "Strings call");
					iStringsCount++;
				}
			},
			{
				pattern: "^[A-z0-9]+$",
				action: function () {
					assert.ok(true, "NumsStrings call");
					iNumsStringsCount++;
				}
			}
		]);

		oProcessor.callMatched(["123", "asdasd", "11asd"]);

		assert.equal(iNumsCount, 1, "Nums call times");
		assert.equal(iStringsCount, 1, "Strings call times");
		assert.equal(iNumsStringsCount, 3, "NumsStrings call times");
	});

	QUnit.test("params tests", function (assert) {
		var oProcessor = new RulesProcessor([
			{
				pattern: [/^([0-9]+)$/g],
				action: function (oArgs, iNum) {
					return parseInt(oArgs.matchedGroups[0]) + iNum;
				}
			},
			{
				pattern: "^[A-z]+$",
				action: function () {
					return "9";
				}
			},
			{
				pattern: "(^[A-z0-9]+$)",
				action: function (oArgs, iNum) {
					return oArgs.matchedGroups[0] + iNum.toString();
				}
			}
		]);

		var aResult = oProcessor.callMatched(["123", "asdasd", "11asd"], 1);
		assert.deepEqual(aResult, [124, "1231", "9", "asdasd1", "11asd1"], "Returned values");
	});
});
