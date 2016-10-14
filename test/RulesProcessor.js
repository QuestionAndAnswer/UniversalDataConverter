define([
	"UniversalDataConverter/RulesProcessor"
], function (RulesProcessor) {
	QUnit.module("RulesProcessor");

	QUnit.test("RulesProcessor", function (assert) {
		assert.expect(5);

		var oNumsDone = assert.async();
		var oStringsDone = assert.async();
		var oNumsStringsDone = assert.async(3);

		var oProcessor = new RulesProcessor([
			{
				pattern: /^[0-9]+$/g,
				action: function (oArgs) {
					assert.ok("Nums done");
					oNumsDone();
				}
			},
			{
				pattern: "^[A-z]+$",
				action: function (oArgs) {
					assert.ok("Strings done");
					oStringsDone();
				}
			},
			{
				pattern: "^[A-z0-9]+$",
				action: function (oArgs) {
					assert.ok("NumsStrings done");
					oNumsStringsDone();
				}
			}
		]);

		oProcessor.callMatched(["123", "asdasd", "11asd"]);
	});
});
