define([
	"UniversalDataConverter/RulesProcessor"
], function (RulesProcessor) {
	QUnit.module("RulesProcessor");

	QUnit.test("RulesProcessor", function (assert) {
		var iNumsCount = 0;
		var iStringsCount = 0;
		var iNumsStringsCount = 0;

		var oProcessor = new RulesProcessor([
			{
				pattern: /^[0-9]+$/g,
				action: function (oArgs) {
					assert.ok("Nums done");
					iNumsCount++;
					
					return parseInt(oArgs.word);
				}
			},
			{
				pattern: "^[A-z]+$",
				action: function (oArgs) {
					assert.ok("Strings done");
					iStringsCount++;
				}
			},
			{
				pattern: "^[A-z0-9]+$",
				action: function (oArgs) {
					assert.ok("NumsStrings done");
					iNumsStringsCount++;
				}
			}
		]);

		oProcessor.callMatched(["123", "asdasd", "11asd"]);
		var aResult = oProcessor.callMatched("123");

		assert.equal(iNumsCount, 2, "Nums call times correct");
		assert.equal(iStringsCount, 1, "Strings call times correct");
		assert.equal(iNumsStringsCount, 4, "NumsStrings call times correct");
		assert.deepEqual(aResult, [123], "Returned data are good");
	});
});
