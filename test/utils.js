(function() {
	QUnit.module("Utils");
	
    QUnit.test("indexBy", function(assert) {
        var aIn1 = [{
            "GUID": "1"
        }, {
            "GUID": "2"
        }, {
            "GUID": undefined
        }];
        var oResult = utils.indexBy(aIn1, "GUID");
        var oFnResult = utils.indexBy(aIn1, function(oItem) {
            return oItem.GUID;
        });
        var oExpected = {
            "1": {
                "GUID": "1"
            },
            "2": {
                "GUID": "2"
            },
            "undefined": {
                "GUID": undefined
            }
        };

        assert.deepEqual(oResult, oExpected, "String key");
        assert.deepEqual(oFnResult, oExpected, "Function key");
    });

    QUnit.test("groupBy", function(assert) {
        var oIn1 = [1, 2, 3, 4, 5];
        var oIn2 = [{
            group: "1",
            val: 1
        }, {
            group: "1",
            val: 2
        }, {
            group: "3",
            val: 1
        }, {
            group: "2",
            val: 2
        }];

        assert.deepEqual(utils.groupBy(oIn1, function(iVal) {
            return iVal > 3 ? ">3" : "<3";
        }), {
            ">3": [4, 5],
            "<3": [1, 2, 3]
        }, "Group by function key");

        assert.deepEqual(utils.groupBy(oIn2, "group"), {
            "1": [{
                group: "1",
                val: 1
            }, {
                group: "1",
                val: 2
            }],
            "2": [{
                group: "2",
                val: 2
            }],
            "3": [{
                group: "3",
                val: 1
            }]
        }, "Group by string key");
    });

    QUnit.test("getPathPart", function(assert) {
        assert.equal(utils.getPathPart("/first/second/third/fourth", 0), "first", "0");
        assert.equal(utils.getPathPart("/first/second/third/fourth", 1), "second", "1");
        assert.equal(utils.getPathPart("/first/second/third/fourth", 2), "third", "2");
        assert.equal(utils.getPathPart("/first/second/third/fourth", 3), "fourth", "3");
        assert.equal(utils.getPathPart("/first/second/third/fourth", -1), "fourth", "-1");
        assert.equal(utils.getPathPart("/first/second/third/fourth", -2), "third", "-2");
        assert.equal(utils.getPathPart("/first/second/third/fourth", -3), "second", "-3");
        assert.equal(utils.getPathPart("/first/second/third/fourth", -4), "first", "-4");
    });

    QUnit.test("truncatePath", function(assert) {
        assert.equal(utils.truncatePath("/"), "/", "One slash");
        assert.deepEqual(utils.truncatePath(true, "/"), [], "One slash as array");
        assert.equal(utils.truncatePath("/a/items/1"), "/a/items/1", "Just string");
        assert.equal(utils.truncatePath("/a/items/1", -1), "/a/items", "-1 shift");
        assert.equal(utils.truncatePath("/a/items/1", -2), "/a", "-2 shift");
        assert.equal(utils.truncatePath("/a/items/1", 1), "/items/1", "1 shift");
        assert.equal(utils.truncatePath("/a/items/1", 2), "/1", "2 shift");
        assert.equal(utils.truncatePath("/a/items/1", 1, -1), "/items", "1,-1 shift");
        assert.deepEqual(utils.truncatePath(true, "/a/items/1", 1, -1), ["items"], "return as array 1,-1 shift");
    });

    QUnit.test("getValByPath", function(assert) {
        var oObject = {
            a: {
                items: [1, 2, 3, 4],
                d: {
                    x: 1,
                    y: 2
                }
            },
            b: "test"
        };

        assert.deepEqual(utils.getValByPath(oObject, "/"), oObject, "Root get");
        assert.equal(utils.getValByPath(oObject, "/b"), "test", "Root value get no shift");
        assert.equal(utils.getValByPath(oObject, "/a/items/0"), 1, "Array value get no shift");
        assert.deepEqual(utils.getValByPath(oObject, "/a/items/1", -1), [1, 2, 3, 4], "Array get -1 shift");
        assert.deepEqual(utils.getValByPath(oObject, "/a/d/x"), 1, "Object value get no shift");
        assert.propEqual(utils.getValByPath(oObject, "/a/d/x", -1), {
            x: 1,
            y: 2
        }, "Object get -1 shift");
        assert.equal(utils.getValByPath(oObject.a, "/a/items/2", 1), 3, "Array value get 1 shift");
        assert.propEqual(utils.getValByPath(oObject.a, "/a/d/x", 1, -1), {
            x: 1,
            y: 2
        }, "Object get 1,-1 shift");
    });

    QUnit.test("setValByPath", function(assert) {
        var oObject = {
            a: {
                items: [1, 2, 3, 4],
                d: {
                    x: 1,
                    y: 2
                }
            },
            b: "test"
        };

        assert.deepEqual(utils.setValByPath(oObject, "/c", 23), {
            a: {
                items: [1, 2, 3, 4],
                d: {
                    x: 1,
                    y: 2
                }
            },
            b: "test",
            c: 23
        }, "Set value by short path");

        assert.deepEqual(utils.setValByPath(oObject, "/a/items/0", 23), {
            a: {
                items: [23, 2, 3, 4],
                d: {
                    x: 1,
                    y: 2
                }
            },
            b: "test",
            c: 23
        }, "Set value by long path");
    });

    QUnit.test("objectWalkInDeep", function(assert) {
        var oObj = {
            a: {
                b: {
                    c: {},
                    d: ""
                },
                e: ""
            },
            f: ""
        };

        var oExpected = ["/a/b/c", "/a/b/d", "/a/b", "/a/e", "/a", "/f"];
        var oResult = [];
        utils.objectWalkInDeep(oObj, function(sPath) {
            oResult.push(sPath);
        });
        assert.deepEqual(oResult, oExpected);
    });
})();
