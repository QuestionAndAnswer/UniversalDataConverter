(function () {
	QUnit.module("Complex-conversion module");

	QUnit.test("Real data complex conversion 1", function (assert) {
		var oData = {
	        __metadata: {},
	        CustomFields: {
	            Over1: 22,
	            Over2: 33,
	            BigOver4: 55,
	            LoliOver: 100,
	            AnotherField: "AnotherField"
	        },
	        Scope: 123,
	        One: 123,
	        Amount: 123,
	        Title: 123,
	        ClauseHeaders: {
	            results: [{
	                __metadata: {},
	                GUID: "1lASDJH58KJHASDNMN784N",
	                ClauseId: "0001",
	                ClauseSpecificInformation: "ClauseSpecificInformation",
	                UpperItems: {
	                    results: [{
	                        __metadata: {},
	                        GUID: "10293ALK65AGH6FFFOIIO865",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0001",
	                        ClassType: "RIMAC",
	                        EntityType: "CREDI",
	                        Description: "Description",
	                        Value: "Value",
	                        Setting: "Prop1"
	                    }, {
	                        __metadata: {},
	                        GUID: "10293ALK65A1233FFFOIIOTRE",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0001",
	                        ClassType: "RIMAC",
	                        EntityType: "INGOO",
	                        Description: "Description",
	                        Value: "Value",
	                        Setting: "Prop2"
	                    }, {
	                        __metadata: {},
	                        GUID: "10293ALK65AGH987465213549",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0001",
	                        ClassType: "RIMAC",
	                        EntityType: "KREG",
	                        Description: "Description",
	                        Value: "Value",
	                        Setting: "Prop3"
	                    }, {
	                        __metadata: {},
	                        GUID: "10293ALK65AGH6FFF88795325",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0001",
	                        ClassType: "CP",
	                        EntityType: "CREDI",
	                        Description: "Description",
	                        Value: "Value",
	                        Setting: "Prop4"
	                    }, {
	                        __metadata: {},
	                        GUID: "10293ALK65AGH61244F88795325",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0001",
	                        ClassType: "CP",
	                        EntityType: "KREG",
	                        Description: "Description",
	                        Value: "Value",
	                    }, {
	                        __metadata: {},
	                        GUID: "10293A1234451H6FFF88795325",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0001",
	                        ClassType: "CP",
	                        EntityType: "INGOO",
	                        Description: "Description",
	                        Value: "Value",
	                    }, {
	                        __metadata: {},
	                        GUID: "10123193A1234451H6FFF88795325",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0001",
	                        ClassType: "RP",
	                        EntityType: "INGOO",
	                        Description: "Description",
	                        Value: "Value",
	                    }, {
	                        __metadata: {},
	                        GUID: "10293A1234451H6FFF881235325",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0001",
	                        ClassType: "RP",
	                        EntityType: "CREDI",
	                        Description: "Description",
	                        Value: "Value",
	                    }, {
	                        __metadata: {},
	                        GUID: "10293A12341FFDSF8879AAS5325",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0001",
	                        ClassType: "RP",
	                        EntityType: "KREG",
	                        Description: "Description",
	                        Value: "Value",
	                    }]
	                },
	                Settings: {
	                    Prop1: false,
	                    Prop2: true,
	                    Prop3: true,
	                    Prop4: false,
	                    Prop5: false
	                }
	            }, {
	                __metadata: {},
	                GUID: "1lASDJH58KJHASDNMN784N",
	                ClauseId: "0002",
	                ClauseSpecificInformation: "ClauseSpecificInformation",
	                UpperItems: {
	                    results: [{
	                        __metadata: {},
	                        GUID: "10293ALK65AGH6FFFOIIO865",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0002",
	                        RiskType: "POLIT",
	                        Description: "Description",
	                        Value: "Value",
	                        Setting: "Prop1"
	                    }, {
	                        __metadata: {},
	                        GUID: "10293ALK65A1233FFFOIIOTRE",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0002",
	                        RiskType: "POLILLICT",
	                        Description: "Description",
	                        Value: "Value",
	                        Setting: "Prop2"
	                    }, {
	                        __metadata: {},
	                        GUID: "10293ALK65AGH987465213549",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0002",
	                        RiskType: "COMDOM",
	                        Description: "Description",
	                        Value: "Value",
	                        Setting: "Prop3"
	                    }, {
	                        __metadata: {},
	                        GUID: "10293ALK65AGH6FFF88795325",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0002",
	                        RiskType: "COMCROS",
	                        Description: "Description",
	                        Value: "Value",
	                        Setting: "Prop4"
	                    }]
	                },
	                Settings: {
	                    Prop1: false,
	                    Prop2: true,
	                    Prop3: true,
	                    Prop4: false,
	                    Prop5: false
	                }
	            }, {
	                __metadata: {},
	                GUID: "1lASDJH58KJHASDNMN784N",
	                ClauseId: "0003",
	                ClauseSpecificInformation: "ClauseSpecificInformation",
	                UpperItems: {
	                    results: [{
	                        __metadata: {},
	                        GUID: "10293ALK65AGH6FFFOIIO865",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0003",
	                        Description: "Description",
	                        Value: "Value",
	                        Setting: "Prop1"
	                    }, {
	                        __metadata: {},
	                        GUID: "10293ALK65A1233FFFOIIOTRE",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0003",
	                        Description: "Description",
	                        Value: "Value",
	                        Setting: "Prop2"
	                    }, {
	                        __metadata: {},
	                        GUID: "10293ALK65AGH987465213549",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0003",
	                        Description: "Description",
	                        Value: "Value",
	                        Setting: "Prop3"
	                    }, {
	                        __metadata: {},
	                        GUID: "10293ALK65AGH6FFF88795325",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0003",
	                        Description: "Description",
	                        Value: "Value",
	                        Setting: "Prop4"
	                    }]
	                },
	                Settings: {
	                    Prop1: false,
	                    Prop2: true,
	                    Prop3: true,
	                    Prop4: false,
	                    Prop5: false
	                }
	            }, {
	                __metadata: {},
	                GUID: "1lASDJH58KJHASDNMN784N",
	                ClauseId: "0004",
	                ClauseSpecificInformation: "ClauseSpecificInformation",
	                UpperItems: {
	                    results: [{
	                        __metadata: {},
	                        GUID: "10293ALK65AGH6FFFOIIO865",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0004",
	                        Description: "Description",
	                        Value: "Value",
	                        Setting: "Prop1"
	                    }, {
	                        __metadata: {},
	                        GUID: "10293ALK65A1233FFFOIIOTRE",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0004",
	                        Description: "Description",
	                        Value: "Value",
	                        Setting: "Prop2"
	                    }, {
	                        __metadata: {},
	                        GUID: "10293ALK65AGH987465213549",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0004",
	                        Description: "Description",
	                        Value: "Value",
	                        Setting: "Prop3"
	                    }, {
	                        __metadata: {},
	                        GUID: "10293ALK65AGH6FFF88795325",
	                        GUID00: "1lASDJH58KJHASDNMN784N",
	                        ClauseId: "0004",
	                        Description: "Description",
	                        Value: "Value",
	                        Setting: "Prop4"
	                    }]
	                },
	                Settings: {
	                    Prop1: false,
	                    Prop2: true,
	                    Prop3: true,
	                    Prop4: false,
	                    Prop5: false
	                }
	            }]
	        }
	    };

		var oReplacementTable = {
			"0001": "One",
			"0002": "Two",
			"0003": "Three",
			"0004": "Four"
		};

		var aModificationPass = [
			{
				//extract data from all results fields, and put it directly to parent
				inPath: "(.*[A-z0-9]*)/results$",
				//in inPath regex matching groups can be used. They will be applyed to
				//out path if needed.
				outPath: "$1"
			},
			{
				//remove all __metadata fields
				inPath: "__metadata$",
				delete: true
			}
		];

		var aWriteSettingsPass = [
			{
				//write settings to all ClauseItem by getting this settings from clause
				inPath: "(/ClauseHeaders/[0-9]+)/UpperItems/[0-9]+$",
				outValue: function (oArgs) {
					var oClause = utils.getValByPath(oArgs.data, oArgs.matchedGroups[0]);
					var oClauseItem = oArgs.item;
					oClauseItem.Settings = oClause.Settings;
					return oClauseItem;
				}
			}
		];

		var aExtractionPass = [
			{
				//convert all properties in CustomFields that contains Over string
				inPath: "/CustomFields/[A-z]*Over$",
				outValue: function (vVal) { return vVal.toString(); }
			},
			{
				//direct copy all other fields that don't have Over substring in name
				inPath: "/CustomFields/(?![A-z]*Over).*$"
			},
			{
				//general data collection to separate clause
				//using this syntax, all pathes will be matched through or operation
				//it means that outPath and outValue callbacks will be triggered
				//if at least on path has been matched
				inPath: ["/Amount$", "/One$", "/Scope$", "/Title$"],
				outPath: function (oArgs) { return "/GeneralData" + oArgs.path; }
			},
			{
				//extract clauses and write them by they ids. Simillar to indexBy operation
				inPath: /\/ClauseHeaders\/[0-9]+$/g,
				outPath: function (oArgs) {
					return "/" + oReplacementTable[oArgs.item.ClauseId]; //write in destination root
				},
				outValue: function (oArgs) {
					switch(oArgs.item.ClauseId) {
						case "0001":
							return UDC([], [[{
								//grouping by ClassType and EntityType
								inPath: "/UpperItems/[0-9]+$",
								outPath: function (oArgs) { return "/" + oArgs.item.ClassType + "/" + oArgs.item.EntityType; },
								extend: {
									RIMAC: { CREDI: {}, KREG: {}, INGOO: {}},
									CP: { CREDI: {}, KREG: {}, INGOO: {}},
									RP: { CREDI: {}, KREG: {}, INGOO: {}},
								}
							}]]).convert(oArgs.item);
							break;
						case "0002":
							return UDC([], [[{
								inPath: "/UpperItems/[0-9]+$",
								outPath: function (oArgs) { return "/" + oArgs.item.RiskType; },
								extend: { POLIT: {}, POLILLICT: {}, COMDOM: {}, COMCROS: {} }
							}]]).convert(oArgs.item);
							break;
						default:
							return oArgs.item;
					}
				}
			}
		];

		var oResult = UDC([aModificationPass, aWriteSettingsPass], [aExtractionPass]).convert(oData);
		assert.ok(false, JSON.stringify(oResult));
	});
})();
